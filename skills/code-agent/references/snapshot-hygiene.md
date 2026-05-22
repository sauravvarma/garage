# Snapshot hygiene — mobile WebView navigation gotchas

Cross-cutting hazards that show up when frontend code ships to a mobile WebView shell (catalyst-core, Capacitor, Ionic, RN Web) and uses React state for transient UI. The platforms involved (HTML5 bfcache, WebKit page-snapshot cache, React 18 batching, view-transitions API, the routing library) each have partial coverage of the problem; none alone is sufficient.

## The rule of thumb

> If a component holds *transient* state tied to an async operation (loading / verifying / optimistic UI), and that component is about to be navigated away from, **either reset the state before navigating *and* wait for paint, or render the transient state in a portal that lives outside the navigated-component's snapshot scope (e.g. a global toast / overlay).** State that survives in the navigated-away component's DOM is what gets bfcache-captured and re-shown during the back-swipe gesture.

The portal escape hatch is the genuinely novel half. State that lives at the App / route-root level isn't part of the outgoing route's snapshot, so it can't haunt the back-swipe.

## Diagnostic signature

You're looking at this bug if all of these hold:
- The app runs inside a mobile WebView (iOS WKWebView, Android WebView), or any browser that aggressively bfcache's pages
- A component on route A fires an async op, sets some transient state (`loading=true`, button label flips to "Verifying…", etc.), then calls `navigate(B)` on completion
- User does anything that triggers a snapshot restore back to A (iOS edge-swipe, browser back button, `history.back()`) and **briefly sees the transient state frozen on screen** before the live DOM catches up

Don't chase the React state update — the state usually IS getting cleared. The bfcache captured the pre-clear pixels.

## Why standard tools don't fully solve it

| Tool | What it does | Why it's not enough |
|---|---|---|
| React 18 `flushSync` | Forces a synchronous commit + paint between two pieces of logic | Commits the state, but a CSS exit transition can still be mid-flight when the snapshot fires |
| View Transitions API | Lets you choreograph same-document state changes | Same-document only — doesn't cover real history navigations or bfcache restore |
| `pagehide` listener with `event.persisted` check | Spec-blessed cleanup hook | Fires *after* the snapshot has been captured — too late for visual cleanup |
| Routing-lib navigation events | Pre/post navigate hooks | None of the major libs standardize "wait for outgoing UI to settle before pushing" — that's on the caller |
| Suspense + `useTransition` | Avoids showing transient loading states during transitions | Doesn't gate the snapshot timing; works for incoming UI only |

## Patterns that actually work (ranked)

1. **Wait-then-nav (most common).** Close transient UI → `await` the exit animation (`transitionend` event or a known duration matching the CSS transition) → then call `navigate(...)`. Trades ~250-350ms of perceptible latency for a clean snapshot. Most Ionic/Capacitor apps ship this.

2. **Instant-reset before nav.** `flushSync(() => setState(closedState))` then immediately apply `transition: none` to the exiting element and navigate. Snapshot captures the closed state; no extra latency, but the user doesn't see the sheet/modal close — feels abrupt. Right call when navigation speed matters more than transition polish.

3. **Portal-lift the transient state.** Move the "Verifying…" indicator out of the navigated component and into an App-level global overlay (toast, top-of-tree spinner, etc.). The transient state isn't part of the outgoing route's snapshot at all, so it can't be captured. Right call when the same transient state can outlive the route (e.g. background uploads, multi-step auth).

4. **Two-phase nav with interstitial.** Push the new route immediately, but render a deliberate loading shim that masks the broken snapshot during the back gesture. Heavy machinery; only worth it on routes with long async on entry.

## Practical heuristics

- **CSS transition duration ≥ 200ms?** Wait-then-nav is the safer default — flushSync alone won't outrun the transition.
- **State lives inside a component that the route owns?** It's inside the snapshot scope. Lift or reset-and-wait.
- **State lives on `App` / `Provider` / a portal target outside route children?** Already outside the snapshot scope. Free win — no special handling needed.
- **You can't tell whether the WebView caches snapshots?** Assume yes if iOS is a target. WKWebView always does. Chrome bfcache eligibility is more conditional.
- **`navigate()` called inside a Promise `.then()` or `await`?** That microtask boundary is enough for React to commit batched state — but NOT enough for CSS transitions to finish. The exit animation will be mid-flight.

## Native reference

UIKit's `UIViewController.dismiss(animated:completion:)` takes a completion callback by convention — dismiss completes, *then* navigate. WebViews don't get this primitive for free, which is why this class of bug surfaces in web-shipped frontends but rarely in native ones. The wait-then-nav pattern is the WebView's manual reconstruction of that contract.

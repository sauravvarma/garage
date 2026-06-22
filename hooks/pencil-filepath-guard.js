#!/usr/bin/env node
/*
 * Pencil filePath guard — PreToolUse hook for mcp__pencil__batch_design.
 *
 * Why this exists: Pencil MCP has no file-creation tool, and its `filePath`
 * parameter is advisory. A batch_design call that targets a path which does
 * not exist on disk does NOT create that file — it silently falls back to
 * whatever .pen is currently open in the editor, writing nodes into an
 * unrelated design with no error. This hook blocks that exact case.
 *
 * It enforces only the mechanical half (file-exists). The active-editor-match
 * half cannot live here — hooks are shell commands and cannot make MCP calls
 * to read the active editor — so it lives in the agent-side write-barrier gate
 * (design-agent/references/pencil-hygiene.md, Rule 6).
 *
 * Scope is intentionally batch_design only. If set_variables or other writers
 * prove to share the fallback, add them to the matcher in hooks.json.
 */

const fs = require("fs");

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function allow() {
  // No output + exit 0 = no decision; the tool call proceeds normally.
  process.exit(0);
}

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    })
  );
  process.exit(0);
}

// Fail open: any parsing/internal error must not brick legitimate Pencil work.
let payload;
try {
  payload = JSON.parse(readStdin() || "{}");
} catch {
  allow();
}

const filePath = payload && payload.tool_input && payload.tool_input.filePath;

// No filePath → batch_design uses the active editor; nothing for this layer to verify.
if (typeof filePath !== "string" || filePath.length === 0) {
  allow();
}

if (fs.existsSync(filePath)) {
  allow();
}

deny(
  `Pencil write blocked: "${filePath}" does not exist on disk.\n\n` +
    `Pencil MCP cannot create files — a batch_design call to a non-existent path does NOT ` +
    `create it; it silently falls back to whatever .pen is currently open, writing into an ` +
    `unrelated design.\n\n` +
    `Fix: create the file in the Pencil app (it must become the active editor), then retry. ` +
    `Never use batch_design to "create" a .pen.`
);

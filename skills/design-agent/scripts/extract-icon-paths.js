#!/usr/bin/env node
/*
 * extract-icon-paths — parse a React/JS file for inline <svg> definitions and
 * emit a JSON catalog of icon names mapped to their geometry, viewBox, and
 * stroke attributes. Generic. Works on any file that defines SVG icons inline.
 *
 * Usage:
 *   extract-icon-paths.js <react-file> [--out=<json-path>]
 *   extract-icon-paths.js <react-file> --pretty
 *
 * Two extraction strategies, applied in order:
 *
 * 1. Named-icon-component pattern. Looks for `name === "X"` or `name == "X"`
 *    branches in a function (typically called `Icon`) that return JSX
 *    containing an <svg> with one or more <path d="..." /> children. This
 *    matches the convention used in HealthInsightHubV2 and many design
 *    systems where a single Icon component switches on a name prop.
 *
 * 2. Standalone <svg> blocks. Anywhere in the file, find <svg ...> ... </svg>
 *    blocks containing path elements. Emits them under a synthesized name
 *    derived from the surrounding component name (or "icon-N" if unknown).
 *
 * Output schema:
 *   { "<name>": {
 *       "geometry": "<concatenated path d values>",
 *       "viewBox": [x, y, w, h],
 *       "strokeWidth": <number-or-null>,
 *       "strokeLinecap": "<round|butt|square|null>",
 *       "strokeLinejoin": "<round|miter|bevel|null>",
 *       "fill": "<value-or-null>",
 *       "stroke": "<value-or-null>",
 *       "source": "<react-file-path>"
 *     },
 *     ...
 *   }
 *
 * The script is intentionally regex-based, not AST-based — keeps the
 * dependency surface zero. Edge cases that need a real parser are out of
 * scope; for those, prefer manual extraction.
 */

const fs = require("fs");

function usage() {
    console.error("usage: extract-icon-paths.js <react-file> [--out=<json>] [--pretty]");
    process.exit(2);
}

const args = process.argv.slice(2);
if (args.length === 0) usage();

const inputPath = args[0];
let outPath = null;
let pretty = false;
for (const arg of args.slice(1)) {
    if (arg.startsWith("--out=")) outPath = arg.slice(6);
    else if (arg === "--pretty") pretty = true;
    else if (arg === "--help" || arg === "-h") usage();
}

if (!fs.existsSync(inputPath)) {
    console.error(`error: ${inputPath} not found`);
    process.exit(2);
}

const source = fs.readFileSync(inputPath, "utf8");
const icons = {};

// ---------- helpers ----------

function parseViewBox(value) {
    if (!value) return null;
    const parts = value.split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts.every(n => !Number.isNaN(n))) return parts;
    return null;
}

function parseNumberAttr(value) {
    if (value == null) return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
}

function attrFrom(svgOpenTag, attrName) {
    const re = new RegExp(`${attrName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|\\{["']?([^"'}]+)["']?\\})`);
    const m = svgOpenTag.match(re);
    if (!m) return null;
    return m[1] ?? m[2] ?? m[3] ?? null;
}

function pathDValues(svgInner) {
    const re = /<path[^>]*\sd\s*=\s*(?:"([^"]+)"|'([^']+)'|\{["']?([^"'}]+)["']?\})[^>]*\/?>/g;
    const result = [];
    for (const m of svgInner.matchAll(re)) {
        result.push(m[1] ?? m[2] ?? m[3]);
    }
    return result;
}

function extractSvgBlock(text, fromIndex) {
    // returns { open, openTag, inner, end } for the svg starting at fromIndex
    const open = text.indexOf("<svg", fromIndex);
    if (open === -1) return null;
    const closeOfOpen = text.indexOf(">", open);
    if (closeOfOpen === -1) return null;
    const openTag = text.slice(open, closeOfOpen + 1);
    const close = text.indexOf("</svg>", closeOfOpen);
    const selfClose = openTag.endsWith("/>");
    if (selfClose) {
        return { open, openTag, inner: "", end: closeOfOpen + 1 };
    }
    if (close === -1) return null;
    const inner = text.slice(closeOfOpen + 1, close);
    return { open, openTag, inner, end: close + "</svg>".length };
}

// Pull a value out of a JS-object literal `{ k: v, ... }` body.
function attrFromObjectLiteral(literalBody, key) {
    if (!literalBody) return null;
    // matches:  key: "v"  |  key: 'v'  |  key: 16  |  key: [a, b, c, d]
    const re = new RegExp(
        `(?:^|[\\s,{])${key}\\s*:\\s*(?:"([^"]*)"|'([^']*)'|(\\[[^\\]]+\\])|([0-9.+-]+))`,
    );
    const m = literalBody.match(re);
    if (!m) return null;
    if (m[1] != null) return m[1];
    if (m[2] != null) return m[2];
    if (m[3] != null) {
        // strip brackets, return the content as a string for downstream parsing
        return m[3].slice(1, -1);
    }
    if (m[4] != null) return m[4];
    return null;
}

// Find the body of the first `const props = { ... }` (or similar) declaration
// before `index`. Returns the object-literal body string, or null.
function findPropsLiteralBefore(text, index) {
    const slice = text.slice(0, index);
    const re = /(?:const|let|var)\s+props\s*=\s*\{([\s\S]*?)\}\s*;?\s*\n/g;
    let last = null;
    for (const m of slice.matchAll(re)) {
        last = m[1];
    }
    return last;
}

function buildIcon(svg, sourceText, svgIndex) {
    const geometry = pathDValues(svg.inner).join(" ");
    if (!geometry) return null;
    const propsBody = findPropsLiteralBefore(sourceText, svgIndex);
    const pick = (jsxAttr, propsKey, parser = (v) => v) => {
        const fromJsx = attrFrom(svg.openTag, jsxAttr);
        if (fromJsx != null) return parser(fromJsx);
        const fromProps = attrFromObjectLiteral(propsBody, propsKey ?? jsxAttr);
        return fromProps != null ? parser(fromProps) : null;
    };
    return {
        geometry,
        viewBox: pick("viewBox", "viewBox", parseViewBox),
        strokeWidth: pick("strokeWidth", "strokeWidth", parseNumberAttr),
        strokeLinecap: pick("strokeLinecap", "strokeLinecap"),
        strokeLinejoin: pick("strokeLinejoin", "strokeLinejoin"),
        fill: pick("fill", "fill"),
        stroke: pick("stroke", "stroke"),
        source: inputPath,
    };
}

// ---------- strategy 1: named-icon-component pattern ----------

const namedRegex = /\bname\s*===?\s*"([A-Za-z0-9_-]+)"/g;
for (const nm of source.matchAll(namedRegex)) {
    const name = nm[1];
    const svg = extractSvgBlock(source, nm.index);
    if (!svg) continue;
    const icon = buildIcon(svg, source, svg.open);
    if (icon && !icons[name]) icons[name] = icon;
}

// ---------- strategy 2: standalone <svg> blocks ----------

let cursor = 0;
let unnamedCounter = 0;
while (true) {
    const svg = extractSvgBlock(source, cursor);
    if (!svg) break;
    cursor = svg.end;
    // Already captured by strategy 1?
    const geometry = pathDValues(svg.inner).join(" ");
    const alreadyCaptured = Object.values(icons).some(
        i => i.geometry === geometry && i.source === inputPath,
    );
    if (alreadyCaptured) continue;
    const icon = buildIcon(svg, source, svg.open);
    if (!icon) continue;
    // Synthesize a name from a nearby `function Foo` or `const Foo =` declaration
    const before = source.slice(Math.max(0, svg.end - 800), svg.end);
    const fn = before.match(/(?:function|const)\s+([A-Z][A-Za-z0-9_]*)/g);
    const candidate = fn ? fn[fn.length - 1].replace(/^(?:function|const)\s+/, "") : null;
    const name = candidate ? `${candidate}-${++unnamedCounter}` : `icon-${++unnamedCounter}`;
    if (!icons[name]) icons[name] = icon;
}

// ---------- output ----------

const output = JSON.stringify(icons, null, pretty ? 2 : 0);

if (outPath) {
    fs.writeFileSync(outPath, output + "\n");
    console.error(`wrote ${Object.keys(icons).length} icons to ${outPath}`);
} else {
    process.stdout.write(output);
    if (pretty || process.stdout.isTTY) process.stdout.write("\n");
}

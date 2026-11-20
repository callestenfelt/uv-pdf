import { cpSync, rmSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
const src = "node_modules/universalviewer/dist";
const dst = "public/uv";
rmSync(dst, { recursive: true, force: true });
mkdirSync(dst, { recursive: true });
cpSync(`${src}/umd`, `${dst}/umd`, { recursive: true });
cpSync(`${src}/uv.css`, `${dst}/uv.css`);

// Patch UV's pdf.js loader so a newer (ESM) pdf.js can be used at runtime.
// If window.PDFJS_ESM_BASE is set (e.g. https://cdn.jsdelivr.net/npm/pdfjs-dist@6.5.438/build/)
// that version is loaded via import(); otherwise UV's hard-coded 3.11.174 is used as before.
const OLD_LOAD = '[4,(0,B.Pw)(["//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"])]';
const OLD_LIB = 'this._pdfjsLib=window["pdfjs-dist/build/pdf"]';
const OLD_WORKER = 'workerSrc="//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"';
const NEW_LOAD = `[4,window.PDFJS_ESM_BASE?import(window.PDFJS_ESM_BASE+"pdf.min.mjs"):(0,B.Pw)(["//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"])]`;
const NEW_LIB = 'this._pdfjsLib=window.PDFJS_ESM_BASE?s.sent():window["pdfjs-dist/build/pdf"]';
const NEW_WORKER = 'workerSrc=window.PDFJS_ESM_BASE?window.PDFJS_ESM_BASE+"pdf.worker.min.mjs":"//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"';
let patched = 0;
for (const f of readdirSync(`${dst}/umd`).filter((n) => n.endsWith(".js"))) {
  const p = `${dst}/umd/${f}`;
  const t = readFileSync(p, "utf8");
  if (!t.includes(OLD_LOAD)) continue;
  for (const s of [OLD_LOAD, OLD_LIB, OLD_WORKER]) if (!t.includes(s)) throw new Error("patch anchor missing in " + f);
  writeFileSync(p, t.replace(OLD_LOAD, NEW_LOAD).replace(OLD_LIB, NEW_LIB).replace(OLD_WORKER, NEW_WORKER));
  patched++;
}
if (patched !== 1) throw new Error("expected to patch exactly 1 UV chunk, patched " + patched);
console.log("UV copied to", dst, "(pdf.js loader patched)");

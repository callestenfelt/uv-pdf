# Project notes (handoff)

State as of 2026-11-20. Everything below was verified in this repo unless marked "not verified".

## Goal
Reproduce the PDF lag seen at https://samlingar.shm.bazooka.dev/media/f92f4970-a1a7-44c6-bb02-d2294d675a07
(Universal Viewer 4.4.4) and find out whether it can be fixed.

## Findings
- **Their site runs UV's pdf.js mode with pdf.js 3.11.174** (canvas present, `PDFObject` not loaded, only script is
  `cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js`). Checked 2026-11-20. Their UV config was not readable.
- **Cause of the lag:** the test PDF (`public/media/test.pdf`, 7 pages, 45 MB) has pages 1-4 as single ~4900x6150 px
  JPEGs (9-11 MB each). pdf.js 3.11 takes 1.4-2.8 s per render on those pages at any zoom, and UV never caches a
  rendered page, so every page turn and zoom pays that again.
- **pdf.js 6.5.438 renders the same pages in 0.14-0.3 s.** Why it is faster is not verified (likely image decoding).
- **Native mode** (`usePdfJs: false`, Chrome's built-in viewer) is also fast on this file. It is UV's default.
- **Security:** pdf.js 3.11.174 is affected by CVE-2024-4367 (JS execution from a crafted PDF). The recommended
  mitigation is `isEvalSupported: false` in `getDocument`; UV 4.4.4 does not set it (no `isEvalSupported` in its dist).
  Exploitation itself was not tested.
- **Upstream:** UV PR #1696 ("Pdfjs update") is open and approved, held until after RC4. PR #1528 is an older
  Dependabot bump. PR #1947 (merged Nov 2026, after 4.4.4) adds the CVE mitigation. UV 4.4.4 is the latest stable on npm.
- The test PDF is Public Domain Mark (SHM), so it is fine to host publicly.

## How the repo works
- `npm install` runs `scripts/sync-uv.mjs`: copies UV's `dist/umd` into `public/uv` and **patches** the pdf.js loader
  in the hashed chunk (it throws if the anchors are missing, so a UV change can't silently break it). With
  `window.PDFJS_ESM_BASE` set, a newer ESM pdf.js is loaded via `import()` instead of the hard-coded 3.11.
- `public/index.html` builds the viewer. Modes: `/` native, `/?pdfjs=1` pdf.js 3.11, `/?pdfjs=new` newer pdf.js
  (`&v=` overrides the version, default 6.5.438). It rewrites `manifest.json` (written for `http://localhost:8080`) to
  the current origin through a blob URL.
- `public/manifest.json`: IIIF v3, one Canvas whose **id is the PDF URL** (UV's native renderer embeds the canvas id).
- `public/bench.html` (3.11) and `public/bench2.html?v=...` (ESM versions) time raw pdf.js renders.
  Gotcha: in an automation-controlled tab `requestAnimationFrame` runs ~1 Hz, which makes newer pdf.js look
  quantised to 1 s steps. `bench2.html` shims rAF with `setTimeout` (`&raf=1` disables the shim).
- `docs/risk-pdfjs.md`: Swedish write-up of the risk for the developers.

## Run locally
```
npm install
# put the PDF at public/media/test.pdf (gitignored)
npm start        # http://localhost:8080
```

## Deployed demo
https://uv-pdf.vercel.app (Vercel project `uv-pdf`, public, no login). Deployed with
`npx vercel deploy public --yes --name uv-pdf` from the repo root; it is **not** linked to GitHub, so redeploy after
changes. Remove with `npx vercel remove uv-pdf`.

## Open / not done
- Not timed inside UV itself: speedup of `/?pdfjs=new` vs `/?pdfjs=1` was only measured with the benchmark pages.
- The patch is a proof of concept on minified code, not production-ready. Real options for the developers: turn off
  pdf.js mode, set `isEvalSupported: false`, or wait for / contribute to UV PR #1696.
- Not posted anywhere: a timing comment on PR #1696 (draft offered, not written).
- The demo link is not yet mentioned in `docs/risk-pdfjs.md`.
- Newer pdf.js loads from jsdelivr at runtime (worker included); UV's old one from cdnjs. Neither is self-hosted.

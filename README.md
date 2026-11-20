# uv-pdf

Universal Viewer 4.4.4 PDF viewer test bed.

    npm install            # also copies UV into public/uv
    # put a PDF at public/media/test.pdf (gitignored)
    npm start              # http://localhost:8080

- `/` : browser-native renderer (PDFObject)
- `/?pdfjs=1` : pdf.js canvas renderer (`modules.pdfCenterPanel.options.usePdfJs`)
- `/?pdfjs=new` : same, but with newer pdf.js (default 6.5.438, override with `&v=`). UV's pdf.js loader is patched by `scripts/sync-uv.mjs`
- Manifest: `public/manifest.json` (IIIF v3, one Canvas with an `application/pdf` body)

Demo: https://uv-pdf.vercel.app

See `docs/NOTES.md` for findings and status, `docs/risk-pdfjs.md` for the Swedish risk write-up.

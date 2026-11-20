# uv-pdf

Universal Viewer 4.4.4 PDF viewer test bed.

    npm install            # also copies UV into public/uv
    # put a PDF at public/media/test.pdf (gitignored)
    npm start              # http://localhost:8080

- `/` : browser-native renderer (PDFObject)
- `/?pdfjs=1` : pdf.js canvas renderer (`modules.pdfCenterPanel.options.usePdfJs`)
- Manifest: `public/manifest.json` (IIIF v3, one Canvas with an `application/pdf` body)

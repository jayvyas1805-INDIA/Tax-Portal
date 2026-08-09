import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// pdf.js needs a worker script. Loading it from a CDN avoids extra Vite
// config — no need to copy the worker file into your public/ folder.
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

// Renders fully client-side: the browser fetches the raw PDF bytes itself
// and pdf.js parses them locally. This works regardless of where the file
// is hosted (including localhost/private networks in dev) and regardless
// of Content-Type/Content-Disposition headers — unlike a native <iframe>
// or Google Docs Viewer, which both require the file to be reachable
// (and correctly labeled) from outside your machine.
const PdfPreview = ({ label, fileUrl }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);

  // <Page> renders to a <canvas> at a fixed pixel width, so it has no way
  // to be responsive on its own — a hardcoded width just overflows (and
  // overlaps whatever sits below it) on any narrower container. Measuring
  // the wrapper and re-measuring on resize keeps the canvas in bounds.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const update = () => setContainerWidth(el.clientWidth);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleReload = () => {
    setFailed(false);
    setNumPages(null);
    setPageNumber(1);
    setAttempt((a) => a + 1);
  };

  if (failed) {
    return (
      <div className="pdm-doc-preview pdm-doc-preview--error">
        <strong>Error</strong>
        <p>Failed to load PDF document.</p>
        <div className="pdm-doc-preview__actions">
          <button type="button" onClick={handleReload}>
            Reload
          </button>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            Open in new tab ↗
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="pdm-pdf-preview pdm-pdf-preview--rendered" ref={containerRef}>
      <Document
        key={attempt}
        file={fileUrl}
        loading={<div className="pdm-doc-preview--loading"><p>Loading {label}…</p></div>}
        onLoadSuccess={({ numPages: n }) => setNumPages(n)}
        onLoadError={(err) => {
          // Logging the real pdf.js error is the only way to tell apart a
          // CORS block, a 404/auth failure, a corrupt file, or a worker
          // load failure — they all render as the same generic message.
          console.error("PdfPreview load error for", fileUrl, err);
          setFailed(true);
        }}
      >
        {containerWidth > 0 && (
          <Page
            pageNumber={pageNumber}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            width={containerWidth}
          />
        )}
      </Document>

      {numPages > 1 && (
        <div className="pdm-pdf-preview__nav">
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((p) => p - 1)}
          >
            ‹ Prev
          </button>
          <span>
            Page {pageNumber} of {numPages}
          </span>
          <button
            type="button"
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber((p) => p + 1)}
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
};

export default PdfPreview;
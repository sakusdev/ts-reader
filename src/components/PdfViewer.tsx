import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import { useSwipePaging } from "../hooks/useSwipePaging";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

type Props = {
  file: File;
  initialLocation: string | null;
  onLocationChange: (location: string, progressLabel: string) => void;
};

export function PdfViewer({ file, initialLocation, onLocationChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => (pageCount ? Math.min(pageCount, p + 1) : p + 1));
  const swipeHandlers = useSwipePaging({ onPrev: goPrev, onNext: goNext });

  useEffect(() => {
    const restoredPage = Number(initialLocation);
    setPage(Number.isFinite(restoredPage) && restoredPage > 0 ? restoredPage : 1);
    setPageCount(0);
  }, [file, initialLocation]);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const data = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data }).promise;

      if (cancelled) return;
      setPageCount(pdf.numPages);

      const safePage = Math.min(Math.max(page, 1), pdf.numPages);
      const pdfPage = await pdf.getPage(safePage);

      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      const viewport = pdfPage.getViewport({ scale: 1.4 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await pdfPage.render({
        canvas,
        canvasContext: context,
        viewport,
      }).promise;

      onLocationChange(String(safePage), `Page ${safePage} / ${pdf.numPages}`);
    }

    render().catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [file, page, onLocationChange]);

  return (
    <section className="viewer" {...swipeHandlers}>
      <div className="viewerControls">
        <button onClick={goPrev}>Prev</button>
        <span>{page} / {pageCount || "?"}</span>
        <button onClick={goNext}>Next</button>
      </div>
      <div className="mobileSwipeHint">Swipe left / right to turn pages</div>
      <canvas ref={canvasRef} className="pdfCanvas" />
    </section>
  );
}

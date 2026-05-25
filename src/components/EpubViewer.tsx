import { useEffect, useRef } from "react";
import ePub, { type Rendition } from "epubjs";
import { useSwipePaging } from "../hooks/useSwipePaging";

type Props = {
  file: File;
  initialLocation: string | null;
  onLocationChange: (location: string, progressLabel: string) => void;
};

export function EpubViewer({ file, initialLocation, onLocationChange }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renditionRef = useRef<Rendition | null>(null);

  const goPrev = () => renditionRef.current?.prev();
  const goNext = () => renditionRef.current?.next();
  const swipeHandlers = useSwipePaging({ onPrev: goPrev, onNext: goNext });

  useEffect(() => {
    let destroyed = false;

    async function open() {
      const buffer = await file.arrayBuffer();
      if (destroyed || !containerRef.current) return;

      containerRef.current.innerHTML = "";

      const book = ePub(buffer);
      const rendition = book.renderTo(containerRef.current, {
        width: "100%",
        height: "100%",
        spread: "none",
      });

      rendition.on("relocated", (location: { start?: { cfi?: string; percentage?: number } }) => {
        const cfi = location.start?.cfi ?? "";
        const percentage = location.start?.percentage;
        const label = typeof percentage === "number"
          ? `${Math.round(percentage * 100)}%`
          : "EPUB position saved";

        onLocationChange(cfi, label);
      });

      renditionRef.current = rendition;
      await rendition.display(initialLocation || undefined);
    }

    open().catch(console.error);

    return () => {
      destroyed = true;
      renditionRef.current?.destroy();
      renditionRef.current = null;
    };
  }, [file, initialLocation, onLocationChange]);

  return (
    <section className="viewer" {...swipeHandlers}>
      <div className="viewerControls">
        <button onClick={goPrev}>Prev</button>
        <span>{file.name}</span>
        <button onClick={goNext}>Next</button>
      </div>
      <div className="mobileSwipeHint">Swipe left / right to turn pages</div>
      <div ref={containerRef} className="epubFrame" />
    </section>
  );
}

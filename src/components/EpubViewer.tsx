import { useEffect, useRef } from "react";
import ePub, { type Rendition } from "epubjs";

type Props = {
  file: File;
  onLocationChange: (location: string, progressLabel: string) => void;
};

export function EpubViewer({ file, onLocationChange }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renditionRef = useRef<Rendition | null>(null);

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
      await rendition.display();
    }

    open().catch(console.error);

    return () => {
      destroyed = true;
      renditionRef.current?.destroy();
      renditionRef.current = null;
    };
  }, [file, onLocationChange]);

  return (
    <section className="viewer">
      <div className="viewerControls">
        <button onClick={() => renditionRef.current?.prev()}>Prev</button>
        <span>{file.name}</span>
        <button onClick={() => renditionRef.current?.next()}>Next</button>
      </div>
      <div ref={containerRef} className="epubFrame" />
    </section>
  );
}

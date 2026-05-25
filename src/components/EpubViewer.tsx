import { useEffect, useRef } from "react";
import ePub, { type Rendition } from "epubjs";

type Props = {
  file: File;
};

export function EpubViewer({ file }: Props) {
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

      renditionRef.current = rendition;
      await rendition.display();
    }

    open().catch(console.error);

    return () => {
      destroyed = true;
      renditionRef.current?.destroy();
      renditionRef.current = null;
    };
  }, [file]);

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

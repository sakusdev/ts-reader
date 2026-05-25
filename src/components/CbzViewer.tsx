import { useEffect, useState } from "react";
import JSZip from "jszip";

type Props = {
  file: File;
  onLocationChange: (location: string, progressLabel: string) => void;
};

export function CbzViewer({ file, onLocationChange }: Props) {
  const [pages, setPages] = useState<string[]>([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let urls: string[] = [];

    async function open() {
      const zip = await JSZip.loadAsync(await file.arrayBuffer());

      const imageFiles = Object.values(zip.files)
        .filter((entry) => !entry.dir && /\.(png|jpe?g|webp|gif)$/i.test(entry.name))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

      urls = await Promise.all(
        imageFiles.map(async (entry) => {
          const blob = await entry.async("blob");
          return URL.createObjectURL(blob);
        })
      );

      setPages(urls);
      setPage(0);
    }

    open().catch(console.error);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [file]);

  useEffect(() => {
    if (pages.length === 0) return;
    onLocationChange(String(page), `Page ${page + 1} / ${pages.length}`);
  }, [page, pages.length, onLocationChange]);

  return (
    <section className="viewer">
      <div className="viewerControls">
        <button onClick={() => setPage((p) => Math.max(0, p - 1))}>Prev</button>
        <span>{pages.length ? `${page + 1} / ${pages.length}` : "Loading"}</span>
        <button onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))}>Next</button>
      </div>

      {pages[page] && <img className="cbzImage" src={pages[page]} alt={`Page ${page + 1}`} />}
    </section>
  );
}

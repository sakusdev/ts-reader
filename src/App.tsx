import { useState } from "react";
import { PdfViewer } from "./components/PdfViewer";
import { EpubViewer } from "./components/EpubViewer";
import { CbzViewer } from "./components/CbzViewer";
import { detectBookFormat, type BookFormat } from "./readers/format";

export function App() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<BookFormat | null>(null);

  function onFileChange(nextFile: File | undefined) {
    if (!nextFile) return;
    setFile(nextFile);
    setFormat(detectBookFormat(nextFile.name, nextFile.type));
  }

  return (
    <main className="app">
      <header className="toolbar">
        <div>
          <h1>ts-reader</h1>
          <p>PDF / EPUB / CBZ local ebook reader</p>
        </div>

        <label className="fileButton">
          Open book
          <input
            type="file"
            accept=".pdf,.epub,.cbz,.zip,application/pdf,application/epub+zip"
            onChange={(event) => onFileChange(event.target.files?.[0])}
          />
        </label>
      </header>

      {!file && (
        <section className="empty">
          <h2>Select a file</h2>
          <p>Open PDF, EPUB, CBZ, or ZIP image books.</p>
        </section>
      )}

      {file && format === "pdf" && <PdfViewer file={file} />}
      {file && format === "epub" && <EpubViewer file={file} />}
      {file && format === "cbz" && <CbzViewer file={file} />}
      {file && format === "unknown" && (
        <section className="empty">
          <h2>Unsupported format</h2>
          <p>{file.name}</p>
        </section>
      )}
    </main>
  );
}

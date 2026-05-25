import { useCallback, useEffect, useState } from "react";
import { PdfViewer } from "./components/PdfViewer";
import { EpubViewer } from "./components/EpubViewer";
import { CbzViewer } from "./components/CbzViewer";
import { Bookshelf } from "./components/Bookshelf";
import { createBookId, getBookTitle, type LibraryBook } from "./books";
import { detectBookFormat, type BookFormat } from "./readers/format";
import { clearLibrary, listLibraryBooks, saveLibraryBook, saveReadingState } from "./storage/libraryDb";

export function App() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<BookFormat | null>(null);
  const [bookId, setBookId] = useState<string | null>(null);
  const [books, setBooks] = useState<LibraryBook[]>([]);

  const refreshBooks = useCallback(async () => {
    setBooks(await listLibraryBooks());
  }, []);

  useEffect(() => {
    refreshBooks().catch(console.error);
  }, [refreshBooks]);

  async function onFileChange(nextFile: File | undefined) {
    if (!nextFile) return;

    const nextFormat = detectBookFormat(nextFile.name, nextFile.type);
    const nextBookId = createBookId(nextFile);

    setFile(nextFile);
    setFormat(nextFormat);
    setBookId(nextBookId);

    if (nextFormat !== "unknown") {
      await saveLibraryBook({
        id: nextBookId,
        title: getBookTitle(nextFile),
        format: nextFormat,
        size: nextFile.size,
        lastModified: nextFile.lastModified,
        lastOpenedAt: Date.now(),
        location: "",
        progressLabel: "Opened",
      });
      await refreshBooks();
    }
  }

  const onLocationChange = useCallback(async (location: string, progressLabel: string) => {
    if (!file || !format || !bookId || format === "unknown") return;

    const book: LibraryBook = {
      id: bookId,
      title: getBookTitle(file),
      format,
      size: file.size,
      lastModified: file.lastModified,
      lastOpenedAt: Date.now(),
      location,
      progressLabel,
    };

    await saveLibraryBook(book);
    await saveReadingState({
      bookId,
      title: book.title,
      format,
      location,
      progressLabel,
      updatedAt: Date.now(),
    });
    await refreshBooks();
  }, [bookId, file, format, refreshBooks]);

  async function onClearLibrary() {
    await clearLibrary();
    await refreshBooks();
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

      <div className="layout">
        <Bookshelf books={books} currentBookId={bookId} onClear={onClearLibrary} />

        <section className="readerPane">
          {!file && (
            <section className="empty">
              <h2>Select a file</h2>
              <p>Open PDF, EPUB, CBZ, or ZIP image books.</p>
              <p className="hint">The browser stores history and reading position, but you still need to select the local file again.</p>
            </section>
          )}

          {file && format === "pdf" && <PdfViewer file={file} onLocationChange={onLocationChange} />}
          {file && format === "epub" && <EpubViewer file={file} onLocationChange={onLocationChange} />}
          {file && format === "cbz" && <CbzViewer file={file} onLocationChange={onLocationChange} />}
          {file && format === "unknown" && (
            <section className="empty">
              <h2>Unsupported format</h2>
              <p>{file.name}</p>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}

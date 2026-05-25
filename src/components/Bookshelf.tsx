import type { LibraryBook } from "../books";

type Props = {
  books: LibraryBook[];
  currentBookId: string | null;
  onClear: () => void;
};

export function Bookshelf({ books, currentBookId, onClear }: Props) {
  return (
    <aside className="bookshelf">
      <div className="bookshelfHeader">
        <h2>Bookshelf</h2>
        <button onClick={onClear} disabled={books.length === 0}>Clear</button>
      </div>

      {books.length === 0 && (
        <p className="bookshelfEmpty">Open a book to add it here.</p>
      )}

      <div className="bookList">
        {books.map((book) => (
          <article
            key={book.id}
            className={book.id === currentBookId ? "bookCard active" : "bookCard"}
          >
            <div className="bookTitle">{book.title}</div>
            <div className="bookMeta">{book.format.toUpperCase()} · {formatBytes(book.size)}</div>
            <div className="bookProgress">{book.progressLabel || "No progress"}</div>
          </article>
        ))}
      </div>
    </aside>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

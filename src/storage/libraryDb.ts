import { openDB } from "idb";
import type { LibraryBook } from "../books";

export type ReadingState = {
  bookId: string;
  title: string;
  format: string;
  location: string;
  progressLabel: string;
  updatedAt: number;
};

export const libraryDb = openDB("ts-reader", 2, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("readingStates")) {
      db.createObjectStore("readingStates", { keyPath: "bookId" });
    }

    if (!db.objectStoreNames.contains("books")) {
      db.createObjectStore("books", { keyPath: "id" });
    }
  },
});

export async function saveReadingState(state: ReadingState) {
  const db = await libraryDb;
  await db.put("readingStates", state);
}

export async function getReadingState(bookId: string) {
  const db = await libraryDb;
  return db.get("readingStates", bookId);
}

export async function saveLibraryBook(book: LibraryBook) {
  const db = await libraryDb;
  await db.put("books", book);
}

export async function listLibraryBooks() {
  const db = await libraryDb;
  const books = await db.getAll("books");
  return books.sort((a, b) => b.lastOpenedAt - a.lastOpenedAt) as LibraryBook[];
}

export async function clearLibrary() {
  const db = await libraryDb;
  await db.clear("books");
  await db.clear("readingStates");
}

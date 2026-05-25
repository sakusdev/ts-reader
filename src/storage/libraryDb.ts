import { openDB } from "idb";

export type ReadingState = {
  bookId: string;
  title: string;
  format: string;
  location: string;
  updatedAt: number;
};

export const libraryDb = openDB("ts-reader", 1, {
  upgrade(db) {
    db.createObjectStore("readingStates", { keyPath: "bookId" });
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

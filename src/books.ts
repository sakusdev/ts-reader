import type { BookFormat } from "./readers/format";

export type LibraryBook = {
  id: string;
  title: string;
  format: BookFormat;
  size: number;
  lastModified: number;
  lastOpenedAt: number;
  location: string;
  progressLabel: string;
};

export function createBookId(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

export function getBookTitle(file: File) {
  return file.name.replace(/\.[^.]+$/, "");
}

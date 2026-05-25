export type BookFormat = "pdf" | "epub" | "cbz" | "unknown";

export function detectBookFormat(fileName: string, mimeType: string): BookFormat {
  const lower = fileName.toLowerCase();

  if (mimeType === "application/pdf" || lower.endsWith(".pdf")) return "pdf";
  if (mimeType === "application/epub+zip" || lower.endsWith(".epub")) return "epub";
  if (lower.endsWith(".cbz") || lower.endsWith(".zip")) return "cbz";

  return "unknown";
}

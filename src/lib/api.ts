import type { Book } from "../types";
import { fallbackBooks } from "../data/seed";
import { makeCover } from "./cover";

interface DummyProduct {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  brand?: string;
  sku?: string;
}

const BOOK_CATEGORIES = [
  "Fiction",
  "Science",
  "History",
  "Technology",
  "Biography",
  "Mystery",
  "Fantasy",
  "Philosophy",
];

function titleCase(s: string): string {
  return s
    .split(/[\s-_]+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function mapProductToBook(p: DummyProduct, index: number): Book {
  const h = hashStr(p.title + p.id);
  const category = BOOK_CATEGORIES[h % BOOK_CATEGORIES.length];
  const author = p.brand ? titleCase(p.brand) : `Author ${String.fromCharCode(65 + (h % 26))}. Writer`;
  const total = 2 + (h % 6);
  const available = Math.max(0, total - (h % 3));
  const year = 1998 + (h % 27);
  return {
    id: `api_${p.id}`,
    title: p.title,
    author,
    isbn: p.sku ?? `978-1-${String(10000 + (h % 89999))}`,
    publisher: p.brand ? `${titleCase(p.brand)} Press` : "Meridian Press",
    category,
    year,
    availableCopies: index < 2 ? 0 : available,
    totalCopies: total,
    description: p.description,
    // Generated cover: DummyJSON thumbnails are product photos on an
    // unreliable CDN — real book-style art always renders instead.
    cover: makeCover(p.title, author, category),
  };
}

export async function fetchBooksFromAPI(signal?: AbortSignal): Promise<Book[]> {
  const res = await fetch("https://dummyjson.com/products?limit=30&skip=0", { signal });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = (await res.json()) as { products: DummyProduct[] };
  if (!Array.isArray(data.products)) throw new Error("Unexpected API response");
  return data.products.map(mapProductToBook);
}

export function getFallbackBooks(): Book[] {
  return fallbackBooks;
}

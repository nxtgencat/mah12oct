import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowUpDown, Eye, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useLibrary } from "../context/LibraryContext";
import { useToast } from "../context/ToastContext";
import type { Book } from "../types";
import { Badge, BookCardSkeleton, Button, Card, EmptyState, ErrorState, NoResults, PageHeader, Pagination, Select } from "../components/ui";
import { ConfirmDialog, Modal } from "../components/Modal";
import { BookForm } from "../components/forms";

const PAGE_SIZE = 8;

function Cover({ book }: { book: Book }) {
  const [failed, setFailed] = useState(false);
  if (!book.cover || failed) {
    return (
      <div className="flex aspect-[2/3] w-full items-center justify-center bg-gradient-to-br from-primary-800 to-primary-500 p-4 text-center">
        <p className="line-clamp-2 text-[15px] font-bold leading-snug text-white">{book.title}</p>
      </div>
    );
  }
  return (
    <img
      src={book.cover}
      alt={`Cover of ${book.title}`}
      loading="lazy"
      onError={() => setFailed(true)}
      className="aspect-[2/3] w-full object-cover"
    />
  );
}

export function BooksPage() {
  const { books, categories, booksLoading, booksError, apiSource, reloadBooks, addBook, updateBook, deleteBook } = useLibrary();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const initialQ = params.get("q") ?? "";

  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState("all");
  const [author, setAuthor] = useState("all");
  const [sort, setSort] = useState<"none" | "az" | "za">("none");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<{ mode: "add" | "edit"; book?: Book } | null>(null);
  const [deleting, setDeleting] = useState<Book | null>(null);

  useEffect(() => {
    setQ(params.get("q") ?? "");
    setPage(1);
  }, [params]);

  useEffect(() => {
    setPage(1);
  }, [q, category, author, sort]);

  const authors = useMemo(() => Array.from(new Set(books.map((b) => b.author))).sort(), [books]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = books.filter((b) => {
      const matchQ =
        !needle ||
        b.title.toLowerCase().includes(needle) ||
        b.author.toLowerCase().includes(needle) ||
        b.isbn.toLowerCase().includes(needle);
      const matchC = category === "all" || b.category === category;
      const matchA = author === "all" || b.author === author;
      return matchQ && matchC && matchA;
    });
    if (sort === "az") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "za") list = [...list].sort((a, b) => b.title.localeCompare(a.title));
    return list;
  }, [books, q, category, author, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const clearFilters = () => {
    setQ("");
    setCategory("all");
    setAuthor("all");
    setSort("none");
    setParams({});
  };
  const hasFilter = q.trim() !== "" || category !== "all" || author !== "all" || sort !== "none";

  return (
    <div>
      <PageHeader
        title="Books"
        subtitle={
          apiSource === "api"
            ? `Live catalog from DummyJSON · ${books.length} titles`
            : apiSource === "cache"
              ? `Cached catalog · ${books.length} titles`
              : `Local catalog · ${books.length} titles`
        }
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={reloadBooks} disabled={booksLoading}>
              <RefreshCw size={14} aria-hidden="true" className={booksLoading ? "animate-spin" : ""} />
              Sync API
            </Button>
            <Button size="sm" onClick={() => setModal({ mode: "add" })}>
              <Plus size={15} aria-hidden="true" /> Add book
            </Button>
          </>
        }
      />

      {booksError ? (
        <div className="mb-4">
          <ErrorState message={booksError} onRetry={reloadBooks} />
        </div>
      ) : null}

      <Card className="mb-4 p-3.5">
        <div className="grid gap-2.5 md:grid-cols-[1.4fr_1fr_1fr_auto] [&>*]:min-w-0">
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title, author, ISBN…"
              aria-label="Search books"
              className="w-full rounded-sm border border-gray-300 bg-white py-2 pl-9 pr-3 text-[13.5px] outline-none transition placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:border-night-700 dark:bg-night-800 dark:text-gray-100"
            />
          </div>
          <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select value={author} onChange={(e) => setAuthor(e.target.value)} aria-label="Filter by author">
            <option value="all">All authors</option>
            {authors.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
          <Button variant="secondary" size="sm" onClick={() => setSort((s) => (s === "az" ? "za" : "az"))} aria-label="Sort by title">
            <ArrowUpDown size={14} aria-hidden="true" /> {sort === "az" ? "A–Z" : sort === "za" ? "Z–A" : "Sort"}
          </Button>
        </div>
      </Card>

      {booksLoading && books.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Loading books">
          {Array.from({ length: 8 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : books.length === 0 && !booksLoading ? (
        <Card>
          <EmptyState
            title="No books in the catalog"
            message="Sync from the API or add your first book manually."
            action={
              <div className="flex gap-2">
                <Button size="sm" onClick={reloadBooks}>Sync API</Button>
                <Button size="sm" variant="secondary" onClick={() => setModal({ mode: "add" })}>Add book</Button>
              </div>
            }
          />
        </Card>
      ) : pageItems.length === 0 ? (
        <Card>
          <NoResults query={q} onClear={hasFilter ? clearFilters : undefined} />
        </Card>
      ) : (
        <>
          <p className="t-caption mb-3" role="status">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} books
          </p>
          <div className="anim-list-in grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {pageItems.map((b) => (
              <Card key={b.id} className="group flex flex-col overflow-hidden transition-shadow hover:shadow-medium">
                <div className="relative">
                  <Cover book={b} />
                  <span className="absolute left-2 top-2">
                    <Badge tone={b.availableCopies > 0 ? "green" : "red"}>
                      {b.availableCopies > 0 ? `${b.availableCopies} available` : "Out of stock"}
                    </Badge>
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="t-caption">{b.category} · {b.year}</p>
                  <h3 className="mt-0.5 line-clamp-1 text-[15px] font-bold tracking-tight" title={b.title}>
                    {b.title}
                  </h3>
                  <p className="t-muted truncate">by {b.author}</p>
                  <p className="t-caption mt-1 truncate">ISBN {b.isbn}</p>
                  <p className="t-muted mt-2 line-clamp-2 text-[13px]">{b.description}</p>
                  <div className="mt-3 flex items-center gap-1.5 border-t border-gray-100 pt-3 dark:border-white/10">
                    <Link
                      to={`/books/${b.id}`}
                      aria-label={`View ${b.title}`}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-sm border border-gray-300 bg-white px-2 py-1.5 text-[12.5px] font-semibold text-ink-700 transition hover:bg-gray-50 dark:border-night-700 dark:bg-night-800 dark:text-gray-200 dark:hover:bg-night-700"
                    >
                      <Eye size={13} aria-hidden="true" /> View
                    </Link>
                    <button
                      type="button"
                      onClick={() => setModal({ mode: "edit", book: b })}
                      aria-label={`Edit ${b.title}`}
                      className="rounded-sm border border-gray-300 bg-white p-[7px] text-ink-700 transition hover:bg-gray-50 dark:border-night-700 dark:bg-night-800 dark:text-gray-200 dark:hover:bg-night-700"
                    >
                      <Pencil size={13} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(b)}
                      aria-label={`Delete ${b.title}`}
                      className="rounded-sm border border-gray-300 bg-white p-[7px] text-red-600 transition hover:bg-red-50 dark:border-night-700 dark:bg-night-800 dark:hover:bg-red-500/10"
                    >
                      <Trash2 size={13} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Pagination page={safePage} totalPages={totalPages} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
        </>
      )}

      <Modal
        open={modal !== null}
        title={modal?.mode === "edit" ? "Edit book" : "Add new book"}
        subtitle="All fields except description are required."
        onClose={() => setModal(null)}
        wide
      >
        {modal ? (
          <BookForm
            initial={modal.book}
            onCancel={() => setModal(null)}
            onSubmit={(values) => {
              if (modal.mode === "edit" && modal.book) {
                updateBook(modal.book.id, values);
                toast.success("Book updated", values.title);
              } else {
                addBook(values);
                toast.success("Book added", values.title);
              }
              setModal(null);
            }}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete book?"
        message={deleting ? `“${deleting.title}” will be permanently removed. This cannot be undone.` : ""}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;
          const ok = deleteBook(deleting.id);
          if (ok) toast.success("Book deleted", deleting.title);
          else toast.error("Cannot delete", "This book is currently issued to a member.");
          setDeleting(null);
        }}
      />
    </div>
  );
}

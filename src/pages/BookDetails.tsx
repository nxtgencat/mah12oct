import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Pencil } from "lucide-react";
import { useLibrary } from "../context/LibraryContext";
import { useToast } from "../context/ToastContext";
import { Badge, Button, Card, EmptyState, PageHeader } from "../components/ui";
import { Modal } from "../components/Modal";
import { BookForm } from "../components/forms";

export function BookDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { books, updateBook, activeIssues, members } = useLibrary();
  const toast = useToast();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const book = books.find((b) => b.id === id);
  if (!book) {
    return (
      <div>
        <PageHeader title="Book not found" />
        <Card>
          <EmptyState
            title="This book doesn't exist"
            message="It may have been deleted. Return to the catalog to browse available titles."
            action={
              <Button size="sm" onClick={() => navigate("/books")}>
                Back to books
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const issuedTo = activeIssues
    .filter((i) => i.bookId === book.id)
    .map((i) => members.find((m) => m.id === i.memberId)?.name ?? "Member");

  return (
    <div>
      <PageHeader
        title={book.title}
        subtitle={`by ${book.author} · ${book.publisher}, ${book.year}`}
        actions={
          <>
            <Link to="/books" className="inline-flex items-center gap-1.5 rounded-sm border border-gray-300 bg-white px-3.5 py-2 text-[13px] font-semibold text-ink-700 shadow-subtle transition hover:bg-gray-50 dark:border-night-700 dark:bg-night-800 dark:text-gray-200 dark:hover:bg-night-700">
              <ArrowLeft size={14} aria-hidden="true" /> All books
            </Link>
            <Button size="sm" onClick={() => setEditing(true)}>
              <Pencil size={14} aria-hidden="true" /> Edit
            </Button>
          </>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="min-w-0 overflow-hidden lg:col-span-1">
          {book.cover && !imgFailed ? (
            <img src={book.cover} alt={`Cover of ${book.title}`} onError={() => setImgFailed(true)} className="aspect-[4/5] w-full object-cover" />
          ) : (
            <div className="flex aspect-[4/5] w-full items-center justify-center bg-gradient-to-br from-primary-800 to-primary-500 p-6 text-center">
              <p className="text-[22px] font-bold text-white">{book.title}</p>
            </div>
          )}
          <div className="p-4">
            <Badge tone={book.availableCopies > 0 ? "green" : "red"}>
              {book.availableCopies} of {book.totalCopies} copies available
            </Badge>
          </div>
        </Card>
        <Card className="min-w-0 p-5 lg:col-span-2">
          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {[
              ["Title", book.title],
              ["Author", book.author],
              ["ISBN", book.isbn],
              ["Publisher", book.publisher],
              ["Category", book.category],
              ["Published year", String(book.year)],
              ["Total copies", String(book.totalCopies)],
              ["Available copies", String(book.availableCopies)],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="t-label uppercase tracking-wide text-ink-500 dark:text-gray-400">{k}</dt>
                <dd className="t-body mt-0.5 font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 border-t border-gray-100 pt-4 dark:border-white/10">
            <h2 className="t-subheading text-[14px]">Description</h2>
            <p className="t-body mt-1.5 text-ink-700 dark:text-gray-300">{book.description || "No description available."}</p>
          </div>
          <div className="mt-5 border-t border-gray-100 pt-4 dark:border-white/10">
            <h2 className="t-subheading text-[14px]">Currently issued to</h2>
            {issuedTo.length === 0 ? (
              <p className="t-muted mt-1">All copies are on the shelf.</p>
            ) : (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {issuedTo.map((n) => (
                  <Badge key={n} tone="violet">{n}</Badge>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      <Modal open={editing} title="Edit book" onClose={() => setEditing(false)} wide>
        <BookForm
          initial={book}
          onCancel={() => setEditing(false)}
          onSubmit={(values) => {
            updateBook(book.id, values);
            toast.success("Book updated", values.title);
            setEditing(false);
          }}
        />
      </Modal>
    </div>
  );
}

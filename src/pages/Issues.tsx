import { useMemo, useState } from "react";
import { ArrowLeftRight, History, RotateCcw } from "lucide-react";
import { useLibrary } from "../context/LibraryContext";
import { useToast } from "../context/ToastContext";
import { Badge, Button, Card, EmptyState, Field, NoResults, PageHeader, Pagination, Select } from "../components/ui";
import { formatDate } from "../lib/utils";

const PAGE_SIZE = 8;

export function IssuesPage() {
  const { books, members, issues, issueBook, returnBook } = useLibrary();
  const toast = useToast();
  const [bookId, setBookId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [historyQ, setHistoryQ] = useState("");
  const [status, setStatus] = useState<"all" | "issued" | "returned" | "overdue">("all");
  const [page, setPage] = useState(1);

  const availableBooks = useMemo(() => books.filter((b) => b.availableCopies > 0), [books]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookId || !memberId) {
      toast.error("Missing selection", "Choose both a book and a member.");
      return;
    }
    const res = issueBook(bookId, memberId);
    if (res.ok) {
      toast.success("Book issued", res.message);
      setBookId("");
      setMemberId("");
    } else {
      toast.error("Cannot issue", res.message);
    }
  };

  const history = useMemo(() => {
    const t = new Date().toISOString().slice(0, 10);
    const needle = historyQ.trim().toLowerCase();
    return issues
      .filter((i) => {
        const book = books.find((b) => b.id === i.bookId);
        const member = members.find((m) => m.id === i.memberId);
        const matchQ =
          !needle ||
          book?.title.toLowerCase().includes(needle) ||
          member?.name.toLowerCase().includes(needle);
        const isOverdue = i.returnDate === null && i.dueDate < t;
        const matchS =
          status === "all" ||
          (status === "issued" && i.returnDate === null && !isOverdue) ||
          (status === "returned" && i.returnDate !== null) ||
          (status === "overdue" && isOverdue);
        return matchQ && matchS;
      })
      .slice()
      .sort((a, b) => b.issueDate.localeCompare(a.issueDate));
  }, [issues, books, members, historyQ, status]);

  const totalPages = Math.max(1, Math.ceil(history.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const items = history.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const t = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <PageHeader title="Issue & Return" subtitle="Lend books in seconds. Availability updates automatically." />

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="min-w-0 p-5 lg:col-span-2">
          <h2 className="t-heading flex items-center gap-2 text-[16px]">
            <ArrowLeftRight size={17} className="text-primary-700" aria-hidden="true" /> Issue a book
          </h2>
          <p className="t-muted mt-0.5">14-day loan · $2/day overdue fine.</p>
          <form onSubmit={submit} className="mt-4 space-y-3.5">
            <Field label="Book" required>
              <Select value={bookId} onChange={(e) => setBookId(e.target.value)} aria-label="Select book">
                <option value="">Select a book…</option>
                {availableBooks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} — {b.availableCopies} left
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Member" required>
              <Select value={memberId} onChange={(e) => setMemberId(e.target.value)} aria-label="Select member">
                <option value="">Select a member…</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} · {m.membershipId}
                  </option>
                ))}
              </Select>
            </Field>
            {bookId && memberId ? (
              <p className="t-caption rounded-sm bg-primary-50 p-2.5 text-primary-800" role="status">
                Ready: “{books.find((b) => b.id === bookId)?.title}” → {members.find((m) => m.id === memberId)?.name}.
                Duplicate loans are blocked automatically.
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={!bookId || !memberId}>
              <ArrowLeftRight size={15} aria-hidden="true" /> Issue book
            </Button>
          </form>
          <div className="mt-4 rounded-md bg-gray-50 p-3 text-[12.5px] text-ink-500">
            Out-of-stock titles are hidden here. See the Books page for the full catalog.
          </div>
        </Card>

        <Card className="min-w-0 p-5 lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="t-heading flex items-center gap-2 text-[16px]">
              <History size={17} className="text-primary-700" aria-hidden="true" /> Issue history
            </h2>
            <Select value={status} onChange={(e) => { setStatus(e.target.value as typeof status); setPage(1); }} aria-label="Filter by status" className="!w-auto">
              <option value="all">All statuses</option>
              <option value="issued">Issued</option>
              <option value="overdue">Overdue</option>
              <option value="returned">Returned</option>
            </Select>
          </div>
          <input
            value={historyQ}
            onChange={(e) => { setHistoryQ(e.target.value); setPage(1); }}
            placeholder="Search by book or member…"
            aria-label="Search issue history"
            className="mt-3 w-full rounded-sm border border-gray-300 bg-white py-2 px-3 text-[13.5px] outline-none transition placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
          {items.length === 0 ? (
            <div className="mt-2">
              {history.length === 0 && issues.length === 0 ? (
                <EmptyState title="No circulation yet" message="Issue your first book using the form." />
              ) : (
                <NoResults onClear={() => { setHistoryQ(""); setStatus("all"); }} />
              )}
            </div>
          ) : (
            <>
              <ul className="anim-list-in mt-2 divide-y divide-gray-100">
                {items.map((i) => {
                  const book = books.find((b) => b.id === i.bookId);
                  const member = members.find((m) => m.id === i.memberId);
                  const overdue = i.returnDate === null && i.dueDate < t;
                  return (
                    <li key={i.id} className="flex flex-wrap items-center gap-3 py-3">
                      <div className="min-w-0 flex-1 basis-48">
                        <p className="truncate text-[13.5px] font-semibold">{book?.title ?? "Unknown book"}</p>
                        <p className="t-caption truncate">
                          {member?.name ?? "Unknown"} · {formatDate(i.issueDate)} → due {formatDate(i.dueDate)}
                          {i.returnDate ? ` · back ${formatDate(i.returnDate)}` : ""}
                        </p>
                      </div>
                      {i.returnDate ? <Badge tone="green">Returned</Badge> : overdue ? <Badge tone="red">Overdue</Badge> : <Badge tone="violet">Issued</Badge>}
                      {i.returnDate === null ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            const res = returnBook(i.id);
                            if (res.ok) toast.success("Returned", res.message);
                            else toast.error("Failed", res.message);
                          }}
                        >
                          <RotateCcw size={13} aria-hidden="true" /> Return
                        </Button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
              <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { BadgeCheck, CircleDollarSign, Search } from "lucide-react";
import { useLibrary } from "../context/LibraryContext";
import { useToast } from "../context/ToastContext";
import { Badge, Button, Card, EmptyState, NoResults, PageHeader, Select, StatCard } from "../components/ui";
import { formatCurrency, formatDate } from "../lib/utils";

export function FinesPage() {
  const { fineRecords, overdueIssues, books, members, toggleFinePaid, fineCollected, fineOutstanding } = useLibrary();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return fineRecords.filter((f) => {
      const member = members.find((m) => m.id === f.memberId);
      const matchQ = !needle || member?.name.toLowerCase().includes(needle) || member?.membershipId.toLowerCase().includes(needle);
      const matchF = filter === "all" || (filter === "paid" ? f.paid : !f.paid);
      return matchQ && matchF;
    });
  }, [fineRecords, members, q, filter]);

  const overdueList = useMemo(
    () =>
      overdueIssues.map((i) => ({
        issue: i,
        book: books.find((b) => b.id === i.bookId),
        member: members.find((m) => m.id === i.memberId),
      })),
    [overdueIssues, books, members],
  );

  return (
    <div>
      <PageHeader title="Fines" subtitle="Automatic $2/day overdue calculation. Payments are UI-only (demo)." />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Outstanding" value={formatCurrency(fineOutstanding)} sub={`${fineRecords.filter((f) => !f.paid).length} unpaid records`} icon={<CircleDollarSign size={19} />} tone="red" />
        <StatCard label="Collected" value={formatCurrency(fineCollected)} sub="Marked as paid" icon={<BadgeCheck size={19} />} tone="green" />
        <StatCard label="Overdue books" value={overdueIssues.length} sub="Currently past due" icon={<Search size={19} />} tone="amber" />
        <StatCard label="Total records" value={fineRecords.length} sub="All fine entries" icon={<CircleDollarSign size={19} />} tone="blue" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="min-w-0 p-5 lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="t-heading text-[16px]">Fine history</h2>
            <Select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} aria-label="Filter by payment status" className="!w-auto">
              <option value="all">Paid + Unpaid</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </Select>
          </div>
          <div className="relative mt-3">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by member name or ID…"
              aria-label="Search fines by member"
              className="w-full rounded-sm border border-gray-300 bg-white py-2 pl-9 pr-3 text-[13.5px] outline-none transition placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          {fineRecords.length === 0 ? (
            <EmptyState
              icon={<CircleDollarSign size={22} aria-hidden="true" />}
              title="No fines — well done"
              message="Overdue returns will automatically generate a fine record here."
            />
          ) : filtered.length === 0 ? (
            <NoResults query={q} onClear={() => { setQ(""); setFilter("all"); }} />
          ) : (
            <ul className="anim-list-in mt-2 divide-y divide-gray-100">
              {filtered.map((f) => {
                const book = books.find((b) => b.id === f.bookId);
                const member = members.find((m) => m.id === f.memberId);
                return (
                  <li key={f.issueId} className="flex flex-wrap items-center gap-3 py-3">
                    <div className="min-w-0 flex-1 basis-52">
                      <p className="truncate text-[13.5px] font-semibold">{member?.name ?? "Unknown member"}</p>
                      <p className="t-caption truncate">
                        {book?.title ?? "Unknown book"} · {f.daysOverdue}d overdue · due {formatDate(f.dueDate)}
                      </p>
                    </div>
                    <span className="text-[15px] font-bold">{formatCurrency(f.amount)}</span>
                    <Badge tone={f.paid ? "green" : "amber"}>{f.paid ? "Paid" : "Unpaid"}</Badge>
                    <Button
                      size="sm"
                      variant={f.paid ? "secondary" : "success"}
                      onClick={() => {
                        toggleFinePaid(f.issueId);
                        toast.info(f.paid ? "Marked unpaid" : "Marked paid", formatCurrency(f.amount));
                      }}
                    >
                      {f.paid ? "Mark unpaid" : "Mark paid"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="min-w-0 p-5 lg:col-span-2">
          <h2 className="t-heading text-[16px]">Overdue right now</h2>
          <p className="t-muted">{overdueList.length} books past due date.</p>
          {overdueList.length === 0 ? (
            <div className="mt-3 rounded-md bg-emerald-50 p-4 text-center ring-1 ring-inset ring-emerald-200">
              <p className="t-subheading text-[13.5px] text-emerald-800">All clear</p>
              <p className="t-muted mt-0.5">No books are currently overdue.</p>
            </div>
          ) : (
            <ul className="anim-list-in mt-3 space-y-2.5">
              {overdueList.map(({ issue, book, member }) => (
                <li key={issue.id} className="rounded-md border border-red-200 bg-red-50/50 p-3">
                  <p className="truncate text-[13.5px] font-bold">{book?.title ?? "Unknown"}</p>
                  <p className="t-caption mt-0.5">
                    {member?.name ?? "Unknown"} · due {formatDate(issue.dueDate)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

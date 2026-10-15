import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, BookOpen, CircleDollarSign, MapPin } from "lucide-react";
import { useLibrary } from "../context/LibraryContext";
import { FINE_PER_DAY } from "../types";
import { Badge, Button, Card, EmptyState, PageHeader } from "../components/ui";
import { daysBetween, formatCurrency, formatDate, todayISO } from "../lib/utils";

export function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { members, books, issues } = useLibrary();
  const navigate = useNavigate();
  const member = members.find((m) => m.id === id);

  if (!member) {
    return (
      <div>
        <PageHeader title="Member not found" />
        <Card>
          <EmptyState
            title="This member doesn't exist"
            message="They may have been removed."
            action={<Button size="sm" onClick={() => navigate("/members")}>Back to members</Button>}
          />
        </Card>
      </div>
    );
  }

  const mine = issues.filter((i) => i.memberId === member.id).slice().sort((a, b) => b.issueDate.localeCompare(a.issueDate));
  const active = mine.filter((i) => i.returnDate === null);
  const t = todayISO();
  const outstanding = mine.reduce((s, i) => {
    const end = i.returnDate ?? t;
    const days = Math.max(0, daysBetween(i.dueDate, end));
    return s + (days > 0 && !i.finePaid ? days * FINE_PER_DAY : 0);
  }, 0);

  return (
    <div>
      <PageHeader
        title={member.name}
        subtitle={`${member.membershipId} · Member since ${formatDate(member.joinedAt)}`}
        actions={
          <Link to="/members" className="inline-flex items-center gap-1.5 rounded-sm border border-gray-300 bg-white px-3.5 py-2 text-[13px] font-semibold text-ink-700 shadow-subtle transition hover:bg-gray-50 dark:border-night-700 dark:bg-night-800 dark:text-gray-200 dark:hover:bg-night-700">
            <ArrowLeft size={14} aria-hidden="true" /> All members
          </Link>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="min-w-0 p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary-700 text-[20px] font-bold text-white" aria-hidden="true">
            {member.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </div>
          <h2 className="t-heading mt-3 text-[17px]">{member.name}</h2>
          <p className="t-muted">{member.email}</p>
          <dl className="mt-4 space-y-2.5 border-t border-gray-100 pt-4 text-[13.5px] dark:border-white/10">
            <div><dt className="t-caption">Phone</dt><dd className="font-medium">{member.phone}</dd></div>
            <div><dt className="t-caption">Address</dt><dd className="flex items-start gap-1.5 font-medium"><MapPin size={14} className="mt-0.5 shrink-0 text-gray-400" aria-hidden="true" />{member.address}</dd></div>
            <div><dt className="t-caption">Membership ID</dt><dd className="font-mono text-[13px] font-semibold">{member.membershipId}</dd></div>
          </dl>
          <div className="mt-4 flex gap-2">
            <span className="flex-1 rounded-md bg-violet-50 p-2.5 text-center ring-1 ring-inset ring-violet-200">
              <span className="block text-[19px] font-bold text-violet-800">{active.length}</span>
              <span className="t-caption">Active loans</span>
            </span>
            <span className="flex-1 rounded-md bg-amber-50 p-2.5 text-center ring-1 ring-inset ring-amber-200">
              <span className="block text-[19px] font-bold text-amber-800">{formatCurrency(outstanding)}</span>
              <span className="t-caption">Due fines</span>
            </span>
          </div>
        </Card>

        <Card className="min-w-0 p-5 lg:col-span-2">
          <h2 className="t-heading text-[16px]">Borrowing history</h2>
          <p className="t-muted">{mine.length} records</p>
          {mine.length === 0 ? (
            <EmptyState icon={<BookOpen size={22} aria-hidden="true" />} title="No loans yet" message="Books issued to this member will appear here." />
          ) : (
            <ul className="anim-list-in mt-3 divide-y divide-gray-100 dark:divide-white/10">
              {mine.map((i) => {
                const book = books.find((b) => b.id === i.bookId);
                const overdue = i.returnDate === null && i.dueDate < t;
                return (
                  <li key={i.id} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold">{book?.title ?? "Unknown book"}</p>
                      <p className="t-caption">
                        Issued {formatDate(i.issueDate)} · Due {formatDate(i.dueDate)}
                        {i.returnDate ? ` · Returned ${formatDate(i.returnDate)}` : ""}
                      </p>
                    </div>
                    {i.returnDate ? <Badge tone="green">Returned</Badge> : overdue ? <Badge tone="red">Overdue</Badge> : <Badge tone="violet">Issued</Badge>}
                    {!i.finePaid && Math.max(0, daysBetween(i.dueDate, i.returnDate ?? t)) > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-amber-700">
                        <CircleDollarSign size={13} aria-hidden="true" />
                        {formatCurrency(Math.max(0, daysBetween(i.dueDate, i.returnDate ?? t)) * FINE_PER_DAY)}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

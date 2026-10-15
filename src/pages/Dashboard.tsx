import { Link } from "react-router";
import {
  ArrowLeftRight,
  ArrowRight,
  BookOpen,
  CircleDollarSign,
  Clock3,
  Plus,
  Tags,
  TriangleAlert,
  UserPlus,
  Users,
} from "lucide-react";
import { useLibrary } from "../context/LibraryContext";
import { Badge, Card, PageHeader, StatCard } from "../components/ui";
import { formatCurrency, timeAgo } from "../lib/utils";

const kindDot: Record<string, string> = {
  book: "bg-primary-500",
  member: "bg-teal-500",
  issue: "bg-violet-500",
  fine: "bg-amber-500",
  auth: "bg-gray-400",
  category: "bg-emerald-500",
};

export function DashboardPage() {
  const { books, members, categories, activeIssues, overdueIssues, fineCollected, activities, issues } = useLibrary();

  const totalCopies = books.reduce((s, b) => s + b.totalCopies, 0);
  const available = books.reduce((s, b) => s + b.availableCopies, 0);
  const returned = issues.filter((i) => i.returnDate !== null).length;

  const quickActions = [
    { to: "/books", icon: Plus, title: "Add book", desc: "Expand the catalog", tone: "bg-primary-700" },
    { to: "/members", icon: UserPlus, title: "Add member", desc: "Register a reader", tone: "bg-teal-600" },
    { to: "/issues", icon: ArrowLeftRight, title: "Issue book", desc: "Lend in seconds", tone: "bg-violet-600" },
    { to: "/categories", icon: Tags, title: "Categories", desc: "Organize shelves", tone: "bg-amber-600" },
  ] as const;

  const recentIssues = issues.slice(0, 5);
  const bookById = (id: string) => books.find((b) => b.id === id)?.title ?? "Unknown book";
  const memberById = (id: string) => members.find((m) => m.id === id)?.name ?? "Unknown member";

  return (
    <div>
      <PageHeader
        title="Good day, Librarian"
        subtitle="Here's what's happening across your library today."
        actions={
          <>
            <Link to="/books" className="inline-flex items-center gap-1.5 rounded-sm bg-primary-700 px-4 py-2 text-[13.5px] font-semibold text-white shadow-subtle transition hover:bg-primary-800">
              <Plus size={15} aria-hidden="true" /> Add book
            </Link>
            <Link to="/issues" className="inline-flex items-center gap-1.5 rounded-sm border border-gray-300 bg-white px-4 py-2 text-[13.5px] font-semibold text-ink-900 shadow-subtle transition hover:bg-gray-50 dark:border-night-700 dark:bg-night-800 dark:text-gray-100 dark:hover:bg-night-700">
              Issue book
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Total books" value={books.length} sub={`${totalCopies} copies in stock`} icon={<BookOpen size={19} />} tone="blue" />
        <StatCard label="Members" value={members.length} sub="Active readers" icon={<Users size={19} />} tone="teal" />
        <StatCard label="Books issued" value={activeIssues.length} sub={`${returned} returned all-time`} icon={<ArrowLeftRight size={19} />} tone="violet" />
        <StatCard label="Available" value={available} sub="Copies on shelf" icon={<Clock3 size={19} />} tone="green" />
        <StatCard label="Overdue" value={overdueIssues.length} sub="Need attention" icon={<TriangleAlert size={19} />} tone="red" />
        <StatCard label="Categories" value={categories.length} sub="Shelf sections" icon={<Tags size={19} />} tone="gray" />
        <StatCard label="Fine collected" value={formatCurrency(fineCollected)} sub="Paid fines (demo)" icon={<CircleDollarSign size={19} />} tone="amber" />
        <StatCard label="Catalog titles" value={books.length} sub="Synced via DummyJSON" icon={<BookOpen size={19} />} tone="blue" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-5">
        <Card className="min-w-0 p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="t-heading text-[16px]">Quick actions</h2>
              <p className="t-muted">Jump to the most common tasks.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickActions.map((a) => (
              <Link
                key={a.title}
                to={a.to}
                className="group flex items-center gap-3 rounded-md border border-gray-200 p-3.5 transition hover:border-primary-300 hover:shadow-medium dark:border-white/10"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-white ${a.tone}`}>
                  <a.icon size={18} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="t-subheading block text-[14px]">{a.title}</span>
                  <span className="t-caption block">{a.desc}</span>
                </span>
                <ArrowRight size={16} className="shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-primary-600" aria-hidden="true" />
              </Link>
            ))}
          </div>

          <div className="mt-5 border-t border-gray-100 pt-4 dark:border-white/10">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="t-subheading text-[14px]">Latest circulation</h3>
              <Link to="/issues" className="text-[12.5px] font-semibold text-primary-700 hover:underline dark:text-primary-300">
                View all
              </Link>
            </div>
            {recentIssues.length === 0 ? (
              <p className="t-muted">No circulation yet. Issue your first book to get started.</p>
            ) : (
              <ul className="anim-list-in divide-y divide-gray-100 dark:divide-white/10">
                {recentIssues.map((i) => (
                  <li key={i.id} className="flex items-center gap-3 py-2.5">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${i.returnDate ? "bg-emerald-500" : i.dueDate < new Date().toISOString().slice(0, 10) ? "bg-red-500" : "bg-violet-500"}`} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold">{bookById(i.bookId)}</p>
                      <p className="t-caption truncate">
                        {memberById(i.memberId)} · due {i.dueDate}
                      </p>
                    </div>
                    <Badge tone={i.returnDate ? "green" : "violet"}>{i.returnDate ? "Returned" : "Issued"}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card className="min-w-0 p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="t-heading text-[16px]">Recent activity</h2>
              <p className="t-muted">Live feed from this browser.</p>
            </div>
          </div>
          {activities.length === 0 ? (
            <div className="rounded-md bg-gray-50 p-4 text-center dark:bg-white/5">
              <p className="t-subheading text-[13.5px]">Quiet for now</p>
              <p className="t-muted mt-1">Actions like issuing books and adding members will appear here.</p>
            </div>
          ) : (
            <ol className="anim-list-in max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {activities.slice(0, 12).map((a) => (
                <li key={a.id} className="flex gap-2.5">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${kindDot[a.kind] ?? "bg-gray-400"}`} aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium leading-snug">{a.text}</p>
                    {a.detail ? <p className="t-caption truncate">{a.detail}</p> : null}
                    <p className="t-caption">{timeAgo(a.time)}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </div>
  );
}

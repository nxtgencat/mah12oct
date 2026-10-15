import { useMemo } from "react";
import { ArrowLeftRight, BookOpen, CheckCircle2, TriangleAlert, Users } from "lucide-react";
import { useLibrary } from "../context/LibraryContext";
import { monthlyIssueSeed } from "../data/seed";
import { Badge, Card, PageHeader, StatCard } from "../components/ui";
import { formatCurrency } from "../lib/utils";

function Bars({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex h-40 items-end gap-2.5" role="img" aria-label="Bar chart">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="t-caption font-semibold">{d.value}</span>
          <div className="flex w-full flex-1 items-end rounded-sm bg-gray-100 dark:bg-white/10">
            <div
              className={`w-full rounded-sm ${color} transition-all`}
              style={{ height: `${Math.max(6, (d.value / max) * 100)}%` }}
              title={`${d.label}: ${d.value}`}
            />
          </div>
          <span className="t-caption">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function ReportsPage() {
  const { books, members, issues, categories, activeIssues, overdueIssues, fineCollected, fineOutstanding } = useLibrary();

  const returned = issues.filter((i) => i.returnDate !== null).length;

  const categoryCounts = useMemo(
    () =>
      categories
        .map((c) => ({ label: c.name, value: books.filter((b) => b.category === c.name).length }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8),
    [categories, books],
  );

  const monthly = monthlyIssueSeed;
  const maxMonthly = Math.max(1, ...monthly.map((m) => Math.max(m.issued, m.returned)));

  return (
    <div>
      <PageHeader title="Reports" subtitle="Snapshot of stock, circulation, and fines. Charts use seeded demo data." />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Total books" value={books.length} sub="Titles in catalog" icon={<BookOpen size={19} />} tone="blue" />
        <StatCard label="Books issued" value={activeIssues.length} sub="Currently on loan" icon={<ArrowLeftRight size={19} />} tone="violet" />
        <StatCard label="Books returned" value={returned} sub="All-time returns" icon={<CheckCircle2 size={19} />} tone="green" />
        <StatCard label="Active members" value={members.length} sub="Registered readers" icon={<Users size={19} />} tone="teal" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="min-w-0 p-5">
          <div className="mb-1 flex items-center justify-between">
            <div>
              <h2 className="t-heading text-[16px]">Monthly circulation</h2>
              <p className="t-muted">Issued vs returned (demo data).</p>
            </div>
            <div className="flex items-center gap-3 text-[12px] font-medium">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-primary-600" aria-hidden="true" /> Issued</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" aria-hidden="true" /> Returned</span>
            </div>
          </div>
          <div className="flex h-48 items-end gap-3 pt-4" role="img" aria-label="Monthly issue chart">
            {monthly.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex h-36 w-full items-end justify-center gap-1 rounded-sm bg-gray-50 p-1.5 dark:bg-white/5">
                  <div className="w-full max-w-6 rounded-sm bg-primary-600" style={{ height: `${(m.issued / maxMonthly) * 100}%` }} title={`${m.month} issued: ${m.issued}`} />
                  <div className="w-full max-w-6 rounded-sm bg-emerald-500" style={{ height: `${(m.returned / maxMonthly) * 100}%` }} title={`${m.month} returned: ${m.returned}`} />
                </div>
                <span className="t-caption">{m.month}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="min-w-0 p-5">
          <h2 className="t-heading text-[16px]">Category-wise books</h2>
          <p className="t-muted">Live counts from your catalog.</p>
          <div className="mt-4">
            <Bars data={categoryCounts} color="bg-teal-600" />
          </div>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {categoryCounts.map((c) => (
              <Badge key={c.label} tone="gray">{c.label} · {c.value}</Badge>
            ))}
          </ul>
        </Card>

        <Card className="min-w-0 p-5">
          <h2 className="t-heading text-[16px]">Overdue summary</h2>
          <p className="t-muted">{overdueIssues.length} books currently overdue.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-md bg-red-50 p-3.5 text-center ring-1 ring-inset ring-red-200">
              <TriangleAlert size={18} className="mx-auto text-red-600" aria-hidden="true" />
              <p className="mt-1 text-[22px] font-bold text-red-800">{overdueIssues.length}</p>
              <p className="t-caption">Overdue books</p>
            </div>
            <div className="rounded-md bg-amber-50 p-3.5 text-center ring-1 ring-inset ring-amber-200">
              <p className="mt-1 text-[22px] font-bold text-amber-800">{formatCurrency(fineOutstanding)}</p>
              <p className="t-caption">Outstanding fines</p>
            </div>
          </div>
        </Card>

        <Card className="min-w-0 p-5">
          <h2 className="t-heading text-[16px]">Fine collection</h2>
          <p className="t-muted">Demo payments marked in the Fines module.</p>
          <div className="mt-4">
            {(() => {
              const total = fineCollected + fineOutstanding;
              const pct = total === 0 ? 0 : Math.round((fineCollected / total) * 100);
              return (
                <>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Fine collection rate">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[13px]">
                    <span className="font-semibold text-emerald-700">Collected {formatCurrency(fineCollected)}</span>
                    <span className="t-muted">{pct}% · {formatCurrency(fineOutstanding)} pending</span>
                  </div>
                </>
              );
            })()}
          </div>
        </Card>
      </div>
    </div>
  );
}

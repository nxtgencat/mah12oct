import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Eye, Mail, Pencil, Phone, Plus, Search, Trash2 } from "lucide-react";
import { useLibrary } from "../context/LibraryContext";
import { useToast } from "../context/ToastContext";
import type { Member } from "../types";
import { Badge, Button, Card, EmptyState, NoResults, PageHeader, Pagination } from "../components/ui";
import { ConfirmDialog, Modal } from "../components/Modal";
import { MemberForm } from "../components/forms";
import { formatDate } from "../lib/utils";

const PAGE_SIZE = 8;

export function MembersPage() {
  const { members, issues, addMember, updateMember, deleteMember } = useLibrary();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<{ mode: "add" | "edit"; member?: Member } | null>(null);
  const [deleting, setDeleting] = useState<Member | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(needle) ||
        m.email.toLowerCase().includes(needle) ||
        m.membershipId.toLowerCase().includes(needle) ||
        m.phone.includes(needle),
    );
  }, [members, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const items = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const activeCount = (id: string) => issues.filter((i) => i.memberId === id && i.returnDate === null).length;

  return (
    <div>
      <PageHeader
        title="Members"
        subtitle={`${members.length} registered readers`}
        actions={
          <Button size="sm" onClick={() => setModal({ mode: "add" })}>
            <Plus size={15} aria-hidden="true" /> Add member
          </Button>
        }
      />

      <Card className="mb-4 p-3.5">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search name, email, membership ID, phone…"
            aria-label="Search members"
            className="w-full rounded-sm border border-gray-300 bg-white py-2 pl-9 pr-3 text-[13.5px] outline-none transition placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
      </Card>

      {members.length === 0 ? (
        <Card>
          <EmptyState
            title="No members yet"
            message="Register your first reader to start lending books."
            action={<Button size="sm" onClick={() => setModal({ mode: "add" })}>Add member</Button>}
          />
        </Card>
      ) : items.length === 0 ? (
        <Card><NoResults query={q} onClear={() => setQ("")} /></Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-[13.5px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-[12px] uppercase tracking-wide text-ink-500">
                    <th scope="col" className="px-4 py-3 font-semibold">Member</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Contact</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Membership</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Issued</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="anim-list-in divide-y divide-gray-100">
                  {items.map((m) => (
                    <tr key={m.id} className="transition hover:bg-gray-50/70">
                      <td className="px-4 py-3">
                        <Link to={`/members/${m.id}`} className="font-semibold text-ink-900 hover:text-primary-700 hover:underline">
                          {m.name}
                        </Link>
                        <p className="t-caption">{m.membershipId}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="flex items-center gap-1.5 text-ink-700"><Mail size={13} className="text-gray-400" aria-hidden="true" />{m.email}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-ink-500"><Phone size={13} className="text-gray-400" aria-hidden="true" />{m.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-ink-700">Joined {formatDate(m.joinedAt)}</td>
                      <td className="px-4 py-3">
                        <Badge tone={activeCount(m.id) > 0 ? "violet" : "gray"}>{activeCount(m.id)} active</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <Link to={`/members/${m.id}`} aria-label={`View ${m.name}`} className="rounded-sm border border-gray-300 bg-white p-1.5 text-ink-700 transition hover:bg-gray-50">
                            <Eye size={14} aria-hidden="true" />
                          </Link>
                          <button type="button" onClick={() => setModal({ mode: "edit", member: m })} aria-label={`Edit ${m.name}`} className="rounded-sm border border-gray-300 bg-white p-1.5 text-ink-700 transition hover:bg-gray-50">
                            <Pencil size={14} aria-hidden="true" />
                          </button>
                          <button type="button" onClick={() => setDeleting(m)} aria-label={`Delete ${m.name}`} className="rounded-sm border border-gray-300 bg-white p-1.5 text-red-600 transition hover:bg-red-50">
                            <Trash2 size={14} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="anim-list-in grid gap-3 md:hidden">
            {items.map((m) => (
              <Card key={m.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link to={`/members/${m.id}`} className="text-[15px] font-bold hover:text-primary-700">{m.name}</Link>
                    <p className="t-caption">{m.membershipId} · Joined {formatDate(m.joinedAt)}</p>
                  </div>
                  <Badge tone={activeCount(m.id) > 0 ? "violet" : "gray"}>{activeCount(m.id)} active</Badge>
                </div>
                <p className="t-muted mt-2 truncate">{m.email} · {m.phone}</p>
                <div className="mt-3 flex gap-1.5 border-t border-gray-100 pt-3">
                  <Link to={`/members/${m.id}`} className="inline-flex flex-1 items-center justify-center gap-1 rounded-sm border border-gray-300 px-2 py-1.5 text-[12.5px] font-semibold hover:bg-gray-50">
                    <Eye size={13} aria-hidden="true" /> Profile
                  </Link>
                  <button type="button" onClick={() => setModal({ mode: "edit", member: m })} aria-label={`Edit ${m.name}`} className="rounded-sm border border-gray-300 p-[7px] hover:bg-gray-50">
                    <Pencil size={13} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => setDeleting(m)} aria-label={`Delete ${m.name}`} className="rounded-sm border border-gray-300 p-[7px] text-red-600 hover:bg-red-50">
                    <Trash2 size={13} aria-hidden="true" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <Modal open={modal !== null} title={modal?.mode === "edit" ? "Edit member" : "Add member"} onClose={() => setModal(null)}>
        {modal ? (
          <MemberForm
            initial={modal.member}
            onCancel={() => setModal(null)}
            onSubmit={(values) => {
              if (modal.mode === "edit" && modal.member) {
                updateMember(modal.member.id, values);
                toast.success("Member updated", values.name);
              } else {
                const created = addMember(values);
                toast.success("Member added", `${created.name} · ${created.membershipId}`);
              }
              setModal(null);
            }}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete member?"
        message={deleting ? `“${deleting.name}” will be removed. Active loans must be returned first.` : ""}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;
          const res = deleteMember(deleting.id);
          if (res.ok) toast.success("Member deleted", deleting.name);
          else toast.error("Cannot delete", res.message);
          setDeleting(null);
        }}
      />
    </div>
  );
}

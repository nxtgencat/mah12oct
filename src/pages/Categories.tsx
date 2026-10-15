import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { useLibrary } from "../context/LibraryContext";
import { useToast } from "../context/ToastContext";
import type { Category } from "../types";
import { Button, Card, EmptyState, PageHeader } from "../components/ui";
import { ConfirmDialog, Modal } from "../components/Modal";
import { CategoryForm } from "../components/forms";

const palette = [
  "bg-primary-50 text-primary-700 ring-primary-200",
  "bg-teal-50 text-teal-700 ring-teal-200",
  "bg-violet-50 text-violet-700 ring-violet-200",
  "bg-amber-50 text-amber-800 ring-amber-200",
  "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "bg-red-50 text-red-700 ring-red-200",
];

export function CategoriesPage() {
  const { categories, books, addCategory, updateCategory, deleteCategory } = useLibrary();
  const toast = useToast();
  const [modal, setModal] = useState<{ mode: "add" | "edit"; cat?: Category } | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of books) map.set(b.category, (map.get(b.category) ?? 0) + 1);
    return map;
  }, [books]);

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle={`${categories.length} sections · click a category to filter the catalog`}
        actions={
          <Button size="sm" onClick={() => setModal({ mode: "add" })}>
            <Plus size={15} aria-hidden="true" /> Add category
          </Button>
        }
      />

      {categories.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Tags size={22} aria-hidden="true" />}
            title="No categories"
            message="Create sections to organize your shelves."
            action={<Button size="sm" onClick={() => setModal({ mode: "add" })}>Add category</Button>}
          />
        </Card>
      ) : (
        <div className="anim-list-in grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((c, i) => (
            <Card key={c.id} className="p-4 transition-shadow hover:shadow-medium">
              <div className="flex items-start justify-between gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[13px] font-bold ring-1 ring-inset ${palette[i % palette.length]}`}>
                  <Tags size={13} aria-hidden="true" /> {c.name}
                </span>
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => setModal({ mode: "edit", cat: c })} aria-label={`Edit ${c.name}`} className="rounded-sm border border-gray-200 bg-white p-1.5 text-ink-700 transition hover:bg-gray-50 dark:border-night-700 dark:bg-night-800 dark:text-gray-200 dark:hover:bg-night-700">
                    <Pencil size={13} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => setDeleting(c)} aria-label={`Delete ${c.name}`} className="rounded-sm border border-gray-200 bg-white p-1.5 text-red-600 transition hover:bg-red-50 dark:border-night-700 dark:bg-night-800 dark:hover:bg-red-500/10">
                    <Trash2 size={13} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <p className="t-muted mt-2 min-h-[20px]">{c.description || "No description."}</p>
              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-white/10">
                <p className="t-caption">{counts.get(c.name) ?? 0} books</p>
                <Link to={`/books`} className="text-[12.5px] font-semibold text-primary-700 hover:underline dark:text-primary-300">
                  Browse shelf →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal !== null} title={modal?.mode === "edit" ? "Edit category" : "Add category"} onClose={() => setModal(null)}>
        {modal ? (
          <CategoryForm
            initial={modal.cat}
            onCancel={() => setModal(null)}
            onSubmit={(name, description) => {
              const res = modal.mode === "edit" && modal.cat
                ? updateCategory(modal.cat.id, name, description)
                : addCategory(name, description);
              if (res.ok) {
                toast.success("Saved", res.message);
                setModal(null);
              } else {
                toast.error("Cannot save", res.message);
              }
            }}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete category?"
        message={deleting ? `“${deleting.name}” will be removed. Categories holding books cannot be deleted.` : ""}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;
          const res = deleteCategory(deleting.id);
          if (res.ok) toast.success("Deleted", res.message);
          else toast.error("Cannot delete", res.message);
          setDeleting(null);
        }}
      />
    </div>
  );
}

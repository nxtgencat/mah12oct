import { useState } from "react";
import type { Book, Category, Member } from "../types";
import { isEmail, isPhone } from "../lib/utils";
import { useLibrary } from "../context/LibraryContext";
import { Button, Field, Input, Select, TextArea } from "./ui";

type BookValues = Omit<Book, "id">;

export function BookForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Book;
  onSubmit: (v: BookValues) => void;
  onCancel: () => void;
}) {
  const { categories } = useLibrary();
  const [v, setV] = useState<BookValues>({
    title: initial?.title ?? "",
    author: initial?.author ?? "",
    isbn: initial?.isbn ?? "",
    publisher: initial?.publisher ?? "",
    category: initial?.category ?? categories[0]?.name ?? "Fiction",
    year: initial?.year ?? new Date().getFullYear(),
    availableCopies: initial?.availableCopies ?? 1,
    totalCopies: initial?.totalCopies ?? 1,
    description: initial?.description ?? "",
    cover: initial?.cover ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof BookValues, val: string | number) => setV((p) => ({ ...p, [k]: val }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (v.title.trim().length < 2) err.title = "Title is required.";
    if (v.author.trim().length < 2) err.author = "Author is required.";
    if (v.isbn.trim().length < 3) err.isbn = "ISBN is required.";
    if (v.publisher.trim().length < 2) err.publisher = "Publisher is required.";
    if (!v.category) err.category = "Category is required.";
    if (!Number.isInteger(Number(v.year)) || Number(v.year) < 1400 || Number(v.year) > new Date().getFullYear() + 1)
      err.year = "Enter a valid year.";
    if (!Number.isInteger(Number(v.totalCopies)) || Number(v.totalCopies) < 1) err.totalCopies = "At least 1 copy.";
    if (!Number.isInteger(Number(v.availableCopies)) || Number(v.availableCopies) < 0) err.availableCopies = "Cannot be negative.";
    if (Number(v.availableCopies) > Number(v.totalCopies)) err.availableCopies = "Cannot exceed total copies.";
    setErrors(err);
    if (Object.keys(err).length > 0) return;
    onSubmit({
      ...v,
      title: v.title.trim(),
      author: v.author.trim(),
      isbn: v.isbn.trim(),
      publisher: v.publisher.trim(),
      year: Number(v.year),
      totalCopies: Number(v.totalCopies),
      availableCopies: Number(v.availableCopies),
      description: v.description.trim(),
      cover: v.cover.trim(),
    });
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-3.5">
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Title" error={errors.title} required>
          <Input value={v.title} onChange={(e) => set("title", e.target.value)} fieldError={errors.title} placeholder="The Great Novel" />
        </Field>
        <Field label="Author" error={errors.author} required>
          <Input value={v.author} onChange={(e) => set("author", e.target.value)} fieldError={errors.author} placeholder="Author name" />
        </Field>
        <Field label="ISBN" error={errors.isbn} required>
          <Input value={v.isbn} onChange={(e) => set("isbn", e.target.value)} fieldError={errors.isbn} placeholder="978-0-00-000000-0" />
        </Field>
        <Field label="Publisher" error={errors.publisher} required>
          <Input value={v.publisher} onChange={(e) => set("publisher", e.target.value)} fieldError={errors.publisher} placeholder="Meridian Press" />
        </Field>
        <Field label="Category" error={errors.category} required>
          <Select value={v.category} onChange={(e) => set("category", e.target.value)} fieldError={errors.category}>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Published year" error={errors.year} required>
          <Input type="number" value={v.year} onChange={(e) => set("year", Number(e.target.value))} fieldError={errors.year} />
        </Field>
        <Field label="Total copies" error={errors.totalCopies} required>
          <Input type="number" min={1} value={v.totalCopies} onChange={(e) => set("totalCopies", Number(e.target.value))} fieldError={errors.totalCopies} />
        </Field>
        <Field label="Available copies" error={errors.availableCopies} required>
          <Input type="number" min={0} value={v.availableCopies} onChange={(e) => set("availableCopies", Number(e.target.value))} fieldError={errors.availableCopies} />
        </Field>
      </div>
      <Field label="Cover image URL" hint="Paste an image URL, or leave blank for a generated cover.">
        <Input value={v.cover} onChange={(e) => set("cover", e.target.value)} placeholder="https://…" inputMode="url" />
      </Field>
      <Field label="Description">
        <TextArea value={v.description} onChange={(e) => set("description", e.target.value)} placeholder="Short summary of the book…" />
      </Field>
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial ? "Save changes" : "Add book"}</Button>
      </div>
    </form>
  );
}

type MemberValues = Omit<Member, "id" | "membershipId" | "joinedAt">;

export function MemberForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Member;
  onSubmit: (v: MemberValues) => void;
  onCancel: () => void;
}) {
  const [v, setV] = useState<MemberValues>({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    address: initial?.address ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof MemberValues, val: string) => setV((p) => ({ ...p, [k]: val }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (v.name.trim().length < 2) err.name = "Full name is required.";
    if (!isEmail(v.email)) err.email = "Enter a valid email.";
    if (!isPhone(v.phone)) err.phone = "Enter a valid mobile number.";
    if (v.address.trim().length < 5) err.address = "Address is required.";
    setErrors(err);
    if (Object.keys(err).length > 0) return;
    onSubmit({ name: v.name.trim(), email: v.email.trim(), phone: v.phone.trim(), address: v.address.trim() });
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-3.5">
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Full name" error={errors.name} required>
          <Input value={v.name} onChange={(e) => set("name", e.target.value)} fieldError={errors.name} placeholder="Ada Lovelace" autoComplete="name" />
        </Field>
        <Field label="Email" error={errors.email} required>
          <Input type="email" value={v.email} onChange={(e) => set("email", e.target.value)} fieldError={errors.email} placeholder="ada@example.com" autoComplete="email" />
        </Field>
        <Field label="Mobile number" error={errors.phone} required>
          <Input value={v.phone} onChange={(e) => set("phone", e.target.value)} fieldError={errors.phone} placeholder="+91 98000 00000" autoComplete="tel" />
        </Field>
        <Field label="Address" error={errors.address} required>
          <Input value={v.address} onChange={(e) => set("address", e.target.value)} fieldError={errors.address} placeholder="Street, City" autoComplete="street-address" />
        </Field>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial ? "Save changes" : "Add member"}</Button>
      </div>
    </form>
  );
}

export function CategoryForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Category;
  onSubmit: (name: string, description: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [error, setError] = useState<string | undefined>();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError("Category name is required.");
      return;
    }
    setError(undefined);
    onSubmit(name, description);
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-3.5">
      <Field label="Category name" error={error} required>
        <Input value={name} onChange={(e) => setName(e.target.value)} fieldError={error} placeholder="e.g. Poetry" />
      </Field>
      <Field label="Description">
        <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What belongs on this shelf?" />
      </Field>
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial ? "Save changes" : "Add category"}</Button>
      </div>
    </form>
  );
}

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Activity, Book, Category, FineRecord, Issue, Member } from "../types";
import { FINE_PER_DAY, LOAN_DAYS } from "../types";
import { seedCategories, seedMembers } from "../data/seed";
import { fetchBooksFromAPI, getFallbackBooks } from "../lib/api";
import { makeCover } from "../lib/cover";
import { addDaysISO, daysBetween, loadJSON, saveJSON, todayISO, uid } from "../lib/utils";

interface LibraryContextValue {
  books: Book[];
  members: Member[];
  categories: Category[];
  issues: Issue[];
  activities: Activity[];
  booksLoading: boolean;
  booksError: string | null;
  apiSource: "api" | "cache" | "seed";
  reloadBooks: () => void;
  // books
  addBook: (b: Omit<Book, "id">) => void;
  updateBook: (id: string, patch: Partial<Book>) => void;
  deleteBook: (id: string) => boolean;
  // members
  addMember: (m: Omit<Member, "id" | "membershipId" | "joinedAt">) => Member;
  updateMember: (id: string, patch: Partial<Member>) => void;
  deleteMember: (id: string) => { ok: boolean; message: string };
  // categories
  addCategory: (name: string, description: string) => { ok: boolean; message: string };
  updateCategory: (id: string, name: string, description: string) => { ok: boolean; message: string };
  deleteCategory: (id: string) => { ok: boolean; message: string };
  // circulation
  issueBook: (bookId: string, memberId: string) => { ok: boolean; message: string };
  returnBook: (issueId: string) => { ok: boolean; message: string };
  toggleFinePaid: (issueId: string) => void;
  // derived
  activeIssues: Issue[];
  overdueIssues: Issue[];
  fineRecords: FineRecord[];
  fineCollected: number;
  fineOutstanding: number;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

const K = {
  books: "lms_books_v2",
  members: "lms_members_v1",
  categories: "lms_categories_v1",
  issues: "lms_issues_v1",
  activities: "lms_activities_v1",
};

function logActivity(list: Activity[], text: string, kind: Activity["kind"], detail?: string): Activity[] {
  const entry: Activity = { id: uid("act"), text, detail, time: new Date().toISOString(), kind };
  return [entry, ...list].slice(0, 40);
}

function seedIssues(): Issue[] {
  const t = todayISO();
  return [
    {
      id: "iss_seed_1",
      bookId: "seed_6",
      memberId: "mem_1",
      issueDate: addDaysISO(t, -20),
      dueDate: addDaysISO(t, -6),
      returnDate: null,
      finePaid: false,
    },
    {
      id: "iss_seed_2",
      bookId: "seed_11",
      memberId: "mem_2",
      issueDate: addDaysISO(t, -10),
      dueDate: addDaysISO(t, 4),
      returnDate: null,
      finePaid: false,
    },
    {
      id: "iss_seed_3",
      bookId: "seed_4",
      memberId: "mem_3",
      issueDate: addDaysISO(t, -30),
      dueDate: addDaysISO(t, -16),
      returnDate: addDaysISO(t, -14),
      finePaid: true,
    },
  ];
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>(() => loadJSON<Book[]>(K.books, []));
  const [members, setMembers] = useState<Member[]>(() => {
    const m = loadJSON<Member[]>(K.members, []);
    return m.length > 0 ? m : seedMembers;
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    const c = loadJSON<Category[]>(K.categories, []);
    return c.length > 0 ? c : seedCategories;
  });
  const [issues, setIssues] = useState<Issue[]>(() => {
    const i = loadJSON<Issue[]>(K.issues, []);
    return i.length > 0 ? i : seedIssues();
  });
  const [activities, setActivities] = useState<Activity[]>(() => loadJSON<Activity[]>(K.activities, []));
  const [booksLoading, setBooksLoading] = useState(false);
  const [booksError, setBooksError] = useState<string | null>(null);
  const [apiSource, setApiSource] = useState<"api" | "cache" | "seed">(
    books.length > 0 ? "cache" : "seed",
  );
  const abortRef = useRef<AbortController | null>(null);

  const pushActivity = useCallback((text: string, kind: Activity["kind"], detail?: string) => {
    setActivities((prev) => logActivity(prev, text, kind, detail));
  }, []);

  const loadBooks = useCallback(
    async (force = false) => {
      if (!force) {
        const cached = loadJSON<Book[]>(K.books, []);
        if (cached.length > 0) {
          setBooks(cached);
          setApiSource("cache");
          return;
        }
      }
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setBooksLoading(true);
      setBooksError(null);
      try {
        const apiBooks = await fetchBooksFromAPI(ctrl.signal);
        setBooks(apiBooks);
        setApiSource("api");
        saveJSON(K.books, apiBooks);
        pushActivity("Book catalog synced from DummyJSON", "book", `${apiBooks.length} titles loaded`);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const fallback = getFallbackBooks();
        setBooks((prev) => (prev.length > 0 ? prev : fallback));
        setApiSource("seed");
        setBooksError("Could not reach the book API. Showing local catalog instead.");
      } finally {
        setBooksLoading(false);
      }
    },
    [pushActivity],
  );

  useEffect(() => {
    // Drop the v1 book cache — it stored unreliable CDN thumbnails.
    try {
      localStorage.removeItem("lms_books_v1");
    } catch {
      /* ignore */
    }
    loadBooks(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Seed circulation references fallback ids ("seed_*"); remap them onto the
  // live catalog once books arrive so history always resolves to real titles.
  useEffect(() => {
    if (books.length === 0) return;
    setIssues((prev) => {
      const targets = [
        books[5]?.id ?? books[0].id,
        books[10 % books.length]?.id ?? books[0].id,
        books[3]?.id ?? books[0].id,
      ];
      let changed = false;
      const next = prev.map((iss, idx) => {
        if (!iss.id.startsWith("iss_seed_")) return iss;
        if (books.some((b) => b.id === iss.bookId)) return iss;
        changed = true;
        return { ...iss, bookId: targets[idx % targets.length] };
      });
      return changed ? next : prev;
    });
  }, [books]);

  useEffect(() => saveJSON(K.books, books), [books]);
  useEffect(() => saveJSON(K.members, members), [members]);
  useEffect(() => saveJSON(K.categories, categories), [categories]);
  useEffect(() => saveJSON(K.issues, issues), [issues]);
  useEffect(() => saveJSON(K.activities, activities), [activities]);

  const activeIssues = useMemo(() => issues.filter((i) => i.returnDate === null), [issues]);
  const overdueIssues = useMemo(() => {
    const t = todayISO();
    return issues.filter((i) => i.returnDate === null && i.dueDate < t);
  }, [issues]);

  const fineRecords = useMemo<FineRecord[]>(() => {
    const t = todayISO();
    return issues
      .map((i) => {
        const end = i.returnDate ?? t;
        const days = Math.max(0, daysBetween(i.dueDate, end));
        if (days <= 0) return null;
        return {
          issueId: i.id,
          bookId: i.bookId,
          memberId: i.memberId,
          daysOverdue: days,
          amount: days * FINE_PER_DAY,
          paid: i.finePaid,
          dueDate: i.dueDate,
        } satisfies FineRecord;
      })
      .filter((f): f is FineRecord => f !== null)
      .sort((a, b) => b.amount - a.amount);
  }, [issues]);

  const fineCollected = useMemo(
    () => fineRecords.filter((f) => f.paid).reduce((s, f) => s + f.amount, 0),
    [fineRecords],
  );
  const fineOutstanding = useMemo(
    () => fineRecords.filter((f) => !f.paid).reduce((s, f) => s + f.amount, 0),
    [fineRecords],
  );

  const value = useMemo<LibraryContextValue>(() => {
    const bookById = (id: string) => books.find((b) => b.id === id);
    const memberById = (id: string) => members.find((m) => m.id === id);
    return {
      books,
      members,
      categories,
      issues,
      activities,
      booksLoading,
      booksError,
      apiSource,
      reloadBooks: () => loadBooks(true),
      addBook: (b) => {
        const next: Book = {
          ...b,
          id: uid("book"),
          cover: b.cover.trim() ? b.cover.trim() : makeCover(b.title, b.author, b.category),
        };
        setBooks((prev) => [next, ...prev]);
        pushActivity(`New book added: ${next.title}`, "book", next.author);
      },
      updateBook: (id, patch) => {
        setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
        const b = bookById(id);
        if (b) pushActivity(`Book updated: ${b.title}`, "book");
      },
      deleteBook: (id) => {
        const hasActive = issues.some((i) => i.bookId === id && i.returnDate === null);
        if (hasActive) return false;
        setBooks((prev) => prev.filter((b) => b.id !== id));
        pushActivity("Book removed from catalog", "book", bookById(id)?.title);
        return true;
      },
      addMember: (m) => {
        const count = members.length + 1;
        const next: Member = {
          ...m,
          id: uid("mem"),
          membershipId: `LIB-${new Date().getFullYear()}-${String(count).padStart(3, "0")}${Math.floor(Math.random() * 90 + 10)}`.slice(0, 12),
          joinedAt: todayISO(),
        };
        setMembers((prev) => [next, ...prev]);
        pushActivity(`New member registered: ${next.name}`, "member", next.membershipId);
        return next;
      },
      updateMember: (id, patch) => {
        setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
      },
      deleteMember: (id) => {
        const hasActive = issues.some((i) => i.memberId === id && i.returnDate === null);
        if (hasActive) return { ok: false, message: "Member has books still issued. Return them first." };
        const m = memberById(id);
        setMembers((prev) => prev.filter((x) => x.id !== id));
        if (m) pushActivity(`Member removed: ${m.name}`, "member");
        return { ok: true, message: "Member deleted." };
      },
      addCategory: (name, description) => {
        const norm = name.trim().toLowerCase();
        if (!norm) return { ok: false, message: "Category name is required." };
        if (categories.some((c) => c.name.toLowerCase() === norm))
          return { ok: false, message: "This category already exists." };
        const next: Category = { id: uid("cat"), name: name.trim(), description: description.trim() };
        setCategories((prev) => [...prev, next]);
        pushActivity(`Category added: ${next.name}`, "category");
        return { ok: true, message: "Category added." };
      },
      updateCategory: (id, name, description) => {
        const norm = name.trim().toLowerCase();
        if (!norm) return { ok: false, message: "Category name is required." };
        if (categories.some((c) => c.id !== id && c.name.toLowerCase() === norm))
          return { ok: false, message: "Another category with this name exists." };
        const old = categories.find((c) => c.id === id);
        setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name: name.trim(), description: description.trim() } : c)));
        if (old && old.name !== name.trim()) {
          setBooks((prev) => prev.map((b) => (b.category === old.name ? { ...b, category: name.trim() } : b)));
        }
        return { ok: true, message: "Category updated." };
      },
      deleteCategory: (id) => {
        const cat = categories.find((c) => c.id === id);
        if (!cat) return { ok: false, message: "Category not found." };
        if (books.some((b) => b.category === cat.name))
          return { ok: false, message: "Category is used by books. Reassign them first." };
        setCategories((prev) => prev.filter((c) => c.id !== id));
        return { ok: true, message: "Category deleted." };
      },
      issueBook: (bookId, memberId) => {
        const book = bookById(bookId);
        const member = memberById(memberId);
        if (!book || !member) return { ok: false, message: "Select a valid book and member." };
        if (book.availableCopies <= 0) return { ok: false, message: "No copies available for this book." };
        const dup = issues.some((i) => i.bookId === bookId && i.memberId === memberId && i.returnDate === null);
        if (dup) return { ok: false, message: "This member already has this book issued." };
        const t = todayISO();
        const next: Issue = {
          id: uid("iss"),
          bookId,
          memberId,
          issueDate: t,
          dueDate: addDaysISO(t, LOAN_DAYS),
          returnDate: null,
          finePaid: false,
        };
        setIssues((prev) => [next, ...prev]);
        setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) } : b)));
        pushActivity(`Book issued: ${book.title}`, "issue", `to ${member.name}`);
        return { ok: true, message: `Issued to ${member.name}. Due ${addDaysISO(t, LOAN_DAYS)}.` };
      },
      returnBook: (issueId) => {
        const issue = issues.find((i) => i.id === issueId);
        if (!issue || issue.returnDate !== null) return { ok: false, message: "Issue record not found." };
        const t = todayISO();
        setIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, returnDate: t } : i)));
        setBooks((prev) => prev.map((b) => (b.id === issue.bookId ? { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) } : b)));
        const book = bookById(issue.bookId);
        const member = memberById(issue.memberId);
        pushActivity(`Book returned: ${book?.title ?? "Unknown"}`, "issue", `by ${member?.name ?? "member"}`);
        return { ok: true, message: "Book returned successfully." };
      },
      toggleFinePaid: (issueId) => {
        setIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, finePaid: !i.finePaid } : i)));
        const issue = issues.find((i) => i.id === issueId);
        if (issue) pushActivity(issue.finePaid ? "Fine marked unpaid" : "Fine marked paid", "fine", issue.id);
      },
      activeIssues,
      overdueIssues,
      fineRecords,
      fineCollected,
      fineOutstanding,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [books, members, categories, issues, activities, booksLoading, booksError, apiSource, activeIssues, overdueIssues, fineRecords, fineCollected, fineOutstanding, loadBooks, pushActivity]);

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
}

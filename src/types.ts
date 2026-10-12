export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  category: string;
  year: number;
  availableCopies: number;
  totalCopies: number;
  description: string;
  cover: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  membershipId: string;
  joinedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export type IssueStatus = "issued" | "returned" | "overdue";

export interface Issue {
  id: string;
  bookId: string;
  memberId: string;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  finePaid: boolean;
}

export interface Activity {
  id: string;
  text: string;
  detail?: string;
  time: string;
  kind: "book" | "member" | "issue" | "fine" | "auth" | "category";
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface FineRecord {
  issueId: string;
  bookId: string;
  memberId: string;
  daysOverdue: number;
  amount: number;
  paid: boolean;
  dueDate: string;
}

export const FINE_PER_DAY = 2;
export const LOAN_DAYS = 14;

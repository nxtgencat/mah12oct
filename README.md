# Athena Library — Management System

A responsive Library Management System built with **React + Vite + TypeScript + Tailwind CSS v4**, **Context API** state management, **React Router** navigation, and a live **DummyJSON** book catalog. All library data persists in `localStorage`. Includes light/dark theme support with a persisted topbar toggle.

## Demo credentials

- Email: `admin@library.com`
- Password: `admin123`

## Features

| Module | What's inside |
|---|---|
| **Authentication** | Login, register, forgot-password UI, validation, show/hide password, protected routes, logout, session in `localStorage` |
| **Dashboard** | Total books, members, issued, available, overdue, categories, fine collected, recent activity feed, quick actions |
| **Books** | DummyJSON-powered catalog (30 titles + graceful local fallback), add/edit/delete, details page, search (title/author/ISBN), category + author filters, title sort, pagination, skeletons & error state |
| **Members** | Full CRUD with validation, search, pagination, profile view with loan history |
| **Issue / Return** | Issue with availability update, duplicate-issue guard, returns, due-date tracking, filterable history |
| **Fines** | Automatic $2/day overdue calculation, paid/unpaid toggle (UI-only), member search, overdue list |
| **Categories** | Add/edit/delete with duplicate + in-use guards, shelf counts |
| **Reports** | Circulation chart, category counts, overdue & collection summaries (demo data where noted) |
| **Theme** | Light/dark mode toggle in the topbar, OS preference on first visit, choice persisted in `localStorage` |

## Stack

- `pnpm` · React 19 · Vite · TypeScript · Tailwind CSS v4 · `react-router` · `lucide-react` · `oxlint`
- No form/toast/chart libraries — validation, toasts, and charts are small hand-rolled modules to keep the bundle lean.

## Scripts

```sh
pnpm install
pnpm run dev      # start dev server
pnpm run build    # typecheck + production build
pnpm run lint     # oxlint
pnpm run preview  # serve the production build
```

## Data & persistence

- Catalog: `https://dummyjson.com/products?limit=30` mapped to book records (author, ISBN, publisher, category, year, copies). Covers are deterministic generated book art (no external images), so they always render; custom cover URLs are still supported per book. If the API is unreachable, a bundled 12-book catalog is used and an error banner with retry is shown.
- `localStorage` keys: `lms_books_v2`, `lms_members_v1`, `lms_categories_v1`, `lms_issues_v1`, `lms_activities_v1`, `lms_users`, `lms_session`, `lms_theme`.
- Loans run 14 days; overdue fines accrue at $2/day.

## Project structure

```
src/
  types.ts            # domain models
  lib/                # api mapper, generated cover art, date/currency/storage utils
  data/seed.ts        # fallback books, members, categories, demo chart data
  context/            # AuthContext, LibraryContext, ThemeContext, ToastContext
  components/         # ui kit, Modal, Layout, forms
  pages/              # auth + 8 modules
  App.tsx             # providers + protected routes
```

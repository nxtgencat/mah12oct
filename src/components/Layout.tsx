import { useState } from "react";
import type { ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import {
  AlertTriangle,
  ArrowLeftRight,
  BookOpen,
  ChartColumn,
  ChevronsLeft,
  CircleDollarSign,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  Tags,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/books", label: "Books", icon: BookOpen },
  { to: "/members", label: "Members", icon: Users },
  { to: "/issues", label: "Issue / Return", icon: ArrowLeftRight },
  { to: "/fines", label: "Fines", icon: CircleDollarSign },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/reports", label: "Reports", icon: ChartColumn },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const { overdueIssues } = useLibrary();
  return (
    <nav aria-label="Primary" className="flex flex-col gap-1">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `group flex items-center gap-2.5 rounded-sm px-3 py-2 text-[13.5px] font-medium transition ${
              isActive
                ? "bg-primary-700 text-white shadow-subtle"
                : "text-ink-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
            }`
          }
        >
          <l.icon size={17} strokeWidth={2} aria-hidden="true" className="shrink-0" />
          <span className="flex-1">{l.label}</span>
          {l.to === "/fines" && overdueIssues.length > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1.5 text-[11px] font-bold text-ink-900">
              {overdueIssues.length}
            </span>
          ) : null}
          {l.to === "/issues" ? (
            <AlertTriangle size={0} aria-hidden="true" className="hidden" />
          ) : null}
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarBody({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  if (collapsed) return null;
  return (
    <div className="flex h-full flex-col">
      <Link to="/" onClick={onNavigate} className="flex items-center gap-2.5 px-1 py-1" aria-label="Athena Library home">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-700 text-white shadow-subtle">
          <Library size={19} aria-hidden="true" />
        </span>
        <span className="leading-tight">
          <span className="block text-[15px] font-bold tracking-tight">Athena Library</span>
          <span className="t-caption block">Management System</span>
        </span>
      </Link>
      <div className="mt-5 flex-1">
        <NavItems onNavigate={onNavigate} />
      </div>
      <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/5">
        <p className="t-label text-ink-700 dark:text-gray-200">{user?.name ?? "Librarian"}</p>
        <p className="t-caption truncate">{user?.email}</p>
        <button
          type="button"
          onClick={() => {
            logout();
            toast.info("Signed out", "See you soon.");
            navigate("/login");
          }}
          className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-sm border border-gray-300 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-ink-700 transition hover:bg-gray-100 dark:border-night-700 dark:bg-night-800 dark:text-gray-200 dark:hover:bg-night-700"
        >
          <LogOut size={14} aria-hidden="true" /> Sign out
        </button>
      </div>
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggle: toggleTheme } = useTheme();
  const [globalQ, setGlobalQ] = useState("");

  const submitGlobal = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/books?q=${encodeURIComponent(globalQ.trim())}`);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden border-r border-gray-200 bg-white transition-all duration-200 dark:border-white/10 dark:bg-night-900 lg:block ${
          collapsed ? "w-[68px]" : "w-[248px]"
        }`}
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col p-3">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Link to="/" className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-700 text-white" aria-label="Home">
                <Library size={19} aria-hidden="true" />
              </Link>
              <nav aria-label="Primary collapsed" className="mt-3 flex flex-col gap-1">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.end}
                    title={l.label}
                    aria-label={l.label}
                    className={({ isActive }) =>
                      `flex h-10 w-10 items-center justify-center rounded-sm transition ${
                        isActive ? "bg-primary-700 text-white" : "text-ink-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                      }`
                    }
                  >
                    <l.icon size={18} aria-hidden="true" />
                  </NavLink>
                ))}
              </nav>
              <button
                type="button"
                onClick={() => setCollapsed(false)}
                aria-label="Expand sidebar"
                className="mt-auto flex h-9 w-9 items-center justify-center rounded-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
              >
                <Menu size={17} />
              </button>
            </div>
          ) : (
            <>
              <SidebarBody collapsed={collapsed} />
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                aria-label="Collapse sidebar"
                className="mt-2 flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-[12.5px] font-medium text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
              >
                <ChevronsLeft size={15} /> Collapse
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="anim-fade absolute inset-0 bg-ink-900/45" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <div className="anim-dialog absolute inset-y-0 left-0 w-[280px] bg-white p-4 shadow-elevated dark:bg-night-900">
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="rounded-sm p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
              >
                <X size={19} />
              </button>
            </div>
            <SidebarBody collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className={`transition-all duration-200 ${collapsed ? "lg:pl-[68px]" : "lg:pl-[248px]"}`}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-night-950/90">
          <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-2.5 sm:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="rounded-sm p-2 text-ink-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 lg:hidden"
            >
              <Menu size={19} />
            </button>
            <form onSubmit={submitGlobal} role="search" className="relative hidden flex-1 sm:block">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                value={globalQ}
                onChange={(e) => setGlobalQ(e.target.value)}
                placeholder="Search by title, author, or ISBN…  (Enter)"
                aria-label="Global search books"
                className="w-full max-w-md rounded-sm border border-gray-300 bg-gray-50 py-2 pl-9 pr-3 text-[13.5px] outline-none transition placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100 dark:border-night-700 dark:bg-night-800 dark:text-gray-100 dark:focus:bg-night-800 dark:focus:border-primary-400"
              />
            </form>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                className="rounded-sm border border-gray-300 bg-white p-2 text-ink-700 shadow-subtle transition hover:bg-gray-50 dark:border-night-700 dark:bg-night-800 dark:text-gray-200 dark:hover:bg-night-700"
              >
                {theme === "dark" ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
              </button>
              <span className="t-caption hidden md:block">
                {location.pathname === "/" ? "Dashboard" : location.pathname.replace("/", "").replace("-", " ")}
              </span>
              <Link
                to="/books"
                className="rounded-sm bg-ink-900 px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-ink-700 sm:hidden"
              >
                Search
              </Link>
              <Link
                to="/issues"
                className="hidden rounded-sm bg-primary-700 px-3.5 py-2 text-[13px] font-semibold text-white shadow-subtle transition hover:bg-primary-800 sm:inline-flex"
              >
                Issue book
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-100 px-4 py-2 dark:border-white/10 sm:hidden">
            <form onSubmit={submitGlobal} role="search" className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                value={globalQ}
                onChange={(e) => setGlobalQ(e.target.value)}
                placeholder="Search books…"
                aria-label="Global search books"
                className="w-full rounded-sm border border-gray-300 bg-gray-50 py-2 pl-9 pr-3 text-[13.5px] outline-none focus:border-primary-500 focus:bg-white dark:border-night-700 dark:bg-night-800 dark:text-gray-100 dark:focus:bg-night-800 dark:focus:border-primary-400"
              />
            </form>
          </div>
        </header>

        <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">{children}</main>
        <footer className="mx-auto max-w-[1200px] px-4 pb-8 sm:px-6">
          <p className="t-caption border-t border-gray-200 pt-4 dark:border-white/10">
            Athena Library · Demo build with DummyJSON catalog, local persistence, and UI-only fine payments.
          </p>
        </footer>
      </div>
    </div>
  );
}

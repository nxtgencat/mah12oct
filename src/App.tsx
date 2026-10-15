import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LibraryProvider } from "./context/LibraryContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ForgotPage } from "./pages/auth/ForgotPage";
import { DashboardPage } from "./pages/Dashboard";
import { BooksPage } from "./pages/Books";
import { BookDetailsPage } from "./pages/BookDetails";
import { MembersPage } from "./pages/Members";
import { MemberProfilePage } from "./pages/MemberProfile";
import { IssuesPage } from "./pages/Issues";
import { FinesPage } from "./pages/Fines";
import { CategoriesPage } from "./pages/Categories";
import { ReportsPage } from "./pages/Reports";

function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <Layout>{children}</Layout>
    </RequireAuth>
  );
}

export default function App() {
  return (
    <ThemeProvider>
    <ToastProvider>
      <AuthProvider>
        <LibraryProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot" element={<ForgotPage />} />
              <Route path="/" element={<Shell><DashboardPage /></Shell>} />
              <Route path="/books" element={<Shell><BooksPage /></Shell>} />
              <Route path="/books/:id" element={<Shell><BookDetailsPage /></Shell>} />
              <Route path="/members" element={<Shell><MembersPage /></Shell>} />
              <Route path="/members/:id" element={<Shell><MemberProfilePage /></Shell>} />
              <Route path="/issues" element={<Shell><IssuesPage /></Shell>} />
              <Route path="/fines" element={<Shell><FinesPage /></Shell>} />
              <Route path="/categories" element={<Shell><CategoriesPage /></Shell>} />
              <Route path="/reports" element={<Shell><ReportsPage /></Shell>} />
              <Route path="*" element={<Shell><DashboardPage /></Shell>} />
            </Routes>
          </BrowserRouter>
        </LibraryProvider>
      </AuthProvider>
    </ToastProvider>
    </ThemeProvider>
  );
}

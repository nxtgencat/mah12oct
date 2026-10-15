import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { isEmail } from "../../lib/utils";
import { Button, Card, Field, Input } from "../../components/ui";
import { AuthFooter, AuthShell } from "./AuthShell";

export function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const [email, setEmail] = useState("admin@library.com");
  const [password, setPassword] = useState("admin123");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!isEmail(email)) next.email = "Enter a valid email address.";
    if (password.length < 6) next.password = "Password must be at least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setBusy(true);
    const res = login(email, password);
    setBusy(false);
    if (res.ok) {
      toast.success("Signed in", res.message);
      navigate(location.state?.from ?? "/", { replace: true });
    } else {
      toast.error("Sign in failed", res.message);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage books, members, and circulation.">
      <Card className="p-5 sm:p-6">
        <form onSubmit={submit} noValidate className="space-y-4">
          <Field label="Email" error={errors.email} required>
            <Input
              type="email"
              autoComplete="email"
              placeholder="you@library.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fieldError={errors.email}
            />
          </Field>
          <Field label="Password" error={errors.password} required>
            <div className="relative">
              <Input
                type={show ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fieldError={errors.password}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
                aria-pressed={show}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-gray-200"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>
          <div className="flex items-center justify-between">
            <span className="t-caption">Demo: admin@library.com / admin123</span>
            <Link to="/forgot" className="text-[13px] font-semibold text-primary-700 hover:underline dark:text-primary-300">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" loading={busy} className="w-full" size="lg">
            <LogIn size={16} aria-hidden="true" /> Sign in
          </Button>
        </form>
      </Card>
      <AuthFooter text="New to Athena?" linkText="Create an account" to="/register" />
    </AuthShell>
  );
}

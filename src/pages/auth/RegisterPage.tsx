import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { isEmail } from "../../lib/utils";
import { Button, Card, Field, Input } from "../../components/ui";
import { AuthFooter, AuthShell } from "./AuthShell";

export function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Enter your full name.";
    if (!isEmail(email)) next.email = "Enter a valid email address.";
    if (password.length < 6) next.password = "Use at least 6 characters.";
    if (confirm !== password) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setBusy(true);
    const res = register(name, email, password);
    setBusy(false);
    if (res.ok) {
      toast.success("Account created", res.message);
      navigate("/", { replace: true });
    } else {
      toast.error("Registration failed", res.message);
    }
  };

  return (
    <AuthShell title="Create account" subtitle="Join Athena to start running your library.">
      <Card className="p-5 sm:p-6">
        <form onSubmit={submit} noValidate className="space-y-4">
          <Field label="Full name" error={errors.name} required>
            <Input placeholder="Ada Lovelace" value={name} onChange={(e) => setName(e.target.value)} fieldError={errors.name} autoComplete="name" />
          </Field>
          <Field label="Email" error={errors.email} required>
            <Input type="email" placeholder="you@library.com" value={email} onChange={(e) => setEmail(e.target.value)} fieldError={errors.email} autoComplete="email" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Password" error={errors.password} required>
              <div className="relative">
                <Input
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fieldError={errors.password}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-gray-200"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            <Field label="Confirm password" error={errors.confirm} required>
              <Input
                type={show ? "text" : "password"}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                fieldError={errors.confirm}
                autoComplete="new-password"
              />
            </Field>
          </div>
          <Button type="submit" loading={busy} className="w-full" size="lg">
            <UserPlus size={16} aria-hidden="true" /> Create account
          </Button>
        </form>
      </Card>
      <AuthFooter text="Already have an account?" linkText="Sign in" to="/login" />
    </AuthShell>
  );
}

import { useState } from "react";
import { MailCheck, Send } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { isEmail } from "../../lib/utils";
import { Button, Card, Field, Input } from "../../components/ui";
import { AuthFooter, AuthShell } from "./AuthShell";

export function ForgotPage() {
  const { requestReset } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(undefined);
    const res = requestReset(email);
    if (res.ok) {
      setSent(true);
      toast.success("Reset link sent", res.message);
    } else {
      toast.error("Not found", res.message);
    }
  };

  return (
    <AuthShell title="Reset password" subtitle="Enter your account email and we'll send a reset link.">
      <Card className="p-5 sm:p-6">
        {sent ? (
          <div className="py-2 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <MailCheck size={22} aria-hidden="true" />
            </span>
            <p className="t-subheading mt-3">Check your inbox</p>
            <p className="t-muted mt-1">
              If <span className="font-semibold text-ink-900 dark:text-gray-100">{email}</span> is registered, a reset link is on its way (demo — no email is actually sent).
            </p>
            <Button variant="secondary" className="mt-4" onClick={() => setSent(false)}>
              Use a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-4">
            <Field label="Email" error={error} required>
              <Input type="email" placeholder="you@library.com" value={email} onChange={(e) => setEmail(e.target.value)} fieldError={error} autoComplete="email" />
            </Field>
            <Button type="submit" className="w-full" size="lg">
              <Send size={15} aria-hidden="true" /> Send reset link
            </Button>
          </form>
        )}
      </Card>
      <AuthFooter text="Remember your password?" linkText="Back to sign in" to="/login" />
    </AuthShell>
  );
}

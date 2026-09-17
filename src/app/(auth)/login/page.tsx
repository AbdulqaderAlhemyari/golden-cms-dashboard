"use client";

import { Suspense, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TextField } from "@/components/forms/TextField";
import { login } from "@/lib/api/auth";
import { copy } from "@/lib/copy/ar";
import { mapAuthError } from "@/lib/errors/mapApiError";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const expiredNotice = useMemo(() => {
    return searchParams.get("reason") === "expired" ? copy.sessionExpired : null;
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError(copy.emailRequired);
      return;
    }
    if (!password) {
      setError(copy.passwordRequired);
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace("/overview");
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card-surface space-y-6 p-6 md:p-8">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-foreground">{copy.signIn}</h2>
        <p className="text-sm leading-relaxed text-muted">
          {copy.signInSubtitle}
        </p>
      </div>

      {expiredNotice ? (
        <p className="rounded-lg bg-orange-50 px-3 py-2 text-sm text-primary">
          {expiredNotice}
        </p>
      ) : null}

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <TextField
          label={copy.email}
          name="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          required
        />
        <TextField
          label={copy.password}
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={submitting}
          required
        />

        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={submitting}
        >
          {submitting ? copy.signingIn : copy.signIn}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="card-surface p-8 text-center text-muted">
          {copy.loading}
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

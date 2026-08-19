import { useState, type FormEvent, type ReactElement } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { isApiError } from "../lib/api";

export default function LoginPage(): ReactElement {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  if (status === "authed") {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    setFieldErrors({});
    try {
      await login(email.trim(), password, otpToken.trim() || undefined);
      navigate("/", { replace: true });
    } catch (error) {
      if (isApiError(error)) {
        setFieldErrors(error.fields ?? {});
        setFormError(error.message);
      } else {
        setFormError("خطای غیرمنتظره؛ دوباره تلاش کنید.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="admin-card w-full max-w-sm">
        <h1 className="mb-1 text-xl font-bold">پنل مدیریت</h1>
        <p className="admin-muted mb-6 text-sm">
          برای ورود، ایمیل و رمز عبور خود را وارد کنید.
        </p>
        <form onSubmit={(event) => void handleSubmit(event)} noValidate>
          <div className="mb-4">
            <label htmlFor="email" className="admin-label">
              ایمیل
            </label>
            <input
              id="email"
              type="email"
              dir="ltr"
              className={`admin-input ${fieldErrors.email ? "admin-input-error" : ""}`}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
            {fieldErrors.email?.[0] !== undefined && (
              <p className="mt-1 text-xs" style={{ color: "var(--admin-danger)" }}>
                {fieldErrors.email[0]}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="admin-label">
              رمز عبور
            </label>
            <input
              id="password"
              type="password"
              dir="ltr"
              className={`admin-input ${fieldErrors.password ? "admin-input-error" : ""}`}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            {fieldErrors.password?.[0] !== undefined && (
              <p className="mt-1 text-xs" style={{ color: "var(--admin-danger)" }}>
                {fieldErrors.password[0]}
              </p>
            )}
          </div>
          <div className="mb-6">
            <label htmlFor="otpToken" className="admin-label">
              کد تأیید (اختیاری)
            </label>
            <input
              id="otpToken"
              type="text"
              dir="ltr"
              className={`admin-input ${fieldErrors.otpToken ? "admin-input-error" : ""}`}
              value={otpToken}
              onChange={(event) => setOtpToken(event.target.value)}
              autoComplete="one-time-code"
            />
            {fieldErrors.otpToken?.[0] !== undefined && (
              <p className="mt-1 text-xs" style={{ color: "var(--admin-danger)" }}>
                {fieldErrors.otpToken[0]}
              </p>
            )}
          </div>
          {formError !== null && (
            <div
              className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm"
              style={{ color: "var(--admin-danger)" }}
            >
              {formError}
            </div>
          )}
          <button
            type="submit"
            className="admin-btn admin-btn-primary w-full"
            disabled={pending}
          >
            {pending ? "…" : "ورود"}
          </button>
        </form>
      </div>
    </div>
  );
}

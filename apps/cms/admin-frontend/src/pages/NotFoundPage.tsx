import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-bold">۴۰۴</h1>
      <p className="admin-muted text-sm">صفحه موردنظر پیدا نشد.</p>
      <Link to="/" className="admin-btn">
        بازگشت به داشبورد
      </Link>
    </div>
  );
}

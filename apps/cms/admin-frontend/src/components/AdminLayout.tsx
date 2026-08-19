import { useState, type ReactElement } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

interface NavItem {
  label: string;
  to: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "داشبورد",
    items: [{ label: "نمای کلی", to: "/" }],
  },
  {
    title: "محتوا",
    items: [
      { label: "مدیریت محتوا", to: "/content" },
      { label: "صفحات", to: "/composition" },
    ],
  },
  {
    title: "رسانه",
    items: [{ label: "کتابخانه رسانه", to: "/media" }],
  },
  {
    title: "نظارت",
    items: [{ label: "بهداشت و ترجمه", to: "/overview" }],
  },
  {
    title: "تنظیمات",
    items: [
      { label: "تنظیمات سایت", to: "/settings" },
      { label: "تگ‌ها", to: "/tags" },
      { label: "برگزیده‌ها", to: "/featured" },
      { label: "امنیت / TOTP", to: "/security" },
    ],
  },
];

export default function AdminLayout(): ReactElement {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout(): Promise<void> {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="px-4 py-4 text-base font-bold">پنل مدیریت</div>
        <nav className="px-2 pb-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="mb-4">
              <div className="admin-muted px-2 pb-1 text-xs">{group.title}</div>
              <ul>
                {group.items.map((item) => (
                  <li key={item.label}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `block rounded px-2 py-1.5 text-sm hover:bg-gray-100 ${
                          isActive ? "admin-link-active" : ""
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <div className="admin-main">
        <header className="flex items-center justify-between border-b px-6 py-3"
          style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-surface)" }}
        >
          <div className="text-sm font-medium">پنل مدیریت محتوای تها</div>
          <div className="flex items-center gap-3">
            <span className="text-sm">{user?.displayName ?? user?.email}</span>
            <button
              type="button"
              className="admin-btn"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
            >
              {loggingOut ? "…" : "خروج"}
            </button>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

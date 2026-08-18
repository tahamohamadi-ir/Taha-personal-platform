import { Route, Routes } from "react-router-dom";
import { AuthGuard, AuthProvider } from "./lib/AuthContext";
import AdminLayout from "./components/AdminLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ContentListPage from "./pages/ContentListPage";
import ContentDetailPage from "./pages/ContentDetailPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AuthGuard />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/content" element={<ContentListPage />} />
            <Route path="/content/:entity" element={<ContentListPage />} />
            <Route
              path="/content/:entity/:id"
              element={<ContentDetailPage />}
            />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

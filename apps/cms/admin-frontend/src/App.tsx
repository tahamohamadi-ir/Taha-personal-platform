import { Route, Routes } from "react-router-dom";
import { AuthGuard, AuthProvider } from "./lib/AuthContext";
import AdminLayout from "./components/AdminLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ContentListPage from "./pages/ContentListPage";
import ContentDetailPage from "./pages/ContentDetailPage";
import ContentEditPage from "./pages/ContentEditPage";
import MediaLibraryPage from "./pages/MediaLibraryPage";
import OverviewPage from "./pages/OverviewPage";
import CompositionListPage from "./pages/CompositionListPage";
import CompositionEditorPage from "./pages/CompositionEditorPage";
import SettingsPage from "./pages/SettingsPage";
import TagsPage from "./pages/TagsPage";
import FeaturedPage from "./pages/FeaturedPage";
import SecurityPage from "./pages/SecurityPage";
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
            <Route path="/content/:entity/new" element={<ContentEditPage />} />
            <Route
              path="/content/:entity/:id"
              element={<ContentDetailPage />}
            />
            <Route
              path="/content/:entity/:id/edit"
              element={<ContentEditPage />}
            />
            <Route path="/media" element={<MediaLibraryPage />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/composition" element={<CompositionListPage />} />
            <Route path="/composition/new" element={<CompositionEditorPage />} />
            <Route
              path="/composition/:id/edit"
              element={<CompositionEditorPage />}
            />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/featured" element={<FeaturedPage />} />
            <Route path="/security" element={<SecurityPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { send } from './api/client';
import { useSession } from './hooks/session';
import { usePublicSettings } from './hooks/settings';
import { AuthPage, ProfilePage, PublicProfilePage } from './pages/Account';
import { ErrorNotice } from './components/Feedback';
import { AdminLayout, AdminHome } from './layouts/Admin';
import { ArticleAdmin, ArticleEditor, TaxonomyPage } from './pages/ContentAdmin';
import { ListingPage, ArticlePage } from './pages/Public';
import { ModerationPage } from './pages/Moderation';
import { SeoPage, AnalyticsPage } from './pages/SeoAnalytics';
import { UsersPage, RolesPage, LogsPage, SettingsPage } from './pages/SuperAdmin';
export default function App() {
  const session = useSession();
  const publicSettings = usePublicSettings();
  const qc = useQueryClient();
  const logout = useMutation({
    mutationFn: () => send('/auth/logout', 'POST'),
    onSuccess: async () => {
      qc.setQueryData(['session'], null);
      await qc.invalidateQueries();
    },
  });
  return (
    <>
      <header>
        <div className="masthead">
          <Link className="brand" to="/">
            {publicSettings.data?.data.siteName &&
            publicSettings.data.data.siteName !== 'Điểm Mới' ? (
              publicSettings.data.data.siteName
            ) : (
              <>
                điểm<span>mới.</span>
              </>
            )}
          </Link>
          <span className="tagline">KHOA HỌC · TRÍ TUỆ NHÂN TẠO · CÔNG NGHỆ</span>
          <nav aria-label="Tài khoản">
            {session.data ? (
              <>
                <Link to="/profile">{session.data.displayName}</Link>
                {session.data.permissions.some(
                  (p) =>
                    ![
                      'comments.create',
                      'comments.manage_own',
                      'engagement.manage_own',
                      'reports.create',
                    ].includes(p),
                ) && <Link to="/admin">Quản trị</Link>}
                <button className="text-button" onClick={() => logout.mutate()}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login">Đăng nhập</NavLink>
                <Link to="/register">Đăng ký</Link>
              </>
            )}
          </nav>
        </div>
        <div className="navline">
          <NavLink to="/">Trang chủ</NavLink>
          <NavLink to="/search">Tìm kiếm</NavLink>
          <span>Hiểu công nghệ. Mở góc nhìn.</span>
        </div>
      </header>
      <main>
        <ErrorNotice error={logout.error} />
        <Routes>
          <Route path="/" element={<ListingPage />} />
          <Route path="/search" element={<ListingPage searchMode />} />
          <Route path="/articles/:slug" element={<ArticlePage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage register />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/users/:username" element={<PublicProfilePage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHome />} />
            <Route path="articles" element={<ArticleAdmin />} />
            <Route path="articles/new" element={<ArticleEditor />} />
            <Route path="articles/:id/edit" element={<ArticleEditor />} />
            <Route path="taxonomy" element={<TaxonomyPage />} />
            <Route path="moderation" element={<ModerationPage />} />
            <Route path="seo" element={<SeoPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="logs" element={<LogsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route
            path="*"
            element={
              <section>
                <h1>Không tìm thấy trang</h1>
                <Link to="/">Về trang chủ</Link>
              </section>
            }
          />
        </Routes>
      </main>
      <footer>
        <strong>điểm mới.</strong>
        <p>Tri thức mở ra những khả năng mới.</p>
        <span>Tạp chí khoa học và công nghệ · Phase 1</span>
      </footer>
    </>
  );
}

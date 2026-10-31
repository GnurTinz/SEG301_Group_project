import { Link, NavLink, Outlet } from 'react-router-dom';
import { useSession } from '../hooks/session';
import { Loading } from '../components/Feedback';
export const adminLinks = [
  ['/admin/articles', 'Bài viết', 'documents.update'],
  ['/admin/taxonomy', 'Danh mục & thẻ', 'taxonomy.manage'],
  ['/admin/moderation', 'Kiểm duyệt', 'moderation.review'],
  ['/admin/seo', 'Dữ liệu SEO', 'seo.edit'],
  ['/admin/analytics', 'Phân tích', 'analytics.read'],
  ['/admin/users', 'Tài khoản', 'users.manage'],
  ['/admin/roles', 'Vai trò & quyền', 'permissions.manage'],
  ['/admin/logs', 'Nhật ký', 'audit.read'],
  ['/admin/settings', 'Cài đặt', 'settings.manage'],
] as const;
export function AdminLayout() {
  const s = useSession();
  if (s.isPending) return <Loading />;
  if (!s.data)
    return (
      <p>
        Vui lòng <Link to="/login">đăng nhập</Link>.
      </p>
    );
  const allowed = adminLinks.filter((l) => s.data!.permissions.includes(l[2]));
  if (!allowed.length) return <p role="alert">Bạn không có quyền truy cập quản trị.</p>;
  return (
    <div className="admin-layout">
      <aside>
        <span className="eyebrow">KHÔNG GIAN QUẢN TRỊ</span>
        <h2>Ban biên tập</h2>
        <nav aria-label="Quản trị">
          {allowed.map(([href, text]) => (
            <NavLink key={href} to={href}>
              {text}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
export function AdminHome() {
  const s = useSession();
  return (
    <section className="panel">
      <span className="eyebrow">TỔNG QUAN</span>
      <h1>Chào {s.data?.displayName}</h1>
      <p>
        Chọn một chức năng để quản lý tạp chí. Quyền truy cập được kiểm tra trên máy chủ cho mỗi
        thao tác.
      </p>
      <div className="admin-tiles">
        {adminLinks
          .filter((l) => s.data?.permissions.includes(l[2]))
          .map(([href, text]) => (
            <Link className="panel" to={href} key={href}>
              {text} →
            </Link>
          ))}
      </div>
    </section>
  );
}
export function PermissionGate({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const s = useSession();
  if (s.isPending) return <Loading />;
  return s.data?.permissions.includes(permission) ? (
    children
  ) : (
    <p role="alert">Bạn không có quyền sử dụng chức năng này.</p>
  );
}

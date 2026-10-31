import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, send } from '../api/client';
import { PermissionGate } from '../layouts/Admin';
import { ErrorNotice, Loading } from '../components/Feedback';
import { Pagination } from '../components/Pagination';
interface Role {
  id: string;
  key: string;
  name: string;
  permissions: { permissionId: string; permission: { id: string; key: string } }[];
}
interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  status: string;
  roles: { roleId: string; role: Role }[];
}
function RoleAssignment({ user, roles }: { user: User; roles: Role[] }) {
  const [ids, setIds] = useState(user.roles.map((r) => r.roleId));
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: () => send(`/admin/users/${user.id}/roles`, 'PUT', { roleIds: ids }),
    onSuccess: () => qc.invalidateQueries(),
  });
  return (
    <section className="panel">
      <h2>Vai trò của @{user.username}</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          m.mutate();
        }}
      >
        <div className="checkbox-grid">
          {roles.map((r) => (
            <label key={r.id}>
              <input
                type="checkbox"
                checked={ids.includes(r.id)}
                onChange={(e) =>
                  setIds(e.target.checked ? [...ids, r.id] : ids.filter((id) => id !== r.id))
                }
              />
              {r.key}
            </label>
          ))}
        </div>
        <button disabled={m.isPending}>Lưu vai trò</button>
        <ErrorNotice error={m.error} />
        {m.isSuccess && <p role="status">Đã lưu vai trò. Quyền mới áp dụng ở yêu cầu tiếp theo.</p>}
      </form>
    </section>
  );
}
export function UsersPage() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => api<User[]>(`/admin/users?page=${page}`),
  });
  const roles = useQuery({ queryKey: ['admin-roles'], queryFn: () => api<Role[]>('/admin/roles') });
  const m = useMutation({
    mutationFn: (user: User) =>
      send(`/admin/users/${user.id}`, 'PATCH', {
        status: user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
      }),
    onSuccess: () => qc.invalidateQueries(),
  });
  const chosen = q.data?.data.find((u) => u.id === selected);
  return (
    <PermissionGate permission="users.manage">
      <span className="eyebrow">QUẢN LÝ TRUY CẬP</span>
      <h1>Tài khoản</h1>
      <ErrorNotice error={q.error || roles.error || m.error} />
      {m.isSuccess && <p role="status">Đã cập nhật tài khoản.</p>}
      {q.isPending ? (
        <Loading />
      ) : (
        <>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Thành viên</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {q.data?.data.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.displayName}</strong>
                      <small>
                        @{u.username} · {u.email}
                      </small>
                    </td>
                    <td>{u.roles.map((r) => r.role.key).join(', ') || 'Chưa gán'}</td>
                    <td>{u.status}</td>
                    <td>
                      <div className="actions">
                        <button className="secondary" onClick={() => setSelected(u.id)}>
                          Gán vai trò
                        </button>
                        <button
                          className="secondary"
                          disabled={m.isPending}
                          onClick={() => {
                            if (
                              window.confirm(
                                `${u.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'} @${u.username}?`,
                              )
                            )
                              m.mutate(u);
                          }}
                        >
                          {u.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            pages={q.data?.meta?.totalPages ?? 0}
            onPage={(p) => {
              setPage(p);
              setSelected(null);
            }}
          />
          {chosen && roles.data && (
            <RoleAssignment key={chosen.id} user={chosen} roles={roles.data.data} />
          )}
        </>
      )}
    </PermissionGate>
  );
}
function PermissionEditor({
  role,
  permissions,
}: {
  role: Role;
  permissions: { id: string; key: string }[];
}) {
  const [ids, setIds] = useState(role.permissions.map((p) => p.permissionId));
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: () => send(`/admin/roles/${role.id}/permissions`, 'PUT', { permissionIds: ids }),
    onSuccess: () => qc.invalidateQueries(),
  });
  return (
    <section className="panel">
      <h2>{role.key}</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          m.mutate();
        }}
      >
        <div className="checkbox-grid">
          {permissions.map((p) => (
            <label key={p.id}>
              <input
                type="checkbox"
                checked={ids.includes(p.id)}
                onChange={(e) =>
                  setIds(e.target.checked ? [...ids, p.id] : ids.filter((id) => id !== p.id))
                }
              />
              {p.key}
            </label>
          ))}
        </div>
        <button disabled={m.isPending}>Lưu quyền</button>
        <ErrorNotice error={m.error} />
        {m.isSuccess && <p role="status">Đã cập nhật quyền.</p>}
      </form>
    </section>
  );
}
export function RolesPage() {
  const [selected, setSelected] = useState('');
  const q = useQuery({ queryKey: ['admin-roles'], queryFn: () => api<Role[]>('/admin/roles') });
  const p = useQuery({
    queryKey: ['permissions'],
    queryFn: () => api<{ id: string; key: string }[]>('/admin/permissions'),
  });
  const role = q.data?.data.find((r) => r.id === selected) ?? q.data?.data[0];
  return (
    <PermissionGate permission="permissions.manage">
      <span className="eyebrow">PHÂN QUYỀN THEO VAI TRÒ</span>
      <h1>Vai trò & quyền</h1>
      <p>Một tài khoản có thể có nhiều vai trò; quyền hiệu lực là hợp các quyền được cấp.</p>
      <ErrorNotice error={q.error || p.error} />
      {q.isPending || p.isPending ? (
        <Loading />
      ) : (
        <>
          <label>
            Chọn vai trò
            <select value={role?.id ?? ''} onChange={(e) => setSelected(e.target.value)}>
              {q.data?.data.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.key}
                </option>
              ))}
            </select>
          </label>
          {role && p.data && (
            <PermissionEditor key={role.id} role={role} permissions={p.data.data} />
          )}
        </>
      )}
    </PermissionGate>
  );
}
interface Audit {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  actor: { username: string } | null;
  metadataJson: Record<string, unknown>;
  createdAt: string;
}
export function LogsPage() {
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [actor, setActor] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const q = useQuery({
    queryKey: ['logs', page, filter],
    queryFn: () => api<Audit[]>(`/admin/audit-logs?page=${page}&${filter}`),
  });
  return (
    <PermissionGate permission="audit.read">
      <span className="eyebrow">TRUY VẾT HOẠT ĐỘNG</span>
      <h1>Nhật ký hệ thống</h1>
      <form
        className="filters panel"
        onSubmit={(e) => {
          e.preventDefault();
          const p = new URLSearchParams();
          if (action) p.set('action', action);
          if (actor) p.set('actor', actor);
          if (from) p.set('from', from);
          if (to) p.set('to', to);
          setFilter(p.toString());
          setPage(1);
        }}
      >
        <label>
          Hành động
          <input
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="documents.status"
          />
        </label>
        <label>
          Mã tài khoản
          <input value={actor} onChange={(e) => setActor(e.target.value)} placeholder="UUID" />
        </label>
        <label>
          Từ ngày
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label>
          Đến ngày
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <button>Lọc nhật ký</button>
      </form>
      <ErrorNotice error={q.error} />
      {q.isPending ? (
        <Loading />
      ) : (
        <>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Người thực hiện</th>
                  <th>Hành động</th>
                  <th>Đối tượng</th>
                </tr>
              </thead>
              <tbody>
                {q.data?.data.map((l) => (
                  <tr key={l.id}>
                    <td>{new Date(l.createdAt).toLocaleString('vi-VN')}</td>
                    <td>{l.actor?.username ?? 'Hệ thống / khách'}</td>
                    <td>{l.action}</td>
                    <td>
                      {l.entityType}
                      <small>{l.entityId}</small>
                      <details>
                        <summary>Chi tiết</summary>
                        <pre>{JSON.stringify(l.metadataJson, null, 2)}</pre>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {q.data?.data.length === 0 && <p>Chưa có nhật ký phù hợp.</p>}
          <Pagination page={page} pages={q.data?.meta?.totalPages ?? 0} onPage={setPage} />
        </>
      )}
    </PermissionGate>
  );
}
interface Settings {
  siteName: string;
  commentsEnabled: boolean;
  logRetentionDays: number;
}
function SettingsForm({ value }: { value: Settings }) {
  const f = useForm<Settings>({ defaultValues: value });
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: (d: Settings) => send('/admin/settings', 'PATCH', d),
    onSuccess: () => qc.invalidateQueries(),
  });
  return (
    <form className="panel" onSubmit={f.handleSubmit((d) => m.mutate(d))}>
      <label>
        Tên tạp chí
        <input required maxLength={100} {...f.register('siteName')} />
      </label>
      <label className="checkbox-label">
        <input type="checkbox" {...f.register('commentsEnabled')} />
        Cho phép bình luận mới
      </label>
      <label>
        Thời gian lưu log (ngày)
        <input
          type="number"
          min={7}
          max={365}
          {...f.register('logRetentionDays', { valueAsNumber: true })}
        />
      </label>
      <button disabled={m.isPending}>Lưu cài đặt</button>
      <ErrorNotice error={m.error} />
      {m.isSuccess && <p role="status">Đã lưu cài đặt.</p>}
    </form>
  );
}
export function SettingsPage() {
  const q = useQuery({ queryKey: ['settings'], queryFn: () => api<Settings>('/admin/settings') });
  return (
    <PermissionGate permission="settings.manage">
      <span className="eyebrow">THIẾT LẬP TẠP CHÍ</span>
      <h1>Cài đặt chung</h1>
      <ErrorNotice error={q.error} />
      {q.isPending ? <Loading /> : q.data && <SettingsForm value={q.data.data} />}
    </PermissionGate>
  );
}

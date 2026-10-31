import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, send } from '../api/client';
import { useSession, type Identity } from '../hooks/session';
import { ErrorNotice, Loading } from '../components/Feedback';
const authSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(12, 'Mật khẩu cần ít nhất 12 ký tự'),
  username: z.string().optional(),
});
type Credentials = z.infer<typeof authSchema>;
export function AuthPage({ register = false }: { register?: boolean }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const form = useForm<Credentials>({
    resolver: zodResolver(
      register
        ? authSchema.extend({
            username: z
              .string()
              .regex(/^[a-zA-Z0-9_]{3,30}$/, 'Tên đăng nhập gồm 3–30 chữ, số hoặc dấu gạch dưới'),
          })
        : authSchema,
    ),
  });
  const mutation = useMutation({
    mutationFn: (data: Credentials) =>
      send<Identity>(`/auth/${register ? 'register' : 'login'}`, 'POST', data),
    onSuccess: async (r) => {
      qc.setQueryData(['session'], r.data);
      await qc.invalidateQueries();
      navigate('/profile');
    },
  });
  return (
    <section className="account panel">
      <span className="eyebrow">CỘNG ĐỒNG ĐIỂM MỚI</span>
      <h1>{register ? 'Tạo tài khoản' : 'Chào mừng trở lại'}</h1>
      <p>Cùng đọc, thảo luận và khám phá công nghệ.</p>
      <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))}>
        {register && (
          <label>
            Tên đăng nhập
            <input autoComplete="username" {...form.register('username')} />
            {form.formState.errors.username && (
              <small role="alert">{form.formState.errors.username.message}</small>
            )}
          </label>
        )}
        <label>
          Email
          <input type="email" autoComplete="email" {...form.register('email')} />
          {form.formState.errors.email && (
            <small role="alert">{form.formState.errors.email.message}</small>
          )}
        </label>
        <label>
          Mật khẩu
          <input
            type="password"
            autoComplete={register ? 'new-password' : 'current-password'}
            {...form.register('password')}
          />
          {form.formState.errors.password && (
            <small role="alert">{form.formState.errors.password.message}</small>
          )}
        </label>
        <ErrorNotice error={mutation.error} />
        <button disabled={mutation.isPending}>
          {mutation.isPending ? 'Đang xử lý…' : register ? 'Đăng ký' : 'Đăng nhập'}
        </button>
      </form>
      <p>
        <Link to={register ? '/login' : '/register'}>
          {register ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
        </Link>
      </p>
    </section>
  );
}
const profileSchema = z.object({
  displayName: z.string().min(1).max(80),
  bio: z.string().max(1000),
});
function ProfileForm({ user }: { user: Identity }) {
  const qc = useQueryClient();
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: user.displayName, bio: user.bio },
  });
  const mutation = useMutation({
    mutationFn: (d: z.infer<typeof profileSchema>) => send<Identity>('/users/me', 'PATCH', d),
    onSuccess: async (r) => {
      qc.setQueryData(['session'], r.data);
      await qc.invalidateQueries({ queryKey: ['session'] });
    },
  });
  return (
    <section className="panel account">
      <h1>Hồ sơ của bạn</h1>
      <p>
        @{user.username} · {user.email}
      </p>
      <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))}>
        <label>
          Tên hiển thị
          <input {...form.register('displayName')} />
        </label>
        <label>
          Giới thiệu
          <textarea {...form.register('bio')} />
        </label>
        <ErrorNotice error={mutation.error} />
        {Object.values(form.formState.errors).map((e, i) => (
          <p role="alert" key={i}>
            {e.message}
          </p>
        ))}
        {mutation.isSuccess && <p role="status">Đã lưu hồ sơ.</p>}
        <button disabled={mutation.isPending}>Lưu hồ sơ</button>
      </form>
    </section>
  );
}
export function ProfilePage() {
  const s = useSession();
  if (s.isPending) return <Loading />;
  if (!s.data)
    return (
      <p>
        Vui lòng <Link to="/login">đăng nhập</Link> để xem hồ sơ.
      </p>
    );
  return <ProfileForm user={s.data} />;
}
export function PublicProfilePage() {
  const { username } = useParams();
  const q = useQuery({
    queryKey: ['profile', username],
    queryFn: () => api<Pick<Identity, 'username' | 'displayName' | 'bio'>>(`/users/${username}`),
  });
  if (q.isPending) return <Loading />;
  if (q.error) return <ErrorNotice error={q.error} />;
  return (
    <section className="panel">
      <h1>{q.data.data.displayName}</h1>
      <p>@{q.data.data.username}</p>
      <p>{q.data.data.bio}</p>
    </section>
  );
}

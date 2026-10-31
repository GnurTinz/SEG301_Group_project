import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, send } from '../api/client';
import type { Article, Taxon } from '../types/content';
import { ErrorNotice, Loading } from '../components/Feedback';
import { Pagination } from '../components/Pagination';
import { PermissionGate } from '../layouts/Admin';
export function ArticleAdmin() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['admin-articles', page, status],
    queryFn: () =>
      api<Article[]>(`/admin/documents?page=${page}${status ? `&status=${status}` : ''}`),
  });
  const action = useMutation({
    mutationFn: ({ id, status }: { id: string; status?: string }) =>
      status
        ? send(`/documents/${id}/status`, 'PATCH', { status })
        : send(`/documents/${id}`, 'DELETE'),
    onSuccess: () => qc.invalidateQueries(),
  });
  return (
    <PermissionGate permission="documents.update">
      <div className="section-heading">
        <div>
          <span className="eyebrow">BIÊN TẬP NỘI DUNG</span>
          <h1>Bài viết</h1>
        </div>
        <Link className="button" to="/admin/articles/new">
          Viết bài mới
        </Link>
      </div>
      <label>
        Trạng thái
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tất cả</option>
          {['DRAFT', 'PUBLISHED', 'UNPUBLISHED'].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <ErrorNotice error={q.error || action.error} />
      {q.isPending ? (
        <Loading />
      ) : (
        <>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Bài viết</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {q.data?.data.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <Link to={`/admin/articles/${d.id}/edit`}>{d.title}</Link>
                      <small>{d.category.name}</small>
                    </td>
                    <td>
                      <span className="badge">{d.status}</span>
                    </td>
                    <td>
                      <div className="actions">
                        <Link to={`/admin/articles/${d.id}/edit`}>Sửa</Link>
                        <button
                          className="secondary"
                          disabled={action.isPending}
                          onClick={() =>
                            action.mutate({
                              id: d.id,
                              status: d.status === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED',
                            })
                          }
                        >
                          {d.status === 'PUBLISHED' ? 'Gỡ xuất bản' : 'Xuất bản'}
                        </button>
                        <button
                          className="danger"
                          disabled={action.isPending}
                          onClick={() => {
                            if (window.confirm(`Xóa bài “${d.title}”?`))
                              action.mutate({ id: d.id });
                          }}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {q.data?.data.length === 0 && <p>Chưa có bài viết.</p>}
          <Pagination page={page} pages={q.data?.meta?.totalPages ?? 0} onPage={setPage} />
          {action.isSuccess && <p role="status">Đã cập nhật bài viết.</p>}
        </>
      )}
    </PermissionGate>
  );
}
const schema = z
  .object({
    title: z.string().min(1).max(200),
    summary: z.string().min(1).max(600),
    content: z.string().min(1).max(100000),
    categoryId: z.string().uuid('Chọn danh mục'),
    tagIds: z.array(z.string()),
    coverImageUrl: z.string(),
    coverImageAlt: z.string().max(300),
  })
  .refine((d) => !d.coverImageUrl || !!d.coverImageAlt.trim(), {
    path: ['coverImageAlt'],
    message: 'Ảnh cần mô tả thay thế',
  });
type Values = z.infer<typeof schema>;
function Editor({ article }: { article?: Article }) {
  const nav = useNavigate();
  const qc = useQueryClient();
  const cats = useQuery({ queryKey: ['categories'], queryFn: () => api<Taxon[]>('/categories') });
  const tags = useQuery({ queryKey: ['tags'], queryFn: () => api<Taxon[]>('/tags') });
  const f = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: article?.title ?? '',
      summary: article?.summary ?? '',
      content: article?.content ?? '<p></p>',
      categoryId: article?.categoryId ?? '',
      tagIds: article?.tags.map((t) => t.tagId) ?? [],
      coverImageUrl: article?.coverImageUrl ?? '',
      coverImageAlt: article?.coverImageAlt ?? '',
    },
  });
  const save = useMutation({
    mutationFn: (d: Values) =>
      send<Article>(
        article ? `/documents/${article.id}` : '/documents',
        article ? 'PATCH' : 'POST',
        { ...d, coverImageUrl: d.coverImageUrl || null },
      ),
    onSuccess: async () => {
      await qc.invalidateQueries();
      nav('/admin/articles');
    },
  });
  const upload = useMutation({
    mutationFn: (file: File) => {
      const data = new FormData();
      data.set('image', file);
      data.set('alt', f.getValues('coverImageAlt'));
      return api<{ url: string; alt: string }>('/uploads/images', { method: 'POST', body: data });
    },
    onSuccess: (r) => {
      f.setValue('coverImageUrl', r.data.url, { shouldValidate: true });
    },
  });
  return (
    <section className="panel">
      <span className="eyebrow">BIÊN TẬP</span>
      <h1>{article ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}</h1>
      <p>Bài mới được lưu ở trạng thái nháp. Xuất bản từ danh sách bài viết.</p>
      <form onSubmit={f.handleSubmit((d) => save.mutate(d))}>
        <label>
          Tiêu đề
          <input {...f.register('title')} />
        </label>
        <label>
          Tóm tắt
          <textarea {...f.register('summary')} />
        </label>
        <label>
          Nội dung HTML
          <textarea className="content-editor" {...f.register('content')} />
          <small>
            Hỗ trợ p, h2, h3, danh sách, liên kết và định dạng cơ bản. Máy chủ lọc HTML.
          </small>
        </label>
        <div className="form-grid">
          <label>
            Danh mục
            <select {...f.register('categoryId')}>
              <option value="">Chọn danh mục</option>
              {cats.data?.data.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Thẻ (giữ Ctrl/Command để chọn nhiều)
            <select multiple {...f.register('tagIds')}>
              {tags.data?.data.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Mô tả ảnh
          <input {...f.register('coverImageAlt')} />
        </label>
        <label>
          Ảnh bìa (JPEG, PNG, WebP · tối đa 5 MB)
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload.mutate(file);
            }}
          />
        </label>
        <label>
          Đường dẫn ảnh
          <input readOnly {...f.register('coverImageUrl')} />
        </label>
        {Object.entries(f.formState.errors).map(([key, e]) => (
          <p role="alert" key={key}>
            {key}: {e?.message}
          </p>
        ))}
        <ErrorNotice error={save.error || upload.error || cats.error || tags.error} />
        {upload.isSuccess && <p role="status">Đã tải ảnh lên.</p>}
        <div className="actions">
          <button disabled={save.isPending || upload.isPending}>Lưu bài viết</button>
          <Link to="/admin/articles">Hủy</Link>
        </div>
      </form>
    </section>
  );
}
export function ArticleEditor() {
  const { id } = useParams();
  const q = useQuery({
    queryKey: ['editor', id],
    queryFn: () => api<Article>(`/admin/documents/${id}`),
    enabled: !!id,
  });
  return (
    <PermissionGate permission={id ? 'documents.update' : 'documents.create'}>
      {id && q.isPending ? (
        <Loading />
      ) : q.error ? (
        <ErrorNotice error={q.error} />
      ) : (
        <Editor key={id ?? 'new'} article={q.data?.data} />
      )}
    </PermissionGate>
  );
}
function TaxonomySection({ kind, title }: { kind: 'categories' | 'tags'; title: string }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Taxon | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const q = useQuery({ queryKey: [kind], queryFn: () => api<Taxon[]>(`/${kind}`) });
  const mutation = useMutation({
    mutationFn: ({ id, remove = false }: { id?: string; remove?: boolean }) =>
      send(
        `/${kind}${id ? `/${id}` : ''}`,
        remove ? 'DELETE' : id ? 'PATCH' : 'POST',
        remove ? {} : { name, ...(kind === 'categories' ? { description } : {}) },
      ),
    onSuccess: async () => {
      setEditing(null);
      setName('');
      setDescription('');
      await qc.invalidateQueries();
    },
  });
  return (
    <section className="panel">
      <h2>{title}</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate({ id: editing?.id });
        }}
      >
        <label>
          Tên {title.toLowerCase()}
          <input required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        {kind === 'categories' && (
          <label>
            Mô tả danh mục
            <textarea
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
        )}
        <button disabled={mutation.isPending}>
          {editing ? 'Lưu thay đổi' : `Thêm ${title.toLowerCase()}`}
        </button>
        {editing && (
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setEditing(null);
              setName('');
              setDescription('');
            }}
          >
            Hủy sửa
          </button>
        )}
      </form>
      <ErrorNotice error={q.error || mutation.error} />
      {mutation.isSuccess && <p role="status">Đã cập nhật.</p>}
      {q.data?.data.map((t) => (
        <div className="taxonomy-row" key={t.id}>
          <span>{t.name}</span>
          <button
            className="text-button"
            onClick={() => {
              setEditing(t);
              setName(t.name);
              setDescription(t.description ?? '');
            }}
          >
            Sửa
          </button>
          <button
            className="text-button"
            onClick={() => {
              if (window.confirm(`Xóa ${t.name}?`)) mutation.mutate({ id: t.id, remove: true });
            }}
          >
            Xóa
          </button>
        </div>
      ))}
    </section>
  );
}
export function TaxonomyPage() {
  return (
    <PermissionGate permission="taxonomy.manage">
      <h1>Danh mục & thẻ</h1>
      <div className="form-grid">
        <TaxonomySection kind="categories" title="Danh mục" />
        <TaxonomySection kind="tags" title="Thẻ" />
      </div>
    </PermissionGate>
  );
}

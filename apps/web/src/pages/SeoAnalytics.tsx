import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { api, send } from '../api/client';
import type { Article } from '../types/content';
import { PermissionGate } from '../layouts/Admin';
import { ErrorNotice, Loading } from '../components/Feedback';
import { Pagination } from '../components/Pagination';
type SeoValues = Pick<Article, 'seoTitle' | 'seoDescription' | 'seoKeywords' | 'coverImageAlt'>;
function SeoEditor({ article }: { article: Article }) {
  const qc = useQueryClient();
  const f = useForm<SeoValues>({
    defaultValues: {
      seoTitle: article.seoTitle,
      seoDescription: article.seoDescription,
      seoKeywords: article.seoKeywords,
      coverImageAlt: article.coverImageAlt,
    },
  });
  const m = useMutation({
    mutationFn: (d: SeoValues) => send(`/seo/documents/${article.id}`, 'PATCH', d),
    onSuccess: () => qc.invalidateQueries(),
  });
  return (
    <section className="panel">
      <h2>{article.title}</h2>
      <form onSubmit={f.handleSubmit((d) => m.mutate(d))}>
        <label>
          Tiêu đề SEO
          <input maxLength={200} {...f.register('seoTitle')} />
        </label>
        <label>
          Mô tả SEO
          <textarea maxLength={320} {...f.register('seoDescription')} />
        </label>
        <label>
          Từ khóa SEO
          <input maxLength={500} {...f.register('seoKeywords')} />
        </label>
        <label>
          Mô tả ảnh (alt)
          <input
            maxLength={300}
            required={!!article.coverImageUrl}
            {...f.register('coverImageAlt')}
          />
        </label>
        <button disabled={m.isPending}>Lưu metadata</button>
        <ErrorNotice error={m.error} />
        {m.isSuccess && <p role="status">Đã lưu metadata.</p>}
      </form>
    </section>
  );
}
export function SeoPage() {
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ['seo', page],
    queryFn: () => api<Article[]>(`/seo/documents?page=${page}`),
  });
  const selected = q.data?.data.find((d) => d.id === selectedId);
  return (
    <PermissionGate permission="seo.edit">
      <span className="eyebrow">TỐI ƯU KHẢ NĂNG KHÁM PHÁ</span>
      <h1>Dữ liệu SEO</h1>
      <p>
        Chỉnh sửa metadata và mô tả ảnh. Nội dung và trạng thái xuất bản được quản lý bởi biên tập
        viên.
      </p>
      <ErrorNotice error={q.error} />
      {q.isPending ? (
        <Loading />
      ) : (
        <>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Bài viết</th>
                  <th>SEO hiện tại</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {q.data?.data.map((d) => (
                  <tr key={d.id}>
                    <td>
                      {d.title}
                      <small>{d.status}</small>
                    </td>
                    <td>{d.seoTitle || 'Chưa có'}</td>
                    <td>
                      <button className="secondary" onClick={() => setSelectedId(d.id)}>
                        Sửa SEO
                      </button>
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
              setSelectedId(null);
            }}
          />
          {selected && <SeoEditor key={selected.id} article={selected} />}
        </>
      )}
    </PermissionGate>
  );
}
interface Overview {
  views: number;
  searches: number;
  clicks: number;
  ctr: number;
  topQueries: { query: string; searches: number }[];
  topDocuments: { id: string; title: string; slug: string; views: number }[];
  trends: { day: string; searches: number; clicks: number }[];
}
export function AnalyticsPage() {
  const [params, setParams] = useSearchParams();
  const q = useQuery({
    queryKey: ['analytics', params.toString()],
    queryFn: () => api<Overview>(`/analytics/overview?${params}`),
  });
  const d = q.data?.data;
  const max = Math.max(1, ...(d?.trends.map((t) => t.searches) ?? []));
  return (
    <PermissionGate permission="analytics.read">
      <span className="eyebrow">DỮ LIỆU TƯƠNG TÁC THỰC</span>
      <h1>Phân tích độc giả</h1>
      <form
        className="filters panel"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const n = new URLSearchParams();
          for (const [k, v] of f) if (v) n.set(k, String(v));
          setParams(n);
        }}
      >
        <label>
          Từ ngày
          <input type="date" name="from" defaultValue={params.get('from') ?? ''} />
        </label>
        <label>
          Đến ngày
          <input type="date" name="to" defaultValue={params.get('to') ?? ''} />
        </label>
        <button>Áp dụng</button>
      </form>
      <ErrorNotice error={q.error} />
      {q.isPending ? (
        <Loading />
      ) : (
        d && (
          <>
            <div className="metric-grid">
              {[
                ['Lượt xem', d.views],
                ['Lượt tìm kiếm', d.searches],
                ['Lượt nhấp', d.clicks],
                ['Click / search', `${d.ctr.toFixed(1)}%`],
              ].map(([label, value]) => (
                <div className="panel metric" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <p className="muted">
              CTR = số click / số lượt tìm kiếm. Một lượt tìm có thể có nhiều click nên tỷ lệ có thể
              vượt 100%. Biểu đồ theo ngày UTC, tối đa 90 ngày gần nhất có dữ liệu.
            </p>
            <section className="panel">
              <h2>Xu hướng tìm kiếm</h2>
              {d.trends.length ? (
                <div className="trend-chart" role="img" aria-label="Lượt tìm kiếm theo ngày">
                  {d.trends.map((t) => (
                    <div className="trend-column" key={t.day}>
                      <span>{t.searches}</span>
                      <div
                        style={{ height: `${Math.max(2, (t.searches / max) * 140)}px` }}
                        title={`${t.day}: ${t.searches} searches, ${t.clicks} clicks`}
                      />
                      <small>{t.day.slice(5)}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Chưa có dữ liệu tìm kiếm.</p>
              )}
            </section>
            <div className="form-grid">
              <section className="panel">
                <h2>Từ khóa nổi bật</h2>
                {d.topQueries.length ? (
                  <ol className="rank-list">
                    {d.topQueries.map((t) => (
                      <li key={t.query}>
                        <span>{t.query}</span>
                        <strong>{t.searches}</strong>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p>Chưa có từ khóa.</p>
                )}
              </section>
              <section className="panel">
                <h2>Bài viết được đọc</h2>
                {d.topDocuments.length ? (
                  <ol className="rank-list">
                    {d.topDocuments.map((t) => (
                      <li key={t.id}>
                        <Link to={`/articles/${t.slug}`}>{t.title}</Link>
                        <strong>{t.views}</strong>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p>Chưa có lượt xem.</p>
                )}
              </section>
            </div>
          </>
        )
      )}
    </PermissionGate>
  );
}

import { useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api, send } from '../api/client';
import type { Article, Taxon } from '../types/content';
import { ErrorNotice, Loading } from '../components/Feedback';
import { Pagination } from '../components/Pagination';
import { Engagement } from '../components/Engagement';
export const dateText = (s: string | null) =>
  s ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(s)) : 'Bản nháp';
function Filters({ searchMode }: { searchMode: boolean }) {
  const [params, setParams] = useSearchParams();
  const cats = useQuery({ queryKey: ['categories'], queryFn: () => api<Taxon[]>('/categories') });
  const tags = useQuery({ queryKey: ['tags'], queryFn: () => api<Taxon[]>('/tags') });
  return (
    <form
      className="filters panel"
      key={params.toString()}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const next = new URLSearchParams();
        for (const [k, v] of data) if (String(v).trim()) next.set(k, String(v).trim());
        setParams(next);
      }}
    >
      {searchMode && (
        <label className="keyword">
          Từ khóa
          <input
            name="q"
            defaultValue={params.get('q') ?? ''}
            required
            maxLength={200}
            placeholder="Bạn muốn tìm hiểu điều gì?"
          />
        </label>
      )}
      <label>
        Danh mục
        <select name="category" defaultValue={params.get('category') ?? ''}>
          <option value="">Tất cả danh mục</option>
          {cats.data?.data.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Thẻ
        <select name="tag" defaultValue={params.get('tag') ?? ''}>
          <option value="">Tất cả thẻ</option>
          {tags.data?.data.map((t) => (
            <option key={t.id} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Từ ngày
        <input type="date" name="from" defaultValue={params.get('from') ?? ''} />
      </label>
      <label>
        Đến ngày
        <input type="date" name="to" defaultValue={params.get('to') ?? ''} />
      </label>
      <button>{searchMode ? 'Tìm kiếm' : 'Lọc bài viết'}</button>
      <ErrorNotice error={cats.error || tags.error} />
    </form>
  );
}
export function ListingPage({ searchMode = false }: { searchMode?: boolean }) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const key = params.toString();
  const enabled = !searchMode || !!params.get('q')?.trim();
  const q = useQuery({
    queryKey: [searchMode ? 'search' : 'articles', key],
    queryFn: () => api<Article[]>(`/${searchMode ? 'search' : 'documents'}?${key}`),
    enabled,
    staleTime: searchMode ? Infinity : 0,
  });
  const click = useMutation({
    mutationFn: async ({ d, index }: { d: Article; index: number }) => {
      await send('/search/clicks', 'POST', {
        search_id: q.data?.meta?.searchId,
        clicked_doc_id: d.id,
        position: index + 1,
      });
      return d;
    },
    onSuccess: (d) => navigate(`/articles/${d.slug}`),
  });
  const change = (k: string, value: string) => {
    const n = new URLSearchParams(params);
    n.set(k, value);
    if (k !== 'page') n.set('page', '1');
    setParams(n);
  };
  return (
    <>
      <section className="intro">
        <span className="eyebrow">
          {searchMode ? 'KHO TRI THỨC' : 'TẠP CHÍ ĐIỆN TỬ · ĐỌC ĐỂ HIỂU'}
        </span>
        <h1>
          {searchMode ? (
            'Tìm một góc nhìn mới.'
          ) : (
            <>
              Công nghệ chuyển động.
              <br />
              <em>Tri thức dẫn đường.</em>
            </>
          )}
        </h1>
        <p>
          {searchMode
            ? 'Khám phá bài viết về AI, dữ liệu và những ứng dụng thực tế.'
            : 'Những bài viết giúp bạn hiểu sâu hơn về trí tuệ nhân tạo, khoa học và thế giới số.'}
        </p>
      </section>
      <Filters searchMode={searchMode} />
      <ErrorNotice error={q.error || click.error} />
      {!enabled ? (
        <p className="notice">Nhập từ khóa để bắt đầu tìm kiếm.</p>
      ) : q.isPending ? (
        <Loading />
      ) : (
        <>
          <div className="section-heading">
            <h2>{searchMode ? `Kết quả cho “${params.get('q')}”` : 'Bài viết mới nhất'}</h2>
            <span className="muted">{q.data?.meta?.total ?? 0} bài viết</span>
          </div>
          <div className="article-grid">
            {q.data?.data.map((d, index) => (
              <article
                key={d.id}
                className={`article-card ${!searchMode && index === 0 ? 'featured' : ''}`}
              >
                {d.coverImageUrl && (
                  <img
                    src={d.coverImageUrl}
                    alt={d.coverImageAlt}
                    loading={index > 0 ? 'lazy' : 'eager'}
                  />
                )}
                <div className="card-content">
                  <div className="card-meta">
                    <span className="category">{d.category.name}</span>
                    <span>{dateText(d.publishedAt)}</span>
                  </div>
                  <h2>
                    <Link
                      to={`/articles/${d.slug}`}
                      onClick={
                        searchMode
                          ? (e) => {
                              e.preventDefault();
                              if (!click.isPending) click.mutate({ d, index });
                            }
                          : undefined
                      }
                    >
                      {d.title}
                    </Link>
                  </h2>
                  <p>{d.summary}</p>
                  <div className="byline">
                    <span>{d.author}</span>
                    <span>{d.viewsCount.toLocaleString('vi-VN')} lượt xem</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {q.data?.data.length === 0 && (
            <section className="panel">
              <h2>Chưa tìm thấy bài viết</h2>
              <p>Thử một từ khóa khác hoặc mở rộng bộ lọc.</p>
            </section>
          )}
          <Pagination
            page={Number(params.get('page') ?? 1)}
            pages={q.data?.meta?.totalPages ?? 0}
            onPage={(p) => change('page', String(p))}
            pageSize={Number(params.get('pageSize') ?? 10)}
            onSize={(p) => change('pageSize', String(p))}
          />
        </>
      )}
    </>
  );
}
export function ArticlePage() {
  const { slug } = useParams();
  const q = useQuery({
    queryKey: ['article', slug],
    queryFn: () => api<Article>(`/documents/${slug}`),
  });
  useEffect(() => {
    if (!q.data) return;
    const d = q.data.data;
    document.title = `${d.seoTitle || d.title} · Điểm Mới`;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.append(meta);
    }
    meta.content = d.seoDescription || d.summary;
    let metaKeywords = document.querySelector<HTMLMetaElement>('meta[name="keywords"]');
    if (d.seoKeywords) {
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.name = 'keywords';
        document.head.append(metaKeywords);
      }
      metaKeywords.content = d.seoKeywords;
    } else if (metaKeywords) {
      metaKeywords.remove();
    }
    return () => {
      document.title = 'Điểm Mới — Tạp chí công nghệ';
      meta!.content = 'Tạp chí khoa học, trí tuệ nhân tạo và công nghệ.';
      const kw = document.querySelector<HTMLMetaElement>('meta[name="keywords"]');
      if (kw) kw.remove();
    };
  }, [q.data]);
  if (q.isPending) return <Loading />;
  if (q.error) return <ErrorNotice error={q.error} />;
  const d = q.data.data;
  return (
    <article className="article-detail">
      <Link className="backlink" to="/">
        ← Về tạp chí
      </Link>
      <div className="article-header">
        <span className="eyebrow">{d.category.name}</span>
        <h1>{d.title}</h1>
        <p className="lead">{d.summary}</p>
        <div className="byline">
          <span>{d.author}</span>
          <time dateTime={d.publishedAt ?? ''}>{dateText(d.publishedAt)}</time>
          <span>{d.viewsCount} lượt xem</span>
        </div>
      </div>
      {d.coverImageUrl && (
        <img className="article-cover" src={d.coverImageUrl} alt={d.coverImageAlt} />
      )}
      <div className="article-body" dangerouslySetInnerHTML={{ __html: d.content }} />
      <div className="tags">
        {d.tags.map((t) => (
          <Link key={t.tagId} to={`/?tag=${encodeURIComponent(t.tag.slug)}`}>
            #{t.tag.name}
          </Link>
        ))}
      </div>
      <Engagement article={d} />
    </article>
  );
}

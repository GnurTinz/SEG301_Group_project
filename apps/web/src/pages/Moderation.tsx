import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, send } from '../api/client';
import { PermissionGate } from '../layouts/Admin';
import { ErrorNotice, Loading } from '../components/Feedback';
import { Pagination } from '../components/Pagination';
interface Item {
  id: string;
  body?: string;
  reason?: string;
  description?: string;
  status: string;
  user?: { username: string };
  reporter?: { username: string };
  document?: { title: string } | null;
  comment?: { body: string } | null;
}
export function ModerationPage() {
  const [kind, setKind] = useState<'comments' | 'reports'>('reports');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['moderation', kind, page, status],
    queryFn: () =>
      api<Item[]>(`/moderation/${kind}?page=${page}${status ? `&status=${status}` : ''}`),
  });
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      send(`/moderation/${kind}/${id}${kind === 'comments' ? '/status' : ''}`, 'PATCH', { status }),
    onSuccess: () => qc.invalidateQueries(),
  });
  return (
    <PermissionGate permission="moderation.review">
      <span className="eyebrow">CỘNG ĐỒNG AN TOÀN</span>
      <h1>Kiểm duyệt</h1>
      <div className="actions">
        <button
          className={kind === 'reports' ? '' : 'secondary'}
          onClick={() => {
            setKind('reports');
            setStatus('');
            setPage(1);
          }}
        >
          Báo cáo
        </button>
        <button
          className={kind === 'comments' ? '' : 'secondary'}
          onClick={() => {
            setKind('comments');
            setStatus('');
            setPage(1);
          }}
        >
          Bình luận
        </button>
      </div>
      <label>
        Lọc trạng thái
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tất cả</option>
          {(kind === 'comments'
            ? ['VISIBLE', 'HIDDEN', 'SPAM']
            : ['OPEN', 'RESOLVED', 'DISMISSED']
          ).map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </label>
      <ErrorNotice error={q.error || mutation.error} />
      {mutation.isSuccess && <p role="status">Đã cập nhật kiểm duyệt.</p>}
      {q.isPending ? (
        <Loading />
      ) : (
        <>
          {q.data?.data.map((item) => (
            <article className="panel moderation-item" key={item.id}>
              <div className="section-heading">
                <strong>
                  {item.document?.title ?? (kind === 'reports' ? 'Báo cáo bình luận' : 'Bình luận')}
                </strong>
                <span className="badge">{item.status}</span>
              </div>
              <p>{item.body ?? item.comment?.body ?? item.reason}</p>
              {item.description && <p>{item.description}</p>}
              <p className="muted">
                @{item.user?.username ?? item.reporter?.username} · {item.reason}
              </p>
              <div className="actions">
                {(kind === 'comments'
                  ? [
                      ['HIDDEN', 'Ẩn'],
                      ['VISIBLE', 'Khôi phục'],
                      ['SPAM', 'Đánh dấu spam'],
                    ]
                  : [
                      ['RESOLVED', 'Đã xử lý'],
                      ['DISMISSED', 'Bỏ qua'],
                    ]
                ).map(([value, label]) => (
                  <button
                    className="secondary"
                    disabled={mutation.isPending || item.status === value}
                    key={value}
                    onClick={() => mutation.mutate({ id: item.id, status: value! })}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </article>
          ))}
          {q.data?.data.length === 0 && <p>Hàng đợi trống.</p>}
          <Pagination page={page} pages={q.data?.meta?.totalPages ?? 0} onPage={setPage} />
        </>
      )}
    </PermissionGate>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, send } from '../api/client';
import { useSession } from '../hooks/session';
import type { Article } from '../types/content';
import { ErrorNotice, Loading } from './Feedback';
import { Pagination } from './Pagination';
import { usePublicSettings } from '../hooks/settings';
interface Comment {
  id: string;
  body: string;
  parentId: string | null;
  userId: string;
  createdAt: string;
  user: { username: string; displayName: string };
  mentions: { mentionedUser: { username: string } }[];
}
export function ReportForm({ documentId, commentId }: { documentId?: string; commentId?: string }) {
  const [reason, setReason] = useState('SPAM');
  const [description, setDescription] = useState('');
  const mutation = useMutation({
    mutationFn: () => send('/reports', 'POST', { documentId, commentId, reason, description }),
  });
  return (
    <details className="report-form">
      <summary>Báo cáo {commentId ? 'bình luận' : 'bài viết'}</summary>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <label>
          Lý do
          <select value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="SPAM">Spam</option>
            <option value="HARASSMENT">Quấy rối</option>
            <option value="MISINFORMATION">Thông tin sai lệch</option>
            <option value="OTHER">Khác</option>
          </select>
        </label>
        <label>
          Mô tả
          <textarea
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <button className="secondary" disabled={mutation.isPending || mutation.isSuccess}>
          Gửi báo cáo
        </button>
        <ErrorNotice error={mutation.error} />
        {mutation.isSuccess && <p role="status">Đã gửi báo cáo đến kiểm duyệt viên.</p>}
      </form>
    </details>
  );
}
export function Engagement({ article }: { article: Article }) {
  const settings = usePublicSettings();
  const s = useSession();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [body, setBody] = useState('');
  const [reply, setReply] = useState<Comment | null>(null);
  const [editing, setEditing] = useState<Comment | null>(null);
  const comments = useQuery({
    queryKey: ['comments', article.id, page],
    queryFn: () => api<Comment[]>(`/documents/${article.id}/comments?page=${page}`),
  });
  const mutate = useMutation({
    mutationFn: ({ path, method, data }: { path: string; method: string; data?: unknown }) =>
      send(path, method, data),
    onSuccess: () => qc.invalidateQueries(),
  });
  const comment = useMutation({
    mutationFn: () =>
      editing
        ? send(`/comments/${editing.id}`, 'PATCH', { body })
        : send(`/documents/${article.id}/comments`, 'POST', { body, parentId: reply?.id }),
    onSuccess: async () => {
      setBody('');
      setEditing(null);
      setReply(null);
      await qc.invalidateQueries();
    },
  });
  return (
    <section className="engagement">
      <div className="engagement-bar">
        <span>
          {article.likesCount} lượt thích · {article.averageRating?.toFixed(1) ?? '—'}/5 (
          {article.ratingsCount} đánh giá)
        </span>
        {s.data ? (
          <>
            <button
              className="secondary"
              disabled={mutate.isPending}
              onClick={() =>
                mutate.mutate({
                  path: `/documents/${article.id}/like`,
                  method: article.ownLiked ? 'DELETE' : 'PUT',
                })
              }
            >
              {article.ownLiked ? 'Bỏ thích' : 'Thích bài viết'}
            </button>
            <label>
              Đánh giá của bạn
              <select
                aria-label="Đánh giá của bạn"
                value={article.ownRating ?? ''}
                disabled={mutate.isPending}
                onChange={(e) =>
                  mutate.mutate({
                    path: `/documents/${article.id}/rating`,
                    method: e.target.value ? 'PUT' : 'DELETE',
                    data: e.target.value ? { value: Number(e.target.value) } : {},
                  })
                }
              >
                <option value="">Chưa đánh giá</option>
                {[1, 2, 3, 4, 5].map((v) => (
                  <option key={v} value={v}>
                    {v} sao
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <Link to="/login">Đăng nhập để tương tác</Link>
        )}
      </div>
      <ErrorNotice error={mutate.error} />
      {s.data && <ReportForm documentId={article.id} />}
      <h2>Thảo luận</h2>
      {settings.data?.data.commentsEnabled === false ? (
        <p className="notice">Bình luận mới đang tạm đóng.</p>
      ) : s.data ? (
        <form
          className="panel comment-form"
          onSubmit={(e) => {
            e.preventDefault();
            comment.mutate();
          }}
        >
          <label>
            {editing
              ? 'Sửa bình luận của bạn'
              : reply
                ? `Trả lời @${reply.user.username}`
                : 'Bình luận của bạn'}
            <textarea
              required
              maxLength={4000}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Chia sẻ góc nhìn của bạn. Dùng @username để nhắc thành viên."
            />
          </label>
          <button disabled={comment.isPending}>
            {editing ? 'Lưu bình luận' : 'Gửi bình luận'}
          </button>
          {(editing || reply) && (
            <button
              className="text-button"
              type="button"
              onClick={() => {
                setEditing(null);
                setReply(null);
                setBody('');
              }}
            >
              Hủy
            </button>
          )}
          <ErrorNotice error={comment.error} />
          {comment.isSuccess && <p role="status">Đã lưu bình luận.</p>}
        </form>
      ) : (
        <p>
          <Link to="/login">Đăng nhập</Link> để tham gia thảo luận.
        </p>
      )}
      <ErrorNotice error={comments.error} />
      {comments.isPending ? (
        <Loading />
      ) : (
        <>
          {comments.data?.data.map((c) => (
            <article className={`comment ${c.parentId ? 'reply' : ''}`} key={c.id}>
              <div className="byline">
                <Link to={`/users/${c.user.username}`}>
                  <strong>{c.user.displayName}</strong> @{c.user.username}
                </Link>
                <time>{new Date(c.createdAt).toLocaleString('vi-VN')}</time>
                {c.parentId && <span>↳ Trả lời</span>}
              </div>
              <p>{c.body}</p>
              {c.mentions.length > 0 && (
                <div className="tags">
                  {c.mentions.map((m) => (
                    <Link key={m.mentionedUser.username} to={`/users/${m.mentionedUser.username}`}>
                      @{m.mentionedUser.username}
                    </Link>
                  ))}
                </div>
              )}
              {s.data && (
                <div className="actions">
                  {!c.parentId && (
                    <button
                      className="text-button"
                      onClick={() => {
                        setReply(c);
                        setEditing(null);
                        setBody('');
                        document.querySelector('textarea')?.focus();
                      }}
                    >
                      Trả lời
                    </button>
                  )}
                  {s.data.id === c.userId && (
                    <>
                      <button
                        className="text-button"
                        onClick={() => {
                          setEditing(c);
                          setReply(null);
                          setBody(c.body);
                          document.querySelector('textarea')?.focus();
                        }}
                      >
                        Sửa bình luận
                      </button>
                      <button
                        className="text-button"
                        onClick={() => {
                          if (window.confirm('Xóa bình luận này?'))
                            mutate.mutate({ path: `/comments/${c.id}`, method: 'DELETE' });
                        }}
                      >
                        Xóa bình luận
                      </button>
                    </>
                  )}
                  <ReportForm commentId={c.id} />
                </div>
              )}
            </article>
          ))}
          {comments.data?.data.length === 0 && (
            <p className="muted">Chưa có bình luận. Hãy mở đầu cuộc trò chuyện.</p>
          )}
          <Pagination page={page} pages={comments.data?.meta?.totalPages ?? 0} onPage={setPage} />
        </>
      )}
    </section>
  );
}

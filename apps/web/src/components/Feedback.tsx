export function ErrorNotice({ error }: { error: unknown }) {
  return error ? (
    <p role="alert" className="notice error">
      {error instanceof Error ? error.message : 'Có lỗi xảy ra'}
    </p>
  ) : null;
}
export function Loading() {
  return (
    <p role="status" className="notice">
      Đang tải dữ liệu…
    </p>
  );
}

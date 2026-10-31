export function Pagination({
  page,
  pages,
  onPage,
  pageSize,
  onSize,
}: {
  page: number;
  pages: number;
  onPage: (p: number) => void;
  pageSize?: number;
  onSize?: (p: number) => void;
}) {
  return (
    <div className="pagination">
      <button className="secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Trang trước
      </button>
      <span>
        Trang {page} / {Math.max(1, pages)}
      </span>
      <button className="secondary" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Trang sau
      </button>
      {onSize && (
        <label>
          Số bài mỗi trang
          <select value={pageSize} onChange={(e) => onSize(Number(e.target.value))}>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </label>
      )}
    </div>
  );
}

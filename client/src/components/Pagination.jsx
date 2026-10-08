export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Pagination">
      <button className="btn ghost small" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
      <span className="muted small">Page {page} of {pages}</span>
      <button className="btn ghost small" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button>
    </nav>
  );
}

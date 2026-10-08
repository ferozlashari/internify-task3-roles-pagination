import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import JobForm from '../components/JobForm';
import JobCard from '../components/JobCard';
import Pagination from '../components/Pagination';

const LIMIT = 5;
const TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
const EMPTY_FILTERS = { search: '', type: '' };

export default function Home() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (applied.search) params.set('search', applied.search);
      if (applied.type) params.set('type', applied.type);
      const data = await api(`/jobs?${params}`);
      if (data.data.length === 0 && page > 1) {
        setPage(page - 1); // the last job on this page was removed
        return;
      }
      setJobs(data.data);
      setMeta({ total: data.total, pages: data.pages });
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, applied]);

  useEffect(() => { load(); }, [load]);

  const canModify = (job) => !!user && (user.role === 'admin' || job.createdBy?._id === user._id);

  const search = (e) => {
    e.preventDefault();
    setPage(1);
    setApplied(filters);
  };

  const clear = () => {
    setFilters(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
  };

  const save = async (body) => {
    if (editing) await api(`/jobs/${editing._id}`, { method: 'PUT', body });
    else await api('/jobs', { method: 'POST', body });
    setEditing(null);
    await load();
  };

  const remove = async (job) => {
    if (!window.confirm(`Delete "${job.title}"?`)) return;
    try {
      await api(`/jobs/${job._id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const filtering = applied.search || applied.type;

  return (
    <main className="container">
      {user ? (
        <JobForm key={editing?._id || 'new'} initial={editing} onSubmit={save} onCancel={editing ? () => setEditing(null) : null} />
      ) : (
        <div className="alert success">
          <Link to="/login">Log in</Link> or <Link to="/signup">create an account</Link> to post jobs.
        </div>
      )}

      <h2>Open positions</h2>
      <form className="toolbar" onSubmit={search}>
        <div>
          <label htmlFor="search">Search by title, company or description</label>
          <input id="search" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="For example: React developer" />
        </div>
        <div>
          <label htmlFor="filter-type">Job type</label>
          <select id="filter-type" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="">All types</option>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="row">
          <button className="btn">Search</button>
          {filtering && <button type="button" className="btn ghost" onClick={clear}>Clear</button>}
        </div>
      </form>

      {error && <div className="alert error" role="alert">{error}</div>}
      {loading ? <p className="muted">Loading jobs...</p> : jobs.length === 0 ? (
        <div className="empty">{filtering ? 'No jobs match your search. Try different words or clear the filters.' : 'No jobs yet. Log in and post the first one.'}</div>
      ) : (
        <>
          <p className="muted small">{meta.total} job{meta.total === 1 ? '' : 's'} found</p>
          <div className="job-list">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} canModify={canModify(job)} onEdit={setEditing} onDelete={remove} />
            ))}
          </div>
          <Pagination page={page} pages={meta.pages} onChange={setPage} />
        </>
      )}
    </main>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';

export default function Admin() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await api(`/users?page=${page}&limit=8`);
      if (data.data.length === 0 && page > 1) {
        setPage(page - 1);
        return;
      }
      setUsers(data.data);
      setPages(data.pages);
    } catch (err) {
      setError(err.message);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const changeRole = async (target, role) => {
    setError('');
    setMessage('');
    try {
      await api(`/users/${target._id}/role`, { method: 'PATCH', body: { role } });
      setMessage(`${target.name} is now ${role === 'admin' ? 'an admin' : 'a regular user'}.`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (target) => {
    if (!window.confirm(`Delete ${target.name} and all of their jobs?`)) return;
    setError('');
    setMessage('');
    try {
      await api(`/users/${target._id}`, { method: 'DELETE' });
      setMessage(`${target.name} was deleted.`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="container">
      <h2>Manage users</h2>
      {error && <div className="alert error" role="alert">{error}</div>}
      {message && <div className="alert success">{message}</div>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}{u._id === me._id && <span className="muted small"> (you)</span>}</td>
                <td>{u.email}</td>
                <td>
                  <select aria-label={`Role for ${u.name}`} value={u.role} disabled={u._id === me._id} onChange={(e) => changeRole(u, e.target.value)}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td><button className="btn danger small" disabled={u._id === me._id} onClick={() => remove(u)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pages={pages} onChange={setPage} />
    </main>
  );
}

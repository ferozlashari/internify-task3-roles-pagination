import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  return (
    <main className="container">
      <div className="panel">
        <h2>Your profile</h2>
        <dl className="profile">
          <dt>Name</dt><dd>{user.name}</dd>
          <dt>Email</dt><dd>{user.email}</dd>
          <dt>Role</dt><dd><span className={`badge ${user.role === 'admin' ? 'admin' : ''}`}>{user.role === 'admin' ? 'Admin' : 'User'}</span></dd>
          <dt>Member since</dt><dd>{new Date(user.createdAt).toLocaleDateString()}</dd>
        </dl>
      </div>
    </main>
  );
}

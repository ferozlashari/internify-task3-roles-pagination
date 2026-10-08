import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand">Job Board</Link>
        <NavLink to="/" end>Jobs</NavLink>
        {user ? (
          <>
            {user.role === 'admin' && <NavLink to="/admin">Manage users</NavLink>}
            <NavLink to="/profile">Profile</NavLink>
            <span className="who">{user.name}</span>
            {user.role === 'admin' && <span className="badge admin">Admin</span>}
            <button className="btn ghost small" style={{ color: '#fff', borderColor: '#cfd8e6' }} onClick={signOut}>Log out</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log in</NavLink>
            <NavLink to="/signup">Sign up</NavLink>
          </>
        )}
      </div>
    </header>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-logo" onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}>
          Visit Tracker
        </h1>
        <div className="navbar-right">
          <span className="navbar-user">
            {user?.name} {isAdmin && <span className="badge">Admin</span>}
          </span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

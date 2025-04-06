import React from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const NavBar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="teal">
      <div className="nav-wrapper container">
        <a href="#" className="brand-logo">Tennis & Padel Uruguay</a>
        {user && (
          <ul id="nav-mobile" className="right">
            <li><span>Bienvenido, {user.username}</span></li>
            <li>
              <button
                className="btn-flat white-text waves-effect"
                onClick={logout}
              >
                Cerrar sesión
              </button>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
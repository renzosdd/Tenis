import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { addNotification } = useNotification();

  const handleLogin = () => {
    if (login(username, password)) {
      addNotification('Inicio de sesión exitoso', 'success');
      setUsername('');
      setPassword('');
      const modal = M.Modal.getInstance(document.getElementById('login-modal'));
      modal.close();
    } else {
      addNotification('Credenciales incorrectas', 'error');
    }
  };

  return (
    <div className="row">
      <div className="input-field col s12">
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label htmlFor="username">Usuario</label>
      </div>
      <div className="input-field col s12">
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label htmlFor="password">Contraseña</label>
      </div>
      <div className="col s12">
        <button
          className="btn teal waves-effect waves-light"
          onClick={handleLogin}
        >
          Iniciar sesión
        </button>
        <p className="grey-text" style={{ marginTop: '10px' }}>
          Usa <strong>admin</strong> como usuario y contraseña para probar.
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
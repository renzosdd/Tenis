import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext.jsx';

const PlayerForm = ({ onRegisterPlayer, players }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const { addNotification } = useNotification();

  const handleRegister = () => {
    if (!firstName || !lastName || !email) {
      addNotification('Por favor, completa todos los campos', 'error');
      return;
    }

    if (players.some(p => p.email === email)) {
      addNotification('Este correo ya está registrado', 'error');
      return;
    }

    onRegisterPlayer({ firstName, lastName, email });
    setFirstName('');
    setLastName('');
    setEmail('');
  };

  return (
    <div className="row">
      <div className="col s12">
        <div className="card">
          <div className="card-content">
            <span className="card-title">Registrar Jugador</span>
            <div className="row">
              <div className="input-field col s12 m4">
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <label htmlFor="firstName">Nombre</label>
              </div>
              <div className="input-field col s12 m4">
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                <label htmlFor="lastName">Apellido</label>
              </div>
              <div className="input-field col s12 m4">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label htmlFor="email">Email</label>
              </div>
            </div>
            <button
              className="btn teal waves-effect waves-light"
              onClick={handleRegister}
            >
              Registrar Jugador
            </button>
          </div>
        </div>
      </div>
      <div className="col s12">
        <h5 style={{ color: '#00695c' }}>Jugadores Registrados</h5>
        {players.length > 0 ? (
          <table className="striped">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={index}>
                  <td>{player.firstName}</td>
                  <td>{player.lastName}</td>
                  <td>{player.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="grey-text">No hay jugadores registrados.</p>
        )}
      </div>
    </div>
  );
};

export default PlayerForm;
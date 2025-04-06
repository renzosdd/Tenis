import React, { useState, useEffect } from 'react';
import M from 'materialize-css';
import GroupCard from './GroupCard.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';

const TournamentForm = ({ players, onCreateTournament }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [groupSize, setGroupSize] = useState('');
  const [pairs, setPairs] = useState([]);
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const { addNotification } = useNotification();

  useEffect(() => {
    M.FormSelect.init(document.querySelectorAll('select'));
  }, []);

  const handleCreatePair = () => {
    if (!player1 || !player2) {
      addNotification('Selecciona dos jugadores para crear una pareja', 'error');
      return;
    }
    if (player1 === player2) {
      addNotification('Los jugadores de una pareja deben ser diferentes', 'error');
      return;
    }
    const pairName = `${players.find(p => p.email === player1)?.firstName} ${players.find(p => p.email === player1)?.lastName} / ${players.find(p => p.email === player2)?.firstName} ${players.find(p => p.email === player2)?.lastName}`;
    if (!pairName || pairName.includes('undefined')) {
      addNotification('Error al crear la pareja. Asegúrate de que los jugadores seleccionados existan.', 'error');
      return;
    }
    if (pairs.includes(pairName)) {
      addNotification('Esta pareja ya existe', 'error');
      return;
    }
    setPairs([...pairs, pairName]);
    setPlayer1('');
    setPlayer2('');
    M.FormSelect.init(document.querySelectorAll('select'));
  };

  const handleRemovePair = (pair) => {
    setPairs(pairs.filter(p => p !== pair));
  };

  const generateGroups = () => {
    if (pairs.length < 3) {
      return [];
    }

    if (!groupSize || !groupSize.startsWith('Grupos de ')) {
      return [];
    }

    const parts = groupSize.split(' ');
    if (parts.length !== 3) {
      return [];
    }

    const size = parseInt(parts[2]); // El número está en el índice 2 ("3" en "Grupos de 3")
    if (isNaN(size)) {
      return [];
    }

    const totalPairs = pairs.length;
    const possibleFullGroups = Math.floor(totalPairs / size);
    const remainingPairs = totalPairs % size;

    if (possibleFullGroups === 0 && remainingPairs < 2) {
      return [];
    }

    const shuffledPairs = [...pairs].sort(() => Math.random() - 0.5);
    const groups = [];
    for (let i = 0; i < shuffledPairs.length; i += size) {
      const groupPairs = shuffledPairs.slice(i, i + size);
      if (groupPairs.length === size || (i + size >= shuffledPairs.length && groupPairs.length >= 2)) {
        const matches = [];
        for (let j = 0; j < groupPairs.length; j++) {
          for (let k = j + 1; k < groupPairs.length; k++) {
            matches.push({
              pair1: groupPairs[j],
              pair2: groupPairs[k],
              date: null,
              result: null
            });
          }
        }
        groups.push({
          name: `Grupo ${groups.length + 1}`,
          pairs: groupPairs,
          matches,
          winners: null
        });
      }
    }

    return groups;
  };

  const handleCreateTournament = () => {
    if (!name || !category || !groupSize) {
      addNotification('Completa todos los campos (nombre, categoría y tamaño de grupo)', 'error');
      return;
    }

    if (pairs.length < 3) {
      addNotification('Se necesitan al menos 3 parejas para crear un torneo', 'error');
      return;
    }

    if (!groupSize.startsWith('Grupos de ')) {
      addNotification('Por favor, selecciona un tamaño de grupo válido (por ejemplo, "Grupos de 3")', 'error');
      return;
    }

    const parts = groupSize.split(' ');
    if (parts.length !== 3) {
      addNotification('El formato del tamaño del grupo no es válido. Debe ser como "Grupos de 3"', 'error');
      return;
    }

    const size = parseInt(parts[2]); // El número está en el índice 2
    if (isNaN(size)) {
      addNotification('El tamaño del grupo no es válido. Debe ser un número (por ejemplo, "Grupos de 3")', 'error');
      return;
    }

    const totalPairs = pairs.length;
    const possibleFullGroups = Math.floor(totalPairs / size);
    const remainingPairs = totalPairs % size;

    if (possibleFullGroups === 0 && remainingPairs < 2) {
      addNotification(
        `No hay suficientes parejas para formar grupos de ${size}. Tienes ${totalPairs} parejas, necesitas al menos ${size} para un grupo completo, o al menos 2 para un grupo parcial.`,
        'error'
      );
      return;
    }

    const groups = generateGroups();
    if (groups.length === 0) {
      addNotification(
        `No se pudieron generar grupos. Tienes ${totalPairs} parejas, pero no se pueden formar grupos válidos con el tamaño seleccionado (${size}).`,
        'error'
      );
      return;
    }

    onCreateTournament({
      name,
      category,
      groupSize,
      groups,
      pairs,
      knockout: [],
      completed: false
    });

    addNotification(`Torneo ${name} creado con ${groups.length} grupo(s)`, 'success');
    setName('');
    setCategory('');
    setGroupSize('');
    setPairs([]);
    setPlayer1('');
    setPlayer2('');
    M.FormSelect.init(document.querySelectorAll('select'));
  };

  return (
    <div className="row">
      <div className="col s12">
        <div className="card">
          <div className="card-content">
            <span className="card-title">Crear Torneo</span>
            <div className="row">
              <div className="input-field col s12 m6">
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <label htmlFor="name">Nombre del Torneo</label>
              </div>
              <div className="input-field col s12 m6">
                <input
                  id="category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <label htmlFor="category">Categoría</label>
              </div>
              <div className="input-field col s12 m6">
                <select
                  value={groupSize}
                  onChange={(e) => {
                    console.log('groupSize seleccionado:', e.target.value);
                    setGroupSize(e.target.value);
                  }}
                >
                  <option value="" disabled>Selecciona un tamaño</option>
                  <option value="Grupos de 3">Grupos de 3 Parejas</option>
                  <option value="Grupos de 4">Grupos de 4 Parejas</option>
                  <option value="Grupos de 5">Grupos de 5 Parejas</option>
                </select>
                <label>Tamaño de los Grupos</label>
              </div>
            </div>
            <div className="row">
              <div className="col s12">
                <h5 style={{ color: '#00695c' }}>Crear Parejas</h5>
                <div className="row">
                  <div className="input-field col s12 m5">
                    <select
                      value={player1}
                      onChange={(e) => setPlayer1(e.target.value)}
                    >
                      <option value="" disabled>Selecciona un jugador</option>
                      {players.map((player, index) => (
                        <option key={index} value={player.email}>
                          {player.firstName} {player.lastName}
                        </option>
                      ))}
                    </select>
                    <label>Jugador 1</label>
                  </div>
                  <div className="input-field col s12 m5">
                    <select
                      value={player2}
                      onChange={(e) => setPlayer2(e.target.value)}
                    >
                      <option value="" disabled>Selecciona un jugador</option>
                      {players.map((player, index) => (
                        <option key={index} value={player.email}>
                          {player.firstName} {player.lastName}
                        </option>
                      ))}
                    </select>
                    <label>Jugador 2</label>
                  </div>
                  <div className="col s12 m2">
                    <button
                      className="btn teal waves-effect waves-light"
                      onClick={handleCreatePair}
                      style={{ marginTop: '20px' }}
                    >
                      Crear Pareja
                    </button>
                  </div>
                </div>
                {pairs.length > 0 && (
                  <div className="collection">
                    {pairs.map((pair, index) => (
                      <div key={index} className="collection-item">
                        {pair}
                        <button
                          className="btn-flat right"
                          onClick={() => handleRemovePair(pair)}
                        >
                          <i className="material-icons red-text">delete</i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {pairs.length >= 3 && groupSize && groupSize.startsWith('Grupos de ') && (
              <div className="row">
                <div className="col s12">
                  <h5 style={{ color: '#00695c' }}>Vista Previa de los Grupos</h5>
                  {(() => {
                    const groups = generateGroups();
                    console.log('Generated groups:', groups);
                    return groups.length > 0 ? (
                      groups.map((group, index) => (
                        <GroupCard key={index} group={group} />
                      ))
                    ) : (
                      <p className="grey-text">No se pueden generar grupos con la configuración actual.</p>
                    );
                  })()}
                </div>
              </div>
            )}
            <button
              className="btn teal waves-effect waves-light"
              onClick={handleCreateTournament}
            >
              Crear Torneo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentForm;
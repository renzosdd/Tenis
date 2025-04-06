import React, { useState, useEffect } from 'react';
import GroupCard from './GroupCard.jsx';
import KnockoutSlider from './KnockoutSlider.jsx';
import MatchModal from './MatchModal.jsx';
import M from 'materialize-css';
import { useAuth } from '../contexts/AuthContext.jsx';

const TournamentDetails = ({ tournament, onUpdateResult, onDelete, onFinalize, editable, onClose }) => {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const modalInstances = M.Modal.init(document.querySelectorAll('.modal'), { dismissible: true });
    M.Datepicker.init(document.querySelectorAll('.datepicker'), { format: 'yyyy-mm-dd', autoClose: true });
    M.Timepicker.init(document.querySelectorAll('.timepicker'), { twelveHour: false, autoClose: true });
    return () => modalInstances.forEach(instance => instance.destroy());
  }, []);

  const handleDelete = () => {
    const deleteModal = M.Modal.getInstance(document.getElementById('delete-modal'));
    if (deleteModal) deleteModal.open();
  };

  const confirmDelete = () => {
    const password = document.getElementById('delete-password').value;
    if (password === user?.password) {
      if (window.confirm(`¿Eliminar el torneo ${tournament.name}? Esto no se puede deshacer.`)) {
        onDelete(tournament.name);
        M.Modal.getInstance(document.getElementById('delete-modal')).close();
        onClose();
      }
    } else {
      M.toast({ html: 'Contraseña incorrecta', classes: 'red' });
    }
  };

  const handleFinalize = () => {
    if (window.confirm(`¿Finalizar el torneo ${tournament.name}? Esto marcará al campeón.`)) {
      onFinalize(tournament.name);
    }
  };

  const scheduleGroup = (group) => {
    const scheduleModal = M.Modal.getInstance(document.getElementById(`group-schedule-modal-${group.name}`));
    if (scheduleModal) scheduleModal.open();
  };

  const handleGroupSchedule = (groupName) => {
    const date = document.getElementById(`group-date-${groupName}`).value;
    const time = document.getElementById(`group-time-${groupName}`).value;
    if (!date || !time) {
      M.toast({ html: 'Selecciona fecha y hora', classes: 'red' });
      return;
    }
    const fullDate = `${date} ${time}`;
    const updatedGroups = tournament.groups.map(g => {
      if (g.name === groupName) {
        return {
          ...g,
          matches: g.matches.map(m => ({ ...m, date: fullDate, result: m.result || { date: fullDate } }))
        };
      }
      return g;
    });
    onUpdateResult(null, { groups: updatedGroups }, tournament);
    M.Modal.getInstance(document.getElementById(`group-schedule-modal-${groupName}`)).close();
    M.toast({ html: `Grupo ${groupName} programado`, classes: 'green' });
  };

  const isTournamentComplete = tournament.knockout.length > 0 && 
    tournament.knockout[0].matches.length === 1 && 
    tournament.knockout[0].matches[0].result?.winner;

  const pendingMatches = tournament.groups.reduce((acc, g) => acc + g.matches.filter(m => !m.result).length, 0) +
                        tournament.knockout.reduce((acc, p) => acc + p.matches.filter(m => !m.result).length, 0);

  return (
    <div className="modal" id={`tournament-details-modal-${tournament.name}`}>
      <div className="modal-content">
        <h4 style={{ color: '#00695c' }}>{tournament.name}</h4>
        <p><strong>Tipo:</strong> Dobles - Grupos de {tournament.groupSize}</p>
        {tournament.groups.length > 0 && (
          <div className="section">
            <h5 style={{ color: '#00695c' }}>Fase de grupos</h5>
            {tournament.groups.map((group) => (
              <div key={group.name}>
                <h6 style={{ color: '#00695c', fontWeight: 'bold' }}>{group.name}</h6>
                <GroupCard
                  group={group}
                  tournament={tournament}
                  onUpdateResult={onUpdateResult}
                  editable={editable}
                  onMatchClick={setSelectedMatch}
                />
                {editable && (
                  <div className="right-align">
                    <a
                      href="#"
                      className="btn-flat waves-effect"
                      onClick={(e) => { e.preventDefault(); scheduleGroup(group); }}
                    >
                      <i className="material-icons teal-text">Programar</i>
                    </a>
                  </div>
                )}
                {group.winners && (
                  <p className="green-text">Clasificados: {group.winners.join(', ')}</p>
                )}
                {editable && (
                  <div id={`group-schedule-modal-${group.name}`} className="modal">
                    <div className="modal-content">
                      <h5 style={{ color: '#00695c' }}>Programar {group.name}</h5>
                      <div className="row">
                        <div className="input-field col s12 m6">
                          <input
                            type="text"
                            className="datepicker"
                            id={`group-date-${group.name}`}
                          />
                          <label htmlFor={`group-date-${group.name}`}>Fecha</label>
                        </div>
                        <div className="input-field col s12 m6">
                          <input
                            type="text"
                            className="timepicker"
                            id={`group-time-${group.name}`}
                          />
                          <label htmlFor={`group-time-${group.name}`}>Hora</label>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        className="modal-close btn-flat waves-effect"
                        onClick={() => M.Modal.getInstance(document.getElementById(`group-schedule-modal-${group.name}`)).close()}
                      >
                        Cancelar
                      </button>
                      <button
                        className="btn teal waves-effect waves-light"
                        onClick={() => handleGroupSchedule(group.name)}
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {tournament.knockout.length > 0 && (
          <div className="section">
            <h5 style={{ color: '#00695c' }}>Fase eliminatoria</h5>
            <KnockoutSlider
              phases={tournament.knockout}
              tournament={tournament}
              onUpdateResult={onUpdateResult}
              editable={editable}
              onMatchClick={setSelectedMatch}
            />
            {tournament.completed && (
              <p className="green-text" style={{ fontWeight: 'bold' }}>
                Campeón: {tournament.knockout[0].matches[0].result.winner === 1 
                  ? tournament.knockout[0].matches[0].pair1 
                  : tournament.knockout[0].matches[0].pair2}
              </p>
            )}
          </div>
        )}
        {editable && (
          <div className="card-action">
            <a
              href="#"
              className="btn-flat waves-effect"
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
            >
              <i className="material-icons red-text">Borrar torneo</i> 
            </a>
            {isTournamentComplete && !tournament.completed && (
              <a
                href="#"
                className="btn-flat waves-effect"
                onClick={(e) => { e.preventDefault(); handleFinalize(); }}
              >
                <i className="material-icons purple-text">check_circle</i>
              </a>
            )}
          </div>
        )}
      </div>
      <div className="modal-footer">
        <button className="modal-close btn-flat waves-effect" onClick={onClose}>Cerrar</button>
      </div>
      {selectedMatch && editable && (
        <MatchModal
          match={selectedMatch}
          tournament={tournament}
          onUpdateResult={onUpdateResult}
          onClose={() => setSelectedMatch(null)}
        />
      )}
      {editable && (
        <div id="delete-modal" className="modal">
          <div className="modal-content">
            <h5 style={{ color: '#00695c' }}>Confirmar eliminación</h5>
            <p>Ingresa tu contraseña para eliminar el torneo {tournament.name}:</p>
            <div className="input-field">
              <input id="delete-password" type="password" />
              <label htmlFor="delete-password">Contraseña</label>
            </div>
          </div>
          <div className="modal-footer">
            <button className="modal-close btn-flat waves-effect">Cancelar</button>
            <button className="btn teal waves-effect waves-light" onClick={confirmDelete}>Eliminar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentDetails;
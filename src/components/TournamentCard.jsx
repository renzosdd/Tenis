import React from 'react';
import GroupCard from './GroupCard.jsx';
import KnockoutSlider from './KnockoutSlider.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';

const TournamentCard = ({ tournament, onUpdateResult, onDelete, onFinalize, editable = true }) => {
  const { addNotification } = useNotification();

  const handleDelete = () => {
    if (window.confirm(`¿Eliminar el torneo ${tournament.name}? Esto no se puede deshacer.`)) {
      onDelete(tournament.name);
    }
  };

  const handleFinalize = () => {
    if (window.confirm(`¿Finalizar el torneo ${tournament.name}? Esto marcará al campeón.`)) {
      onFinalize(tournament.name);
    }
  };

  const isTournamentComplete = tournament.knockout.length > 0 && 
    tournament.knockout[0].matches.length === 1 && 
    tournament.knockout[0].matches[0].result?.winner;

  return (
    <div className="card" style={{ borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
      <div className="card-content">
        <div className="row">
          <div className="col s10">
            <span className="card-title" style={{ color: '#00695c', fontWeight: 'bold' }}>
              {tournament.name} {tournament.completed && <span className="green-text">(Finalizado)</span>}
            </span>
          </div>
          {editable && (
            <div className="col s2 right-align">
              <button
                onClick={handleDelete}
                className="btn-small red waves-effect waves-light"
                style={{ borderRadius: '5px' }}
              >
                <i className="material-icons">delete</i>
              </button>
            </div>
          )}
        </div>
        <p><strong>Tipo:</strong> Dobles - Grupos de {tournament.groupSize}</p>
        <p><strong>Categoría:</strong> {tournament.category}</p>
        <p><strong>Parejas:</strong> {tournament.pairs.join(', ')}</p>

        {tournament.groups.length > 0 && (
          <div className="section">
            <h5 style={{ color: '#00695c' }}>Fase de Grupos</h5>
            {tournament.groups.map((group, idx) => (
              <div key={idx}>
                <GroupCard
                  group={group}
                  tournament={tournament}
                  onUpdateResult={onUpdateResult}
                  editable={editable}
                />
                {group.winners && (
                  <p className="green-text">Clasificados: {group.winners.join(', ')}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {tournament.knockout.length > 0 && (
          <div className="section">
            <h5 style={{ color: '#00695c' }}>Fase Eliminatoria</h5>
            <KnockoutSlider
              phases={tournament.knockout}
              tournament={tournament}
              onUpdateResult={onUpdateResult}
              editable={editable}
            />
            {editable && isTournamentComplete && !tournament.completed && (
              <button
                onClick={handleFinalize}
                className="btn teal waves-effect waves-light"
                style={{ marginTop: '10px', borderRadius: '5px' }}
              >
                Finalizar Torneo
              </button>
            )}
            {tournament.completed && (
              <p className="green-text" style={{ fontWeight: 'bold' }}>
                Campeón: {tournament.knockout[0].matches[0].result.winner === 1 
                  ? tournament.knockout[0].matches[0].pair1 
                  : tournament.knockout[0].matches[0].pair2}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentCard;
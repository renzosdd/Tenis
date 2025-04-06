import React from 'react';
import { useNotification } from '../contexts/NotificationContext.jsx';

const ProfileCard = ({ player, onDelete, editable = true }) => {
  const { addNotification } = useNotification();

  const handleDelete = () => {
    if (window.confirm(`¿Eliminar a ${player.name}? Esto también eliminará sus datos de todos los torneos.`)) {
      onDelete(player.name);
      addNotification(`Jugador ${player.name} eliminado`, 'success');
    }
  };

  const winPercentage = player.wins + player.losses > 0 
    ? ((player.wins / (player.wins + player.losses)) * 100).toFixed(1) 
    : 0;
  const avgGamesPerMatch = player.matches.length > 0 
    ? (player.gamesWon / player.matches.length).toFixed(1) 
    : 0;

  return (
    <div className="card">
      <div className="card-content">
        <span className="card-title">{player.name}</span>
        <p><strong>Nivel:</strong> {player.level}</p>
        <p><strong>Partidos Ganados:</strong> {player.wins}</p>
        <p><strong>Games Ganados:</strong> {player.gamesWon}</p>
        <p><strong>Games Perdidos:</strong> {player.gamesLost}</p>
        <p><strong>Derrotas:</strong> {player.losses}</p>
        <p><strong>Porcentaje de Victorias:</strong> {winPercentage}%</p>
        <p><strong>Games Promedio por Partido:</strong> {avgGamesPerMatch}</p>
        {player.matches.length > 0 && (
          <div className="section">
            <h5>Historial de Partidos</h5>
            <ul className="collection">
              {player.matches.map((match, idx) => (
                <li key={idx} className="collection-item">
                  vs {match.player2 || 'Bye'} - 
                  {match.result?.winner ? 
                    (match.result.winner === 1 && match.player1 === player.name) || 
                    (match.result.winner === 2 && match.player2 === player.name) ? 
                    ' Ganó' : ' Perdió' : 
                    ' Pendiente'} 
                  {match.result?.set1 && ` (${match.result.set1.p1}-${match.result.set1.p2}${match.result.set2 ? `, ${match.result.set2.p1}-${match.result.set2.p2}` : ''}${match.result.tiebreak ? `, TB ${match.result.tiebreak}` : ''})`}
                  {' - ' + new Date(match.date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {editable && (
        <div className="card-action">
          <button
            onClick={handleDelete}
            className="btn red waves-effect waves-light"
          >
            Eliminar Jugador
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
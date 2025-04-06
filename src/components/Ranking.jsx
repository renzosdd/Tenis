import React from 'react';

const Ranking = ({ players }) => {
  const rankedPlayers = [...players].sort((a, b) => {
    const diffA = (a.gamesWon || 0) - (a.gamesLost || 0);
    const diffB = (b.gamesWon || 0) - (b.gamesLost || 0);
    return (b.wins || 0) - (a.wins || 0) || diffB - diffA;
  });

  return (
    <div className="card">
      <div className="card-content">
        <span className="card-title">Ranking Global</span>
        {rankedPlayers.length > 0 ? (
          <table className="highlight responsive-table">
            <thead>
              <tr>
                <th>Posición</th>
                <th>Jugador</th>
                <th>Victorias</th>
                <th>Diferencia de Games</th>
                <th>Games Ganados</th>
              </tr>
            </thead>
            <tbody>
              {rankedPlayers.map((player, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{player.name}</td>
                  <td>{player.wins || 0}</td>
                  <td>{(player.gamesWon || 0) - (player.gamesLost || 0)}</td>
                  <td>{player.gamesWon || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="grey-text">No hay jugadores registrados aún.</p>
        )}
      </div>
    </div>
  );
};

export default Ranking;
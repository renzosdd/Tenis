import React from 'react';

const TournamentHistory = ({ tournaments }) => {
  const completedTournaments = tournaments.filter(t => t.completed);

  return (
    <div className="row">
      <div className="col s12">
        <h5 style={{ color: '#00695c' }}>Historial de Torneos</h5>
        {completedTournaments.length > 0 ? (
          <ul className="collapsible">
            {completedTournaments.map((tournament) => {
              const finalMatch = tournament.knockout[0]?.matches[0];
              const champion = finalMatch?.result?.winner === 1 ? finalMatch.pair1 : finalMatch?.result?.winner === 2 ? finalMatch.pair2 : null;
              return (
                <li key={tournament.name}>
                  <div className="collapsible-header" style={{ backgroundColor: '#ef5350', padding: '10px' }}>
                    <i className="material-icons">expand_more</i>
                    <span style={{ fontWeight: 'bold' }}>{tournament.name}</span>
                    {champion && (
                      <span className="new badge right" data-badge-caption="Campeón">
                        {champion}
                      </span>
                    )}
                  </div>
                  <div className="collapsible-body">
                    <div className="row">
                      <div className="col s12">
                        <p><strong>Categoría:</strong> {tournament.category}</p>
                        <p><strong>Fecha de inicio:</strong> {tournament.startDate || 'No especificada'}</p>
                      </div>
                      <div className="col s12">
                        <h6 style={{ color: '#00695c', marginTop: '20px' }}>Grupos</h6>
                        {tournament.groups.map((group, groupIdx) => (
                          <div key={group.name} style={{ marginBottom: '20px', border: '1px solid #e0e0e0', padding: '10px', borderRadius: '5px' }}>
                            <h6 style={{ color: '#00695c' }}>{group.name}</h6>
                            {group.matches.map((match, matchIdx) => (
                              <div key={`${group.name}-match-${matchIdx}`} style={{ marginLeft: '20px', marginBottom: '10px' }}>
                                <p>
                                  <strong>{match.pair1}</strong> vs <strong>{match.pair2 || 'Bye'}</strong> -{' '}
                                  {match.result && match.result.set1 && match.result.set2 ? (
                                    `Resultado: ${match.result.set1.p1 || 0}-${match.result.set1.p2 || 0}, ${match.result.set2.p1 || 0}-${match.result.set2.p2 || 0}` +
                                    (match.result.tiebreak ? `, Tiebreak: ${match.result.tiebreak.p1 || 0}-${match.result.tiebreak.p2 || 0}` : '')
                                  ) : 'Sin resultado'}
                                  {match.date && ` | Programado para: ${match.date}`}
                                </p>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                      {tournament.knockout.length > 0 && (
                        <div className="col s12">
                          <h6 style={{ color: '#00695c', marginTop: '20px' }}>Fase Eliminatoria</h6>
                          {tournament.knockout.map((phase, phaseIdx) => (
                            <div key={phaseIdx} style={{ marginBottom: '20px', border: '1px solid #e0e0e0', padding: '10px', borderRadius: '5px' }}>
                              <h6 style={{ color: '#00695c' }}>Ronda {tournament.knockout.length - phaseIdx}</h6>
                              {phase.matches.map((match, matchIdx) => (
                                <div key={matchIdx} style={{ marginLeft: '20px', marginBottom: '10px' }}>
                                  <p>
                                    <strong>{match.pair1}</strong> vs <strong>{match.pair2 || 'Bye'}</strong> -{' '}
                                    {match.result && match.result.set1 && match.result.set2 ? (
                                      `Resultado: ${match.result.set1.p1 || 0}-${match.result.set1.p2 || 0}, ${match.result.set2.p1 || 0}-${match.result.set2.p2 || 0}` +
                                      (match.result.tiebreak ? `, Tiebreak: ${match.result.tiebreak.p1 || 0}-${match.result.tiebreak.p2 || 0}` : '')
                                    ) : 'Sin resultado'}
                                    {match.date && ` | Programado para: ${match.date}`}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="card">
            <div className="card-content">
              <p className="grey-text">No hay torneos completados en el historial.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentHistory;
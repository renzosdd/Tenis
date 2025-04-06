import React, { useState, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import NavBar from './components/NavBar.jsx';
import PlayerForm from './components/PlayerForm.jsx';
import TournamentForm from './components/TournamentForm.jsx';
import TournamentHistory from './components/TournamentHistory.jsx';
import LoginForm from './components/LoginForm.jsx';
import { useAuth } from './contexts/AuthContext.jsx';
import { useNotification } from './contexts/NotificationContext.jsx';
import M from 'materialize-css';

const App = () => {
  const [players, setPlayers] = useState(() => JSON.parse(localStorage.getItem('players')) || []);
  const [tournaments, setTournaments] = useState(() => JSON.parse(localStorage.getItem('tournaments')) || []);
  const [view, setView] = useState('activos');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(null);
  const [selectedPhaseIdx, setSelectedPhaseIdx] = useState(null);

  useEffect(() => {
    localStorage.setItem('players', JSON.stringify(players));
    localStorage.setItem('tournaments', JSON.stringify(tournaments));
    M.Collapsible.init(document.querySelectorAll('.collapsible'), { accordion: true });
    M.Modal.init(document.querySelectorAll('.modal'));
    M.updateTextFields();
  }, [tournaments, players]);

  const registerPlayer = (player) => {
    setPlayers(prev => [...prev, { ...player, matches: [] }]);
    addNotification(`Jugador ${player.firstName} ${player.lastName} registrado`, 'success');
  };

  const createTournament = (tournament) => {
    setTournaments(prev => [...prev, { ...tournament, completed: false, startDate: new Date().toISOString().split('T')[0] }]);
    addNotification(`Torneo ${tournament.name} creado exitosamente`, 'success');
  };

  const updateResult = (match, result, tournament, groupIdx, phaseIdx) => {
    const updatedTournaments = tournaments.map(t => {
      if (t.name === tournament.name && !t.completed) {
        if (groupIdx !== null) {
          t.groups = t.groups.map((g, idx) => {
            if (idx === groupIdx) {
              return {
                ...g,
                matches: g.matches.map(m => (m.pair1 === match.pair1 && m.pair2 === match.pair2) ? { ...m, ...result } : m)
              };
            }
            return g;
          });
          t.groups = t.groups.map(g => {
            const allMatchesCompleted = g.matches.every(m => m.result?.winner);
            if (allMatchesCompleted && !g.winners) {
              const pairStats = g.pairs.map(pair => {
                const wins = g.matches.filter(m => 
                  (m.pair1 === pair && m.result.winner === 1) || 
                  (m.pair2 === pair && m.result.winner === 2)
                ).length;
                return { name: pair, wins };
              });
              const winners = pairStats.sort((a, b) => b.wins - a.wins).slice(0, 2).map(p => p.name);
              return { ...g, winners };
            }
            return g;
          });
          if (t.groups.every(g => g.winners) && t.knockout.length === 0) {
            const allWinners = t.groups.flatMap(g => g.winners);
            t.knockout = generateKnockout(allWinners);
            addNotification(`Fase eliminatoria generada para ${t.name}`, 'success');
          }
        } else if (phaseIdx !== null) {
          t.knockout = t.knockout.map((p, idx) => {
            if (idx === phaseIdx) {
              const updatedMatches = p.matches.map(m => (m.pair1 === match.pair1 && m.pair2 === match.pair2) ? { ...m, ...result } : m);
              if (updatedMatches.every(m => m.result?.winner) && idx > 0) {
                const nextPhase = t.knockout[idx - 1];
                const winners = updatedMatches.map(m => m.result.winner === 1 ? m.pair1 : m.pair2);
                nextPhase.matches = winners.map((w, i) => ({
                  pair1: w,
                  pair2: i % 2 === 0 && winners[i + 1] ? winners[i + 1] : null,
                  date: null,
                  result: null
                })).filter(m => m.pair1);
              }
              return { ...p, matches: updatedMatches };
            }
            return p;
          });
        }
      }
      return t;
    });
    setTournaments(updatedTournaments);
  };

  const generateKnockout = (pairsList) => {
    const shuffled = [...pairsList].sort(() => Math.random() - 0.5);
    const phases = [];
    let currentPairs = shuffled;
    while (currentPairs.length > 1) {
      const matches = [];
      for (let i = 0; i < currentPairs.length; i += 2) {
        matches.push({
          pair1: currentPairs[i],
          pair2: currentPairs[i + 1] || null,
          date: null,
          result: null
        });
      }
      phases.unshift({ matches });
      currentPairs = Array(Math.ceil(currentPairs.length / 2)).fill(null);
    }
    return phases;
  };

  const finalizeTournament = (tournamentName) => {
    setTournaments(prev => prev.map(t => 
      t.name === tournamentName ? { ...t, completed: true } : t
    ));
    const tournament = tournaments.find(t => t.name === tournamentName);
    const finalMatch = tournament.knockout[0].matches[0];
    const champion = finalMatch.result.winner === 1 ? finalMatch.pair1 : finalMatch.pair2;
    addNotification(`${champion} es el campeón de ${tournamentName}!`, 'success');
  };

  const scheduleGroupMatches = (tournament, groupIdx, dateTime) => {
    const updatedTournaments = tournaments.map(t => {
      if (t.name === tournament.name && !t.completed) {
        t.groups = t.groups.map((g, idx) => {
          if (idx === groupIdx) {
            return {
              ...g,
              scheduledDate: dateTime,
              matches: g.matches.map(m => ({
                ...m,
                date: dateTime,
                result: m.result ? { ...m.result, date: dateTime } : null
              }))
            };
          }
          return g;
        });
      }
      return t;
    });
    setTournaments(updatedTournaments);
    addNotification(`Partidos del grupo ${tournament.groups[groupIdx].name} programados para ${dateTime}`, 'success');
  };

  const deleteTournament = (tournamentName) => {
    setTournaments(prev => prev.filter(t => t.name !== tournamentName));
    addNotification(`Torneo ${tournamentName} eliminado`, 'success');
  };

  const filteredTournaments = tournaments.filter(t => 
    !t.completed && 
    (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     t.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const MatchEditModal = () => {
    if (!selectedMatch || !selectedTournament) return null;

    const [set1p1, setSet1p1] = useState(selectedMatch.result?.set1?.p1 || '');
    const [set1p2, setSet1p2] = useState(selectedMatch.result?.set1?.p2 || '');
    const [set2p1, setSet2p1] = useState(selectedMatch.result?.set2?.p1 || '');
    const [set2p2, setSet2p2] = useState(selectedMatch.result?.set2?.p2 || '');
    const [tiebreakP1, setTiebreakP1] = useState(selectedMatch.result?.tiebreak?.p1 || '');
    const [tiebreakP2, setTiebreakP2] = useState(selectedMatch.result?.tiebreak?.p2 || '');
    const [matchDate, setMatchDate] = useState(selectedMatch.date ? selectedMatch.date.split(' ')[0] : '');
    const [matchTime, setMatchTime] = useState(selectedMatch.date ? selectedMatch.date.split(' ')[1] : '');

    const calculateWinner = () => {
      const s1p1 = parseInt(set1p1) || 0;
      const s1p2 = parseInt(set1p2) || 0;
      const s2p1 = parseInt(set2p1) || 0;
      const s2p2 = parseInt(set2p2) || 0;

      const setsWonP1 = (s1p1 > s1p2 ? 1 : 0) + (s2p1 > s2p2 ? 1 : 0);
      const setsWonP2 = (s1p2 > s1p1 ? 1 : 0) + (s2p2 > s2p1 ? 1 : 0);

      if (setsWonP1 > setsWonP2) return 1;
      if (setsWonP2 > setsWonP1) return 2;
      if (setsWonP1 === 1 && setsWonP2 === 1) {
        const tbP1 = parseInt(tiebreakP1) || 0;
        const tbP2 = parseInt(tiebreakP2) || 0;
        return tbP1 > tbP2 ? 1 : tbP2 > tbP1 ? 2 : null;
      }
      return null;
    };

    const handleSave = () => {
      if (!matchDate || !matchTime) {
        addNotification('Por favor, selecciona fecha y hora del partido', 'error');
        return;
      }

      const s1p1 = parseInt(set1p1);
      const s1p2 = parseInt(set1p2);
      const s2p1 = parseInt(set2p1);
      const s2p2 = parseInt(set2p2);
      const hasResults = set1p1 || set1p2 || set2p1 || set2p2;

      if (hasResults) {
        if (s1p1 < 0 || s1p2 < 0 || s2p1 < 0 || s2p2 < 0) {
          addNotification('Los puntajes no pueden ser negativos', 'error');
          return;
        }

        const setsWonP1 = (s1p1 > s1p2 ? 1 : 0) + (s2p1 > s2p2 ? 1 : 0);
        const setsWonP2 = (s1p2 > s1p1 ? 1 : 0) + (s2p2 > s2p1 ? 1 : 0);

        if (setsWonP1 === 1 && setsWonP2 === 1 && (!tiebreakP1 || !tiebreakP2)) {
          addNotification('Ingresa el super tiebreak para determinar el ganador', 'error');
          return;
        }
      }

      const result = { date: `${matchDate} ${matchTime}` };
      if (hasResults) {
        result.set1 = { p1: s1p1 || 0, p2: s1p2 || 0 };
        result.set2 = { p1: s2p1 || 0, p2: s2p2 || 0 };
        const winner = calculateWinner();
        if (winner) {
          result.winner = winner;
          if ((s1p1 > s1p2 && s2p2 > s2p1) || (s1p2 > s1p1 && s2p1 > s2p2)) {
            const tbP1 = parseInt(tiebreakP1) || 0;
            const tbP2 = parseInt(tiebreakP2) || 0;
            if (tbP1 < 0 || tbP2 < 0) {
              addNotification('Los puntajes del tiebreak no pueden ser negativos', 'error');
              return;
            }
            result.tiebreak = { p1: tbP1, p2: tbP2 };
          }
        }
      }

      updateResult(selectedMatch, result, selectedTournament, selectedGroupIdx, selectedPhaseIdx);
      addNotification(`Resultado del partido ${selectedMatch.pair1} vs ${selectedMatch.pair2 || 'Bye'} actualizado`, 'success');
      setSelectedMatch(null);
      setSelectedTournament(null);
      setSelectedGroupIdx(null);
      setSelectedPhaseIdx(null);
    };

    const showTiebreak = (parseInt(set1p1) > parseInt(set1p2) && parseInt(set2p2) > parseInt(set2p1)) ||
                        (parseInt(set1p2) > parseInt(set1p1) && parseInt(set2p1) > parseInt(set2p2));

    return (
      <div id="match-edit-modal" className="modal open">
        <div className="modal-content">
          <h5 style={{ color: '#00695c' }}>Editar Partido: {selectedMatch.pair1} vs {selectedMatch.pair2 || 'Bye'}</h5>
          <div className="row">
            <div className="input-field col s12 m6">
              <input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
              />
              <label className="active">Fecha</label>
            </div>
            <div className="input-field col s12 m6">
              <input
                type="time"
                value={matchTime}
                onChange={(e) => setMatchTime(e.target.value)}
              />
              <label className="active">Hora</label>
            </div>
            <div className="col s12">
              <h6 style={{ color: '#00695c' }}>Set 1</h6>
            </div>
            <div className="input-field col s12 m6">
              <input
                type="number"
                value={set1p1}
                onChange={(e) => setSet1p1(e.target.value)}
                placeholder={selectedMatch.pair1}
                min="0"
              />
              <label>{selectedMatch.pair1}</label>
            </div>
            <div className="input-field col s12 m6">
              <input
                type="number"
                value={set1p2}
                onChange={(e) => setSet1p2(e.target.value)}
                placeholder={selectedMatch.pair2 || 'Bye'}
                min="0"
              />
              <label>{selectedMatch.pair2 || 'Bye'}</label>
            </div>
            <div className="col s12">
              <h6 style={{ color: '#00695c' }}>Set 2</h6>
            </div>
            <div className="input-field col s12 m6">
              <input
                type="number"
                value={set2p1}
                onChange={(e) => setSet2p1(e.target.value)}
                placeholder={selectedMatch.pair1}
                min="0"
              />
              <label>{selectedMatch.pair1}</label>
            </div>
            <div className="input-field col s12 m6">
              <input
                type="number"
                value={set2p2}
                onChange={(e) => setSet2p2(e.target.value)}
                placeholder={selectedMatch.pair2 || 'Bye'}
                min="0"
              />
              <label>{selectedMatch.pair2 || 'Bye'}</label>
            </div>
            {showTiebreak && (
              <>
                <div className="col s12">
                  <h6 style={{ color: '#00695c' }}>Super Tiebreak</h6>
                </div>
                <div className="input-field col s12 m6">
                  <input
                    type="number"
                    value={tiebreakP1}
                    onChange={(e) => setTiebreakP1(e.target.value)}
                    placeholder={selectedMatch.pair1}
                    min="0"
                  />
                  <label>{selectedMatch.pair1}</label>
                </div>
                <div className="input-field col s12 m6">
                  <input
                    type="number"
                    value={tiebreakP2}
                    onChange={(e) => setTiebreakP2(e.target.value)}
                    placeholder={selectedMatch.pair2 || 'Bye'}
                    min="0"
                  />
                  <label>{selectedMatch.pair2 || 'Bye'}</label>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn-flat waves-effect modal-close"
            onClick={() => {
              setSelectedMatch(null);
              setSelectedTournament(null);
              setSelectedGroupIdx(null);
              setSelectedPhaseIdx(null);
            }}
          >
            Cancelar
          </button>
          <button
            className="btn teal waves-effect waves-light"
            onClick={handleSave}
          >
            Guardar
          </button>
        </div>
      </div>
    );
  };

  const GroupScheduler = ({ tournament, group, groupIdx }) => {
    const [scheduling, setScheduling] = useState(false);
    const [date, setDate] = useState(group.scheduledDate ? group.scheduledDate.split(' ')[0] : '');
    const [time, setTime] = useState(group.scheduledDate ? group.scheduledDate.split(' ')[1] : '');

    const handleSave = () => {
      if (!date || !time) {
        addNotification('Selecciona fecha y hora para programar el grupo', 'error');
        return;
      }
      const fullDate = `${date} ${time}`;
      scheduleGroupMatches(tournament, groupIdx, fullDate);
      setScheduling(false);
    };

    return (
      <div style={{ marginBottom: '10px' }}>
        {group.scheduledDate && !scheduling && (
          <p><strong>Programado para:</strong> {group.scheduledDate}</p>
        )}
        {user && !scheduling && (
          <button
            className="btn-flat waves-effect"
            onClick={() => setScheduling(true)}
          >
            <i className="material-icons left">schedule</i> {group.scheduledDate ? 'Reprogramar' : 'Programar'} Grupo
          </button>
        )}
        {scheduling && (
          <div style={{ border: '1px solid #e0e0e0', padding: '10px', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
            <div className="row">
              <div className="input-field col s12 m6">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <label className="active">Fecha</label>
              </div>
              <div className="input-field col s12 m6">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
                <label className="active">Hora</label>
              </div>
              <div className="col s12">
                <button
                  className="btn-flat waves-effect"
                  onClick={() => setScheduling(false)}
                  style={{ marginRight: '10px' }}
                >
                  Cancelar
                </button>
                <button
                  className="btn teal waves-effect waves-light"
                  onClick={handleSave}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const GroupStandings = ({ group }) => {
    const standings = group.pairs.map(pair => {
      const wins = group.matches.filter(m => 
        (m.pair1 === pair && m.result?.winner === 1) || 
        (m.pair2 === pair && m.result?.winner === 2)
      ).length;
      const played = group.matches.filter(m => 
        (m.pair1 === pair || m.pair2 === pair) && m.result?.winner
      ).length;
      return { pair, wins, played };
    }).sort((a, b) => b.wins - a.wins);

    return (
      <div style={{ marginBottom: '20px' }}>
        <h6 style={{ color: '#00695c' }}>Clasificación</h6>
        <table className="striped">
          <thead>
            <tr>
              <th>Pareja</th>
              <th>Victorias</th>
              <th>Partidos Jugados</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((entry, idx) => (
              <tr key={idx}>
                <td>{entry.pair}</td>
                <td>{entry.wins}</td>
                <td>{entry.played}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <NavBar />
      <div className="container" style={{ marginTop: '20px' }}>
        {user ? (
          <div className="row">
            <div className="col s12">
              <ul className="tabs tabs-fixed-width" style={{ backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
                <li className="tab col s3">
                  <a href="#jugadores" className={view === 'jugadores' ? 'active teal-text' : 'grey-text'} onClick={() => setView('jugadores')}>
                    Jugadores
                  </a>
                </li>
                <li className="tab col s3">
                  <a href="#crear" className={view === 'crear' ? 'active teal-text' : 'grey-text'} onClick={() => setView('crear')}>
                    Crear torneo
                  </a>
                </li>
                <li className="tab col s3">
                  <a href="#activos" className={view === 'activos' ? 'active teal-text' : 'grey-text'} onClick={() => setView('activos')}>
                    Torneos activos
                  </a>
                </li>
                <li className="tab col s3">
                  <a href="#historial" className={view === 'historial' ? 'active teal-text' : 'grey-text'} onClick={() => setView('historial')}>
                    Historial
                  </a>
                </li>
              </ul>
            </div>
            {view === 'jugadores' && (
              <div className="col s12">
                <PlayerForm onRegisterPlayer={registerPlayer} players={players} />
              </div>
            )}
            {view === 'crear' && (
              <div className="col s12">
                <TournamentForm players={players} onCreateTournament={createTournament} />
              </div>
            )}
            {view === 'activos' && (
              <div className="col s12">
                <div className="row">
                  <div className="col s12">
                    <div className="input-field">
                      <input
                        id="buscar"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nombre o categoría..."
                      />
                    </div>
                  </div>
                </div>
                {filteredTournaments.length > 0 ? (
                  <ul className="collapsible">
                    {filteredTournaments.map((tournament) => (
                      <li key={tournament.name}>
                        <div className="collapsible-header" style={{ backgroundColor: getStatusColor(tournament), padding: '10px' }}>
                          <i className="material-icons">expand_more</i>
                          <span style={{ fontWeight: 'bold' }}>{tournament.name}</span>
                          <span className="new badge right" data-badge-caption="Pendientes">
                            {getPendingMatches(tournament)}
                          </span>
                          {user && (
                            <button
                              className="btn-flat waves-effect right"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`¿Estás seguro de que deseas eliminar el torneo ${tournament.name}?`)) {
                                  deleteTournament(tournament.name);
                                }
                              }}
                              style={{ marginLeft: '10px' }}
                            >
                              <i className="material-icons">delete</i>
                            </button>
                          )}
                        </div>
                        <div className="collapsible-body">
                          <div className="row">
                            <div className="col s12">
                              <p><strong>Categoría:</strong> {tournament.category}</p>
                              <p><strong>Fecha de inicio:</strong> {tournament.startDate || 'Pendiente'}</p>
                              <p><strong>Progreso:</strong> {getProgress(tournament)}%</p>
                              <div className="progress">
                                <div className="determinate" style={{ width: `${getProgress(tournament)}%`, backgroundColor: '#26a69a' }}></div>
                              </div>
                            </div>
                            <div className="col s12">
                              <h6 style={{ color: '#00695c', marginTop: '20px' }}>Grupos</h6>
                              {tournament.groups.map((group, groupIdx) => (
                                <div key={group.name} style={{ marginBottom: '20px', border: '1px solid #e0e0e0', padding: '10px', borderRadius: '5px' }}>
                                  <h6 style={{ color: '#00695c' }}>{group.name}</h6>
                                  <GroupScheduler tournament={tournament} group={group} groupIdx={groupIdx} />
                                  <GroupStandings group={group} />
                                  <h6 style={{ color: '#00695c' }}>Partidos</h6>
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
                                      {user && (
                                        <button
                                          className="btn-flat waves-effect modal-trigger"
                                          onClick={() => {
                                            setSelectedMatch(match);
                                            setSelectedTournament(tournament);
                                            setSelectedGroupIdx(groupIdx);
                                            setSelectedPhaseIdx(null);
                                          }}
                                          data-target="match-edit-modal"
                                        >
                                          <i className="material-icons">edit</i> Editar
                                        </button>
                                      )}
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
                                        {user && (
                                          <button
                                            className="btn-flat waves-effect modal-trigger"
                                            onClick={() => {
                                              setSelectedMatch(match);
                                              setSelectedTournament(tournament);
                                              setSelectedGroupIdx(null);
                                              setSelectedPhaseIdx(phaseIdx);
                                            }}
                                            data-target="match-edit-modal"
                                          >
                                            <i className="material-icons">edit</i> Editar
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ))}
                                {tournament.knockout[0]?.matches[0]?.result?.winner && (
                                  <button
                                    className="btn teal waves-effect waves-light"
                                    onClick={() => finalizeTournament(tournament.name)}
                                  >
                                    Finalizar Torneo
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="col s12">
                    <div className="card">
                      <div className="card-content">
                        <p className="grey-text">No hay torneos activos en este momento.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {view === 'historial' && (
              <div className="col s12">
                <TournamentHistory tournaments={tournaments} />
              </div>
            )}
          </div>
        ) : (
          <div className="row">
            <div className="col s12">
              <div className="card">
                <div className="card-content">
                  <span className="card-title">Bienvenido a Tennis & Padel Uruguay</span>
                  <p>
                    Explora los torneos como espectador o{' '}
                    <button
                      className="btn teal waves-effect waves-light modal-trigger"
                      data-target="login-modal"
                      style={{ borderRadius: '5px' }}
                    >
                      Inicia sesión
                    </button>{' '}
                    para gestionar torneos.
                  </p>
                </div>
              </div>
            </div>
            <div className="col s12">
              <ul className="tabs tabs-fixed-width" style={{ backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
                <li className="tab col s6">
                  <a href="#activos" className={view === 'activos' ? 'active teal-text' : 'grey-text'} onClick={() => setView('activos')}>
                    Torneos activos
                  </a>
                </li>
                <li className="tab col s6">
                  <a href="#historial" className={view === 'historial' ? 'active teal-text' : 'grey-text'} onClick={() => setView('historial')}>
                    Historial
                  </a>
                </li>
              </ul>
            </div>
            {view === 'activos' && (
              <div className="col s12">
                <div className="row">
                  <div className="col s12">
                    <div className="input-field">
                      <input
                        id="buscar"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nombre o categoría..."
                      />
                    </div>
                  </div>
                </div>
                {filteredTournaments.length > 0 ? (
                  <ul className="collapsible">
                    {filteredTournaments.map((tournament) => (
                      <li key={tournament.name}>
                        <div className="collapsible-header" style={{ backgroundColor: getStatusColor(tournament), padding: '10px' }}>
                          <i className="material-icons">expand_more</i>
                          <span style={{ fontWeight: 'bold' }}>{tournament.name}</span>
                          <span className="new badge right" data-badge-caption="Pendientes">
                            {getPendingMatches(tournament)}
                          </span>
                        </div>
                        <div className="collapsible-body">
                          <div className="row">
                            <div className="col s12">
                              <p><strong>Categoría:</strong> {tournament.category}</p>
                              <p><strong>Fecha de inicio:</strong> {tournament.startDate || 'Pendiente'}</p>
                              <p><strong>Progreso:</strong> {getProgress(tournament)}%</p>
                              <div className="progress">
                                <div className="determinate" style={{ width: `${getProgress(tournament)}%`, backgroundColor: '#26a69a' }}></div>
                              </div>
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
                    ))}
                  </ul>
                ) : (
                  <div className="col s12">
                    <div className="card">
                      <div className="card-content">
                        <p className="grey-text">No hay torneos activos en este momento.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div id="login-modal" className="modal">
              <div className="modal-content">
                <h5 style={{ color: '#00695c' }}>Iniciar sesión</h5>
                <LoginForm />
              </div>
              <div className="modal-footer">
                <button className="modal-close btn-flat waves-effect">Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <MatchEditModal />
    </ErrorBoundary>
  );
};

const getStatusColor = (tournament) => {
  const pendingMatches = getPendingMatches(tournament);
  if (tournament.completed) return '#ef5350';
  if (pendingMatches === 0) return '#66bb6a';
  return '#ffca28';
};

const getPendingMatches = (tournament) => {
  return tournament.groups.reduce((acc, g) => acc + g.matches.filter(m => !m.result).length, 0) +
         tournament.knockout.reduce((acc, p) => acc + p.matches.filter(m => !m.result).length, 0);
};

const getProgress = (tournament) => {
  const totalMatches = tournament.groups.reduce((acc, g) => acc + g.matches.length, 0) +
                      tournament.knockout.reduce((acc, p) => acc + p.matches.length, 0);
  const completedMatches = totalMatches - getPendingMatches(tournament);
  return totalMatches ? Math.round((completedMatches / totalMatches) * 100) : 0;
};

export default App;
import React from 'react';
import M from 'materialize-css';

const KnockoutSlider = ({ phases, tournament, onUpdateResult, editable, onMatchClick }) => {
  const initializeSlider = () => {
    const slider = document.querySelector('.slider');
    M.Slider.init(slider, { indicators: true, interval: 5000 });
  };

  React.useEffect(() => {
    initializeSlider();
  }, []);

  return (
    <div className="slider">
      <ul className="slides">
        {phases.map((phase, phaseIdx) => (
          <li key={phaseIdx}>
            <div className="card">
              <div className="card-content">
                <span className="card-title">Ronda {phases.length - phaseIdx}</span>
                {phase.matches.map((match, matchIdx) => (
                  <div key={matchIdx} className="row">
                    <div className="col s12">
                      <p>
                        <strong>{match.pair1}</strong> vs <strong>{match.pair2 || 'Bye'}</strong> -{' '}
                        {match.date ? `Programado para: ${match.date}` : 'Pendiente de programación'}
                      </p>
                      {match.result ? (
                        <p>
                          Resultado: {match.result.set1.p1}-{match.result.set1.p2}, {match.result.set2.p1}-{match.result.set2.p2}
                          {match.result.tiebreak && `, Tiebreak: ${match.result.tiebreak.p1}-${match.result.tiebreak.p2}`}
                          <br />
                          Ganador: {match.result.winner === 1 ? match.pair1 : match.pair2}
                        </p>
                      ) : (
                        <p>Sin resultado</p>
                      )}
                      {editable && (
                        <button
                          className="btn-flat waves-effect"
                          onClick={() => onMatchClick({ ...match, result: match.result || { set1: { p1: '', p2: '' }, set2: { p1: '', p2: '' }, tiebreak: { p1: '', p2: '' } } })}
                        >
                          <i className="material-icons">edit</i> Editar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default KnockoutSlider;
import React, { useState, useEffect } from 'react';
import M from 'materialize-css';
import { useNotification } from '../contexts/NotificationContext.jsx';

const MatchModal = ({ match, tournament, onUpdateResult, onClose }) => {
  // Aseguramos que match.result esté inicializado como un objeto vacío si es undefined
  const initialResult = match.result || { set1: { p1: '', p2: '' }, set2: { p1: '', p2: '' }, tiebreak: { p1: '', p2: '' } };

  const [set1p1, setSet1p1] = useState(initialResult.set1.p1 || '');
  const [set1p2, setSet1p2] = useState(initialResult.set1.p2 || '');
  const [set2p1, setSet2p1] = useState(initialResult.set2.p1 || '');
  const [set2p2, setSet2p2] = useState(initialResult.set2.p2 || '');
  const [tiebreakP1, setTiebreakP1] = useState(initialResult.tiebreak.p1 || '');
  const [tiebreakP2, setTiebreakP2] = useState(initialResult.tiebreak.p2 || '');
  const [matchDate, setMatchDate] = useState(match.date || '');
  const { addNotification } = useNotification();

  useEffect(() => {
    const modal = document.getElementById(`match-modal-${match.pair1}-${match.pair2 || 'bye'}`);
    const modalInstance = M.Modal.init(modal, { dismissible: true, onCloseEnd: onClose });
    modalInstance.open();

    M.Datepicker.init(document.querySelectorAll('.datepicker'), {
      format: 'yyyy-mm-dd',
      autoClose: true,
      defaultDate: match.date ? new Date(match.date) : null,
      setDefaultDate: !!match.date
    });

    M.Timepicker.init(document.querySelectorAll('.timepicker'), {
      twelveHour: false,
      autoClose: true,
      defaultTime: match.date ? match.date.split(' ')[1] : '12:00'
    });

    return () => modalInstance.destroy();
  }, [match, onClose]);

  const handleDateTimeChange = () => {
    const date = document.getElementById(`date-${match.pair1}-${match.pair2 || 'bye'}`).value;
    const time = document.getElementById(`time-${match.pair1}-${match.pair2 || 'bye'}`).value;
    if (date && time) {
      const fullDate = `${date} ${time}`;
      setMatchDate(fullDate);
    }
  };

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
    const result = { date: matchDate };

    const hasResults = set1p1 || set1p2 || set2p1 || set2p2;
    if (hasResults) {
      if (!matchDate) {
        addNotification('Por favor, selecciona fecha y hora antes de guardar resultados', 'error');
        return;
      }
      result.set1 = { p1: parseInt(set1p1) || 0, p2: parseInt(set1p2) || 0 };
      result.set2 = { p1: parseInt(set2p1) || 0, p2: parseInt(set2p2) || 0 };
      const winner = calculateWinner();
      if (winner) {
        result.winner = winner;
        if ((parseInt(set1p1) > parseInt(set1p2) && parseInt(set2p2) > parseInt(set2p1)) ||
            (parseInt(set1p2) > parseInt(set1p1) && parseInt(set2p1) > parseInt(set2p2))) {
          result.tiebreak = { p1: parseInt(tiebreakP1) || 0, p2: parseInt(tiebreakP2) || 0 };
        }
      } else if (set1p1 && set1p2 && set2p1 && set2p2 && !tiebreakP1 && !tiebreakP2) {
        addNotification('Ingresa el super tiebreak para determinar el ganador', 'error');
        return;
      }
    }

    onUpdateResult(match, result, tournament);
    addNotification(`Partido ${match.pair1} vs ${match.pair2 || 'Bye'} actualizado`, 'success');
    onClose();
  };

  const showTiebreak = (parseInt(set1p1) > parseInt(set1p2) && parseInt(set2p2) > parseInt(set2p1)) ||
                      (parseInt(set1p2) > parseInt(set1p1) && parseInt(set2p1) > parseInt(set2p2));

  return (
    <div id={`match-modal-${match.pair1}-${match.pair2 || 'bye'}`} className="modal">
      <div className="modal-content">
        <h5 style={{ color: '#00695c' }}>{match.pair1} vs {match.pair2 || 'Bye'}</h5>
        <div className="row">
          <div className="input-field col s12 m6">
            <input
              type="text"
              className="datepicker"
              id={`date-${match.pair1}-${match.pair2 || 'bye'}`}
              onChange={handleDateTimeChange}
            />
            <label htmlFor={`date-${match.pair1}-${match.pair2 || 'bye'}`}>Fecha</label>
          </div>
          <div className="input-field col s12 m6">
            <input
              type="text"
              className="timepicker"
              id={`time-${match.pair1}-${match.pair2 || 'bye'}`}
              onChange={handleDateTimeChange}
            />
            <label htmlFor={`time-${match.pair1}-${match.pair2 || 'bye'}`}>Hora</label>
          </div>
          <div className="col s12">
            <h6 style={{ color: '#00695c', marginTop: '20px' }}>Set 1</h6>
          </div>
          <div className="input-field col s12 m6">
            <input
              type="number"
              value={set1p1}
              onChange={(e) => setSet1p1(e.target.value)}
              placeholder={match.pair1}
            />
            <label>{match.pair1}</label>
          </div>
          <div className="input-field col s12 m6">
            <input
              type="number"
              value={set1p2}
              onChange={(e) => setSet1p2(e.target.value)}
              placeholder={match.pair2 || 'Bye'}
            />
            <label>{match.pair2 || 'Bye'}</label>
          </div>
          <div className="col s12">
            <h6 style={{ color: '#00695c', marginTop: '20px' }}>Set 2</h6>
          </div>
          <div className="input-field col s12 m6">
            <input
              type="number"
              value={set2p1}
              onChange={(e) => setSet2p1(e.target.value)}
              placeholder={match.pair1}
            />
            <label>{match.pair1}</label>
          </div>
          <div className="input-field col s12 m6">
            <input
              type="number"
              value={set2p2}
              onChange={(e) => setSet2p2(e.target.value)}
              placeholder={match.pair2 || 'Bye'}
            />
            <label>{match.pair2 || 'Bye'}</label>
          </div>
          {showTiebreak && (
            <>
              <div className="col s12">
                <h6 style={{ color: '#00695c', marginTop: '20px' }}>Super tiebreak</h6>
              </div>
              <div className="input-field col s12 m6">
                <input
                  type="number"
                  value={tiebreakP1}
                  onChange={(e) => setTiebreakP1(e.target.value)}
                  placeholder={match.pair1}
                />
                <label>{match.pair1}</label>
              </div>
              <div className="input-field col s12 m6">
                <input
                  type="number"
                  value={tiebreakP2}
                  onChange={(e) => setTiebreakP2(e.target.value)}
                  placeholder={match.pair2 || 'Bye'}
                />
                <label>{match.pair2 || 'Bye'}</label>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="modal-footer">
        <button
          className="modal-close btn-flat waves-effect"
          onClick={onClose}
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

export default MatchModal;
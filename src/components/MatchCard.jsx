import React from 'react';

const MatchCard = ({ match, editable, onClick }) => {
  return (
    <div
      className="row"
      style={{ padding: '10px', margin: '5px 0', backgroundColor: '#fff', borderRadius: '5px', cursor: editable ? 'pointer' : 'default', border: '1px solid #e0e0e0' }}
      onClick={onClick}
    >
      <div className="col s12">
        <p style={{ margin: '0', fontWeight: 'bold' }}>{match.pair1.split(' + ').join(', ')} vs {match.pair2 ? match.pair2.split(' + ').join(', ') : 'Bye'}</p>
        {match.result ? (
          <div>
            <p style={{ margin: '5px 0' }}>Set 1: {match.result.set1.p1} - {match.result.set1.p2}</p>
            {match.result.set2 && <p style={{ margin: '5px 0' }}>Set 2: {match.result.set2.p1} - {match.result.set2.p2}</p>}
            {match.result.tiebreak && (
              <p style={{ margin: '5px 0' }}>Super Tiebreak: {match.result.tiebreak.p1} - {match.result.tiebreak.p2}</p>
            )}
            <p style={{ margin: '5px 0', color: '#388e3c' }}>Ganador: {match.result.winner === 1 ? match.pair1.split(' + ').join(', ') : match.pair2.split(' + ').join(', ')}</p>
            <p style={{ margin: '5px 0' }}>Fecha: {new Date(match.result.date).toLocaleString()}</p>
          </div>
        ) : (
          <p style={{ margin: '5px 0', color: '#757575' }}>
            {match.date ? `Programado: ${new Date(match.date).toLocaleString()}` : 'Pendiente de programación'}
          </p>
        )}
      </div>
    </div>
  );
};

export default MatchCard;
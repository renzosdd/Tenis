import React from 'react';

const GroupCard = ({ group }) => {
  // Validaciones para evitar errores si las propiedades no están definidas
  if (!group || !group.name || !Array.isArray(group.pairs) || !Array.isArray(group.matches)) {
    return <div className="card-panel red lighten-4">Error: Datos del grupo no válidos</div>;
  }

  return (
    <div className="card">
      <div className="card-content">
        <span className="card-title">{group.name}</span>
        <h6>Parejas:</h6>
        <ul className="collection">
          {group.pairs.map((pair, index) => (
            <li key={index} className="collection-item">{pair}</li>
          ))}
        </ul>
        <h6>Cruces:</h6>
        {group.matches.length > 0 ? (
          <ul className="collection">
            {group.matches.map((match, index) => (
              <li key={index} className="collection-item">
                {match.pair1} vs {match.pair2} - {match.result || 'Sin resultado'}
              </li>
            ))}
          </ul>
        ) : (
          <p className="grey-text">No hay cruces definidos.</p>
        )}
      </div>
    </div>
  );
};

export default GroupCard;
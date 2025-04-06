import React from 'react';
import { useNotification } from '../contexts/NotificationContext.jsx';

const DataManager = () => {
  const { addNotification } = useNotification();

  const exportData = () => {
    try {
      const data = { 
        players: JSON.parse(localStorage.getItem('players')), 
        tournaments: JSON.parse(localStorage.getItem('tournaments')) 
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tennis-tournament-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      addNotification('Datos exportados correctamente', 'success');
    } catch (error) {
      addNotification('Error al exportar datos', 'error');
      console.error(error);
    }
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data.players || !data.tournaments) {
          addNotification('Archivo no válido', 'error');
          return;
        }
        localStorage.setItem('players', JSON.stringify(data.players));
        localStorage.setItem('tournaments', JSON.stringify(data.tournaments));
        addNotification('Datos importados correctamente', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        addNotification('Error al importar datos', 'error');
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="card">
      <div className="card-content">
        <span className="card-title">Gestión de Datos</span>
        <div className="row">
          <div className="col s12 m6">
            <button onClick={exportData} className="btn blue waves-effect waves-light">
              Exportar Datos
            </button>
          </div>
          <div className="col s12 m6">
            <label className="btn green waves-effect waves-light">
              Importar Datos
              <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
            </label>
          </div>
          <div className="col s12">
            <p className="grey-text">Guarda una copia de seguridad de todos los jugadores y torneos.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManager;
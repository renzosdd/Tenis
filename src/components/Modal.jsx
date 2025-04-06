import React from 'react';

const Modal = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-content">
        <h4>{title}</h4>
        {children}
      </div>
      <div className="modal-footer">
        <button onClick={onClose} className="btn grey waves-effect waves-light">
          Cancelar
        </button>
        <button onClick={onConfirm} className="btn blue waves-effect waves-light">
          Confirmar
        </button>
      </div>
    </div>
  );
};

export default Modal;
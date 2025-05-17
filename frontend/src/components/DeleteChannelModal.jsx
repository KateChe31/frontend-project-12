import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

const DeleteChannelModal = ({ onClose, onDelete }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const deleteButtonRef = useRef(null);

  useEffect(() => {
    deleteButtonRef.current?.focus();
  }, []);

  const handleSubmit = async(e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onDelete();
      onClose();
    } catch (err) {
      console.error('Ошибка при удалении канала:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return ReactDOM.createPortal(
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
        <form className="modal-content" onSubmit={handleSubmit}>
          <div className="modal-header">
            <h5 className="modal-title">Удалить канал</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Закрыть"
              disabled={isSubmitting}
            ></button>
          </div>
          <div
            className="modal-body"
            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
          >
            <p>Уверены?</p>
          </div>
          <div className="modal-footer">
            <button
              type="submit"
              className="btn btn-danger"
              disabled={isSubmitting}
              ref={deleteButtonRef}
            >
              Удалить
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Отменить
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default DeleteChannelModal;

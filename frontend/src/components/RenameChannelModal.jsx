import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

const RenameChannelModal = ({ currentName, onClose, onRename, existingNames }) => {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setError('');
  }, [name]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleSubmit = async(e) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (trimmedName.length < 3 || trimmedName.length > 20) {
      setError('От 3 до 20 символов.');
      return;
    }

    if (existingNames.includes(trimmedName) && trimmedName !== currentName) {
      setError('Должно быть уникальным');
      return;
    }

    try {
      setIsSubmitting(true);
      await onRename(trimmedName);
      onClose();
    } catch (err) {
      console.error('Ошибка при переименовании канала:', err);
      setError('Не удалось переименовать канал. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return ReactDOM.createPortal(
    <div
      className="modal d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <form className="modal-content" onSubmit={handleSubmit}>
          <div className="modal-header">
            <h5 className="modal-title">Переименовать канал</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Закрыть"
              disabled={isSubmitting}
            />
          </div>
          <div
            className="modal-body"
            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
          >
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              ref={inputRef}
              style={{ minWidth: 0 }}
              disabled={isSubmitting}
            />
            {error && <div className="text-danger mt-2">{error}</div>}
          </div>
          <div className="modal-footer">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              Отправить
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

export default RenameChannelModal;

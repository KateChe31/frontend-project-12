import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import leoProfanity from 'leo-profanity';

const RenameChannelModal = ({ currentName, onClose, onRename, existingNames }) => {
  const { t } = useTranslation();

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
      setError(t('modals.renameChannel.errors.minMax'));
      return;
    }

    if (existingNames.includes(trimmedName) && trimmedName !== currentName) {
      setError(t('modals.renameChannel.errors.unique'));
      return;
    }

    const cleanedName = leoProfanity.clean(trimmedName);

    try {
      setIsSubmitting(true);
      await onRename(cleanedName);
      onClose();
    } catch (err) {
      console.error('Ошибка при переименовании канала:', err);
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
            <h5 className="modal-title">{t('modals.renameChannel.title')}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label={t('modals.renameChannel.cancel')}
              disabled={isSubmitting}
            />
          </div>
          <div
            className="modal-body"
            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
          >
            <label htmlFor="channel-name-input" className="visually-hidden">
              {t('modals.renameChannel.label')}
            </label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              ref={inputRef}
              style={{ minWidth: 0 }}
              disabled={isSubmitting}
              placeholder={t('modals.renameChannel.placeholder')}
            />
            {error && <div className="text-danger mt-2">{error}</div>}
          </div>
          <div className="modal-footer">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {t('modals.renameChannel.submit')}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t('modals.renameChannel.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default RenameChannelModal;

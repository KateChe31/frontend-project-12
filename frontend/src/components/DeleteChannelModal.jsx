import { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { useTranslation } from 'react-i18next'

const DeleteChannelModal = ({ onClose, onDelete }) => {
  const { t } = useTranslation()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const deleteButtonRef = useRef(null)

  useEffect(() => {
    deleteButtonRef.current?.focus()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onDelete()
      onClose()
    }
    catch {
      console.error(t('modals.deleteChannel.deleteFailed', 'Ошибка при удалении канала'))
    }
    finally {
      setIsSubmitting(false)
    }
  }

  return ReactDOM.createPortal(
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        role="document"
        onClick={e => e.stopPropagation()}
      >
        <form className="modal-content" onSubmit={handleSubmit}>
          <div className="modal-header">
            <h5 className="modal-title">{t('modals.deleteChannel.title')}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label={t('modals.deleteChannel.cancel')}
              disabled={isSubmitting}
            />
          </div>
          <div
            className="modal-body"
            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
          >
            <p>{t('modals.deleteChannel.confirm')}</p>
          </div>
          <div className="modal-footer">
            <button
              type="submit"
              className="btn btn-danger"
              disabled={isSubmitting}
              ref={deleteButtonRef}
            >
              {t('modals.deleteChannel.submit')}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t('modals.deleteChannel.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

export default DeleteChannelModal

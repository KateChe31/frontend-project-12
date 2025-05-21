import { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import leoProfanity from 'leo-profanity'

import { createChannelRequest } from '../api/chatApi'

const AddChannelModal = ({ onClose, onChannelCreated }) => {
  const { t } = useTranslation()
  const channels = useSelector(state => state.chat.channels)
  const existingNames = channels.map(ch => ch.name.toLowerCase())
  const inputRef = useRef(null)
  const modalRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const formik = useFormik({
    initialValues: {
      name: '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required(t('modals.addChannel.errors.required'))
        .min(3, t('modals.addChannel.errors.minMax'))
        .max(20, t('modals.addChannel.errors.minMax'))
        .notOneOf(existingNames, t('modals.addChannel.errors.unique')),
    }),
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting }) => {
      const cleanedName = leoProfanity.clean(values.name)
      try {
        const data = await createChannelRequest(cleanedName)
        if (onChannelCreated) {
          onChannelCreated(data.id)
        }
        onClose()
      }
      catch (err) {
        console.error('Ошибка при создании канала:', err)
      }
      finally {
        setSubmitting(false)
      }
    },
  })

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      formik.setTouched({}, false)
      onClose()
    }
  }

  const handleCancel = () => {
    formik.setTouched({}, false)
    onClose()
  }

  return ReactDOM.createPortal(
    <div
      className="modal fade show d-block bg-dark bg-opacity-50"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      onMouseDown={handleBackdropClick}
    >
      <div
        className="modal-dialog"
        role="document"
        ref={modalRef}
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="modal-content">
          <form onSubmit={formik.handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{t('modals.addChannel.title')}</h5>
              <button
                type="button"
                className="btn-close"
                onMouseDown={handleCancel}
                aria-label="Close"
              />
            </div>

            <div className="modal-body text-break">
              <label htmlFor="channelName" className="form-label visually-hidden">
                {t('modals.addChannel.label')}
              </label>
              <input
                id="channelName"
                type="text"
                name="name"
                className={`form-control ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''}`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.name}
                ref={inputRef}
                placeholder={t('modals.addChannel.placeholder')}
                aria-label={t('modals.addChannel.label')}
              />
              {formik.touched.name && formik.errors.name && (
                <div className="invalid-feedback">{formik.errors.name}</div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={formik.isSubmitting}
              >
                {t('modals.addChannel.submit')}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onMouseDown={handleCancel}
                disabled={formik.isSubmitting}
              >
                {t('modals.addChannel.cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default AddChannelModal

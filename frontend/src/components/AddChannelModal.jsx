import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import axios from 'axios';

const AddChannelModal = ({ onClose }) => {
  const channels = useSelector((state) => state.chat.channels);
  const existingNames = channels.map((ch) => ch.name.toLowerCase());
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required('Обязательное поле')
        .min(3, 'От 3 до 20 символов')
        .max(20, 'От 3 до 20 символов')
        .notOneOf(existingNames, 'Должно быть уникальным'),
    }),
    onSubmit: async(values, { setSubmitting, setErrors }) => {
      const token = localStorage.getItem('token');

      try {
        await axios.post('/api/v1/channels', { name: values.name }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        onClose();
      } catch (err) {
        console.error('Ошибка при создании канала:', err);
        setErrors({ name: 'Не удалось создать канал. Попробуйте позже.' });
      } finally {
        setSubmitting(false);
      }
    },
  });

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
        className="modal-dialog"
        role="document"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-content">
          <form onSubmit={formik.handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Добавить канал</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Закрыть"></button>
            </div>
            <div className="modal-body" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
              <input
                type="text"
                name="name"
                className={`form-control ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''}`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.name}
                ref={inputRef}
                placeholder="Имя канала"
                style={{ minWidth: 0 }}
              />
              {formik.touched.name && formik.errors.name && (
                <div className="invalid-feedback">{formik.errors.name}</div>
              )}
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-primary" disabled={formik.isSubmitting}>
                Добавить
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={formik.isSubmitting}>
                Отменить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default AddChannelModal;

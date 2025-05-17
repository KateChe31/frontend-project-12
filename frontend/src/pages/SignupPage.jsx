import React, { useState, useRef, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Header from '../components/Header';

const SignupPage = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const usernameRef = useRef(null);

  useEffect(() => {
    usernameRef.current?.focus(); // фокус на поле при загрузке
  }, []);

  const handleSubmit = async(values, { setSubmitting, setFieldError }) => {
    setServerError('');
    try {
      const response = await axios.post('/api/v1/signup', {
        username: values.username,
        password: values.password,
      });

      const { token } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ username: values.username }));

      navigate('/');
    } catch (error) {
      if (error.response?.status === 409) {
        setFieldError('username', 'Такой пользователь уже существует');
      } else {
        setServerError('Ошибка регистрации. Попробуйте позже.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container min-vh-100 d-flex justify-content-center align-items-center">
        <div className="w-100 d-flex flex-column align-items-center">
          <div style={{ width: '100%', maxWidth: '500px' }}>
            <h1 className="text-center mb-4">Регистрация</h1>

            <Formik
              initialValues={{ username: '', password: '', passwordConfirm: '' }}
              validateOnBlur={true}
              validateOnChange={false}
              validate={values => {
                const errors = {};
                if (!values.username) {
                  errors.username = 'Обязательное поле';
                } else if (values.username.length < 3 || values.username.length > 20) {
                  errors.username = 'От 3 до 20 символов';
                }

                if (!values.password) {
                  errors.password = 'Обязательное поле';
                } else if (values.password.length < 6) {
                  errors.password = 'Не менее 6 символов';
                }

                if (values.password !== values.passwordConfirm) {
                  errors.passwordConfirm = 'Пароли должны совпадать';
                }

                return errors;
              }}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting, setFieldTouched }) => (
                <Form>

                  {/* Имя пользователя */}
                  <div className="form-floating mb-3 position-relative">
                    <Field
                      innerRef={usernameRef}
                      type="text"
                      name="username"
                      id="username"
                      required
                      className={`form-control ${errors.username && touched.username ? 'is-invalid' : ''}`}
                      placeholder=" "
                    />
                    <label htmlFor="username">Имя пользователя</label>
                    {errors.username && touched.username && (
                      <div className="invalid-feedback">{errors.username}</div>
                    )}
                  </div>

                  {/* Пароль */}
                  <div className="form-floating mb-3 position-relative">
                    <Field
                      type="password"
                      name="password"
                      id="password"
                      required
                      className={`form-control ${errors.password && touched.password ? 'is-invalid' : ''}`}
                      placeholder=" "
                      onFocus={() => setFieldTouched('username', true)}
                    />
                    <label htmlFor="password">Пароль</label>
                    {errors.password && touched.password && (
                      <div className="invalid-feedback">{errors.password}</div>
                    )}
                  </div>

                  {/* Подтвердите пароль */}
                  <div className="form-floating mb-3 position-relative">
                    <Field
                      type="password"
                      name="passwordConfirm"
                      id="passwordConfirm"
                      className={`form-control ${errors.passwordConfirm && touched.passwordConfirm ? 'is-invalid' : ''}`}
                      placeholder=" "
                      onFocus={() => {
                        setFieldTouched('username', true);
                        setFieldTouched('password', true);
                      }}
                    />
                    <label htmlFor="passwordConfirm">Подтвердите пароль</label>
                    {errors.passwordConfirm && touched.passwordConfirm && (
                      <div className="invalid-feedback">{errors.passwordConfirm}</div>
                    )}
                  </div>

                  {serverError && (
                    <div className="text-danger mb-3">{serverError}</div>
                  )}

                  <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                    Зарегистрироваться
                  </button>
                </Form>
              )}
            </Formik>

            <p className="text-center mt-3">
              Уже зарегистрированы? <a href="/login">Войти</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;

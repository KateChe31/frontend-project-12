import React, { useRef, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import Header from '../components/Header';

const SignupPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const usernameRef = useRef(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const handleSubmit = async(values, { setSubmitting, setFieldError }) => {
    try {
      const response = await axios.post('/api/v1/signup', {
        username: values.username,
        password: values.password,
      });

      const { token } = response.data;
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify({ username: values.username }));


      navigate('/');
    } catch (error) {
      if (error.response?.status === 409) {
        setFieldError('username', t('signup.errors.userExists'));
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
            <h1 className="text-center mb-4">{t('signup.title')}</h1>

            <Formik
              initialValues={{ username: '', password: '', passwordConfirm: '' }}
              validateOnBlur={true}
              validateOnChange={false}
              validate={(values) => {
                const errors = {};
                if (!values.username) {
                  errors.username = t('signup.errors.required');
                } else if (values.username.length < 3 || values.username.length > 20) {
                  errors.username = t('signup.errors.usernameLength');
                }

                if (!values.password) {
                  errors.password = t('signup.errors.required');
                } else if (values.password.length < 6) {
                  errors.password = t('signup.errors.passwordLength');
                }

                if (values.password !== values.passwordConfirm) {
                  errors.passwordConfirm = t('signup.errors.passwordsMustMatch');
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
                    <label htmlFor="username">{t('signup.username')}</label>
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
                    <label htmlFor="password">{t('signup.password')}</label>
                    {errors.password && touched.password && (
                      <div className="invalid-feedback">{errors.password}</div>
                    )}
                  </div>

                  {/* Подтверждение пароля */}
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
                    <label htmlFor="passwordConfirm">{t('signup.passwordConfirm')}</label>
                    {errors.passwordConfirm && touched.passwordConfirm && (
                      <div className="invalid-feedback">{errors.passwordConfirm}</div>
                    )}
                  </div>

                  <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                    {t('signup.submit')}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;

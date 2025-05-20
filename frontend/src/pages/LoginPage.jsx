import { useState, useRef, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';

const LoginPage = () => {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';
  const usernameInputRef = useRef(null);

  useEffect(() => {
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }

    const handleFocusEvent = () => {
      if (usernameInputRef.current) {
        usernameInputRef.current.focus();
      }
    };

    window.addEventListener('focusUsername', handleFocusEvent);

    return () => {
      window.removeEventListener('focusUsername', handleFocusEvent);
    };
  }, []);

  const handleSubmit = async (values) => {
    try {
      const response = await axios.post('/api/v1/login', {
        username: values.username,
        password: values.password,
      });

      const { token } = response.data;

      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify({ username: values.username }));

      navigate(from, { replace: true });
    } catch {
      setErrorMessage(t('login.authError'));
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />

      <div className="container flex-grow-1 d-flex justify-content-center align-items-center">
        <div className="w-100 d-flex flex-column align-items-center">
          <div style={{ width: '100%', maxWidth: '500px' }}>
            <h1 className="text-center mb-4">{t('login.title')}</h1>

            <Formik
              initialValues={{ username: '', password: '' }}
              onSubmit={handleSubmit}
            >
              {({ handleChange, values }) => (
                <Form>
                  <div className="form-floating mb-3 position-relative">
                    <Field name="username">
                      {({ field }) => (
                        <input
                          {...field}
                          type="text"
                          id="username"
                          className={`form-control ${errorMessage ? 'is-invalid' : ''}`}
                          placeholder=" "
                          onChange={handleChange}
                          value={values.username}
                          ref={usernameInputRef}
                          required
                        />
                      )}
                    </Field>
                    <label htmlFor="username">{t('login.username')}</label>
                  </div>

                  <div className="form-floating mb-3 position-relative">
                    <Field
                      type="password"
                      name="password"
                      id="password"
                      className={`form-control ${errorMessage ? 'is-invalid' : ''}`}
                      placeholder=" "
                      onChange={handleChange}
                      value={values.password}
                      required
                    />
                    <label htmlFor="password">{t('login.password')}</label>
                  </div>

                  {errorMessage && (
                    <div className="text-danger mb-3">{errorMessage}</div>
                  )}

                  <button type="submit" className="btn btn-primary w-100">
                    {t('login.submit')}
                  </button>
                </Form>
              )}
            </Formik>

            <p className="text-center mt-3">
              {t('login.noAccount')} 
              <Link to="/signup">{t('login.signup')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

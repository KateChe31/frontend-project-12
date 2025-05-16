import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { useLocation } from 'react-router-dom';

const LoginPage = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Возвращаемся туда, откуда пришли, либо на "/"
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (values) => {
    try {
      const response = await axios.post('/api/v1/login', {
        username: values.username,
        password: values.password,
      });
  
      const { token } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ username: values.username }));
  
      navigate(from, { replace: true });
    } catch {
      setErrorMessage('Неверные имя пользователя или пароль');
    }    
  };  

  return (
    <div className="container min-vh-100 d-flex justify-content-center align-items-center">
      <div className="w-100 d-flex flex-column align-items-center">
        <div style={{ width: '100%', maxWidth: '500px' }}>
          <h1 className="text-center mb-4">Войти</h1>

          <Formik
            initialValues={{ username: '', password: '' }}
            onSubmit={handleSubmit}
          >
            {({ handleChange, values }) => (
              <Form>
                {/* Поле "Ваш ник" */}
                <div className="form-floating mb-3 position-relative">
                <Field
                  type="text"
                  name="username"
                  id="username"
                  className={`form-control ${errorMessage ? 'is-invalid' : ''}`}
                  placeholder=" "
                  onChange={handleChange}
                  value={values.username}
                  required
                />
                <label htmlFor="username">Ваш ник</label>
                </div>

                {/* Поле "Пароль" */}
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
                  <label htmlFor="password">Пароль</label>
                </div>

                {/* Сообщение об ошибке */}
                {errorMessage && (
                  <div className="text-danger mb-3">{errorMessage}</div>
                )}

                {/* Кнопка отправки формы */}
                <button type="submit" className="btn btn-primary w-100">
                  Войти
                </button>
              </Form>
            )}
          </Formik>

          {/* Ссылка на регистрацию */}
          <p className="text-center mt-3">
            Нет аккаунта? <a href="/register">Регистрация</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

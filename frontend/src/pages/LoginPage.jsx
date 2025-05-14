import React from 'react';
import { Formik, Form, Field } from 'formik';

const LoginPage = () => {
  return (
    <div className="container min-vh-100 d-flex justify-content-center align-items-center">
      <div className="w-100 d-flex flex-column align-items-center">
        <div style={{ width: '100%', maxWidth: '500px' }}>
          <h1 className="text-center mb-4">Войти</h1>
          <Formik
            initialValues={{ username: '', password: '' }}
            onSubmit={(values) => {
              console.log('Форма отправлена:', values);
            }}
          >
            {({ handleChange, values }) => (
              <Form>
                {/* Поле "Ваш ник" */}
                <div className="form-floating mb-3">
                  <Field
                    type="text"
                    name="username"
                    id="username"
                    className="form-control"
                    placeholder=" "
                    onChange={handleChange}
                    value={values.username}
                  />
                  <label htmlFor="username">Ваш ник</label>
                </div>

                {/* Поле "Пароль" */}
                <div className="form-floating mb-3">
                  <Field
                    type="password"
                    name="password"
                    id="password"
                    className="form-control"
                    placeholder=" "
                    onChange={handleChange}
                    value={values.password}
                  />
                  <label htmlFor="password">Пароль</label>
                </div>

                {/* Кнопка */}
                <button type="submit" className="btn btn-primary w-100">
                  Войти
                </button>
              </Form>
            )}
          </Formik>

          <p className="text-center mt-3">
            Нет аккаунта? <a href="/register">Регистрация</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

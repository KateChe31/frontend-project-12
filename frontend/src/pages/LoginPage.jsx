import { useState, useRef, useEffect } from 'react'
import { Formik, Form, Field } from 'formik'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import { loginRequest } from '../api/chatApi'

const LoginPage = () => {
  const { t } = useTranslation()
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const usernameInputRef = useRef(null)

  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    usernameInputRef.current?.focus()

    const handleFocusEvent = () => {
      usernameInputRef.current?.focus()
    }

    window.addEventListener('focusUsername', handleFocusEvent)
    return () => {
      window.removeEventListener('focusUsername', handleFocusEvent)
    }
  }, [])

  const handleSubmit = async (values) => {
    try {
      const { token } = await loginRequest(values)
      sessionStorage.setItem('token', token)
      sessionStorage.setItem('user', JSON.stringify({ username: values.username }))
      navigate(from, { replace: true })
    }
    catch {
      setErrorMessage(t('login.authError'))
    }
  }

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />

      <div className="container flex-grow-1 d-flex justify-content-center align-items-center">
        <div className="row w-100 justify-content-center align-items-center">

          <div className="col-md-6 d-none d-md-flex justify-content-center">
            <img
              src="/login.svg"
              alt="Login illustration"
              className="img-fluid"
              style={{ maxHeight: '400px' }}
            />
          </div>

          <div className="col-12 col-md-6 col-lg-4">
            <h1 className="text-center mb-4">{t('login.title')}</h1>

            <Formik initialValues={{ username: '', password: '' }} onSubmit={handleSubmit}>
              {({ handleChange, values }) => (
                <Form>
                  <div className="form-floating mb-3">
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

                  <div className="form-floating mb-3">
                    <Field name="password">
                      {({ field }) => (
                        <input
                          {...field}
                          type="password"
                          id="password"
                          className={`form-control ${errorMessage ? 'is-invalid' : ''}`}
                          placeholder=" "
                          onChange={handleChange}
                          value={values.password}
                          required
                        />
                      )}
                    </Field>
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
  )
}

export default LoginPage

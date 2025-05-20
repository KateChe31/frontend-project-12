import { Routes, Route } from 'react-router-dom'
import './App.css'

import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import NotFoundPage from './pages/NotFoundPage'
import PrivateRoute from './components/PrivateRoute'
import ChatPage from './pages/ChatPage'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={(
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          )}
        />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/signup" element={<SignupPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Контейнер для всплывающих уведомлений */}
      <ToastContainer
        position="top-right"
        autoClose={6000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  )
}

export default App

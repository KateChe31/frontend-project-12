import { Routes, Route } from 'react-router-dom';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import PrivateRoute from './components/PrivateRoute';

function HomePage() {
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <p>Это заглушка. Позже тут будет чат.</p>
    </>
  );
}

function App() {
  return (
    <Routes>
      {/* Защищённая страница, доступ только с токеном */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        }
      />
      
      {/* Страница логина */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Страница 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;

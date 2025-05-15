import { Routes, Route } from 'react-router-dom';
import './App.css';

import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import PrivateRoute from './components/PrivateRoute';
import ChatPage from './pages/ChatPage'; // ⬅️ Импорт нового компонента

function App() {
  return (
    <Routes>
      {/* Защищённая страница, доступ только с токеном */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <ChatPage /> {/* ⬅️ Тут была HomePage, теперь ChatPage */}
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

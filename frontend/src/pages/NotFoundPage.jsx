import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div>
      <h1>404 — Страница не найдена</h1>
      <p>Кажется, вы заблудились 🙃</p>
      <Link to="/">Вернуться назад</Link>
    </div>
  );
};

export default NotFoundPage;

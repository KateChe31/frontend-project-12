import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t } = useTranslation();

  const token = localStorage.getItem('token');
  const targetPath = token ? '/' : '/login';
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleHexletChatClick = () => {
    if (location.pathname === '/login') {
      const event = new Event('focusUsername');
      window.dispatchEvent(event);
    }
  };

  return (
    <header className="py-3 px-4 border-bottom">
      <div className="d-flex align-items-center">
        <Link
          to={targetPath}
          className="text-decoration-none fs-4 fw-bold text-primary"
          onClick={handleHexletChatClick}
          style={{ flexGrow: 0 }}
        >
          {t('header.appName')}
        </Link>

        <div style={{ marginLeft: 'auto' }}>
          {token && (
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={handleLogout}
            >
              {t('header.logout')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

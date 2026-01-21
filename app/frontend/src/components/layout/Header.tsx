import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Wrench, 
  MessageSquare, 
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import './Header.css';

interface HeaderProps {
  isAuthenticated?: boolean;
  userName?: string;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  isAuthenticated = false, 
  userName = 'Гость',
  onLogout 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', label: 'Главная', icon: <Home size={20} /> },
    { path: '/requests', label: 'Заявки', icon: <Wrench size={20} /> },
    { path: '/chats', label: 'Чаты', icon: <MessageSquare size={20} /> },
  ];

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/auth');
  };

  const handleAccountClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Логотип */}
        <Link to="/" className="logo">
          <div className="logo-icon">
            <Wrench size={28} className="logo-icon-svg" />
          </div>
          <div className="logo-text">
            <h1 className="logo-title">МастерОК</h1>
            <p className="logo-subtitle">Решаем бытовые проблемы вместе</p>
          </div>
        </Link>

        {/* Навигация для десктопа */}
        <nav className="nav-desktop">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Правая часть */}
        <div className="header-actions">
          <button
            className="account-button"
            onClick={handleAccountClick}
            title={isAuthenticated ? 'Личный кабинет' : 'Войти в систему'}
          >
            <User size={22} />
            <span className="account-text">
              {isAuthenticated ? userName : 'Войти'}
            </span>
          </button>

          {isAuthenticated && (
            <button
              className="logout-button"
              onClick={handleLogout}
              title="Выйти"
            >
              <LogOut size={20} />
            </button>
          )}

          {/* Кнопка меню для мобильных */}
          <button
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Меню"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Мобильное меню */}
        <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
          <nav className="nav-mobile">
            <ul className="nav-list-mobile">
              {navItems.map((item) => (
                <li key={item.path} className="nav-item-mobile">
                  <Link
                    to={item.path}
                    className={`nav-link-mobile ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="nav-icon-mobile">{item.icon}</span>
                    <span className="nav-label-mobile">{item.label}</span>
                  </Link>
                </li>
              ))}
              
              {isAuthenticated ? (
                <>
                  <li className="nav-item-mobile">
                    <button
                      className="nav-link-mobile"
                      onClick={() => {
                        navigate('/dashboard');
                        setIsMenuOpen(false);
                      }}
                    >
                      <span className="nav-icon-mobile">
                        <User size={20} />
                      </span>
                      <span className="nav-label-mobile">Личный кабинет</span>
                    </button>
                  </li>
                  <li className="nav-item-mobile">
                    <button
                      className="nav-link-mobile logout"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      <span className="nav-icon-mobile">
                        <LogOut size={20} />
                      </span>
                      <span className="nav-label-mobile">Выйти</span>
                    </button>
                  </li>
                </>
              ) : (
                <li className="nav-item-mobile">
                  <button
                    className="nav-link-mobile"
                    onClick={() => {
                      navigate('/auth');
                      setIsMenuOpen(false);
                    }}
                  >
                    <span className="nav-icon-mobile">
                      <User size={20} />
                    </span>
                    <span className="nav-label-mobile">Войти / Регистрация</span>
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
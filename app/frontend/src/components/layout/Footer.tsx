import React from 'react';
import { Phone, Mail, MapPin, Clock, Shield, Heart } from 'lucide-react';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-wave">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path 
            fill="rgba(250, 248, 240, 0.8)" 
            fillOpacity="1" 
            d="M0,224L48,218.7C96,213,192,203,288,197.3C384,192,480,192,576,202.7C672,213,768,235,864,234.7C960,235,1056,213,1152,192C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      <div className="footer-container">
        <div className="footer-content">
          {/* Блок о компании */}
          <div className="footer-section">
            <div className="footer-logo">
              <div className="footer-logo-icon">
                <Shield size={32} />
              </div>
              <h3 className="footer-logo-text">МастерОК</h3>
            </div>
            <p className="footer-description">
              Онлайн-платформа для быстрого и надежного ремонта бытовой техники. 
              Соединяем клиентов с проверенными мастерами с 2026 года.
            </p>
            <div className="footer-trust">
              <Heart size={18} className="footer-trust-icon" />
              <span>Более 1000 довольных клиентов</span>
            </div>
          </div>

          {/* Контакты */}
          <div className="footer-section">
            <h4 className="footer-title">Контакты</h4>
            <div className="contact-list">
              <a href="tel:+79132775883" className="contact-item">
                <div className="contact-icon-wrapper">
                  <Phone size={20} className="contact-icon" />
                </div>
                <div className="contact-info">
                  <span className="contact-label">Телефон</span>
                  <span className="contact-value">+7 913 277 58 83</span>
                </div>
              </a>

              <a href="mailto:slava.nikitin.200666@mail.ru" className="contact-item">
                <div className="contact-icon-wrapper">
                  <Mail size={20} className="contact-icon" />
                </div>
                <div className="contact-info">
                  <span className="contact-label">Почта</span>
                  <span className="contact-value">slava.nikitin.200666@mail.ru</span>
                </div>
              </a>

              <div className="contact-item">
                <div className="contact-icon-wrapper">
                  <MapPin size={20} className="contact-icon" />
                </div>
                <div className="contact-info">
                  <span className="contact-label">Адрес</span>
                  <span className="contact-value">г. Барнаул, ул. Промышленная, дом 4</span>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon-wrapper">
                  <Clock size={20} className="contact-icon" />
                </div>
                <div className="contact-info">
                  <span className="contact-label">Режим работы</span>
                  <span className="contact-value">Ежедневно 8:00 - 22:00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Быстрые ссылки */}
          <div className="footer-section">
            <h4 className="footer-title">Навигация</h4>
            <ul className="footer-links">
              <li>
                <a href="/" className="footer-link">
                  <span className="link-dot"></span>
                  Главная
                </a>
              </li>
              <li>
                <a href="/requests" className="footer-link">
                  <span className="link-dot"></span>
                  Заявки
                </a>
              </li>
              <li>
                <a href="/chats" className="footer-link">
                  <span className="link-dot"></span>
                  Чаты
                </a>
              </li>
              <li>
                <a href="/auth" className="footer-link">
                  <span className="link-dot"></span>
                  Вход/Регистрация
                </a>
              </li>
              <li>
                <a href="/dashboard" className="footer-link">
                  <span className="link-dot"></span>
                  Личный кабинет
                </a>
              </li>
            </ul>
          </div>

          {/* География работы */}
          <div className="footer-section">
            <h4 className="footer-title">География работы</h4>
            <div className="locations">
              <div className="location-item">
                <div className="location-dot"></div>
                <span>Барнаул (все районы)</span>
              </div>
              <div className="location-item">
                <div className="location-dot"></div>
                <span>Пос. Южный</span>
              </div>
              <div className="location-item">
                <div className="location-dot"></div>
                <span>Научный городок</span>
              </div>
              <div className="location-item">
                <div className="location-dot"></div>
                <span>Новоалтайск</span>
              </div>
            </div>
          </div>
        </div>

        {/* Копирайт */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} МастерОК. Все права защищены.
            </p>
            <div className="footer-bottom-links">
              <a href="/privacy" className="bottom-link">Политика конфиденциальности</a>
              <a href="/terms" className="bottom-link">Пользовательское соглашение</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
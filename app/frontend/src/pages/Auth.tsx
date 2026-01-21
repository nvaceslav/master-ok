import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Phone, 
  User, 
  Building, 
  Mail, 
  Lock, 
  Clock,
  AlertCircle,
  CheckCircle,
  Shield,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import './Auth.css';
import { useAppDispatch, useAppSelector } from '../hooks';
import { sendLoginCode, verifyLogin, sendRegisterCode, verifyRegister, clearError } from '../store/slices/authSlice';

// Типы для форм
interface RegisterForm {
  phone: string;
  role: 'client' | 'master';
  name: string;
  city: string;
  code?: string;
}

interface LoginForm {
  phone: string;
  code?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: any;
}

// Базовый URL для API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'form' | 'code'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Формы
  const [loginForm, setLoginForm] = useState<LoginForm>({ phone: '' });
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    phone: '',
    role: 'client',
    name: '',
    city: 'Барнаул'
  });

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, []);

  // Обработчик обратного отсчёта
  useEffect(() => {
    if (countdown > 0) {
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) {
              clearInterval(countdownRef.current);
              countdownRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [countdown]);

  // Проверка токена при загрузке
  useEffect(() => {
    const token = localStorage.getItem('masterok_token');
    const user = localStorage.getItem('masterok_user');
    
    if (token && user) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Валидация номера телефона
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(\+7|8)[\d]{10}$/;
    return phoneRegex.test(phone);
  };

  // Проверка телефона для кнопки
  const isPhoneValidForButton = (): boolean => {
    const phone = activeTab === 'login' ? loginForm.phone : registerForm.phone;
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 11; // +7 и 10 цифр
  };

  // Форматирование номера телефона
  const formatPhone = (value: string): string => {
    let numbers = value.replace(/\D/g, '');
    
    if (numbers.startsWith('8')) {
      numbers = '7' + numbers.slice(1);
    }
    
    if (numbers.startsWith('7')) {
      return `+7${numbers.slice(1, 4)}${numbers.slice(4, 7)}${numbers.slice(7, 9)}${numbers.slice(9, 11)}`;
    }
    
    return value;
  };

  // Обработчик изменения номера телефона
  const handlePhoneChange = (value: string, isRegister: boolean = false) => {
    const formatted = formatPhone(value);
    
    if (isRegister) {
      setRegisterForm({ ...registerForm, phone: formatted });
    } else {
      setLoginForm({ ...loginForm, phone: formatted });
    }
    
    setError(null);
  };

  // Отправка кода для входа
  const sendLoginCode = async () => {
    if (!validatePhone(loginForm.phone)) {
      setError('Введите корректный номер телефона');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/auth/login/send-code`,
        { phone: loginForm.phone }
      );

      if (response.data.success) {
        setStep('code');
        setSuccess('Код отправлен на ваш телефон');
        setCountdown(60);
      } else {
        setError(response.data.message || 'Ошибка отправки кода');
      }
    } catch (err: any) {
      if (err.response) {
        const errorMessage = err.response.data?.message || 'Ошибка сервера';
        setError(errorMessage);
        
        if (err.response.status === 404) {
          setError('Сервер не отвечает. Проверьте, запущен ли бэкенд на http://localhost:8000');
        }
      } else if (err.request) {
        setError('Сервер не отвечает. Проверьте, запущен ли бэкенд на http://localhost:8000');
      } else {
        setError('Ошибка при отправке запроса: ' + err.message);
      }
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Отправка кода для регистрации
  const sendRegisterCode = async () => {
    if (!validatePhone(registerForm.phone)) {
      setError('Введите корректный номер телефона');
      return;
    }

    if (!registerForm.name.trim()) {
      setError('Введите ваше имя');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/auth/register/send-code`,
        { 
          phone: registerForm.phone,
          role: registerForm.role
        }
      );

      if (response.data.success) {
        setStep('code');
        setSuccess('Код отправлен на ваш телефон');
        setCountdown(60);
      } else {
        setError(response.data.message || 'Ошибка отправки кода');
      }
    } catch (err: any) {
      if (err.response) {
        const errorMessage = err.response.data?.message || 'Ошибка сервера';
        setError(errorMessage);
        
        if (err.response.status === 404) {
          setError('Сервер не отвечает. Проверьте, запущен ли бэкенд на http://localhost:8000');
        }
      } else if (err.request) {
        setError('Сервер не отвечает. Проверьте, запущен ли бэкенд на http://localhost:8000');
      } else {
        setError('Ошибка при отправке запроса: ' + err.message);
      }
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Подтверждение входа
  const verifyLogin = async () => {
    if (!loginForm.code || loginForm.code.length !== 4) {
      setError('Введите 4-значный код');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/auth/login/verify`,
        { 
          phone: loginForm.phone,
          code: loginForm.code
        }
      );

      if (response.data.success && response.data.token) {
        localStorage.setItem('masterok_token', response.data.token);
        localStorage.setItem('masterok_user', JSON.stringify(response.data.user));
        
        setSuccess('Успешный вход! Перенаправление...');
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError(response.data.message || 'Ошибка входа');
      }
    } catch (err: any) {
      if (err.response) {
        const errorMessage = err.response.data?.message || 'Ошибка сервера';
        setError(errorMessage);
      } else if (err.request) {
        setError('Сервер не отвечает. Проверьте, запущен ли бэкенд на http://localhost:8000');
      } else {
        setError('Ошибка при отправке запроса: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Подтверждение регистрации
  const verifyRegister = async () => {
    if (!registerForm.code || registerForm.code.length !== 4) {
      setError('Введите 4-значный код');
      return;
    }

    if (!registerForm.name.trim()) {
      setError('Введите ваше имя');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/auth/register/verify`,
        { 
          phone: registerForm.phone,
          code: registerForm.code,
          name: registerForm.name,
          city: registerForm.city
        }
      );

      if (response.data.success && response.data.token) {
        localStorage.setItem('masterok_token', response.data.token);
        localStorage.setItem('masterok_user', JSON.stringify(response.data.user));
        
        setSuccess('Регистрация успешна! Перенаправление...');
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError(response.data.message || 'Ошибка регистрации');
      }
    } catch (err: any) {
      if (err.response) {
        const errorMessage = err.response.data?.message || 'Ошибка сервера';
        setError(errorMessage);
      } else if (err.request) {
        setError('Сервер не отвечает. Проверьте, запущен ли бэкенд на http://localhost:8000');
      } else {
        setError('Ошибка при отправке запроса: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Повторная отправка кода
  const resendCode = async () => {
    if (countdown > 0) return;
    
    if (activeTab === 'login') {
      await sendLoginCode();
    } else {
      await sendRegisterCode();
    }
  };

  // Сброс формы
  const resetForm = () => {
    setStep('form');
    setError(null);
    setSuccess(null);
    setCountdown(0);
    setLoginForm({ phone: '' });
    setRegisterForm({
      phone: '',
      role: 'client',
      name: '',
      city: 'Барнаул'
    });
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 'form') {
      if (activeTab === 'login') {
        await sendLoginCode();
      } else {
        await sendRegisterCode();
      }
    } else {
      if (activeTab === 'login') {
        await verifyLogin();
      } else {
        await verifyRegister();
      }
    }
  };

  // Список городов
  const cities = [
    'Барнаул',
    'Пос. Южный',
    'Научный городок',
    'Новоалтайск',
    'Бийск',
    'Рубцовск'
  ];

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Левая часть - информация */}
        <div className="auth-info">
          <div className="auth-info-content">
            <div className="logo-section">
              <div className="logo-icon">
                <Shield size={48} />
              </div>
              <h1 className="logo-title">МастерОК</h1>
              <p className="logo-subtitle">Решаем бытовые проблемы вместе</p>
            </div>
            
            <div className="features">
              <div className="feature">
                <div className="feature-icon">
                  <CheckCircle size={24} />
                </div>
                <div className="feature-text">
                  <h4>Быстрая регистрация</h4>
                  <p>Только номер телефона и SMS-код</p>
                </div>
              </div>
              
              <div className="feature">
                <div className="feature-icon">
                  <Shield size={24} />
                </div>
                <div className="feature-text">
                  <h4>Безопасность</h4>
                  <p>Ваши данные под защитой</p>
                </div>
              </div>
              
              <div className="feature">
                <div className="feature-icon">
                  <User size={24} />
                </div>
                <div className="feature-text">
                  <h4>Два аккаунта</h4>
                  <p>Для клиентов и мастеров</p>
                </div>
              </div>
            </div>
            
            <div className="stats">
              <div className="stat">
                <span className="stat-number">1000+</span>
                <span className="stat-label">довольных клиентов</span>
              </div>
              <div className="stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">проверенных мастеров</span>
              </div>
            </div>
          </div>
        </div>

        {/* Правая часть - форма */}
        <div className="auth-form-container">
          <div className="auth-form-wrapper">
            <div className="form-header">
              <h2 className="form-title">
                {activeTab === 'login' ? 'Вход в систему' : 'Регистрация'}
              </h2>
              <p className="form-subtitle">
                {step === 'form' 
                  ? (activeTab === 'login' 
                      ? 'Введите номер телефона для входа' 
                      : 'Заполните данные для регистрации')
                  : 'Введите код из SMS'}
              </p>
            </div>

            {/* Переключатель вкладок */}
            {step === 'form' && (
              <div className="tabs">
                <button
                  className={`tab ${activeTab === 'login' ? 'active' : ''}`}
                  onClick={() => setActiveTab('login')}
                >
                  Вход
                </button>
                <button
                  className={`tab ${activeTab === 'register' ? 'active' : ''}`}
                  onClick={() => setActiveTab('register')}
                >
                  Регистрация
                </button>
              </div>
            )}

            {/* Сообщения об ошибках и успехе */}
            {error && (
              <div className="alert error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert success">
                <CheckCircle size={20} />
                <span>{success}</span>
              </div>
            )}

            {/* Форма */}
            <form onSubmit={handleSubmit} className="auth-form">
              {/* Шаг 1: Ввод данных */}
              {step === 'form' ? (
                <>
                  {/* Поле телефона */}
                  <div className="form-group">
                    <label className="form-label">
                      <Phone size={20} />
                      <span>Номер телефона</span>
                    </label>
                    <div className="phone-input">
                      <span className="phone-prefix">+7</span>
                      <input
                        type="tel"
                        value={activeTab === 'login' ? loginForm.phone.slice(2) : registerForm.phone.slice(2)}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          const fullNumber = `+7${value}`;
                          handlePhoneChange(fullNumber, activeTab === 'register');
                        }}
                        placeholder="999 123 45 67"
                        maxLength={10}
                        className="form-input"
                        disabled={loading}
                        required
                      />
                    </div>
                    <p className="form-hint">Формат: +7 XXX XXX XX XX</p>
                  </div>

                  {/* Дополнительные поля для регистрации */}
                  {activeTab === 'register' && (
                    <>
                      {/* Выбор роли */}
                      <div className="form-group">
                        <label className="form-label">
                          <User size={20} />
                          <span>Выберите роль</span>
                        </label>
                        <div className="role-selector">
                          <button
                            type="button"
                            className={`role-option ${registerForm.role === 'client' ? 'selected' : ''}`}
                            onClick={() => setRegisterForm({ ...registerForm, role: 'client' })}
                            disabled={loading}
                          >
                            <div className="role-icon">
                              <User size={24} />
                            </div>
                            <div className="role-info">
                              <span className="role-title">Клиент</span>
                              <span className="role-desc">Ищу мастера для ремонта</span>
                            </div>
                          </button>
                          
                          <button
                            type="button"
                            className={`role-option ${registerForm.role === 'master' ? 'selected' : ''}`}
                            onClick={() => setRegisterForm({ ...registerForm, role: 'master' })}
                            disabled={loading}
                          >
                            <div className="role-icon">
                              <Shield size={24} />
                            </div>
                            <div className="role-info">
                              <span className="role-title">Мастер</span>
                              <span className="role-desc">Предоставляю услуги ремонта</span>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Имя */}
                      <div className="form-group">
                        <label className="form-label">
                          <User size={20} />
                          <span>Ваше имя</span>
                        </label>
                        <input
                          type="text"
                          value={registerForm.name}
                          onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                          placeholder="Иван Иванов"
                          className="form-input"
                          disabled={loading}
                          required
                        />
                      </div>

                      {/* Город */}
                      <div className="form-group">
                        <label className="form-label">
                          <Building size={20} />
                          <span>Город</span>
                        </label>
                        <select
                          value={registerForm.city}
                          onChange={(e) => setRegisterForm({ ...registerForm, city: e.target.value })}
                          className="form-input"
                          disabled={loading}
                          required
                        >
                          {cities.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </>
              ) : (
                /* Шаг 2: Ввод кода */
                <>
                  <div className="code-step">
                    <div className="code-info">
                      <div className="code-icon">
                        <Mail size={48} />
                      </div>
                      <h3>Проверочный код</h3>
                      <p>
                        Мы отправили SMS на номер{' '}
                        <strong>
                          {activeTab === 'login' ? loginForm.phone : registerForm.phone}
                        </strong>
                      </p>
                    </div>

                    {/* Поле для кода */}
                    <div className="form-group">
                      <label className="form-label">
                        <Lock size={20} />
                        <span>4-значный код из SMS</span>
                      </label>
                      <div className="code-inputs">
                        {[0, 1, 2, 3].map((index) => (
                          <input
                            key={index}
                            type="text"
                            maxLength={1}
                            value={
                              (activeTab === 'login' ? loginForm.code : registerForm.code)?.charAt(index) || ''
                            }
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value) {
                                const currentCode = activeTab === 'login' 
                                  ? loginForm.code || '' 
                                  : registerForm.code || '';
                                
                                const newCode = currentCode.split('');
                                newCode[index] = value;
                                const finalCode = newCode.join('');
                                
                                if (activeTab === 'login') {
                                  setLoginForm({ ...loginForm, code: finalCode });
                                } else {
                                  setRegisterForm({ ...registerForm, code: finalCode });
                                }
                                
                                // Автоматическое перемещение к следующему полю
                                if (value && index < 3) {
                                  const nextInput = document.querySelector(
                                    `.code-inputs input:nth-child(${index + 2})`
                                  ) as HTMLInputElement;
                                  nextInput?.focus();
                                }
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Backspace' && !e.currentTarget.value) {
                                const prevInput = document.querySelector(
                                  `.code-inputs input:nth-child(${index})`
                                ) as HTMLInputElement;
                                prevInput?.focus();
                              }
                            }}
                            className="code-input"
                            disabled={loading}
                            required
                          />
                        ))}
                      </div>
                    </div>

                    {/* Таймер обратного отсчёта */}
                    <div className="countdown-section">
                      {countdown > 0 ? (
                        <div className="countdown">
                          <Clock size={16} />
                          <span>Запросить новый код через {countdown} сек</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={resendCode}
                          className="resend-button"
                          disabled={loading}
                        >
                          <RefreshCw size={16} />
                          <span>Отправить код повторно</span>
                        </button>
                      )}
                    </div>

                    {/* Кнопка назад */}
                    <button
                      type="button"
                      onClick={resetForm}
                      className="back-button"
                      disabled={loading}
                    >
                      ← Изменить номер телефона
                    </button>
                  </div>
                </>
              )}

              {/* Кнопка отправки */}
              <button
                type="submit"
                className="submit-button"
                disabled={loading || 
                  (step === 'form' && !isPhoneValidForButton()) || 
                  (step === 'code' && (
                    activeTab === 'login' 
                      ? !loginForm.code || loginForm.code.length !== 4
                      : !registerForm.code || registerForm.code.length !== 4
                  ))
                }
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    <span>Отправка...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {step === 'form' 
                        ? (activeTab === 'login' ? 'Получить код' : 'Зарегистрироваться')
                        : (activeTab === 'login' ? 'Войти' : 'Завершить регистрацию')}
                    </span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              {/* Ссылки внизу */}
              <div className="form-footer">
                {step === 'form' ? (
                  <>
                    <p className="footer-text">
                      {activeTab === 'login' 
                        ? 'Нет аккаунта? ' 
                        : 'Уже есть аккаунт? '}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab(activeTab === 'login' ? 'register' : 'login');
                          setError(null);
                        }}
                        className="footer-link"
                      >
                        {activeTab === 'login' ? 'Зарегистрироваться' : 'Войти'}
                      </button>
                    </p>
                  </>
                ) : (
                  <p className="footer-text">
                    Не получили код? Проверьте правильность номера или{' '}
                    <button
                      type="button"
                      onClick={resendCode}
                      className="footer-link"
                      disabled={countdown > 0}
                    >
                      отправьте повторно
                    </button>
                  </p>
                )}
                
                <p className="terms">
                  Нажимая кнопку, вы соглашаетесь с{' '}
                  <a href="/terms" className="terms-link">
                    условиями использования
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
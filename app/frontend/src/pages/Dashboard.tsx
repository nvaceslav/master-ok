import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Filter, 
  Search, 
  User, 
  Briefcase, 
  BarChart3,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Upload,
  X
} from 'lucide-react';
import RequestCard from '../components/requests/RequestCard';
import './Dashboard.css';

// Типы
interface UserData {
  id: number;
  name: string;
  phone: string;
  role: 'client' | 'master' | 'admin';
  avatar?: string;
  city?: string;
  rating: number;
  completed_orders: number;
}

interface Request {
  id: number;
  title: string;
  description: string;
  type: string;
  district: string;
  budget?: number;
  status: 'new' | 'searching' | 'in_progress' | 'completed' | 'cancelled';
  clientName: string;
  clientPhone?: string;
  createdAt: string;
  photos?: string[];
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'stats'>('overview');
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Состояние для формы создания заявки
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    type: 'other',
    brand: '',
    model: '',
    address: '',
    district: 'Центральный',
    budget: '',
    photos: [] as File[]
  });

  // Заявки клиента
  const [clientRequests, setClientRequests] = useState<Request[]>([]);
  
  // Доступные заявки для мастера
  const [availableRequests, setAvailableRequests] = useState<Request[]>([]);
  
  // Фильтры для мастера
  const [filters, setFilters] = useState({
    type: 'all',
    district: 'all',
    minBudget: '',
    maxBudget: ''
  });

  // Загрузка данных пользователя
  useEffect(() => {
    const loadUserData = () => {
      const userData = localStorage.getItem('masterok_user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          // Загружаем соответствующие заявки
          if (parsedUser.role === 'client') {
            loadClientRequests(parsedUser.id);
          } else if (parsedUser.role === 'master') {
            loadAvailableRequests();
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      setLoading(false);
    };

    loadUserData();
  }, []);

  // Загрузка заявок клиента
  const loadClientRequests = (userId: number) => {
    // Временные данные для демонстрации
    const mockRequests: Request[] = [
      {
        id: 1,
        title: 'Ремонт холодильника LG',
        description: 'Холодильник не морозит, слышен гул компрессора. Нужна диагностика и ремонт.',
        type: 'refrigerator',
        district: 'Центральный',
        budget: 3000,
        status: 'in_progress',
        clientName: 'Иван Иванов',
        clientPhone: '+79131112233',
        createdAt: '2024-01-20T10:30:00'
      },
      {
        id: 2,
        title: 'Установка кондиционера',
        description: 'Нужна установка настенного кондиционера в комнате 20 кв.м.',
        type: 'other',
        district: 'Ленинский',
        budget: 5000,
        status: 'new',
        clientName: 'Иван Иванов',
        clientPhone: '+79131112233',
        createdAt: '2024-01-19T14:20:00'
      },
      {
        id: 3,
        title: 'Ремонт посудомоечной машины',
        description: 'Не сливает воду после цикла мойки. Нужна диагностика.',
        type: 'dishwasher',
        district: 'Октябрьский',
        budget: 2500,
        status: 'completed',
        clientName: 'Иван Иванов',
        clientPhone: '+79131112233',
        createdAt: '2024-01-18T09:15:00'
      }
    ];
    setClientRequests(mockRequests);
  };

  // Загрузка доступных заявок для мастера
  const loadAvailableRequests = () => {
    // Временные данные для демонстрации
    const mockRequests: Request[] = [
      {
        id: 4,
        title: 'Ремонт стиральной машины',
        description: 'Не крутится барабан, слышен гул двигателя. Модель Indesit IWSC 5105.',
        type: 'washing_machine',
        district: 'Центральный',
        budget: 2800,
        status: 'new',
        clientName: 'Мария Петрова',
        clientPhone: '+79132223344',
        createdAt: '2024-01-20T11:00:00'
      },
      {
        id: 5,
        title: 'Установка духового шкафа',
        description: 'Нужна установка встраиваемого духового шкафа Bosch.',
        type: 'oven',
        district: 'Железнодорожный',
        budget: 1800,
        status: 'new',
        clientName: 'Алексей Смирнов',
        clientPhone: '+79133334455',
        createdAt: '2024-01-20T10:15:00'
      },
      {
        id: 6,
        title: 'Ремонт компьютера',
        description: 'Компьютер не включается. Мигает индикатор питания. Нужна диагностика.',
        type: 'computer',
        district: 'Индустриальный',
        budget: 1500,
        status: 'new',
        clientName: 'Дмитрий Козлов',
        clientPhone: '+79134445566',
        createdAt: '2024-01-19T16:30:00'
      }
    ];
    setAvailableRequests(mockRequests);
  };

  // Обработчик создания заявки
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    if (!newRequest.title.trim() || !newRequest.description.trim()) {
      alert('Заполните обязательные поля');
      return;
    }

    try {
      // Здесь будет запрос к API
      console.log('Создание заявки:', newRequest);
      
      // Временный успех
      alert('Заявка успешно создана!');
      
      // Очистка формы и закрытие
      setNewRequest({
        title: '',
        description: '',
        type: 'other',
        brand: '',
        model: '',
        address: '',
        district: 'Центральный',
        budget: '',
        photos: []
      });
      setIsCreateFormOpen(false);
      
      // Обновление списка заявок
      if (user?.role === 'client') {
        loadClientRequests(user.id);
      }
    } catch (error) {
      console.error('Ошибка создания заявки:', error);
      alert('Ошибка при создании заявки');
    }
  };

  // Обработчик отклика мастера на заявку
  const handleRespondToRequest = async (requestId: number) => {
    try {
      // Здесь будет запрос к API
      console.log('Отклик на заявку:', requestId);
      
      alert('Отклик успешно отправлен!');
      
      // Обновление списка доступных заявок
      setAvailableRequests(prev => 
        prev.filter(req => req.id !== requestId)
      );
    } catch (error) {
      console.error('Ошибка отклика:', error);
      alert('Ошибка при отправке отклика');
    }
  };

  // Обработчик загрузки фото
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos = Array.from(files).slice(0, 5); // Максимум 5 фото
      setNewRequest(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos]
      }));
    }
  };

  // Удаление фото
  const handleRemovePhoto = (index: number) => {
    setNewRequest(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  // Фильтрация заявок для мастера
  const filteredRequests = availableRequests.filter(request => {
    if (filters.type !== 'all' && request.type !== filters.type) return false;
    if (filters.district !== 'all' && request.district !== filters.district) return false;
    if (filters.minBudget && (request.budget || 0) < Number(filters.minBudget)) return false;
    if (filters.maxBudget && (request.budget || 0) > Number(filters.maxBudget)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard-error">
        <AlertCircle size={48} />
        <h3>Пользователь не авторизован</h3>
        <p>Пожалуйста, войдите в систему</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Шапка дашборда */}
      <div className="dashboard-header">
        <div className="user-info">
          <div className="user-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <User size={32} />
            )}
          </div>
          <div className="user-details">
            <h1>Добро пожаловать, {user.name}!</h1>
            <div className="user-stats">
              <span className="user-role">
                <Briefcase size={16} />
                {user.role === 'client' ? 'Клиент' : 'Мастер'}
              </span>
              <span className="user-rating">
                ★ {user.rating.toFixed(1)}
              </span>
              <span className="user-orders">
                <CheckCircle size={16} />
                {user.completed_orders} завершено
              </span>
            </div>
          </div>
        </div>

        {/* Кнопки действий в зависимости от роли */}
        {user.role === 'client' && (
          <button 
            className="create-request-btn"
            onClick={() => setIsCreateFormOpen(true)}
          >
            <Plus size={20} />
            <span>Создать заявку</span>
          </button>
        )}
      </div>

      {/* Основной контент */}
      <div className="dashboard-content">
        {/* Навигация */}
        <div className="dashboard-nav">
          <button 
            className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 size={20} />
            <span>Обзор</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <Briefcase size={20} />
            <span>Заявки</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <BarChart3 size={20} />
            <span>Статистика</span>
          </button>
        </div>

        {/* Контент в зависимости от роли */}
        {user.role === 'client' ? (
          // Дашборд клиента
          <div className="client-dashboard">
            {activeTab === 'overview' && (
              <div className="overview-section">
                <div className="stats-cards">
                  <div className="stat-card">
                    <div className="stat-icon active">
                      <AlertCircle size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>Активные</h3>
                      <p>{clientRequests.filter(r => r.status === 'new' || r.status === 'in_progress').length} заявок</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon completed">
                      <CheckCircle size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>Завершённые</h3>
                      <p>{clientRequests.filter(r => r.status === 'completed').length} заявок</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon pending">
                      <Clock size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>В обработке</h3>
                      <p>{clientRequests.filter(r => r.status === 'in_progress').length} заявок</p>
                    </div>
                  </div>
                </div>

                <div className="recent-requests">
                  <h2>Последние заявки</h2>
                  <div className="requests-list">
                    {clientRequests.slice(0, 3).map(request => (
                      <RequestCard
                        key={request.id}
                        id={request.id}
                        title={request.title}
                        description={request.description}
                        type={request.type}
                        district={request.district}
                        budget={request.budget}
                        status={request.status}
                        clientName={request.clientName}
                        clientPhone={request.clientPhone}
                        createdAt={request.createdAt}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="requests-section">
                <div className="section-header">
                  <h2>Мои заявки</h2>
                  <div className="section-actions">
                    <div className="search-box">
                      <Search size={20} />
                      <input type="text" placeholder="Поиск заявок..." />
                    </div>
                    <select className="filter-select">
                      <option value="all">Все статусы</option>
                      <option value="new">Новые</option>
                      <option value="in_progress">В работе</option>
                      <option value="completed">Завершённые</option>
                    </select>
                  </div>
                </div>
                
                <div className="requests-grid">
                  {clientRequests.length > 0 ? (
                    clientRequests.map(request => (
                      <RequestCard
                        key={request.id}
                        id={request.id}
                        title={request.title}
                        description={request.description}
                        type={request.type}
                        district={request.district}
                        budget={request.budget}
                        status={request.status}
                        clientName={request.clientName}
                        clientPhone={request.clientPhone}
                        createdAt={request.createdAt}
                      />
                    ))
                  ) : (
                    <div className="empty-state">
                      <Briefcase size={48} />
                      <h3>У вас пока нет заявок</h3>
                      <p>Создайте первую заявку на ремонт</p>
                      <button 
                        className="create-btn"
                        onClick={() => setIsCreateFormOpen(true)}
                      >
                        <Plus size={20} />
                        Создать заявку
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="stats-section">
                <h2>Статистика</h2>
                <div className="stats-grid">
                  <div className="stat-item">
                    <h4>Всего заявок</h4>
                    <p className="stat-number">{clientRequests.length}</p>
                  </div>
                  <div className="stat-item">
                    <h4>Средний бюджет</h4>
                    <p className="stat-number">
                      {Math.round(clientRequests.reduce((sum, r) => sum + (r.budget || 0), 0) / clientRequests.length)} ₽
                    </p>
                  </div>
                  <div className="stat-item">
                    <h4>Среднее время выполнения</h4>
                    <p className="stat-number">2.5 дня</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Дашборд мастера
          <div className="master-dashboard">
            {activeTab === 'overview' && (
              <div className="overview-section">
                <div className="available-requests">
                  <div className="section-header">
                    <h2>Доступные заявки</h2>
                    <div className="section-actions">
                      <div className="search-box">
                        <Search size={20} />
                        <input type="text" placeholder="Поиск заявок..." />
                      </div>
                      <button className="filter-btn">
                        <Filter size={20} />
                        Фильтры
                      </button>
                    </div>
                  </div>
                  
                  <div className="filters-panel">
                    <div className="filter-group">
                      <label>Тип техники</label>
                      <select 
                        value={filters.type}
                        onChange={(e) => setFilters({...filters, type: e.target.value})}
                      >
                        <option value="all">Все типы</option>
                        <option value="washing_machine">Стиральные машины</option>
                        <option value="refrigerator">Холодильники</option>
                        <option value="oven">Духовые шкафы</option>
                        <option value="tv">Телевизоры</option>
                        <option value="computer">Компьютеры</option>
                      </select>
                    </div>
                    
                    <div className="filter-group">
                      <label>Район</label>
                      <select 
                        value={filters.district}
                        onChange={(e) => setFilters({...filters, district: e.target.value})}
                      >
                        <option value="all">Все районы</option>
                        <option value="Центральный">Центральный</option>
                        <option value="Ленинский">Ленинский</option>
                        <option value="Октябрьский">Октябрьский</option>
                        <option value="Новоалтайск">Новоалтайск</option>
                      </select>
                    </div>
                    
                    <div className="filter-group">
                      <label>Бюджет</label>
                      <div className="budget-range">
                        <input 
                          type="number" 
                          placeholder="От" 
                          value={filters.minBudget}
                          onChange={(e) => setFilters({...filters, minBudget: e.target.value})}
                        />
                        <span>—</span>
                        <input 
                          type="number" 
                          placeholder="До" 
                          value={filters.maxBudget}
                          onChange={(e) => setFilters({...filters, maxBudget: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="requests-grid">
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map(request => (
                        <RequestCard
                          key={request.id}
                          id={request.id}
                          title={request.title}
                          description={request.description}
                          type={request.type}
                          district={request.district}
                          budget={request.budget}
                          status={request.status}
                          clientName={request.clientName}
                          clientPhone={request.clientPhone}
                          createdAt={request.createdAt}
                        />
                      ))
                    ) : (
                      <div className="empty-state">
                        <Briefcase size={48} />
                        <h3>Нет доступных заявок</h3>
                        <p>Новые заявки появятся здесь</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="my-responses">
                <h2>Мои отклики</h2>
                <div className="responses-list">
                  {/* Здесь будет список откликов мастера */}
                  <div className="empty-state">
                    <Briefcase size={48} />
                    <h3>У вас пока нет откликов</h3>
                    <p>Откликнитесь на доступные заявки</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="master-stats">
                <h2>Статистика мастера</h2>
                <div className="stats-grid">
                  <div className="stat-item">
                    <h4>Выполнено заказов</h4>
                    <p className="stat-number">{user.completed_orders}</p>
                  </div>
                  <div className="stat-item">
                    <h4>Рейтинг</h4>
                    <p className="stat-number">{user.rating.toFixed(1)} ★</p>
                  </div>
                  <div className="stat-item">
                    <h4>Средний отклик</h4>
                    <p className="stat-number">15 мин</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Модальное окно создания заявки */}
      {isCreateFormOpen && user.role === 'client' && (
        <div className="modal-overlay">
          <div className="create-request-modal">
            <div className="modal-header">
              <h2>Создать новую заявку</h2>
              <button 
                className="close-btn"
                onClick={() => setIsCreateFormOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="create-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Заголовок *</label>
                  <input
                    type="text"
                    value={newRequest.title}
                    onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                    placeholder="Например: Ремонт холодильника"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Тип техники *</label>
                  <select
                    value={newRequest.type}
                    onChange={(e) => setNewRequest({...newRequest, type: e.target.value})}
                    required
                  >
                    <option value="other">Выберите тип</option>
                    <option value="washing_machine">Стиральная машина</option>
                    <option value="refrigerator">Холодильник</option>
                    <option value="oven">Духовой шкаф</option>
                    <option value="dishwasher">Посудомоечная машина</option>
                    <option value="tv">Телевизор</option>
                    <option value="computer">Компьютер/ноутбук</option>
                    <option value="other">Другое</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Бренд</label>
                  <input
                    type="text"
                    value={newRequest.brand}
                    onChange={(e) => setNewRequest({...newRequest, brand: e.target.value})}
                    placeholder="Например: LG, Samsung"
                  />
                </div>

                <div className="form-group">
                  <label>Модель</label>
                  <input
                    type="text"
                    value={newRequest.model}
                    onChange={(e) => setNewRequest({...newRequest, model: e.target.value})}
                    placeholder="Например: GA-B459SLQR"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Описание проблемы *</label>
                  <textarea
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                    placeholder="Подробно опишите проблему..."
                    rows={4}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Адрес *</label>
                  <input
                    type="text"
                    value={newRequest.address}
                    onChange={(e) => setNewRequest({...newRequest, address: e.target.value})}
                    placeholder="Улица, дом, квартира"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Район *</label>
                  <select
                    value={newRequest.district}
                    onChange={(e) => setNewRequest({...newRequest, district: e.target.value})}
                    required
                  >
                    <option value="Центральный">Центральный</option>
                    <option value="Ленинский">Ленинский</option>
                    <option value="Октябрьский">Октябрьский</option>
                    <option value="Железнодорожный">Железнодорожный</option>
                    <option value="Индустриальный">Индустриальный</option>
                    <option value="Южный">Южный</option>
                    <option value="Научный городок">Научный городок</option>
                    <option value="Новоалтайск">Новоалтайск</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Предполагаемый бюджет (₽)</label>
                  <input
                    type="number"
                    value={newRequest.budget}
                    onChange={(e) => setNewRequest({...newRequest, budget: e.target.value})}
                    placeholder="Например: 3000"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Фото проблемы (до 5 фото)</label>
                  <div className="photo-upload">
                    <label className="upload-area">
                      <Upload size={24} />
                      <span>Загрузить фото</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                    
                    {newRequest.photos.length > 0 && (
                      <div className="preview-gallery">
                        {newRequest.photos.map((photo, index) => (
                          <div key={index} className="photo-preview">
                            <img 
                              src={URL.createObjectURL(photo)} 
                              alt={`Preview ${index + 1}`} 
                            />
                            <button 
                              type="button"
                              className="remove-photo"
                              onClick={() => handleRemovePhoto(index)}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setIsCreateFormOpen(false)}
                >
                  Отмена
                </button>
                <button type="submit" className="submit-btn">
                  <Plus size={20} />
                  Создать заявку
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
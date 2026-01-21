import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import RequestCard from './components/requests/RequestCard';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Requests from './pages/Requests';
import Chats from './pages/Chats';
import './App.css';
const basename = process.env.NODE_ENV === 'production' ? '/' : '/';

// Компонент защищённого маршрута
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('masterok_token');
  
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Пример данных для демонстрации RequestCard
const sampleRequests = [
  {
    id: 1,
    title: 'Ремонт холодильника LG',
    description: 'Холодильник не морозит, слышен гул компрессора. Необходима диагностика и ремонт. Срочно!',
    type: 'refrigerator' as const,
    district: 'Центральный',
    budget: 3000,
    status: 'new' as const,
    clientName: 'Иван Иванов',
    clientPhone: '+7 913 111 22 33',
    createdAt: '2024-01-20T10:30:00'
  },
  {
    id: 2,
    title: 'Установка стиральной машины',
    description: 'Нужна установка и подключение новой стиральной машины Indesit. Есть все необходимые комплектующие.',
    type: 'washing_machine' as const,
    district: 'Ленинский',
    budget: 1500,
    status: 'searching' as const,
    clientName: 'Мария Петрова',
    clientPhone: '+7 913 222 33 44',
    createdAt: '2024-01-19T14:45:00'
  },
  {
    id: 3,
    title: 'Ремонт телевизора Samsung',
    description: 'Телевизор не включается, нет изображения, но есть звук. Модель UE43NU7090U. Год выпуска 2019.',
    type: 'tv' as const,
    district: 'Октябрьский',
    budget: 2500,
    status: 'in_progress' as const,
    clientName: 'Алексей Смирнов',
    createdAt: '2024-01-18T09:15:00'
  }
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('Гость');
  
  // Проверка аутентификации при загрузке
  useEffect(() => {
    const token = localStorage.getItem('masterok_token');
    const userData = localStorage.getItem('masterok_user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setIsAuthenticated(true);
        setUserName(user.name);
      } catch (error) {
        localStorage.removeItem('masterok_token');
        localStorage.removeItem('masterok_user');
      }
    }
  }, []);

  // Функция выхода
  const handleLogout = () => {
    localStorage.removeItem('masterok_token');
    localStorage.removeItem('masterok_user');
    setIsAuthenticated(false);
    setUserName('Гость');
    window.location.href = '/';
  };

  return (
    <Provider store={store}>
      <AuthProvider>
        <Router basename={basename}>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/requests" 
                element={
                  <ProtectedRoute>
                    <Requests />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chats" 
                element={
                  <ProtectedRoute>
                    <Chats />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chats/:chatId" 
                element={
                  <ProtectedRoute>
                    <Chats />
                  </ProtectedRoute>
                } 
              />
              
              {/* Демонстрационная страница с RequestCard */}
              <Route 
                path="/demo" 
                element={
                  <div className="demo-page">
                    <div className="container">
                      <h1 className="demo-title">Демонстрация карточек заявок</h1>
                      <p className="demo-subtitle">
                        Пример использования компонента RequestCard со всеми статусами
                      </p>
                      
                      <div className="cards-grid">
                        {sampleRequests.map((request) => {
                          const { id, title, description, type, district, budget, status, clientName, clientPhone, createdAt } = request;
                          return (
                            <RequestCard
                              key={id}
                              id={id}
                              title={title}
                              description={description}
                              type={type}
                              district={district}
                              budget={budget}
                              status={status}
                              clientName={clientName}
                              clientPhone={clientPhone}
                              createdAt={createdAt}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                } 
              />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;
import { useState, useEffect } from 'react';
import { useMasterWebSocket } from '../../hooks/useWebSocket';
import { requestService } from '../../services/api';
import RequestCard from './RequestCard';

// Создаем интерфейс для данных API
interface ApiRequest {
    id: number;
    title: string;
    description: string;
    type: string;
    district: string;
    budget?: number;
    status: 'new' | 'searching' | 'in_progress' | 'completed' | 'cancelled';
    client?: {
        name: string;
        phone?: string;
    };
    created_at: string;
}

const RequestList: React.FC = () => {
    const [requests, setRequests] = useState<ApiRequest[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Подключаем WebSocket для получения новых заявок
    useMasterWebSocket((newRequest: any) => {
        // Преобразуем данные из WebSocket
        const formattedRequest = formatRequestFromApi(newRequest);
        
        setRequests(prev => {
            // Проверяем, нет ли уже такой заявки
            const exists = prev.some(r => r.id === newRequest.id);
            if (!exists) {
                return [formattedRequest, ...prev];
            }
            return prev;
        });
        
        // Показываем уведомление
        showNotification('Новая заявка!', newRequest.title);
    });
    
    // Функция для преобразования данных из API
    const formatRequestFromApi = (apiRequest: any): ApiRequest => {
        return {
            ...apiRequest,
            client: apiRequest.client || { name: 'Аноним' },
            created_at: apiRequest.created_at || new Date().toISOString(),
        };
    };
    
    useEffect(() => {
        loadRequests();
        
        // Запрашиваем разрешение на уведомления при загрузке
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }, []);
    
    const loadRequests = async () => {
        try {
            const response = await requestService.getRequests({
                status: 'new',
                per_page: 20,
            });
            
            // Преобразуем данные из API
            const apiRequests: any[] = response.data.data || [];
            const formattedRequests = apiRequests.map(formatRequestFromApi);
            
            setRequests(formattedRequests);
        } catch (error) {
            console.error('Ошибка загрузки заявок:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const showNotification = (title: string, body: string) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body });
        }
    };
    
    const handleContact = (requestId: number) => {
        const request = requests.find(r => r.id === requestId);
        if (request?.client?.phone) {
            console.log('Звонок на номер:', request.client.phone);
            // window.location.href = `tel:${request.client.phone}`;
        }
    };
    
    const handleRespond = (requestId: number) => {
        console.log('Отклик на заявку:', requestId);
        // Логика отклика на заявку
    };
    
    const handleCardClick = (requestId: number) => {
        console.log('Открыть детали заявки:', requestId);
        // Навигация на страницу деталей заявки
        // history.push(`/requests/${requestId}`);
    };
    
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Загрузка заявок...</p>
            </div>
        );
    }
    
    return (
        <div className="request-list">
            <div className="request-list-header">
                <h2>Доступные заявки</h2>
                <div className="request-count">Найдено: {requests.length}</div>
            </div>
            
            {requests.length === 0 ? (
                <div className="no-requests">
                    <div className="no-requests-icon">📭</div>
                    <h3>Нет доступных заявок</h3>
                    <p>Новые заявки появятся здесь автоматически</p>
                </div>
            ) : (
                <div className="requests-grid">
                    {requests.map(request => (
                        <RequestCard 
                            key={request.id}
                            id={request.id}
                            title={request.title || 'Без названия'}
                            description={request.description || 'Описание отсутствует'}
                            type={request.type || 'other'}
                            district={request.district || 'Не указан'}
                            budget={request.budget}
                            status={request.status || 'new'}
                            clientName={request.client?.name || 'Аноним'}
                            clientPhone={request.client?.phone}
                            createdAt={request.created_at || new Date().toISOString()}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default RequestList;
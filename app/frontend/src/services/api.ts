import axios from 'axios';

// Конфигурация axios
const api = axios.create({
    baseURL: 'https://master-ok-production.up.railway.app/api', // ← ТАК!
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Интерцептор для добавления токена
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('masterok_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Интерцептор для обработки ошибок
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Если 401 ошибка - редирект на страницу авторизации
            localStorage.removeItem('masterok_token');
            localStorage.removeItem('masterok_user');
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

// Сервисы API

// Аутентификация
export const authService = {
    sendLoginCode: (phone: string) => 
        api.post('/auth/login/send-code', { phone }),
    
    verifyLogin: (phone: string, code: string) => 
        api.post('/auth/login/verify', { phone, code }),
    
    sendRegisterCode: (phone: string, role: string) => 
        api.post('/auth/register/send-code', { phone, role }),
    
    verifyRegister: (phone: string, code: string, name: string, city: string, role: string = 'client') => 
        api.post('/auth/register/verify', { phone, code, name, city, role }),
    
    logout: () => api.post('/auth/logout'),
    
    getMe: () => api.get('/auth/me'),
};

// Заявки
export const requestService = {
    getRequests: (params?: any) => 
        api.get('/requests', { params }),
    
    getRequest: (id: number) => 
        api.get(`/requests/${id}`),
    
    createRequest: (data: any) => 
        api.post('/requests', data),
    
    updateRequest: (id: number, data: any) => 
        api.put(`/requests/${id}`, data),
    
    deleteRequest: (id: number) => 
        api.delete(`/requests/${id}`),
    
    respondToRequest: (id: number, data: any) => 
        api.post(`/requests/${id}/respond`, data),
    
    selectMaster: (id: number, data: any) => 
        api.post(`/requests/${id}/select-master`, data),
    
    completeRequest: (id: number) => 
        api.post(`/requests/${id}/complete`),
    
    cancelRequest: (id: number) => 
        api.post(`/requests/${id}/cancel`),
    
    uploadPhotos: (id: number, photos: File[]) => {
        const formData = new FormData();
        photos.forEach(photo => {
            formData.append('photos[]', photo);
        });
        return api.post(`/requests/${id}/photos`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    
    getStatistics: () => 
        api.get('/requests/statistics'),
};

// Чаты и сообщения
export const chatService = {
    getChats: () => 
        api.get('/chats'),
    
    getChat: (id: number) => 
        api.get(`/chats/${id}`),
    
    getMessages: (chatId: number, params?: any) => 
        api.get(`/chats/${chatId}/messages`),
    
    sendMessage: (chatId: number, data: { text: string, image?: File }) => {
        const formData = new FormData();
        formData.append('text', data.text);
        if (data.image) {
            formData.append('image', data.image);
        }
        return api.post(`/chats/${chatId}/messages`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    
    markAsRead: (chatId: number) => 
        api.post(`/chats/${chatId}/read`),
    
    getUnreadCount: () => 
        api.get('/chats/unread-count'),
};

// Сообщения (alias для chatService для совместимости)
export const messageService = {
    getMessages: (chatId: number, params?: any) => 
        chatService.getMessages(chatId, params),
    
    sendMessage: (chatId: number, data: { text: string }) => 
        chatService.sendMessage(chatId, data),
};

// Отзывы
export const reviewService = {
    getReviews: (params?: any) => 
        api.get('/reviews', { params }),
    
    createReview: (data: any) => 
        api.post('/reviews', data),
    
    updateReview: (id: number, data: any) => 
        api.put(`/reviews/${id}`, data),
    
    deleteReview: (id: number) => 
        api.delete(`/reviews/${id}`),
};

// Профиль
export const profileService = {
    updateProfile: (data: any) => 
        api.put('/profile', data),
    
    uploadAvatar: (file: File) => {
        const formData = new FormData();
        formData.append('avatar', file);
        return api.post('/profile/upload-avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    
    deleteAvatar: () => 
        api.delete('/profile/avatar'),
    
    getPublicProfile: (id: number) => 
        api.get(`/profile/${id}`),
};

// Публичные маршруты
export const publicService = {
    getMasters: (params?: any) => 
        api.get('/masters', { params }),
    
    getDistricts: () => 
        api.get('/districts'),
};

export default api;
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
    }
}

// Добавляем Pusher в глобальную область
if (typeof window !== 'undefined') {
    window.Pusher = Pusher;
}

// Правильная конфигурация Echo
const echoConfig: any = {
    broadcaster: 'pusher',
    key: process.env.REACT_APP_PUSHER_APP_KEY || 'masterok-key',
    wsHost: process.env.REACT_APP_PUSHER_HOST || '127.0.0.1',
    wsPort: parseInt(process.env.REACT_APP_PUSHER_PORT || '6001'),
    wssPort: parseInt(process.env.REACT_APP_PUSHER_PORT || '6001'),
    forceTLS: false,
    encrypted: false,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/broadcasting/auth`,
    auth: {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('masterok_token')}`,
            Accept: 'application/json',
        },
    },
    cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER || 'mt1',
};

const echo = new Echo(echoConfig);

export default echo;
import { useEffect, useState } from 'react';
import echo from '../services/echo';

const TestWebSocket = () => {
    const [status, setStatus] = useState('Не подключено');
    const [messages, setMessages] = useState<string[]>([]);
    
    useEffect(() => {
        // Подключаемся к тестовому каналу
        const channel = echo.channel('test-channel');
        
        channel.listen('.test.event', (data: any) => {
            setMessages(prev => [...prev, `Получено: ${data.message}`]);
        });
        
        // Тестовое событие
        setTimeout(() => {
            echo.channel('test-channel').whisper('client-event', {
                message: 'Привет с клиента!',
                timestamp: new Date().toISOString(),
            });
        }, 1000);
        
        setStatus('Подключено');
        
        return () => {
            channel.stopListening('.test.event');
            echo.leave('test-channel');
        };
    }, []);
    
    const sendTestMessage = () => {
        // Отправляем тестовое сообщение через API
        fetch('http://localhost:8000/api/test-broadcast', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('masterok_token')}`,
            },
        });
    };
    
    return (
        <div>
            <h2>Тест WebSocket</h2>
            <p>Статус: {status}</p>
            <button onClick={sendTestMessage}>Отправить тестовое сообщение</button>
            <div>
                <h3>Сообщения:</h3>
                {messages.map((msg, index) => (
                    <div key={index}>{msg}</div>
                ))}
            </div>
        </div>
    );
};
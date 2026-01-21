import { useEffect, useRef, useCallback } from 'react';
import echo from '../services/echo';

interface UseWebSocketProps {
    chatId?: number;
    onNewMessage?: (message: any) => void;
    onChatUpdated?: (chat: any) => void;
    onRequestUpdated?: (request: any) => void;
    onUserStatusUpdated?: (data: any) => void;
}

export const useWebSocket = ({
    chatId,
    onNewMessage,
    onChatUpdated,
    onRequestUpdated,
    onUserStatusUpdated,
}: UseWebSocketProps = {}) => {
    const channelsRef = useRef<any[]>([]);
    const token = localStorage.getItem('masterok_token');
    const userStr = localStorage.getItem('masterok_user');
    const user = userStr ? JSON.parse(userStr) : null;

    // Подключение к каналам
    const connect = useCallback(() => {
        if (!user || !token) return;

        console.log('WebSocket: Подключение...');

        // Подписываемся на канал пользователя
        const userChannel = echo.private(`user.${user.id}`);
        channelsRef.current.push(userChannel);

        // Слушаем обновления чатов пользователя
        userChannel.listen('.chat.updated', (data: any) => {
            console.log('WebSocket: Чат обновлен', data);
            onChatUpdated?.(data.chat);
        });

        // Подписываемся на канал заявок (если пользователь - мастер)
        if (user.role === 'master') {
            const requestsChannel = echo.channel('requests');
            channelsRef.current.push(requestsChannel);

            requestsChannel.listen('.request.updated', (data: any) => {
                console.log('WebSocket: Заявка обновлена', data);
                onRequestUpdated?.(data.request);
            });
        }

        // Подписываемся на канал чата, если передан chatId
        if (chatId) {
            const chatChannel = echo.private(`chat.${chatId}`);
            channelsRef.current.push(chatChannel);

            chatChannel.listen('.new.message', (data: any) => {
                console.log('WebSocket: Новое сообщение', data);
                onNewMessage?.(data.message);
            });

            // Слушаем обновления статуса пользователей в чате
            chatChannel.listenForWhisper('typing', (data: any) => {
                console.log('WebSocket: Пользователь печатает', data);
            });
        }

        // Подписываемся на канал статусов
        const statusChannel = echo.join(`user.status.${user.id}`);
        channelsRef.current.push(statusChannel);

        statusChannel.listen('.user.status.updated', (data: any) => {
            console.log('WebSocket: Статус обновлен', data);
            onUserStatusUpdated?.(data);
        });

        // Присоединяемся к общему каналу онлайн пользователей
        const onlineChannel = echo.join('online-users');
        channelsRef.current.push(onlineChannel);

        onlineChannel.here((users: any[]) => {
            console.log('WebSocket: Пользователи онлайн', users);
        });

        onlineChannel.joining((user: any) => {
            console.log('WebSocket: Пользователь присоединился', user);
        });

        onlineChannel.leaving((user: any) => {
            console.log('WebSocket: Пользователь вышел', user);
        });

        return () => {
            console.log('WebSocket: Отключение...');
            channelsRef.current.forEach(channel => {
                try {
                    if (channel.leave) channel.leave();
                    if (channel.unsubscribe) channel.unsubscribe();
                    if (channel.stopListening) channel.stopListening('.chat.updated');
                } catch (error) {
                    console.error('Ошибка при отключении канала:', error);
                }
            });
            channelsRef.current = [];
        };
    }, [user, token, chatId, onNewMessage, onChatUpdated, onRequestUpdated, onUserStatusUpdated]);

    // Отправка события "печатает"
    const sendTypingEvent = useCallback((isTyping: boolean) => {
        if (chatId && user) {
            echo.private(`chat.${chatId}`).whisper('typing', {
                user_id: user.id,
                is_typing: isTyping,
                timestamp: new Date().toISOString(),
            });
        }
    }, [chatId, user]);

    // Отключение от всех каналов
    const disconnect = useCallback(() => {
        channelsRef.current.forEach(channel => {
            try {
                if (channel.leave) channel.leave();
                if (channel.unsubscribe) channel.unsubscribe();
            } catch (error) {
                console.error('Ошибка при отключении:', error);
            }
        });
        channelsRef.current = [];
        echo.disconnect();
    }, []);

    useEffect(() => {
        const cleanup = connect();
        return () => {
            cleanup?.();
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        sendTypingEvent,
        disconnect,
        echo,
    };
};

// Вспомогательный хук для отслеживания онлайн статусов в чатах
export const useChatWebSocket = (chatId: number, onNewMessage: (message: any) => void) => {
    return useWebSocket({
        chatId,
        onNewMessage,
        onChatUpdated: (chat) => {
            console.log('Чат обновлен:', chat);
        },
    });
};

// Вспомогательный хук для мастеров (получение новых заявок)
export const useMasterWebSocket = (onNewRequest: (request: any) => void) => {
    return useWebSocket({
        onRequestUpdated: onNewRequest,
    });
};
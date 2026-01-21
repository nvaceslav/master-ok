import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MoreVertical, 
  Paperclip, 
  Smile, 
  Send, 
  Phone, 
  Video, 
  User,
  ChevronLeft,
  Menu,
  MessageCircle
} from 'lucide-react';
import { useChatWebSocket } from '../hooks/useWebSocket';
import { chatService } from '../services/api'; // Вместо messageService
import { useAuth } from '../contexts/AuthContext';
import './Chats.css';

// Типы данных из второго кода
interface Message {
  id: number;
  text: string;
  user_id: number;
  created_at: string;
  user: {
    id: number;
    name: string;
    avatar_url?: string;
  };
}

interface Chat {
  id: number;
  request_id: number;
  client_id: number;
  master_id: number;
  status: string;
  last_message_at: string;
  client: {
    id: number;
    name: string;
  };
  master: {
    id: number;
    name: string;
  };
  request: {
    id: number;
    title: string;
  };
}

const Chats: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Подключаем WebSocket
  const { sendTypingEvent } = useChatWebSocket(
    chatId ? parseInt(chatId) : 0,
    (message: Message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    }
  );
  
  // Загрузка чатов пользователя
  useEffect(() => {
    loadChats();
  }, []);
  
  // Загрузка сообщений выбранного чата
  useEffect(() => {
    if (chatId) {
      loadMessages(parseInt(chatId));
    }
  }, [chatId]);
  
  // Обработчик изменения размера окна
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const loadChats = async () => {
    try {
      const response = await chatService.getMessages(parseInt(chatId!));
      setChats(response.data.data || []);
      
      // Если есть chatId в URL, выбираем соответствующий чат
      if (chatId) {
        const chat = response.data.data?.find((c: Chat) => c.id === parseInt(chatId));
        if (chat) {
          setSelectedChat(chat);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadMessages = async (id: number) => {
    try {
      const response = await chatService.getMessages(id);
      setMessages(response.data.messages?.data || []);
      scrollToBottom();
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    navigate(`/chats/${chat.id}`);
    
    if (isMobileView) {
      setShowChatList(false);
    }
  };
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedImage) return;
    if (!chatId || !user) return;
    
    try {
      await chatService.sendMessage(parseInt(chatId), { text: newMessage });
      
      setNewMessage('');
      sendTypingEvent(false);
      
      // Сбрасываем выбранное изображение
      if (selectedImage) {
        setSelectedImage(null);
      }
      
      // Фокус на поле ввода
      inputRef.current?.focus();
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
    }
  };
  
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    // Отправляем событие печатания
    if (value.length > 0) {
      sendTypingEvent(true);
    } else {
      sendTypingEvent(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Фильтрация чатов по поиску
  const filteredChats = chats.filter(chat => {
    const otherUser = user?.id === chat.client_id ? chat.master : chat.client;
    return (
      otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.request.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  
  if (loading) {
    return <div className="chats-loading">Загрузка чатов...</div>;
  }
  
  return (
    <div className="chats-page">
      <div className="chats-container">
        {/* Список чатов */}
        <div className={`chats-sidebar ${showChatList ? 'visible' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-title">
              <h2>Чаты</h2>
              <span className="chats-count">{chats.length}</span>
            </div>
            
            <div className="search-container">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Поиск чатов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div className="chats-list">
            {filteredChats.length === 0 ? (
              <div className="no-chats">У вас пока нет чатов</div>
            ) : (
              filteredChats.map(chat => {
                const otherUser = user?.id === chat.client_id ? chat.master : chat.client;
                const isActive = selectedChat?.id === chat.id;
                
                return (
                  <div
                    key={chat.id}
                    className={`chat-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectChat(chat)}
                  >
                    <div className="chat-avatar">
                      <div className="avatar-placeholder">
                        {otherUser.name.charAt(0)}
                      </div>
                    </div>
                    
                    <div className="chat-info">
                      <div className="chat-header">
                        <h3 className="chat-name">{otherUser.name}</h3>
                        <span className="chat-time">{formatTime(chat.last_message_at)}</span>
                      </div>
                      
                      <div className="chat-preview">
                        <p className="chat-request-title">{chat.request.title}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* Окно переписки */}
        <div className={`chat-window ${!showChatList || !isMobileView ? 'visible' : ''}`}>
          {selectedChat ? (
            <>
              {/* Заголовок чата */}
              <div className="chat-header">
                {isMobileView && (
                  <button 
                    className="back-button"
                    onClick={() => setShowChatList(true)}
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}
                
                <div className="chat-user-info">
                  <div className="chat-user-avatar">
                    <div className="avatar-placeholder">
                      {(() => {
                        const otherUser = user?.id === selectedChat.client_id 
                          ? selectedChat.master 
                          : selectedChat.client;
                        return otherUser.name.charAt(0);
                      })()}
                    </div>
                  </div>
                  
                  <div className="chat-user-details">
                    <h2 className="chat-user-name">
                      {user?.id === selectedChat.client_id 
                        ? selectedChat.master.name 
                        : selectedChat.client.name}
                    </h2>
                    <div className="chat-header-subtitle">
                      Заявка: {selectedChat.request.title}
                    </div>
                  </div>
                </div>
                
                <div className="chat-actions">
                  <button className="chat-action-btn">
                    <Phone size={20} />
                  </button>
                  <button className="chat-action-btn">
                    <Video size={20} />
                  </button>
                  <button className="chat-action-btn">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>
              
              {/* Информация о заявке */}
              <div className="request-info">
                <div className="request-info-content">
                  <h3>{selectedChat.request.title}</h3>
                  <p>Заявка #{selectedChat.request.id}</p>
                  <button className="request-details-btn">Подробнее о заявке →</button>
                </div>
              </div>
              
              {/* Область сообщений */}
              <div className="messages-container">
                {typingUsers.length > 0 && (
                  <div className="typing-indicator">
                    <div className="typing-dots">
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                    <span>Печатает...</span>
                  </div>
                )}
                
                <div className="messages-list">
                  {messages.map(message => {
                    const isOwnMessage = message.user_id === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`message ${isOwnMessage ? 'outgoing' : 'incoming'}`}
                      >
                        <div className="message-content">
                          <div className="message-text">
                            <p>{message.text}</p>
                          </div>
                          
                          <div className="message-footer">
                            <span className="message-time">{formatTime(message.created_at)}</span>
                          </div>
                        </div>
                        
                        {!isOwnMessage && (
                          <div className="message-sender">
                            {message.user.name}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              {/* Панель ввода сообщения */}
              <div className="message-input-container">
                {/* Предпросмотр изображения */}
                {selectedImage && (
                  <div className="image-preview">
                    <div className="image-preview-content">
                      <img src={URL.createObjectURL(selectedImage)} alt="Preview" />
                      <button 
                        className="remove-image"
                        onClick={() => setSelectedImage(null)}
                      >
                        ×
                      </button>
                    </div>
                    <span className="image-size">
                      {Math.round(selectedImage.size / 1024)} KB
                    </span>
                  </div>
                )}
                
                <div className="input-tools">
                  <button 
                    className="tool-btn attachment"
                    onClick={() => fileInputRef.current?.click()}
                    title="Прикрепить файл"
                  >
                    <Paperclip size={20} />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </button>
                  
                  <button className="tool-btn emoji" title="Эмодзи">
                    <Smile size={20} />
                  </button>
                </div>
                
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  placeholder="Введите сообщение..."
                  className="message-input"
                />
                
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() && !selectedImage}
                  className={`send-button ${newMessage.trim() || selectedImage ? 'active' : ''}`}
                >
                  <Send size={20} />
                </button>
              </div>
            </>
          ) : (
            // Пустой экран чата
            <div className="empty-chat">
              <div className="empty-chat-content">
                <div className="empty-chat-icon">
                  <MessageCircle size={64} />
                </div>
                <h2>Выберите чат</h2>
                <p>Выберите чат из списка слева, чтобы начать общение</p>
                <button 
                  className="browse-chats-btn"
                  onClick={() => setShowChatList(true)}
                >
                  <Menu size={20} />
                  Просмотреть все чаты
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chats;
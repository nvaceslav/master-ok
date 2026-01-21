import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { chatService } from '../../services/api';

interface Message {
  id: number;
  chat_id: number;
  user_id: number;
  text: string;
  image: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  user: {
    id: number;
    name: string;
    avatar_url: string | null;
  };
}

interface Chat {
  id: number;
  request_id: number;
  client_id: number;
  master_id: number;
  status: 'active' | 'closed';
  last_message_at: string;
  created_at: string;
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
  last_message?: Message;
  unread_count?: number;
}

interface ChatsState {
  chats: Chat[];
  selectedChat: Chat | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  pagination: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
  unreadCount: number;
}

const initialState: ChatsState = {
  chats: [],
  selectedChat: null,
  messages: [],
  loading: false,
  error: null,
  pagination: {
    current_page: 1,
    total: 0,
    per_page: 20,
    last_page: 1,
  },
  unreadCount: 0,
};

// Асинхронные thunks

// Получение списка чатов
export const fetchChats = createAsyncThunk(
  'chats/fetchChats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatService.getChats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки чатов');
    }
  }
);

// Получение сообщений чата
export const fetchMessages = createAsyncThunk(
  'chats/fetchMessages',
  async (chatId: number, { rejectWithValue }) => {
    try {
      const response = await chatService.getMessages(chatId);
      return { chatId, messages: response.data.messages?.data || [] };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки сообщений');
    }
  }
);

// Отправка сообщения
export const sendMessage = createAsyncThunk(
  'chats/sendMessage',
  async ({ chatId, data }: { chatId: number; data: FormData | { text: string; image?: File } }, { rejectWithValue }) => {
    try {
      let sendData;
      
      // Если пришел FormData - преобразуем в объект
      if (data instanceof FormData) {
        sendData = {
          text: data.get('text') as string,
          image: data.get('image') as File
        };
      } else {
        // Если уже объект - оставляем как есть
        sendData = data;
      }
      
      const response = await chatService.sendMessage(chatId, sendData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors || error.response?.data?.message || 'Ошибка отправки сообщения');
    }
  }
);

// Отметка сообщений как прочитанных
export const markAsRead = createAsyncThunk(
  'chats/markAsRead',
  async (chatId: number, { rejectWithValue }) => {
    try {
      const response = await chatService.markAsRead(chatId);
      return { chatId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка отметки сообщений');
    }
  }
);

// Получение количества непрочитанных сообщений
export const fetchUnreadCount = createAsyncThunk(
  'chats/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatService.getUnreadCount();
      return response.data.data.unread_count;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки количества непрочитанных');
    }
  }
);

const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    // Синхронные редьюсеры
    selectChat: (state, action: PayloadAction<Chat>) => {
      state.selectedChat = action.payload;
    },
    clearSelectedChat: (state) => {
      state.selectedChat = null;
      state.messages = [];
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
      
      // Обновляем последнее сообщение в чате
      const chatIndex = state.chats.findIndex(chat => chat.id === action.payload.chat_id);
      if (chatIndex !== -1) {
        state.chats[chatIndex].last_message = action.payload;
        state.chats[chatIndex].last_message_at = action.payload.created_at;
      }
    },
    updateMessageStatus: (state, action: PayloadAction<{ messageId: number; isRead: boolean; readAt?: string }>) => {
      const message = state.messages.find(msg => msg.id === action.payload.messageId);
      if (message) {
        message.is_read = action.payload.isRead;
        if (action.payload.readAt) {
          message.read_at = action.payload.readAt;
        }
      }
    },
    updateChatStatus: (state, action: PayloadAction<{ chatId: number; status: 'active' | 'closed' }>) => {
      const chatIndex = state.chats.findIndex(chat => chat.id === action.payload.chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].status = action.payload.status;
      }
      if (state.selectedChat?.id === action.payload.chatId) {
        state.selectedChat.status = action.payload.status;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchChats
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload.data.data || [];
        state.pagination = {
          current_page: action.payload.data.current_page || 1,
          total: action.payload.data.total || 0,
          per_page: action.payload.data.per_page || 20,
          last_page: action.payload.data.last_page || 1,
        };
        state.error = null;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // fetchMessages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.messages;
        state.error = null;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // sendMessage
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push(action.payload);
        
        // Обновляем последнее сообщение в чате
        const chatIndex = state.chats.findIndex(chat => chat.id === action.payload.chat_id);
        if (chatIndex !== -1) {
          state.chats[chatIndex].last_message = action.payload;
          state.chats[chatIndex].last_message_at = action.payload.created_at;
        }
        state.error = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // markAsRead
      .addCase(markAsRead.pending, (state) => {
        state.loading = true;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.loading = false;
        // Помечаем все сообщения выбранного чата как прочитанные
        state.messages.forEach(message => {
          if (message.chat_id === action.payload.chatId && !message.is_read) {
            message.is_read = true;
            message.read_at = new Date().toISOString();
          }
        });
        
        // Обновляем unread_count в чате
        const chatIndex = state.chats.findIndex(chat => chat.id === action.payload.chatId);
        if (chatIndex !== -1 && state.chats[chatIndex].unread_count) {
          state.chats[chatIndex].unread_count = 0;
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // fetchUnreadCount
      .addCase(fetchUnreadCount.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.loading = false;
        state.unreadCount = action.payload;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  selectChat,
  clearSelectedChat,
  addMessage,
  updateMessageStatus,
  updateChatStatus,
  clearError,
  updateUnreadCount,
} = chatsSlice.actions;

export default chatsSlice.reducer;
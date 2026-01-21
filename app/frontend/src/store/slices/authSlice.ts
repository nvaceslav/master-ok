import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/api';

interface User {
  id: number;
  name: string;
  phone: string;
  role: 'client' | 'master' | 'admin';
  avatar: string | null;
  city: string;
  rating: number;
  completed_orders: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('masterok_token'),
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('masterok_token'),
};

// Асинхронные thunks

// Отправка кода для входа
export const sendLoginCode = createAsyncThunk(
  'auth/sendLoginCode',
  async (phone: string, { rejectWithValue }) => {
    try {
      const response = await authService.sendLoginCode(phone);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка отправки кода');
    }
  }
);

// Подтверждение входа
export const verifyLogin = createAsyncThunk(
  'auth/verifyLogin',
  async ({ phone, code }: { phone: string; code: string }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyLogin(phone, code);
      const { user, token } = response.data;
      
      // Сохраняем в localStorage
      localStorage.setItem('masterok_token', token);
      localStorage.setItem('masterok_user', JSON.stringify(user));
      
      return { user, token };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка входа');
    }
  }
);

// Отправка кода для регистрации
export const sendRegisterCode = createAsyncThunk(
  'auth/sendRegisterCode',
  async ({ phone, role }: { phone: string; role: string }, { rejectWithValue }) => {
    try {
      const response = await authService.sendRegisterCode(phone, role);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка отправки кода');
    }
  }
);

// Подтверждение регистрации
export const verifyRegister = createAsyncThunk(
  'auth/verifyRegister',
  async ({ phone, code, name, city, role = 'client' }: {
    phone: string;
    code: string;
    name: string;
    city: string;
    role?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyRegister(phone, code, name, city);
      const { user, token } = response.data;
      
      // Сохраняем в localStorage
      localStorage.setItem('masterok_token', token);
      localStorage.setItem('masterok_user', JSON.stringify(user));
      
      return { user, token };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка регистрации');
    }
  }
);

// Получение информации о текущем пользователе
export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getMe();
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка получения данных пользователя');
    }
  }
);

// Выход из системы
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      
      // Удаляем из localStorage
      localStorage.removeItem('masterok_token');
      localStorage.removeItem('masterok_user');
      
      return null;
    } catch (error: any) {
      // Даже если ошибка, всё равно удаляем токен
      localStorage.removeItem('masterok_token');
      localStorage.removeItem('masterok_user');
      return rejectWithValue(error.response?.data?.message || 'Ошибка выхода');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Синхронные редьюсеры
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem('masterok_token', action.payload);
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('masterok_token');
      localStorage.removeItem('masterok_user');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // sendLoginCode
      .addCase(sendLoginCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendLoginCode.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(sendLoginCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // verifyLogin
      .addCase(verifyLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(verifyLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // sendRegisterCode
      .addCase(sendRegisterCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendRegisterCode.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(sendRegisterCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // verifyRegister
      .addCase(verifyRegister.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyRegister.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(verifyRegister.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // getMe
      .addCase(getMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      
      // logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, setToken, clearAuth, clearError } = authSlice.actions;
export default authSlice.reducer;
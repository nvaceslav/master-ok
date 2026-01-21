import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import requestsReducer from './slices/requestsSlice';
import chatsReducer from './slices/chatsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    requests: requestsReducer,
    chats: chatsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
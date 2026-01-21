import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { requestService, chatService } from '../../services/api';

interface Request {
  id: number;
  client_id: number;
  title: string;
  description: string;
  type: string;
  brand: string | null;
  model: string | null;
  photos: string[] | null;
  address: string;
  district: string;
  budget: string;
  status: 'new' | 'searching' | 'in_progress' | 'completed' | 'cancelled';
  selected_master_id: number | null;
  selected_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  client: {
    id: number;
    name: string;
    phone: string;
  };
  responses_count?: number;
  chat?: any;
}

interface Response {
  id: number;
  request_id: number;
  master_id: number;
  message: string;
  price: string;
  estimated_time: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  master: {
    id: number;
    name: string;
    rating: number;
  };
}

interface RequestsState {
  requests: Request[];
  selectedRequest: Request | null;
  responses: Response[];
  loading: boolean;
  error: string | null;
  pagination: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
  filters: {
    status: string;
    type: string;
    district: string;
    minBudget: number | null;
    maxBudget: number | null;
  };
  statistics: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
  } | null;
}

const initialState: RequestsState = {
  requests: [],
  selectedRequest: null,
  responses: [],
  loading: false,
  error: null,
  pagination: {
    current_page: 1,
    total: 0,
    per_page: 10,
    last_page: 1,
  },
  filters: {
    status: 'new',
    type: 'all',
    district: 'all',
    minBudget: null,
    maxBudget: null,
  },
  statistics: null,
};

// Асинхронные thunks

// Получение списка заявок
export const fetchRequests = createAsyncThunk(
  'requests/fetchRequests',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await requestService.getRequests(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки заявок');
    }
  }
);

// Получение одной заявки
export const fetchRequest = createAsyncThunk(
  'requests/fetchRequest',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await requestService.getRequest(id);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки заявки');
    }
  }
);

// Создание заявки
export const createRequest = createAsyncThunk(
  'requests/createRequest',
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await requestService.createRequest(data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors || error.response?.data?.message || 'Ошибка создания заявки');
    }
  }
);

// Обновление заявки
export const updateRequest = createAsyncThunk(
  'requests/updateRequest',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await requestService.updateRequest(id, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors || error.response?.data?.message || 'Ошибка обновления заявки');
    }
  }
);

// Удаление заявки
export const deleteRequest = createAsyncThunk(
  'requests/deleteRequest',
  async (id: number, { rejectWithValue }) => {
    try {
      await requestService.deleteRequest(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка удаления заявки');
    }
  }
);

// Отклик на заявку
export const respondToRequest = createAsyncThunk(
  'requests/respondToRequest',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await requestService.respondToRequest(id, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors || error.response?.data?.message || 'Ошибка отклика на заявку');
    }
  }
);

// Выбор мастера
export const selectMaster = createAsyncThunk(
  'requests/selectMaster',
  async ({ id, response_id }: { id: number; response_id: number }, { rejectWithValue }) => {
    try {
      const response = await requestService.selectMaster(id, { response_id });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка выбора мастера');
    }
  }
);

// Завершение заявки
export const completeRequest = createAsyncThunk(
  'requests/completeRequest',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await requestService.completeRequest(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка завершения заявки');
    }
  }
);

// Отмена заявки
export const cancelRequest = createAsyncThunk(
  'requests/cancelRequest',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await requestService.cancelRequest(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка отмены заявки');
    }
  }
);

// Загрузка фото к заявке
export const uploadPhotos = createAsyncThunk(
  'requests/uploadPhotos',
  async ({ id, photos }: { id: number; photos: File[] }, { rejectWithValue }) => {
    try {
      const response = await requestService.uploadPhotos(id, photos);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors || error.response?.data?.message || 'Ошибка загрузки фото');
    }
  }
);

// Получение статистики
export const fetchStatistics = createAsyncThunk(
  'requests/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await requestService.getStatistics();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки статистики');
    }
  }
);

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    // Синхронные редьюсеры
    setFilters: (state, action: PayloadAction<Partial<RequestsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    selectRequest: (state, action: PayloadAction<Request>) => {
      state.selectedRequest = action.payload;
    },
    clearSelectedRequest: (state) => {
      state.selectedRequest = null;
    },
    addResponse: (state, action: PayloadAction<Response>) => {
      state.responses.push(action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchRequests
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.data;
        state.pagination = {
          current_page: action.payload.current_page,
          total: action.payload.total,
          per_page: action.payload.per_page,
          last_page: action.payload.last_page,
        };
        state.error = null;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // fetchRequest
      .addCase(fetchRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRequest = action.payload;
        state.error = null;
      })
      .addCase(fetchRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // createRequest
      .addCase(createRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.requests.unshift(action.payload);
        state.error = null;
      })
      .addCase(createRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // updateRequest
      .addCase(updateRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRequest.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.requests.findIndex(req => req.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
        if (state.selectedRequest?.id === action.payload.id) {
          state.selectedRequest = action.payload;
        }
        state.error = null;
      })
      .addCase(updateRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // deleteRequest
      .addCase(deleteRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = state.requests.filter(req => req.id !== action.payload);
        if (state.selectedRequest?.id === action.payload) {
          state.selectedRequest = null;
        }
        state.error = null;
      })
      .addCase(deleteRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // respondToRequest
      .addCase(respondToRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(respondToRequest.fulfilled, (state, action) => {
        state.loading = false;
        if (state.selectedRequest) {
          // Обновляем количество откликов
          state.selectedRequest.responses_count = (state.selectedRequest.responses_count || 0) + 1;
        }
        state.error = null;
      })
      .addCase(respondToRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // selectMaster
      .addCase(selectMaster.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(selectMaster.fulfilled, (state, action) => {
        state.loading = false;
        const { request, chat } = action.payload;
        
        // Обновляем заявку в списке
        const index = state.requests.findIndex(req => req.id === request.id);
        if (index !== -1) {
          state.requests[index] = { ...state.requests[index], ...request, chat };
        }
        
        // Обновляем выбранную заявку
        if (state.selectedRequest?.id === request.id) {
          state.selectedRequest = { ...state.selectedRequest, ...request, chat };
        }
        state.error = null;
      })
      .addCase(selectMaster.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // completeRequest
      .addCase(completeRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeRequest.fulfilled, (state) => {
        state.loading = false;
        if (state.selectedRequest) {
          state.selectedRequest.status = 'completed';
        }
        state.error = null;
      })
      .addCase(completeRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // cancelRequest
      .addCase(cancelRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelRequest.fulfilled, (state) => {
        state.loading = false;
        if (state.selectedRequest) {
          state.selectedRequest.status = 'cancelled';
        }
        state.error = null;
      })
      .addCase(cancelRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // uploadPhotos
      .addCase(uploadPhotos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadPhotos.fulfilled, (state, action) => {
        state.loading = false;
        if (state.selectedRequest) {
          state.selectedRequest.photos = action.payload.photos;
        }
        state.error = null;
      })
      .addCase(uploadPhotos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // fetchStatistics
      .addCase(fetchStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
        state.error = null;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  selectRequest,
  clearSelectedRequest,
  addResponse,
  clearError,
} = requestsSlice.actions;

export default requestsSlice.reducer;
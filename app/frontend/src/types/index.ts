// Типы пользователей
export interface User {
  id: number;
  name: string;
  phone: string;
  role: 'client' | 'master' | 'admin';
  avatar?: string;
  city?: string;
  about?: string;
  rating: number;
  completed_orders: number;
  specializations?: string[];
  created_at: string;
}

// Типы заявок
export interface Request {
  id: number;
  client_id: number;
  title: string;
  description: string;
  type: 'washing_machine' | 'refrigerator' | 'oven' | 'dishwasher' | 'tv' | 'computer' | 'other';
  brand?: string;
  model?: string;
  photos?: string[];
  address: string;
  district: string;
  budget?: number;
  status: 'new' | 'searching' | 'in_progress' | 'completed' | 'cancelled';
  selected_master_id?: number;
  created_at: string;
  updated_at: string;
  client?: User;
}

// Типы для маршрутов
export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  isProtected?: boolean;
  roles?: Array<'client' | 'master' | 'admin'>;
}

// Ответ API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}
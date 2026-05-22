import api from '../lib/api';

export interface AnalyticsSummary {
  period_revenue: number;
  period_orders: number;
  avg_order_value: number;
}

// Real-time stats specifically for the operational dashboard (kasir view)
export interface DashboardLiveSummary {
  total_orders_today: number;
  pending_orders: number;
  today_revenue: number;
  incomplete_orders: number;
}

export interface ChartData {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopMenu {
  name: string;
  total_sold: number;
  revenue: number;
}

export interface PaymentMethodData {
  method: string;
  total: number;
  revenue: number;
}

export interface PeakHourData {
  hour: string;
  orders: number;
}

export interface Transaction {
  id: number;
  order_number: string;
  customer_name: string;
  total: number;
  payment_method: string | null;
  created_at: string;
}

export const analyticsService = {
  getDashboardLive: async () => {
    const response = await api.get('/analytics/dashboard-stats');
    return response.data as DashboardLiveSummary;
  },

  getSummary: async (period: string = 'Today') => {
    const response = await api.get(`/analytics/summary?period=${encodeURIComponent(period)}`);
    return response.data as AnalyticsSummary;
  },
  
  getChartData: async (period: string = 'Today') => {
    const response = await api.get(`/analytics/chart?period=${encodeURIComponent(period)}`);
    return response.data as ChartData[];
  },
  
  getTopMenus: async (period: string = 'Today') => {
    const response = await api.get(`/analytics/top-menus?period=${encodeURIComponent(period)}`);
    return response.data as TopMenu[];
  },
  
  getPaymentMethods: async (period: string = 'Today') => {
    const response = await api.get(`/analytics/payment-methods?period=${encodeURIComponent(period)}`);
    return response.data as PaymentMethodData[];
  },
  
  getPeakHours: async (period: string = 'Today') => {
    const response = await api.get(`/analytics/peak-hours?period=${encodeURIComponent(period)}`);
    return response.data as PeakHourData[];
  },

  getTransactionHistory: async (period: string = 'Today') => {
    const response = await api.get(`/analytics/transactions?period=${encodeURIComponent(period)}`);
    return response.data as Transaction[];
  },

  exportReport: async (period: string = 'Today', type: 'pdf' | 'excel' = 'pdf') => {
    const endpoint = type === 'pdf' ? '/analytics/export/daily' : '/analytics/export/monthly';
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('picpic_auth_token');
    
    let urlString = `${baseUrl}${endpoint}?period=${encodeURIComponent(period)}`;
    if (token) {
      urlString += `&token=${encodeURIComponent(token)}`;
    }

    window.open(urlString, '_blank');
    
    // Memberikan jeda simulasi loading karena window.open bersifat synchronous
    return new Promise(resolve => setTimeout(resolve, 1500));
  }
};

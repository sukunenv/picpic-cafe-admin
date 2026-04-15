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
  }
};

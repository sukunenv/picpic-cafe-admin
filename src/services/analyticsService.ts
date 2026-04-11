import api from '../lib/api';

export interface AnalyticsSummary {
  today_revenue: number;
  this_week_revenue: number;
  this_month_revenue: number;
  today_orders: number;
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  avg_order_value: number;
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
  getSummary: async () => {
    const response = await api.get('/analytics/summary');
    return response.data as AnalyticsSummary;
  },
  
  getChartData: async () => {
    const response = await api.get('/analytics/chart');
    return response.data as ChartData[];
  },
  
  getTopMenus: async () => {
    const response = await api.get('/analytics/top-menus');
    return response.data as TopMenu[];
  },
  
  getPaymentMethods: async () => {
    const response = await api.get('/analytics/payment-methods');
    return response.data as PaymentMethodData[];
  },
  
  getPeakHours: async () => {
    const response = await api.get('/analytics/peak-hours');
    return response.data as PeakHourData[];
  }
};

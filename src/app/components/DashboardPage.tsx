import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Clock, TrendingUp, AlertCircle, Loader2, RefreshCcw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../lib/api';
import { analyticsService, AnalyticsSummary } from '../../services/analyticsService';

interface Order {
  id: string;
  order_number?: string;
  customer_name: string;
  table_number?: string;
  total: number;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchDashboardData = useCallback(async () => {
    try {
      const [ordersRes, summaryData] = await Promise.all([
        api.get('/orders?per_page=10'),
        analyticsService.getSummary(),
      ]);

      const data = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data.data;
      setOrders(data || []);
      setSummary(summaryData);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch failed:', err);
      if (!summary) setError('Gagal memuat data. Pastikan server API berjalan.');
    } finally {
      setInitialLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] gap-3">
        <Loader2 className="animate-spin text-[#6367FF]" size={40} />
        <p className="text-gray-500 font-medium">Memuat data dashboard...</p>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] gap-4 px-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="text-red-600" size={32} />
        </div>
        <div className="max-w-md">
          <h2 className="font-bold text-xl mb-1 text-gray-800">Oops! Terjadi Kesalahan</h2>
          <p className="text-gray-500">{error}</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-6 py-2.5 bg-[#6367FF] text-white rounded-xl font-bold shadow-lg shadow-[#6367FF]/20 hover:bg-[#5558DD] transition-all flex items-center gap-2"
        >
          <RefreshCcw size={16} />
          Coba Lagi
        </button>
      </div>
    );
  }

  // Hourly chart — count ALL orders today per jam (full 24h to avoid missing early-morning orders)
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  
  const hourlyCount: Record<string, number> = {};
  for (let i = 0; i < 24; i++) {
    hourlyCount[`${i.toString().padStart(2, '0')}:00`] = 0;
  }
  
  orders.forEach(order => {
    const orderDate = new Date(order.created_at);
    const orderLocalStr = `${orderDate.getFullYear()}-${String(orderDate.getMonth()+1).padStart(2,'0')}-${String(orderDate.getDate()).padStart(2,'0')}`;
    const hour = `${orderDate.getHours().toString().padStart(2, '0')}:00`;
    if (orderLocalStr === todayStr && hourlyCount[hour] !== undefined) {
      hourlyCount[hour] += 1;
    }
  });

  // Only show hours with data PLUS min range for readability (e.g. 06:00 to current hour +1)
  const currentHour = today.getHours();
  const minHour = Math.max(0, currentHour - 6);
  const maxHour = Math.min(23, currentHour + 2);
  
  const chartData = Object.entries(hourlyCount)
    .filter(([hour]) => {
      const h = parseInt(hour.split(':')[0]);
      return h >= minHour && h <= maxHour;
    })
    .map(([hour, count]) => ({ hour, orders: count }));

  const recentOrders = orders.slice(0, 8);

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'lunas' || s === 'paid') return 'bg-green-100 text-green-700';
    if (s === 'pending') return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-600';
  };

  const getStatusLabel = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed') return 'Lunas';
    if (s === 'pending') return 'Pending';
    if (s === 'cancelled') return 'Dibatalkan';
    return status;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-2xl text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ringkasan aktivitas cafe hari ini</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-[#6367FF]"
            title="Refresh manual"
          >
            <RefreshCcw size={18} />
          </button>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="font-bold text-gray-600">Live · {formatTime(lastUpdated)}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* Total Order */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-5 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Order</span>
            <div className="w-10 h-10 rounded-xl bg-[#6367FF]/10 flex items-center justify-center group-hover:bg-[#6367FF]/20 transition-all">
              <ShoppingCart size={20} className="text-[#6367FF]" />
            </div>
          </div>
          <p className="font-black text-3xl text-gray-800">{summary?.total_orders ?? 0}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] font-bold bg-[#6367FF]/10 text-[#6367FF] px-2 py-0.5 rounded-full">
              Hari ini: {summary?.today_orders ?? 0}
            </span>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-5 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Pending</span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-all">
              <Clock size={20} className="text-amber-600" />
            </div>
          </div>
          <p className="font-black text-3xl text-amber-600">{summary?.pending_orders ?? 0}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Perlu diproses segera</span>
          </div>
        </div>

        {/* Pendapatan */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-5 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Pendapatan Hari Ini</span>
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-all">
              <TrendingUp size={20} className="text-green-600" />
            </div>
          </div>
          <p className="font-black text-2xl text-gray-800">
            {summary?.today_revenue ? formatPrice(summary.today_revenue) : 'Rp 0'}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              Lunas: {summary?.completed_orders ?? 0} order
            </span>
          </div>
        </div>

        {/* Belum Lunas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-5 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Belum Lunas</span>
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-all">
              <AlertCircle size={20} className="text-red-600" />
            </div>
          </div>
          <p className="font-black text-3xl text-red-600">{summary?.pending_orders ?? 0}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              Butuh konfirmasi
            </span>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-black text-gray-800">Grafik Order Hari Ini</h2>
            <p className="text-xs text-gray-400 mt-0.5">Jumlah pesanan per jam (semua status)</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }}
              tickFormatter={(v) => `${v}`}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: '#f8f9ff', radius: 8 }}
              formatter={(value: number) => [`${value} pesanan`, 'Jumlah Order']}
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#1f2937' }}
            />
            <Bar dataKey="orders" fill="#6367FF" radius={[10, 10, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-gray-800">Pesanan Terbaru</h2>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Auto-refresh setiap 10 detik
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-4 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">No. Order</th>
                <th className="text-left py-4 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Customer</th>
                <th className="text-left py-4 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Meja</th>
                <th className="text-left py-4 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Total</th>
                <th className="text-left py-4 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 font-medium italic">Belum ada pesanan terbaru</td>
                </tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-sm font-bold text-gray-700">
                      {order.order_number || `#${order.id}`}
                    </td>
                    <td className="py-4 px-4 text-sm font-medium">{order.customer_name || '-'}</td>
                    <td className="py-4 px-4 text-sm">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-bold text-gray-600">
                        {order.table_number || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm font-black text-[#6367FF]">
                      {formatPrice(Number(order.total))}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${getStatusStyle(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

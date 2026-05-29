// Explicit comment to trigger Vite HMR
import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  CreditCard, 
  ArrowUpRight, 
  Loader2, 
  Calendar,
  DollarSign,
  History,
  Clock,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { 
  analyticsService, 
  AnalyticsSummary, 
  ChartData, 
  TopMenu, 
  PaymentMethodData, 
  PeakHourData,
  Transaction
} from '../../services/analyticsService';

const COLORS = ['#6367FF', '#8494FF', '#A5B1FF', '#C6CEFF', '#E7EBFF'];

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-2xl ${className}`}></div>
);

export default function AnalyticsPage() {
  const [activePeriod, setActivePeriod] = useState('This Week');
  const [viewTab, setViewTab] = useState('Ringkasan');
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [data, setData] = useState<{
    summary: AnalyticsSummary | null;
    chart: ChartData[];
    topMenus: TopMenu[];
    payments: PaymentMethodData[];
    peakHours: PeakHourData[];
    transactions: Transaction[];
  }>({
    summary: null,
    chart: [],
    topMenus: [],
    payments: [],
    peakHours: [],
    transactions: []
  });

  useEffect(() => {
    fetchData();
  }, [activePeriod, viewTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (viewTab === 'Ringkasan') {
        const [summary, chart, topMenus, payments, peakHours] = await Promise.all([
          analyticsService.getSummary(activePeriod),
          analyticsService.getChartData(activePeriod),
          analyticsService.getTopMenus(activePeriod),
          analyticsService.getPaymentMethods(activePeriod),
          analyticsService.getPeakHours(activePeriod)
        ]);
        setData(prev => ({ ...prev, summary, chart, topMenus, payments, peakHours }));
      } else {
        const transactions = await analyticsService.getTransactionHistory(activePeriod);
        setData(prev => ({ ...prev, transactions }));
      }
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      setIsExporting(true);
      await analyticsService.exportReport(activePeriod, type);
    } catch (err) {
      console.error('Failed to export:', err);
      alert('Gagal mengekspor laporan');
    } finally {
      setIsExporting(false);
    }
  };

  const formatIDR = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const toWIB = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const clean = dateStr.replace('T', ' ').replace('Z', '').replace('.000000', '').split('.')[0];
    return new Date(clean);
  };

  const formatTime = (dateStr: string) => {
    return toWIB(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const groupedTransactions = data.transactions.reduce((acc, curr) => {
    const wibDate = toWIB(curr.created_at);
    const dateLabel = wibDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    
    if (!acc[dateLabel]) {
      acc[dateLabel] = { total: 0, items: [] };
    }
    acc[dateLabel].total += Number(curr.total);
    acc[dateLabel].items.push(curr);
    return acc;
  }, {} as Record<string, { total: number, items: Transaction[] }>);


  return (
    <div className="p-6 font-['Plus_Jakarta_Sans',_sans-serif]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 font-medium">Laporan performa bisnis Picpic Cafe</p>
        </div>
        
        {/* Period Filter Tabs */}
        <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 flex self-start">
          {(viewTab === 'Riwayat Transaksi' ? ['Semua', 'Today', 'This Week', 'This Month'] : ['Today', 'This Week', 'This Month']).map((tab) => (
            <button
              key={tab}
              onClick={() => setActivePeriod(tab)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activePeriod === tab 
                  ? 'bg-[#6367FF] text-white shadow-lg shadow-[#6367FF]/20' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => {
            setViewTab('Ringkasan');
            if (activePeriod === 'Semua') setActivePeriod('This Week');
          }}
          className={`flex items-center gap-2 px-6 py-4 border-b-2 font-bold transition-all ${
            viewTab === 'Ringkasan'
              ? 'border-[#6367FF] text-[#6367FF]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <TrendingUp size={18} />
          Ringkasan
        </button>
        <button
          onClick={() => setViewTab('Riwayat Transaksi')}
          className={`flex items-center gap-2 px-6 py-4 border-b-2 font-bold transition-all ${
            viewTab === 'Riwayat Transaksi'
              ? 'border-[#6367FF] text-[#6367FF]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <History size={18} />
          Riwayat Transaksi
        </button>
      </div>

      {viewTab === 'Ringkasan' ? (
        <>
      {/* SECTION 1: Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {loading ? (
          <>
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </>
        ) : (
          <>
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-green-50/50 group-hover:scale-110 transition-transform">
                <DollarSign size={80} strokeWidth={4} />
              </div>
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                <TrendingUp size={24} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pendapatan {activePeriod === 'Today' ? 'Hari Ini' : activePeriod === 'This Week' ? 'Mingguan' : 'Bulanan'}</p>
              <h3 className="text-2xl font-black text-gray-800">{formatIDR(data.summary?.period_revenue || 0)}</h3>
              <div className="flex items-center gap-1 mt-2 text-green-500 font-bold text-xs">
                <ArrowUpRight size={14} />
                <span>+12.5% vs kemarin</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-blue-50/50 group-hover:scale-110 transition-transform">
                <ShoppingBag size={80} strokeWidth={4} />
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <ShoppingBag size={24} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pesanan {activePeriod === 'Today' ? 'Hari Ini' : activePeriod === 'This Week' ? 'Mingguan' : 'Bulanan'}</p>
              <h3 className="text-2xl font-black text-gray-800">{data.summary?.period_orders || 0} Order</h3>
              <p className="text-xs text-gray-400 font-medium mt-2">Dipesan pada periode ini</p>
            </div>

            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-purple-50/50 group-hover:scale-110 transition-transform">
                <CreditCard size={80} strokeWidth={4} />
              </div>
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                <TrendingUp size={24} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Rata-rata Nilai Pesanan</p>
              <h3 className="text-2xl font-black text-gray-800">{formatIDR(data.summary?.avg_order_value || 0)}</h3>
              <p className="text-xs text-gray-400 font-medium mt-2">Per sekali transaksi</p>
            </div>
          </>
        )}
      </div>

      {/* SECTION 2: 7 Days Revenue Chart */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Tren Pendapatan</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              {activePeriod === 'Today' ? 'Pergerakan Jam' : activePeriod === 'This Week' ? '7 Hari Terakhir' : 'Bulan Ini'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#6367FF] rounded-full"></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Revenue</span>
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          {loading ? <Skeleton className="w-full h-full" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }}
                  tickFormatter={(val) => `Rp${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [formatIDR(value), 'Revenue']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6367FF" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#6367FF', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* SECTION 3: Top Menus & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Menus */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
          <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight mb-8">Top 5 Menu Terlaris</h3>
          <div className="space-y-6">
            {loading ? [1,2,3,4,5].map(i => <Skeleton key={i} className="h-12" />) : 
              data.topMenus.map((menu, idx) => (
                <div key={menu.name} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-gray-50 flex items-center justify-center rounded-lg text-[10px] font-black text-gray-400">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-bold text-gray-700">{menu.name}</span>
                    </div>
                    <span className="text-[10px] font-black text-[#6367FF] uppercase tracking-widest">
                      {menu.total_sold} Sold
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#6367FF] rounded-full transition-all duration-1000"
                      style={{ width: `${(menu.total_sold / data.topMenus[0]?.total_sold) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
          <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight mb-8">Metode Pembayaran</h3>
          <div className="h-[250px] w-full">
            {loading ? <Skeleton className="w-full h-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.payments}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="revenue"
                    nameKey="method"
                  >
                    {data.payments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => formatIDR(val)} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(val) => <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 4: Peak Hours */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
        <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight mb-8">Peak Order Hours</h3>
        <div className="h-[250px] w-full">
          {loading ? <Skeleton className="w-full h-full" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.peakHours}>
                <XAxis 
                  dataKey="hour" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#9CA3AF' }}
                />
                <Tooltip 
                  cursor={{ fill: '#F8F7FF' }}
                  contentStyle={{ borderRadius: '16px', border: 'none' }}
                />
                <Bar 
                  dataKey="orders" 
                  fill="#6367FF" 
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      </>
      ) : (
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 min-h-[500px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Riwayat Transaksi</h3>
            <div className="flex gap-3">
              <button 
                onClick={() => handleExport('pdf')}
                disabled={isExporting || data.transactions.length === 0}
                className="flex items-center gap-2 px-4 py-2 border border-[#766CA9] text-[#766CA9] rounded-xl font-bold text-xs hover:bg-[#766CA9] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText size={16} />
                {isExporting ? 'Mengunduh...' : 'Export PDF Harian'}
              </button>
              {/* Excel export temporarily disabled */}
              <button 
                onClick={() => handleExport('excel')}
                disabled={isExporting || data.transactions.length === 0}
                style={{ display: 'none' }}
                className="flex items-center gap-2 px-4 py-2 border border-[#766CA9] text-[#766CA9] rounded-xl font-bold text-xs hover:bg-[#766CA9] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileSpreadsheet size={16} />
                {isExporting ? 'Mengunduh...' : 'Export Excel Bulanan'}
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-12" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : data.transactions.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center">
              <History size={48} className="text-gray-200 mb-4" />
              <p className="text-gray-500 font-bold">Tidak ada transaksi di periode ini</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedTransactions).map(([date, group]) => (
                <div key={date}>
                  {/* Group Header */}
                  <div className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-2xl mb-4">
                    <span className="font-bold text-gray-700 text-sm flex items-center gap-2">
                      <Calendar size={16} className="text-[#6367FF]" />
                      {date}
                    </span>
                    <span className="font-black text-[#6367FF] text-sm">
                      {formatIDR(group.total)}
                    </span>
                  </div>
                  
                  {/* Transaction List */}
                  <div className="space-y-3">
                    {group.items.map((trx) => (
                      <div key={trx.id} className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="text-gray-400 flex items-center gap-1.5 text-xs font-bold w-20">
                            <Clock size={14} />
                            {formatTime(trx.created_at)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{trx.customer_name || 'Pelanggan'}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{trx.order_number}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            trx.payment_method === 'cash' ? 'bg-gray-100 text-gray-500' :
                            trx.payment_method === 'transfer' ? 'bg-blue-50 text-blue-500' :
                            trx.payment_method === 'qris' ? 'bg-green-50 text-green-500' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {trx.payment_method || 'Unknown'}
                          </span>
                          <span className="font-black text-gray-800 min-w-[100px] text-right">
                            {formatIDR(trx.total)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

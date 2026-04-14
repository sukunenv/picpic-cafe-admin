import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Image as ImageIcon,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Menu as MenuIcon,
  Check,
  Loader2,
  X,
  CreditCard,
  QrCode,
  Banknote,
  Layers,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import DashboardPage from './components/DashboardPage';
import KasirPage from './components/KasirPage';
import OrdersPage from './components/OrdersPage';
import CategoriesPage from './components/CategoriesPage';
import MenuPage from './components/MenuPage';
import BannersPage from './components/BannersPage';
import AnalyticsPage from './components/AnalyticsPage';
import SettingsPage from './components/SettingsPage';
import LoginPage from './components/LoginPage';
import ReceiptModal from './components/ReceiptModal';
import MembersPage from './components/MembersPage';
import MemberDetailPage from './components/MemberDetailPage';
import AccessDenied from './components/AccessDenied';
import { Navigate } from 'react-router';
import api from '../lib/api';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface OrderItem extends MenuItem {
  quantity: number;
  notes: string;
}

function Sidebar({ isCollapsed, onToggle }: { isCollapsed: boolean; onToggle: () => void }) {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Kasir', icon: ShoppingCart, path: '/kasir' },
    { name: 'Orders', icon: Package, path: '/orders' },
    { name: 'Members', icon: Users, path: '/members' },
    { name: 'Menu', icon: MenuIcon, path: '/menu' },
    { name: 'Kategori', icon: Layers, path: '/categories' },
    { name: 'Banners', icon: ImageIcon, path: '/banners' },
    { name: 'Analytics', icon: BarChart3, path: '/analytics' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out relative`}>
      {/* Toggle Button - Optimized for Touch (approx 40x40px) */}
      <button 
        onClick={onToggle}
        className="absolute -right-4 top-20 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-all z-20 active:scale-90"
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <div className={`p-4 ${isCollapsed ? 'px-2' : 'p-6'}`}>
        <div className={`flex items-center gap-3 mb-10 ${isCollapsed ? 'justify-center' : ''}`}>
          <img 
            src="/logo.png" 
            alt="Picpic Logo" 
            className="w-10 h-10 object-contain flex-shrink-0" 
          />
          <span className={`font-black text-xl text-[#6367FF] tracking-tighter transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-full'}`}>
            Picpic Admin
          </span>
        </div>

        <div className="mb-4">
          <p className={`text-[10px] font-black uppercase text-gray-400 mb-4 transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'text-center' : 'px-4'}`}>
            {isCollapsed ? '•••' : 'Main Menu'}
          </p>
          <nav className="space-y-2">
            {navItems.map(item => (
              <Link
                key={item.name}
                to={item.path}
                title={isCollapsed ? item.name : ''}
                className={`w-full flex items-center rounded-2xl transition-all h-12 overflow-hidden ${
                  isCollapsed ? 'justify-center px-0' : 'px-4 gap-3'
                } ${
                  location.pathname === item.path
                    ? 'bg-[#6367FF] text-white shadow-lg shadow-[#6367FF]/20'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon size={20} className="flex-shrink-0" />
                <span className={`text-sm font-bold whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-full'}`}>
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className={`mt-auto p-4 ${isCollapsed ? 'px-2' : 'p-6'}`}>
        <button 
          onClick={() => {
            localStorage.removeItem('picpic_auth_token');
            localStorage.removeItem('picpic_user');
            localStorage.removeItem('user_role');
            window.location.href = '/login';
          }}
          title={isCollapsed ? 'Logout' : ''}
          className={`w-full flex items-center rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold h-12 overflow-hidden ${
            isCollapsed ? 'justify-center px-0' : 'px-4 gap-3'
          }`}
        >
          <LogOut size={20} className="flex-shrink-0" />
          <span className={`text-sm whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-full'}`}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}

function RightPanel({ 
  orderItems, 
  paymentMethod, 
  setPaymentMethod,
  customerName,
  setCustomerName,
  tableNumber,
  setTableNumber,
  onProceedCheckout,
  loading
}: {
  orderItems: OrderItem[];
  paymentMethod: 'Cash' | 'QRIS' | 'Transfer' | null;
  setPaymentMethod: (method: 'Cash' | 'QRIS' | 'Transfer') => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  onProceedCheckout: () => void;
  loading: boolean;
}) {
  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal;

  return (
    <aside className="w-[320px] bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6367FF] flex items-center justify-center">
              <span className="text-white font-bold text-sm">AP</span>
            </div>
            <div>
              <p className="font-bold text-sm">Admin Picpic</p>
              <p className="text-xs text-gray-500">Picpic Admin</p>
            </div>
          </div>
          <button className="relative p-2 hover:bg-gray-50 rounded-lg">
            <Bell size={18} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-6 space-y-3">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
              Nama Customer <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nama pembeli..."
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6367FF]"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
              No. Meja
            </label>
            <input
              type="text"
              placeholder="Nomor meja... (opsional)"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#6367FF]"
            />
          </div>
        </div>

        <h3 className="font-bold mb-3 text-gray-700">Detail Pesanan</h3>

        <div className="space-y-3 mb-4">
          {orderItems.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Belum ada pesanan</p>
          ) : (
            orderItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{item.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{item.quantity}x</span>
                    {item.notes && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                        {item.notes}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-[#6367FF]">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {orderItems.length > 0 && (
          <>
            <div className="border-t border-gray-200 pt-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-[#6367FF]">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-bold mb-3">Metode Pembayaran</p>
              <div className="grid grid-cols-3 gap-2">
                {(['Cash', 'QRIS', 'Transfer'] as const).map(method => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2.5 text-sm rounded-xl border-2 transition-all ${
                      paymentMethod === method
                        ? 'border-[#6367FF] bg-[#6367FF] text-white font-bold shadow-md shadow-[#6367FF]/20'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={onProceedCheckout}
              disabled={loading || !customerName.trim() || orderItems.length === 0 || !paymentMethod}
              className={`w-full py-4 rounded-xl font-black transition-all flex items-center justify-center gap-3 ${
                loading || !customerName.trim() || orderItems.length === 0 || !paymentMethod
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#6367FF] text-white hover:bg-[#5558DD] shadow-lg shadow-[#6367FF]/30 active:scale-[0.98]'
              }`}
            >
              Proses Pesanan
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const role = localStorage.getItem('user_role') || 'kasir';
  if (!allowedRoles.includes(role)) {
    return <AccessDenied />;
  }
  return <>{children}</>;
};

function AppContent() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'QRIS' | 'Transfer' | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };
  
  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cashAmount, setCashAmount] = useState<number>(0);

  // Receipt Modal States
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const [paymentSettings, setPaymentSettings] = useState({
    bankName: 'BANK BCA',
    accountNumber: '1234567890',
    accountHolder: 'PICPIC CAFE'
  });

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('settings_payment') || '{}');
      if (stored.bankName || stored.accountNumber) {
        setPaymentSettings({
          bankName: stored.bankName || paymentSettings.bankName,
          accountNumber: stored.accountNumber || paymentSettings.accountNumber,
          accountHolder: stored.accountHolder || paymentSettings.accountHolder,
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    const expiresAt = localStorage.getItem('token_expires_at');
    if (expiresAt && new Date() > new Date(expiresAt)) {
      localStorage.removeItem('picpic_auth_token');
      localStorage.removeItem('picpic_user');
      localStorage.removeItem('user_role');
      localStorage.removeItem('token_expires_at');
      alert('Sesi kamu telah berakhir, silakan login kembali');
      window.location.href = '/login';
    }
  }, [location.pathname]);
  
  const isAuthenticated = !!localStorage.getItem('picpic_auth_token');
  const location = useLocation();

  const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const changeAmount = cashAmount - total;

  const addToOrder = (item: MenuItem, notes: string) => {
    const existingItem = orderItems.find(oi => oi.id === item.id && oi.notes === notes);

    if (existingItem) {
      setOrderItems(orderItems.map(oi =>
        oi.id === item.id && oi.notes === notes
          ? { ...oi, quantity: oi.quantity + 1 }
          : oi
      ));
    } else {
      setOrderItems([...orderItems, { ...item, quantity: 1, notes }]);
    }
  };

  const handleCheckout = async () => {
    try {
      setOrderLoading(true);
      const payload = {
        customer_name: customerName,
        table_number: tableNumber,
        payment_method: paymentMethod?.toLowerCase(),
        items: orderItems.map(item => ({
          menu_id: parseInt(item.id),
          quantity: item.quantity,
          price: item.price,
          notes: item.notes
        }))
      };

      const response = await api.post('/orders', payload);
      const order = response.data;
      
      // Prepare Receipt Data
      setReceiptData({
        order_number: order.order_number,
        customer_name: customerName,
        table_number: tableNumber,
        items: orderItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total: total,
        method: paymentMethod || '',
        change: paymentMethod === 'Cash' ? changeAmount : 0,
        date: new Date().toLocaleString('id-ID')
      });

      // Cleanup & Next Step
      setShowPaymentModal(false);
      setShowSuccessModal(true);
      
      // Reset Order State
      setOrderItems([]);
      setCustomerName('');
      setTableNumber('');
      setPaymentMethod(null);
      setCashAmount(0);
    } catch (err: any) {
      console.error('Checkout failed:', err);
      alert('Gagal memproses pesanan: ' + (err.response?.data?.message || err.message));
    } finally {
      setOrderLoading(false);
    }
  };

  // If not authenticated and not on login page, redirect to login
  if (!isAuthenticated && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  // If already authenticated and on login page, redirect to home
  if (isAuthenticated && location.pathname === '/login') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex h-screen bg-[#F8F7FF] font-['Plus_Jakarta_Sans',_sans-serif]">
      {isAuthenticated && <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />}

      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/kasir" element={<KasirPage onAddToOrder={addToOrder} />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/members" element={<ProtectedRoute allowedRoles={['admin', 'owner']}><MembersPage /></ProtectedRoute>} />
          <Route path="/members/:id" element={<ProtectedRoute allowedRoles={['admin', 'owner']}><MemberDetailPage /></ProtectedRoute>} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/banners" element={<BannersPage />} />
          <Route path="/analytics" element={<ProtectedRoute allowedRoles={['admin', 'owner']}><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin', 'owner', 'kasir']}><SettingsPage /></ProtectedRoute>} />
        </Routes>
      </main>

      {isAuthenticated && location.pathname === '/kasir' && (
        <RightPanel
          orderItems={orderItems}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          customerName={customerName}
          setCustomerName={setCustomerName}
          tableNumber={tableNumber}
          setTableNumber={setTableNumber}
          onProceedCheckout={() => setShowPaymentModal(true)}
          loading={orderLoading}
        />
      )}

      {/* Payment Confirmation Modal */}
      {showPaymentModal && paymentMethod && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[40px] p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Konfirmasi Pembayaran</h2>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-50 rounded-full transition-all text-gray-400">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-[#6367FF]/5 p-6 rounded-[24px] text-center border-2 border-[#6367FF]/10">
                <p className="text-[10px] font-black text-[#6367FF] uppercase tracking-widest mb-1">Total Belanja</p>
                <h3 className="text-3xl font-black text-gray-800">Rp {total.toLocaleString('id-ID')}</h3>
              </div>

              {paymentMethod === 'Cash' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Banknote className="text-gray-400" size={18} />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pembayaran Cash</span>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Uang Diterima</label>
                    <input
                      type="number"
                      value={cashAmount || ''}
                      onChange={(e) => setCashAmount(Number(e.target.value))}
                      placeholder="Masukkan jumlah uang..."
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#6367FF] transition-all font-black text-lg text-gray-800"
                    />
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Kembalian</span>
                    <span className={`text-xl font-black ${changeAmount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      Rp {changeAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              )}

              {paymentMethod === 'QRIS' && (
                <div className="space-y-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <QrCode className="text-gray-400" size={18} />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pembayaran QRIS</span>
                  </div>
                  <div className="bg-white p-4 inline-block rounded-3xl border-2 border-gray-100 shadow-md">
                    <img 
                      src="/qris.png" 
                      alt="QRIS Picpic Cafe"
                      className="w-48 h-48 mx-auto"
                      onError={(e) => (e.currentTarget.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=QRIS-NOT-FOUND')}
                    />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-[#6367FF]">Rp {total.toLocaleString('id-ID')}</h4>
                    <p className="text-sm font-bold text-gray-600 mt-2">Scan QR code untuk membayar</p>
                  </div>
                </div>
              )}

              {paymentMethod === 'Transfer' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-2">
                    <CreditCard className="text-gray-400" size={18} />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pembayaran Transfer</span>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-3xl space-y-3 border border-gray-100">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nama Bank</p>
                      <p className="font-black text-gray-800">{paymentSettings.bankName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nomor Rekening</p>
                      <p className="text-xl font-black text-[#6367FF]">{paymentSettings.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Atas Nama</p>
                      <p className="font-bold text-gray-800">{paymentSettings.accountHolder}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8">
              <button
                onClick={handleCheckout}
                disabled={orderLoading || (paymentMethod === 'Cash' && changeAmount < 0)}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 ${
                  orderLoading || (paymentMethod === 'Cash' && changeAmount < 0)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#6367FF] text-white hover:bg-[#5558DD] shadow-xl shadow-[#6367FF]/30 active:scale-95'
                }`}
              >
                {orderLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  paymentMethod === 'Cash' ? 'Konfirmasi Lunas' : 
                  paymentMethod === 'QRIS' ? 'Konfirmasi Sudah Dibayar' : 
                  'Konfirmasi Sudah Transfer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm shadow-green-100">
              <Check size={48} strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2 tracking-tight uppercase">Pesanan Berhasil!</h3>
            <p className="text-gray-500 mb-8 font-medium">Pesanan telah tercatat ke sistem dan siap diproses oleh kru dapur.</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setShowReceiptModal(true);
                }}
                className="w-full py-4 bg-[#6367FF] text-white rounded-2xl font-black shadow-lg shadow-[#6367FF]/20 hover:bg-[#5558DD] transition-all uppercase tracking-widest text-[10px]"
              >
                Cetak Struk
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all uppercase tracking-widest text-[10px]"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal 
        isOpen={showReceiptModal} 
        onClose={() => setShowReceiptModal(false)} 
        data={receiptData} 
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

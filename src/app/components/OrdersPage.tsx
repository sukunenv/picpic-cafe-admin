import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2, ListOrdered, CheckCircle2, Eye, X } from 'lucide-react';
import api from '../../lib/api';

interface OrderItem {
  id: number;
  menu: {
    name: string;
    image?: string;
  };
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  table_number: string;
  total: number;
  status: string;
  order_items: OrderItem[];
  payment_method: string;
  created_at: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  
  // Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchOrders(1, activeFilter);
  }, [activeFilter]);

  const fetchOrders = async (page: number, status: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (status !== 'Semua') {
        params.append('status', status);
      }

      const response = await api.get(`/orders?${params.toString()}`);
      setOrders(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
        from: response.data.from,
        to: response.data.to,
      });
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetail = async (id: number) => {
    try {
      setLoadingDetail(true);
      const response = await api.get(`/orders/${id}`);
      setSelectedOrder(response.data);
    } catch (err) {
      alert('Gagal mengambil detail pesanan.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const markAsPaid = async (id: number) => {
    try {
      setIsUpdating(id);
      await api.patch(`/orders/${id}`, { status: 'completed' });
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === id ? { ...order, status: 'completed' } : order
      ));
      
      // Update modal state if open
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status: 'completed' });
      }
    } catch (err) {
      alert('Gagal memperbarui status pesanan.');
    } finally {
      setIsUpdating(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="animate-spin text-[#6367FF] mb-4" size={40} />
        <p className="text-gray-500 font-medium">Memuat Pesanan...</p>
      </div>
    );
  }

  return (
    <div className="p-6 font-['Plus_Jakarta_Sans',_sans-serif]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-2xl text-gray-800 tracking-tight">Manajemen Pesanan</h1>
          <p className="text-sm text-gray-500">Pantau dan kelola semua transaksi cafe</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
          <ListOrdered size={18} className="text-[#6367FF]" />
          <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">{pagination?.total || 0} Total</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['Semua', 'Pending', 'Lunas'].map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeFilter === filter
                ? 'bg-[#6367FF] text-white shadow-lg shadow-[#6367FF]/30'
                : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 overflow-hidden">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-5 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">No. Order</th>
                <th className="text-left py-5 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Customer</th>
                <th className="text-left py-5 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Meja</th>
                <th className="text-left py-5 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                <th className="text-left py-5 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Total</th>
                <th className="text-left py-5 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-300">
                      <ListOrdered size={48} />
                      <p className="font-bold uppercase tracking-widest text-xs">Belum ada pesanan</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 text-xs font-black text-gray-800">{order.order_number}</td>
                    <td className="py-4 px-4 text-sm font-bold text-gray-700">{order.customer_name || '-'}</td>
                    <td className="py-4 px-4 border-none">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black">
                        {order.table_number || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-lg font-black inline-flex items-center gap-1.5 ${
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-600 shadow-sm'
                          : 'bg-amber-50 text-amber-600 shadow-sm'
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${order.status === 'completed' ? 'bg-green-600' : 'bg-amber-600'}`}></div>
                        {order.status === 'completed' ? 'Lunas' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-black text-[#6367FF]">{formatPrice(order.total)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => fetchOrderDetail(order.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#6367FF] text-[#6367FF] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#6367FF] hover:text-white transition-all shadow-sm"
                        >
                          <Eye size={12} />
                          Detail
                        </button>
                        
                        {order.status === 'pending' && (
                          <button
                            onClick={() => markAsPaid(order.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-600 active:scale-95 transition-all shadow-md shadow-green-500/20"
                          >
                            {isUpdating === order.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                            Bayar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination omitted for brevity, keeping same logic */}
        {pagination && pagination.total > 0 && (
          <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Menampilkan <span className="text-gray-800">{pagination.from}</span> sampai <span className="text-gray-800">{pagination.to}</span> dari <span className="text-gray-800">{pagination.total}</span> pesanan
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchOrders(pagination.current_page - 1, activeFilter)}
                disabled={pagination.current_page === 1}
                className={`p-2 rounded-xl border border-gray-100 transition-all ${
                  pagination.current_page === 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50 shadow-sm'
                }`}
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-1.5 px-3">
                <span className="text-[10px] font-black text-gray-800">{pagination.current_page}</span>
                <span className="text-[10px] font-black text-gray-400">/</span>
                <span className="text-[10px] font-black text-gray-400">{pagination.last_page}</span>
              </div>
              <button
                onClick={() => fetchOrders(pagination.current_page + 1, activeFilter)}
                disabled={pagination.current_page === pagination.last_page}
                className={`p-2 rounded-xl border border-gray-100 transition-all ${
                  pagination.current_page === pagination.last_page ? 'text-gray-200 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50 shadow-sm'
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {(selectedOrder || loadingDetail) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="flex items-center justify-between p-8 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Detail Pesanan</h2>
                {selectedOrder && (
                  <p className="text-xs text-gray-400 font-bold mt-1">
                    {selectedOrder.order_number} • {formatDate(selectedOrder.created_at)}
                  </p>
                )}
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto">
              {loadingDetail ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="animate-spin text-[#6367FF]" size={32} />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mengambil Detail...</p>
                </div>
              ) : selectedOrder && (
                <div className="space-y-6">
                  {/* Customer Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                      <p className="text-sm font-black text-gray-800">{selectedOrder.customer_name || '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Nomor Meja</p>
                      <p className="text-sm font-black text-gray-800">{selectedOrder.table_number || '-'}</p>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="border border-gray-100 rounded-2xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 text-[9px] font-black uppercase text-gray-400">Item</th>
                          <th className="text-center py-3 px-2 text-[9px] font-black uppercase text-gray-400">Qty</th>
                          <th className="text-right py-3 px-4 text-[9px] font-black uppercase text-gray-400">Harga</th>
                          <th className="text-right py-3 px-4 text-[9px] font-black uppercase text-gray-400">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {selectedOrder.order_items.map((item) => (
                          <tr key={item.id}>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={item.menu.image || '/logo.png'} 
                                  className="w-10 h-10 rounded-lg object-cover bg-gray-100" 
                                  onError={(e) => (e.currentTarget.src = '/logo.png')}
                                />
                                <div>
                                  <p className="text-xs font-black text-gray-800">{item.menu.name}</p>
                                  {item.notes && <p className="text-[9px] text-gray-400 font-bold italic">"{item.notes}"</p>}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center text-xs font-bold text-gray-600">x{item.quantity}</td>
                            <td className="py-3 px-4 text-right text-xs font-bold text-gray-500">{formatPrice(item.price)}</td>
                            <td className="py-3 px-4 text-right text-xs font-black text-gray-800">{formatPrice(item.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Payment & Total */}
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between text-gray-500">
                      <span className="text-[10px] font-black uppercase tracking-widest">Metode Pembayaran</span>
                      <span className="text-xs font-bold uppercase">{selectedOrder.payment_method || 'CASH'}</span>
                    </div>
                    <div className="h-px bg-gray-100"></div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Total Pembayaran</span>
                      <span className="text-2xl font-black text-[#6367FF]">{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>

                  {/* Modal Action */}
                  <div className="pt-4">
                    {selectedOrder.status === 'pending' ? (
                      <button
                        onClick={() => markAsPaid(selectedOrder.id)}
                        disabled={isUpdating === selectedOrder.id}
                        className="w-full py-4 bg-green-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-green-500/30 hover:bg-green-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        {isUpdating === selectedOrder.id ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <>
                            <CheckCircle2 size={18} />
                            Tandai Lunas & Selesaikan
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="w-full py-4 bg-gray-100 text-green-600 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                        <CheckCircle2 size={18} />
                        Pesanan ini telah lunas
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

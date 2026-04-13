import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Award, 
  TrendingUp, 
  ShoppingBag, 
  Clock,
  RefreshCw,
  UserX,
  Loader2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router';
import api from '../../lib/api';

const MemberDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/members/${id}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch member details:', err);
      alert('Gagal mengambil data member.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleResetPoints = async () => {
    if (!window.confirm('Apakah Anda yakin ingin meriset poin member ini menjadi 0?')) return;
    
    try {
      setActionLoading(true);
      await api.post(`/admin/members/${id}/reset-points`);
      alert('Poin berhasil direset.');
      fetchData();
    } catch (err) {
      alert('Gagal meriset poin.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    const action = data?.member?.deleted_at ? 'mengaktifkan' : 'menonaktifkan';
    if (!window.confirm(`Apakah Anda yakin ingin ${action} akun ini?`)) return;

    try {
      setActionLoading(true);
      await api.put(`/admin/members/${id}/status`);
      alert(`Akun berhasil di${action === 'mengaktifkan' ? 'aktifkan' : 'nonaktifkan'}.`);
      fetchData();
    } catch (err) {
      alert('Gagal mengubah status akun.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F8F7FF]">
        <Loader2 className="animate-spin text-[#6367FF] mb-4" size={48} />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Memuat detail member...</p>
      </div>
    );
  }

  const { member, stats, orders } = data;

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'gold': return 'from-amber-400 to-amber-600';
      case 'silver': return 'from-slate-400 to-slate-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  return (
    <div className="p-8 font-['Plus_Jakarta_Sans',_sans-serif] bg-[#F8F7FF] min-h-screen">
      {/* Top Bar */}
      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={() => navigate('/members')}
          className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#6367FF] hover:shadow-lg transition-all shadow-sm border border-gray-100"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Detail Member</h1>
          <p className="text-sm text-gray-500 font-medium">Informasi lengkap dan riwayat pelanggan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[40px] p-10 shadow-xl shadow-gray-200/50 border border-gray-50 text-center relative overflow-hidden">
            {/* Background Accent */}
            <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-br ${getTierColor(member.tier)} opacity-10`} />
            
            <div className="relative">
              <div className="w-32 h-32 rounded-full mx-auto mb-6 p-1 bg-white shadow-xl">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-[#6367FF] font-black text-4xl border-4 border-gray-50">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    member.name.charAt(0).toUpperCase()
                  )}
                </div>
              </div>

              <span className={`px-4 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest bg-gradient-to-r ${getTierColor(member.tier)} shadow-lg mb-4 inline-block`}>
                {member.tier} Member
              </span>
              
              <h2 className="text-2xl font-black text-gray-800 mb-1">{member.name}</h2>
              <p className="text-gray-400 font-medium text-sm mb-8">{member.email}</p>

              <div className="space-y-4 text-left border-t border-gray-50 pt-8">
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No. Handphone</p>
                    <p className="font-bold text-sm tracking-tight">{member.phone || 'Tidak tersedia'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bergabung</p>
                    <p className="font-bold text-sm tracking-tight">{new Date(member.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loyalty Info */}
          <div className="bg-[#2D2B55] rounded-[40px] p-8 text-white shadow-xl shadow-[#2D2B55]/20 relative overflow-hidden">
             <Award className="absolute -right-6 -bottom-6 text-white/5" size={160} />
             
             <div className="relative">
               <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Total Loyalitas</p>
               <div className="flex items-end justify-between mb-8">
                 <h3 className="text-4xl font-black">{member.points.toLocaleString('id-ID')} <span className="text-sm font-bold text-white/60">Poin</span></h3>
                 <TrendingUp className="text-green-400 mb-2" size={24} />
               </div>

               <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                   <span>Regular</span>
                   <span>Silver</span>
                   <span>Gold</span>
                 </div>
                 <div className="h-3 bg-white/10 rounded-full overflow-hidden flex p-0.5">
                   <div 
                    className={`h-full rounded-full bg-gradient-to-r ${getTierColor(member.tier)} shadow-[0_0_15px_rgba(99,103,255,0.5)]`}
                    style={{ width: `${Math.min(100, (member.points / 5000) * 100)}%` }}
                   />
                 </div>
                 <p className="text-[10px] font-bold text-white/50 mt-4 italic">Poin akan kadaluarsa pada {new Date(new Date(member.created_at).setFullYear(new Date(member.created_at).getFullYear() + 1)).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
               </div>
             </div>
          </div>

          {/* Critical Actions */}
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 px-1 text-center">Tindakan Admin</h4>
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={handleResetPoints}
                disabled={actionLoading}
                className="w-full py-4 bg-gray-50 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-50 hover:text-amber-600 transition-all flex items-center justify-center gap-3 border border-transparent hover:border-amber-200 shadow-sm"
              >
                <RefreshCw size={16} className={actionLoading ? 'animate-spin' : ''} />
                Reset Poin Member
              </button>
              <button 
                onClick={handleToggleStatus}
                disabled={actionLoading}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 border shadow-sm ${
                  member.deleted_at 
                    ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                    : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                }`}
              >
                <UserX size={16} />
                {member.deleted_at ? 'Aktifkan Akun' : 'Nonaktifkan Akun'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Columns - Stats & Orders */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[32px] border border-gray-50 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
                <ShoppingBag size={24} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Order</p>
              <h4 className="text-2xl font-black text-gray-800">{stats.total_orders} <span className="text-xs text-gray-400">Transaksi</span></h4>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-gray-50 shadow-sm">
              <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mb-4">
                <TrendingUp size={24} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Belanja</p>
              <h4 className="text-2xl font-black text-gray-800">Rp {stats.total_spent.toLocaleString('id-ID')}</h4>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-gray-50 shadow-sm">
              <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-4">
                <Clock size={24} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Terakhir</p>
              <h4 className="text-sm font-black text-gray-800 truncate">
                {stats.last_order ? new Date(stats.last_order).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Belum ada order'}
              </h4>
            </div>
          </div>

          {/* Order History */}
          <div className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 border border-gray-50 overflow-hidden">
            <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Riwayat Transaksi</h3>
              <div className="flex items-center gap-2 text-xs font-bold text-[#6367FF] bg-[#6367FF]/5 px-4 py-2 rounded-full">
                <ShoppingBag size={14} />
                {orders.length} Order
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">No. Order</th>
                    <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tanggal</th>
                    <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total</th>
                    <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-10 py-20 text-center">
                        <p className="text-gray-400 font-bold">Belum ada riwayat transaksi</p>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50/30 transition-colors group">
                        <td className="px-10 py-6">
                          <span className="font-black text-gray-800">#{order.order_number}</span>
                        </td>
                        <td className="px-10 py-6">
                           <p className="text-xs font-bold text-gray-600">
                             {new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                           </p>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <span className="font-black text-[#6367FF]">Rp {parseFloat(order.total ?? order.total_price ?? 0).toLocaleString('id-ID')}</span>
                        </td>
                        <td className="px-10 py-6 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            order.status === 'done' ? 'bg-green-100 text-green-600' : 
                            order.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                            'bg-red-100 text-red-600'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-center">
                           <Link 
                            to={`/orders`}
                            className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-[#6367FF] hover:text-white transition-all inline-block shadow-sm"
                           >
                              <ExternalLink size={16} />
                           </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailPage;

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ChevronRight, 
  Mail, 
  Phone, 
  Calendar, 
  Award,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router';
import api from '../../lib/api';

interface Member {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  points: number;
  tier: string;
  created_at: string;
}

const MembersPage = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [pagination, setPagination] = useState({
    current_page: 1, last_page: 1, total: 0, from: 0, to: 0
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTier, setActiveTier] = useState('Semua');

  const tiers = ['Semua', 'Regular', 'Silver', 'Gold'];

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/members', {
        params: {
          search: search || undefined,
          tier: activeTier !== 'Semua' ? activeTier : undefined,
          page: page,
          per_page: 10
        }
      });
      setMembers(res.data.data);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
        from: res.data.from,
        to: res.data.to,
      });
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, activeTier]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, activeTier, page]);

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'gold': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'silver': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-blue-100 text-blue-600 border-blue-200';
    }
  };

  return (
    <div className="p-4 lg:p-8 font-['Plus_Jakarta_Sans',_sans-serif]">
      {/* Header */}
      <div className="mb-6 lg:mb-10">
        <h1 className="text-xl lg:text-2xl font-black text-gray-800 tracking-tight uppercase">Manajemen Member</h1>
        <p className="text-xs lg:text-sm text-gray-500 font-medium">Kelola data pelanggan dan loyalitas PicPic Cafe</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 lg:mb-10 items-center justify-between">
        {/* Search */}
        <div className="relative w-full lg:w-[400px] group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6367FF] transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Cari member by nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-3 lg:py-4 bg-white border border-gray-100 rounded-[20px] shadow-sm focus:outline-none focus:border-[#6367FF]/50 transition-all font-bold text-xs lg:text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex bg-white p-1 rounded-full shadow-sm border border-gray-100 overflow-x-auto no-scrollbar max-w-full">
          {tiers.map((tier) => (
            <button
              key={tier}
              onClick={() => setActiveTier(tier)}
              className={`px-4 lg:px-8 py-2 rounded-full text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTier === tier 
                  ? 'bg-[#6367FF] text-white shadow-lg shadow-[#6367FF]/30' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl lg:rounded-[40px] shadow-xl shadow-gray-200/50 border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed min-w-[900px] lg:min-w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Member</th>
                <th className="w-[150px] px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kontak</th>
                <th className="w-[120px] px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Tier</th>
                <th className="w-[100px] px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Poin</th>
                <th className="w-[140px] px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Bergabung</th>
                <th className="w-[100px] px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-20 text-center">
                    <Loader2 className="animate-spin text-[#6367FF] mx-auto mb-4" size={32} />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Memuat data member...</p>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                      <Users size={32} />
                    </div>
                    <p className="text-sm text-gray-500 font-bold">Member tidak ditemukan</p>
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md bg-[#6367FF]/10 flex items-center justify-center text-[#6367FF] font-black text-sm flex-shrink-0">
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            member.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-gray-800 text-[11px] lg:text-sm truncate">{member.name}</p>
                          <p className="text-[10px] text-gray-400 font-medium truncate">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2 text-[10px] lg:text-xs font-bold text-gray-600">
                        <Phone size={12} className="text-gray-400" />
                        {member.phone || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-3 py-1 lg:px-4 lg:py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getTierColor(member.tier)}`}>
                        {member.tier}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <p className="font-black text-gray-800 text-[11px] lg:text-sm">{member.points.toLocaleString('id-ID')}</p>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2 text-[10px] lg:text-xs font-bold text-gray-500">
                        <Calendar size={12} />
                        {new Date(member.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Link 
                        to={`/members/${member.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 lg:w-auto lg:px-4 lg:py-1.5 bg-gray-50 text-gray-600 rounded-full hover:bg-[#6367FF] hover:text-white transition-all shadow-sm"
                        title="Detail Member"
                      >
                        <ExternalLink size={14} className="lg:hidden" />
                        <span className="hidden lg:inline text-[9px] font-black uppercase tracking-widest mr-1">Detail</span>
                        <ChevronRight size={14} className="hidden lg:inline" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {!loading && members.length > 0 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Showing {pagination.from || 0}-{pagination.to || 0} of {pagination.total} members
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-6 py-2.5 rounded-full bg-white border border-gray-200 text-xs font-black text-gray-600 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <div className="w-10 h-10 flex items-center justify-center bg-[#6367FF] text-white rounded-full text-xs font-black shadow-md shadow-[#6367FF]/30">
              {pagination.current_page}
            </div>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.last_page}
              className="px-6 py-2.5 rounded-full bg-white border border-gray-200 text-xs font-black text-gray-600 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersPage;

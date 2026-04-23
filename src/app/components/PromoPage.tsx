import { useState, useEffect } from 'react';
import { 
  Tag, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Percent,
  Banknote,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import api from '../../lib/api';

interface Menu {
  id: number | string;
  name: string;
  category?: { name: string };
  price: number;
}

interface Promotion {
  id: number | string;
  name: string;
  type: 'percent' | 'fixed';
  value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  menus?: Menu[];
}

export default function PromoPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editData, setEditData] = useState<Promotion | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<'percent' | 'fixed'>('percent');
  const [value, setValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedMenuIds, setSelectedMenuIds] = useState<(number | string)[]>([]);
  const [menuSearchTerm, setMenuSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [promoRes, menuRes] = await Promise.all([
        api.get('/admin/promotions'),
        api.get('/menus')
      ]);
      setPromotions(promoRes.data);
      setMenus(menuRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (promo: Promotion | null = null) => {
    if (promo) {
      setEditData(promo);
      setName(promo.name);
      setType(promo.type);
      setValue(promo.value.toString());
      setStartDate(promo.start_date.split(' ')[0]); // Get date part YYYY-MM-DD
      setEndDate(promo.end_date.split(' ')[0]);
      setIsActive(promo.is_active);
      setSelectedMenuIds(promo.menus?.map(m => m.id) || []);
    } else {
      setEditData(null);
      setName('');
      setType('percent');
      setValue('');
      setStartDate('');
      setEndDate('');
      setIsActive(true);
      setSelectedMenuIds([]);
    }
    setMenuSearchTerm('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMenuIds.length === 0) {
      alert('Pilih minimal satu menu untuk promo ini');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name,
        type,
        value: Number(value),
        start_date: startDate,
        end_date: endDate,
        is_active: isActive,
        menu_ids: selectedMenuIds
      };

      if (editData) {
        await api.put(`/admin/promotions/${editData.id}`, payload);
      } else {
        await api.post('/admin/promotions', payload);
      }

      setShowModal(false);
      fetchData();
    } catch (err: any) {
      console.error('Submit failed:', err);
      alert(err.response?.data?.message || 'Gagal menyimpan promo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm('Yakin ingin menghapus promo ini?')) return;
    try {
      await api.delete(`/admin/promotions/${id}`);
      fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Gagal menghapus promo');
    }
  };

  const toggleStatus = async (promo: Promotion) => {
    try {
      const payload = {
        name: promo.name,
        type: promo.type,
        value: promo.value,
        start_date: promo.start_date.split(' ')[0],
        end_date: promo.end_date.split(' ')[0],
        is_active: !promo.is_active,
        menu_ids: promo.menus?.map(m => m.id) || []
      };
      
      await api.put(`/admin/promotions/${promo.id}`, payload);
      setPromotions(promotions.map(p => 
        p.id === promo.id ? { ...p, is_active: !p.is_active } : p
      ));
    } catch (err) {
      console.error('Toggle status failed:', err);
      alert('Gagal mengubah status promo');
    }
  };

  const filteredPromotions = promotions.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMenus = menus.filter(m => 
    m.name.toLowerCase().includes(menuSearchTerm.toLowerCase()) ||
    m.category?.name.toLowerCase().includes(menuSearchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="p-8 font-['Plus_Jakarta_Sans']">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Manajemen Promo</h1>
          <p className="text-sm text-gray-500 font-medium">Buat diskon menarik untuk pelanggan Picpic Cafe</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#6367FF] text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-[#5558DD] transition-all shadow-lg shadow-[#6367FF]/20 active:scale-95"
        >
          <Plus size={18} /> Tambah Promo
        </button>
      </div>

      {/* Stats Recap */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#6367FF]">
            <Tag size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Promo</p>
            <p className="text-2xl font-black text-gray-800">{promotions.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-500">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Promo Aktif</p>
            <p className="text-2xl font-black text-gray-800">{promotions.filter(p => p.is_active).length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Mendatang</p>
            <p className="text-2xl font-black text-gray-800">
              {promotions.filter(p => new Date(p.start_date) > new Date()).length}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Berakhir</p>
            <p className="text-2xl font-black text-gray-800">
              {promotions.filter(p => new Date(p.end_date) < new Date()).length}
            </p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari promo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:border-[#6367FF] transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Detail Promo</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipe & Nilai</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Periode</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Menu</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-[#6367FF] mb-2" size={32} />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Memuat data promo...</p>
                  </td>
                </tr>
              ) : filteredPromotions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Tag className="text-gray-300" size={24} />
                    </div>
                    <p className="text-gray-400 font-bold">Belum ada promo yang terdaftar.</p>
                  </td>
                </tr>
              ) : (
                filteredPromotions.map((promo) => (
                  <tr key={promo.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-gray-800">{promo.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">ID: {String(promo.id).substring(0,8)}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {promo.type === 'percent' ? (
                          <div className="bg-orange-50 text-orange-600 px-2 py-1 rounded-lg flex items-center gap-1">
                            <Percent size={12} strokeWidth={3} />
                            <span className="text-xs font-black">{promo.value}%</span>
                          </div>
                        ) : (
                          <div className="bg-green-50 text-green-600 px-2 py-1 rounded-lg flex items-center gap-1">
                            <Banknote size={12} strokeWidth={3} />
                            <span className="text-xs font-black">{formatPrice(promo.value)}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight flex items-center gap-1">
                          <Calendar size={10} /> {formatDate(promo.start_date)}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight flex items-center gap-1">
                          <span className="w-2.5 inline-block text-center">—</span> {formatDate(promo.end_date)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-black text-[10px] uppercase tracking-widest border border-gray-200">
                        {promo.menus?.length || 0} Menu
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <button 
                        onClick={() => toggleStatus(promo)}
                        className={`w-12 h-6 rounded-full relative transition-all ${promo.is_active ? 'bg-[#6367FF]' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${promo.is_active ? 'left-7' : 'left-1'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleOpenModal(promo)}
                          className="p-2 text-gray-400 hover:text-[#6367FF] hover:bg-[#6367FF]/10 rounded-xl transition-all"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(promo.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <div>
                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">
                  {editData ? 'Edit Promo' : 'Tambah Promo Baru'}
                </h2>
                <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase">Konfigurasi Diskon Kafe Picpic</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-all"
              >
                <X size={28} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Left Column: Promo Details */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar border-r border-gray-50">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Nama Promo</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Grand Opening 50%..."
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-[#6367FF] focus:bg-white transition-all shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Tipe Diskon</label>
                      <select 
                        value={type}
                        onChange={(e) => setType(e.target.value as 'percent' | 'fixed')}
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-[#6367FF] focus:bg-white transition-all appearance-none shadow-sm"
                      >
                        <option value="percent">Persen (%)</option>
                        <option value="fixed">Nominal (Rp)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">
                        Nilai {type === 'percent' ? '(%)' : '(Rp)'}
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={type === 'percent' ? '50' : '10000'}
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-[#6367FF] focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Tanggal Mulai</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="date"
                          required
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-[#6367FF] focus:bg-white transition-all shadow-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Tanggal Selesai</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="date"
                          required
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-[#6367FF] focus:bg-white transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm">
                    <div>
                      <p className="text-xs font-black text-gray-800 uppercase tracking-tight">Status Aktif</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Promo bisa langsung digunakan</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsActive(!isActive)}
                      className={`w-12 h-6 rounded-full relative transition-all ${isActive ? 'bg-[#6367FF]' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${isActive ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex gap-3 sticky bottom-0 bg-white pb-2">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 px-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-4 px-8 bg-[#6367FF] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#6367FF]/20 hover:bg-[#5558DD] transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : null}
                    {editData ? 'Simpan Perubahan' : 'Terbitkan Promo'}
                  </button>
                </div>
              </form>

              {/* Right Column: Menu Selection */}
              <div className="flex-1 bg-gray-50/50 flex flex-col overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-white/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">Pilih Menu</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {selectedMenuIds.length} Menu Terpilih
                      </p>
                    </div>
                    {selectedMenuIds.length > 0 && (
                      <button 
                        onClick={() => setSelectedMenuIds([])}
                        className="text-[10px] font-black text-red-500 hover:underline uppercase tracking-widest"
                      >
                        Reset Pilihan
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Cari menu atau kategori..."
                      value={menuSearchTerm}
                      onChange={(e) => setMenuSearchTerm(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#6367FF] transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <div className="grid grid-cols-1 gap-2">
                    {filteredMenus.map(menu => {
                      const isSelected = selectedMenuIds.includes(menu.id);
                      return (
                        <button
                          key={menu.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedMenuIds(selectedMenuIds.filter(id => id !== menu.id));
                            } else {
                              setSelectedMenuIds([...selectedMenuIds, menu.id]);
                            }
                          }}
                          className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${
                            isSelected 
                              ? 'border-[#6367FF] bg-[#6367FF]/5 shadow-sm' 
                              : 'border-white bg-white hover:border-gray-200'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${
                            isSelected ? 'bg-[#6367FF] border-[#6367FF]' : 'bg-gray-100 border-gray-200'
                          }`}>
                            {isSelected && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-black truncate ${isSelected ? 'text-[#6367FF]' : 'text-gray-700'}`}>
                              {menu.name}
                            </p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                              {menu.category?.name || 'Uncategorized'} • {formatPrice(menu.price)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #D1D5DB;
        }
      `}</style>
    </div>
  );
}

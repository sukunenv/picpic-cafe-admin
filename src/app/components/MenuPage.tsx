import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  X, 
  ImageIcon, 
  AlertCircle,
  Coffee, GlassWater, Soup, Croissant, IceCream2, Cookie, UtensilsCrossed, Droplets
} from 'lucide-react';
import api from '../../lib/api';

function getCategoryIcon(name: string): React.ElementType {
  const n = name.toLowerCase();
  if (n.includes('coffee') || n.includes('kopi') || n.includes('espresso') || n.includes('latte')) return Coffee;
  if (n.includes('non coffee') || n.includes('noncoffee') || n.includes('non-coffee') || n.includes('minuman') || n.includes('juice') || n.includes('tea') || n.includes('teh') || n.includes('drink')) return GlassWater;
  if (n.includes('food') || n.includes('makanan') || n.includes('rice') || n.includes('nasi') || n.includes('mie')) return Soup;
  if (n.includes('pastry') || n.includes('roti') || n.includes('bread') || n.includes('sandwich')) return Croissant;
  if (n.includes('dessert') || n.includes('sweet') || n.includes('cake') || n.includes('kue')) return IceCream2;
  if (n.includes('snack') || n.includes('cemilan') || n.includes('gorengan')) return Cookie;
  if (n.includes('salad') || n.includes('soup') || n.includes('sayur')) return Droplets;
  return UtensilsCrossed;
}

interface Category {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  category_id: string;
  category?: { name: string };
  price: number;
  description: string;
  image: string;
  is_available: boolean;
}

export default function MenuPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<MenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    description: '',
    image: '',
    is_available: true
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menusRes, catsRes] = await Promise.all([
        api.get('/menus'),
        api.get('/categories')
      ]);
      setMenus(menusRes.data);
      setCategories(catsRes.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Gagal mengambil data menu.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (menu: MenuItem | null = null) => {
    if (menu) {
      setCurrentMenu(menu);
      setFormData({
        name: menu.name,
        category_id: menu.category_id,
        price: menu.price.toString(),
        description: menu.description || '',
        image: menu.image || '',
        is_available: menu.is_available
      });
    } else {
      setCurrentMenu(null);
      setFormData({
        name: '',
        category_id: categories[0]?.id || '',
        price: '',
        description: '',
        image: '',
        is_available: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentMenu(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...formData,
      price: Number(formData.price),
      is_available: formData.is_available
    };

    try {
      if (currentMenu) {
        await api.put(`/menus/${currentMenu.id}`, payload);
      } else {
        await api.post('/menus', payload);
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Gagal menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (menu: MenuItem) => {
    if (window.confirm(`Yakin hapus menu [${menu.name}]?`)) {
      try {
        await api.delete(`/menus/${menu.id}`);
        fetchData();
      } catch (err) {
        alert('Gagal menghapus menu.');
      }
    }
  };

  const handleToggleStatus = async (menu: MenuItem) => {
    try {
      await api.patch(`/menus/${menu.id}/status`);
      setMenus(menus.map(m => 
        m.id === menu.id ? { ...m, is_available: !m.is_available } : m
      ));
    } catch (err) {
      alert('Gagal update status.');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const totalPages = Math.ceil(menus.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = menus.slice(indexOfFirstItem, indexOfLastItem);

  if (loading && menus.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="animate-spin text-[#6367FF] mb-4" size={40} />
        <p className="text-gray-500 font-bold">Memuat Menu...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-2xl text-gray-800 uppercase tracking-tight">Menu Management</h1>
          <p className="text-sm text-gray-500">Kelola semua daftar hidangan Picpic Cafe</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-[#6367FF] text-white rounded-2xl font-black shadow-lg shadow-[#6367FF]/30 hover:bg-[#5558DD] active:scale-95 transition-all text-sm uppercase tracking-widest"
        >
          <Plus size={18} />
          Add Menu
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 overflow-hidden">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-5 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Foto</th>
                <th className="text-left py-5 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Nama</th>
                <th className="text-left py-5 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Kategori</th>
                <th className="text-left py-5 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Harga</th>
                <th className="text-left py-5 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                <th className="text-left py-5 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <img
                      src={item.image || '/logo.png'}
                      alt={item.name}
                      onError={(e) => (e.currentTarget.src = '/logo.png')}
                      className="w-14 h-14 rounded-2xl object-cover border border-gray-100 shadow-sm"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm font-black text-gray-800">{item.name}</p>
                    <p className="text-[10px] text-gray-400 line-clamp-1 max-w-[200px]">{item.description}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                      {item.category?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm font-black text-[#6367FF]">{formatPrice(item.price)}</p>
                  </td>
                  <td className="py-4 px-4">
                    <button 
                      onClick={() => handleToggleStatus(item)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        item.is_available ? 'bg-[#6367FF]' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          item.is_available ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="ml-2 text-[10px] font-bold text-gray-400 uppercase">
                      {item.is_available ? 'Available' : 'Sold Out'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleOpenModal(item)}
                        className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all shadow-sm"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item)}
                        className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-800">{indexOfFirstItem + 1}</span> to <span className="text-gray-800">{Math.min(indexOfLastItem, menus.length)}</span> of <span className="text-gray-800">{menus.length}</span> menus
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-xl border border-gray-100 transition-all ${
                currentPage === 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`p-2 rounded-xl border border-gray-100 transition-all ${
                currentPage === totalPages || totalPages === 0 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="flex items-center justify-between p-8 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">
                {currentMenu ? 'Edit Menu' : 'Add New Menu'}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Menu</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#6367FF] transition-all font-bold text-sm"
                    placeholder="Contoh: Cappuccino"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kategori</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => {
                      const Icon = getCategoryIcon(cat.name);
                      const isSelected = formData.category_id === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, category_id: cat.id })}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border-2 text-xs font-black transition-all ${
                            isSelected
                              ? 'border-[#6367FF] bg-[#6367FF] text-white shadow-md shadow-[#6367FF]/20'
                              : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200 hover:text-gray-700'
                          }`}
                        >
                          <Icon size={13} strokeWidth={isSelected ? 2.5 : 2} />
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Harga (IDR)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#6367FF] transition-all font-bold text-sm"
                    placeholder="35000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status Ketersediaan</label>
                  <div className="flex items-center gap-4 py-3 px-5 bg-gray-50 border border-gray-100 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_available: !formData.is_available })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        formData.is_available ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.is_available ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                    <span className="text-xs font-bold text-gray-600 uppercase">
                      {formData.is_available ? 'Available' : 'Sold Out'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deskripsi Hidangan</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#6367FF] transition-all font-bold text-sm min-h-[100px]"
                  placeholder="Ceritakan tentang menu ini..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">URL Foto Menu</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#6367FF] transition-all font-bold text-sm"
                  placeholder="https://example.com/foto-menu.jpg"
                />
                
                {/* Preview Image */}
                <div className="mt-4 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-100 rounded-3xl min-h-[160px] bg-gray-50/50">
                  {formData.image ? (
                    <div className="relative group overflow-hidden rounded-2xl shadow-md">
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        onError={(e) => (e.currentTarget.src = '/logo.png')}
                        className="max-h-32 object-contain" 
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <ImageIcon size={32} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Preview Area</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] py-4 bg-[#6367FF] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[#6367FF]/30 hover:bg-[#5558DD] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (currentMenu ? 'Update Menu' : 'Simpan Hidangan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

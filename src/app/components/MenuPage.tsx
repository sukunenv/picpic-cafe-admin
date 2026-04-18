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
  variants?: { name: string; price: number }[];
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
  const [variants, setVariants] = useState<{ name: string; price: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
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
      setVariants(menu.variants ? menu.variants.map(v => ({ name: v.name, price: String(v.price) })) : []);
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
      setVariants([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentMenu(null);
    setVariants([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Debug payload
    console.log("Form data yang dikirim:", formData);
    console.log("Image URL:", formData.image);

    if (isUploading) {
      alert("Harap tunggu hingga proses upload foto selesai.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...formData,
      price: variants.length > 0 ? 0 : Number(formData.price),
      is_available: formData.is_available,
      ...(variants.length > 0 && {
        variants: variants.map(v => ({
          name: v.name,
          price: Number(v.price)
        }))
      })
    };

    try {
      if (currentMenu) {
        const res = await api.put(`/menus/${currentMenu.id}`, payload);
        console.log("Response Update:", res.data);
      } else {
        const res = await api.post('/menus', payload);
        console.log("Response Store:", res.data);
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

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 lg:p-6 overflow-hidden">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full table-fixed min-w-[800px] lg:min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="w-[60px] text-left py-3 px-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">Foto</th>
                <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Nama Menu</th>
                <th className="w-[120px] text-left py-3 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Kategori</th>
                <th className="w-[100px] text-left py-3 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Harga</th>
                <th className="w-[120px] text-left py-3 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                <th className="w-[100px] text-left py-3 px-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-2 px-2 text-center">
                    <img
                      src={item.image || '/logo.png'}
                      alt={item.name}
                      onError={(e) => (e.currentTarget.src = '/logo.png')}
                      className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl object-cover border border-gray-100 shadow-sm"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <p className="text-[11px] lg:text-sm font-black text-gray-800 truncate" title={item.name}>{item.name}</p>
                    <p className="text-[9px] text-gray-400 truncate max-w-full">{item.description}</p>
                  </td>
                  <td className="py-2 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-[9px] font-black uppercase tracking-wider">
                      {item.category?.name || '---'}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    <p className="text-[11px] lg:text-sm font-black text-[#6367FF] whitespace-nowrap">{formatPrice(item.price)}</p>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleToggleStatus(item)}
                      className={`relative inline-flex h-4 lg:h-5 w-8 lg:w-10 items-center rounded-full transition-colors focus:outline-none ${
                        item.is_available ? 'bg-[#6367FF]' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          item.is_available ? 'translate-x-4 lg:translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleOpenModal(item)}
                        className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all shadow-sm"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item)}
                        className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all shadow-sm"
                        title="Hapus"
                      >
                        <Trash2 size={14} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl md:max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            {/* Sticky Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white z-10">
              <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">
                {currentMenu ? 'Edit Menu' : 'Add New Menu'}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Baris 1: Nama Menu (Full Width) */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Menu</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-[#6367FF] transition-all font-bold text-sm"
                      placeholder="Contoh: Cappuccino"
                    />
                  </div>

                  {/* Baris 2: Kategori & Harga */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kategori</label>
                    <select 
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-[#6367FF] transition-all font-bold text-sm appearance-none"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Harga (IDR)</label>
                    <input
                      type="number"
                      required={variants.length === 0}
                      disabled={variants.length > 0}
                      value={variants.length > 0 ? 0 : formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className={`w-full px-4 py-2.5 border border-gray-100 rounded-xl focus:outline-none focus:border-[#6367FF] transition-all font-bold text-sm ${variants.length > 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-50'}`}
                      placeholder="35000"
                    />
                  </div>

                  {/* Baris Tambahan: Varian Menu (Full Width) */}
                  <div className="md:col-span-2 space-y-3 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Varian Menu</label>
                      <button
                        type="button"
                        onClick={() => setVariants([...variants, { name: '', price: '' }])}
                        className="text-[10px] font-black text-[#6367FF] bg-[#6367FF]/10 px-3 py-1.5 rounded-lg hover:bg-[#6367FF]/20 transition-colors flex items-center gap-1"
                      >
                        <Plus size={12} /> Tambah Varian
                      </button>
                    </div>
                    
                    {variants.length > 0 ? (
                      <div className="space-y-2">
                        {variants.map((variant, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              required
                              value={variant.name}
                              onChange={(e) => {
                                const newVariants = [...variants];
                                newVariants[idx].name = e.target.value;
                                setVariants(newVariants);
                              }}
                              className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#6367FF] transition-all font-bold text-sm"
                              placeholder="Nama Varian (mis: Coffee Pic)"
                            />
                            <input
                              type="number"
                              required
                              value={variant.price}
                              onChange={(e) => {
                                const newVariants = [...variants];
                                newVariants[idx].price = e.target.value;
                                setVariants(newVariants);
                              }}
                              className="w-1/3 px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#6367FF] transition-all font-bold text-sm"
                              placeholder="Harga"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newVariants = variants.filter((_, i) => i !== idx);
                                setVariants(newVariants);
                              }}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-400 italic ml-1">Tidak ada varian. Harga menggunakan harga utama.</p>
                    )}
                  </div>

                  {/* Baris 3: Deskripsi (Full Width) */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deskripsi Hidangan</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-[#6367FF] transition-all font-bold text-sm min-h-[80px]"
                      placeholder="Ceritakan tentang menu ini..."
                    />
                  </div>

                  {/* Baris 4: Upload Foto & Status Toggle */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Upload Foto</label>
                    <div 
                      className={`relative group flex items-center justify-center h-28 border-2 border-dashed rounded-xl transition-all ${
                        formData.image 
                          ? 'border-purple-200 bg-purple-50/30' 
                          : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50'
                      }`}
                    >
                      {isUploading ? (
                        <Loader2 className="animate-spin text-purple-500" size={20} />
                      ) : formData.image ? (
                        <div className="flex items-center gap-3 w-full px-3">
                          <img src={formData.image} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-white shadow-sm" />
                          <button
                            type="button"
                            onClick={() => document.getElementById('menu-upload')?.click()}
                            className="text-[9px] font-black uppercase text-purple-600 underline"
                          >
                            Ganti Foto
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => document.getElementById('menu-upload')?.click()}
                          className="flex flex-col items-center gap-1.5"
                        >
                          <Plus className="text-gray-400" size={20} />
                          <p className="text-[9px] font-black text-gray-500 uppercase">Upload Hidangan</p>
                        </button>
                      )}
                      <input id="menu-upload" type="file" accept="image/*" className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setIsUploading(true);
                            const data = new FormData();
                            data.append('file', file);
                            data.append('upload_preset', 'picpic_menus');
                            const res = await fetch('https://api.cloudinary.com/v1_1/dkcl8wzdc/image/upload', { method: 'POST', body: data });
                            const result = await res.json();
                            if (result.secure_url) {
                              const transformedUrl = result.secure_url.replace('/upload/', '/upload/w_400,h_400,c_fill,q_auto,f_auto/');
                              setFormData(prev => ({ ...prev, image: transformedUrl }));
                            }
                          } catch (err) {
                            alert('Gagal upload foto');
                          } finally {
                            setIsUploading(false);
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status Hidangan</label>
                    <div className="flex items-center gap-3 py-3 px-4 bg-gray-50 border border-gray-100 rounded-xl h-28 flex-col justify-center">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, is_available: !formData.is_available })}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                          formData.is_available ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          formData.is_available ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                      <span className="text-[10px] font-black text-gray-600 uppercase">
                        {formData.is_available ? 'Ready Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="flex justify-end gap-3 p-5 border-t border-gray-100 bg-white">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 h-10 border border-gray-200 text-gray-500 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="px-8 h-10 bg-purple-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-purple-200 hover:bg-purple-700 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : (currentMenu ? 'Update' : 'Simpan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

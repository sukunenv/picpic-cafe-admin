import { useState, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  X, 
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../../lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  is_active: boolean;
  menus_count: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editData, setEditData] = useState<Category | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories?all=1');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category: Category | null = null) => {
    if (category) {
      setEditData(category);
      setName(category.name);
      setIsActive(category.is_active);
      setImagePreview(category.image);
    } else {
      setEditData(null);
      setName('');
      setIsActive(true);
      setImagePreview(null);
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('name', name);
      formData.append('is_active', isActive ? '1' : '0');
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (!editData) {
        alert('Gambar kategori wajib diisi');
        return;
      }

      if (editData) {
        // Axios multipart for PUT/PATCH is sometimes tricky with FormData, 
        // Laravel expects _method: 'PUT' in POST if using multipart
        formData.append('_method', 'PUT');
        await api.post(`/categories/${editData.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setShowModal(false);
      fetchCategories();
    } catch (err) {
      console.error('Submit failed:', err);
      alert('Gagal menyimpan kategori');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kategori ini? Semua menu dalam kategori ini akan kehilangan relasi kategori.')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Gagal menghapus kategori');
    }
  };

  const toggleStatus = async (category: Category) => {
    try {
      await api.put(`/categories/${category.id}`, {
        is_active: !category.is_active
      });
      setCategories(categories.map(c => 
        c.id === category.id ? { ...c, is_active: !c.is_active } : c
      ));
    } catch (err) {
      console.error('Toggle status failed:', err);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Manajemen Kategori</h1>
          <p className="text-sm text-gray-500 font-medium">Atur kategori menu Kafe Picpic</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#6367FF] text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-[#5558DD] transition-all shadow-lg shadow-[#6367FF]/20"
        >
          <Plus size={18} /> Tambah Kategori
        </button>
      </div>

      {/* Stats Recap */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#6367FF]">
            <Layers size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Kategori</p>
            <p className="text-2xl font-black text-gray-800">{categories.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-500">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Kategori Aktif</p>
            <p className="text-2xl font-black text-gray-800">{categories.filter(c => c.is_active).length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Non-aktif</p>
            <p className="text-2xl font-black text-gray-800">{categories.filter(c => !c.is_active).length}</p>
          </div>
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[#6367FF] transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Gambar</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama Kategori</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Jumlah Menu</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-[#6367FF] mb-2" size={32} />
                    <p className="text-gray-400 font-medium">Memuat data...</p>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <p className="text-gray-400 font-medium font-['Plus_Jakarta_Sans']">Tidak ada data ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img 
                        src={category.image} 
                        alt={category.name} 
                        className="w-[60px] h-[60px] rounded-2xl object-cover border-2 border-white shadow-sm"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-black text-gray-800">{category.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">/{category.slug}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-[#6367FF]/5 text-[#6367FF] rounded-lg font-black text-xs">
                        {category.menus_count} Menu
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => toggleStatus(category)}
                        className={`w-12 h-6 rounded-full relative transition-all ${category.is_active ? 'bg-[#6367FF]' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${category.is_active ? 'left-7' : 'left-1'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleOpenModal(category)}
                          className="p-2 text-gray-400 hover:text-[#6367FF] hover:bg-[#6367FF]/10 rounded-xl transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(category.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">
                  {editData ? 'Edit Kategori' : 'Tambah Kategori'}
                </h2>
                <p className="text-xs text-gray-400 font-bold tracking-widest uppercase">Kafe Picpic</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Nama Kategori</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Coffee, Dessert..."
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#6367FF] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Gambar Kategori</label>
                <div 
                  onClick={() => document.getElementById('category-image')?.click()}
                  className="relative h-48 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden group cursor-pointer hover:border-[#6367FF]/30 transition-all"
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="text-white" size={32} />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Upload size={32} className="mb-2" />
                      <p className="text-xs font-bold uppercase tracking-wider text-center px-4">Tap untuk upload gambar</p>
                    </div>
                  )}
                  <input 
                    id="category-image" 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden" 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Status Aktif</span>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`w-11 h-6 rounded-full relative transition-all ${isActive ? 'bg-[#6367FF]' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isActive ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 px-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-3 py-4 px-8 bg-[#6367FF] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#6367FF]/20 hover:bg-[#5558DD] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : null}
                  {editData ? 'Perbarui Kategori' : 'Simpan Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

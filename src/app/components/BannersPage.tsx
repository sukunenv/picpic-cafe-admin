import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  X, 
  ImageIcon, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { bannerService, Banner } from '../../services/bannerService';

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<Banner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await bannerService.getBanners();
      setBanners(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch banners:', err);
      setError('Gagal mengambil data banner promo.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (banner: Banner | null = null) => {
    if (banner) {
      setCurrentBanner(banner);
      setFormData({
        title: banner.title,
        image_url: banner.image_url,
        is_active: banner.is_active
      });
    } else {
      setCurrentBanner(null);
      setFormData({
        title: '',
        image_url: '',
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentBanner(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (currentBanner) {
        await bannerService.updateBanner(currentBanner.id, formData);
      } else {
        await bannerService.createBanner(formData);
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Gagal menyimpan data banner.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (banner: Banner) => {
    if (window.confirm(`Yakin hapus banner [${banner.title}]?`)) {
      try {
        await bannerService.deleteBanner(banner.id);
        fetchData();
      } catch (err) {
        alert('Gagal menghapus banner.');
      }
    }
  };

  if (loading && banners.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="animate-spin text-[#6367FF] mb-4" size={40} />
        <p className="text-gray-500 font-bold">Memuat Banner Promo...</p>
      </div>
    );
  }

  return (
    <div className="p-6 font-['Plus_Jakarta_Sans',_sans-serif]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 tracking-tight">Banner Management</h1>
          <p className="text-sm text-gray-500">Kelola banner promosi di halaman utama aplikasi</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#6367FF] text-white rounded-xl font-bold shadow-lg shadow-[#6367FF]/20 hover:bg-[#5558DD] active:scale-95 transition-all text-sm"
        >
          <Plus size={18} />
          Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map(banner => (
          <div key={banner.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className="relative h-40 overflow-hidden">
              <img 
                src={banner.image_url} 
                alt={banner.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1544333346-64e4fe18274b?auto=format&fit=crop&q=80&w=1200')}
              />
              <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                banner.is_active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
              }`}>
                {banner.is_active ? 'Aktif' : 'Nonaktif'}
              </div>
            </div>
            
            <div className="p-3">
              <h3 className="font-medium text-sm text-gray-800 truncate mb-1" title={banner.title}>
                {banner.title}
              </h3>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-3">
                <span className="truncate flex-1">{banner.image_url}</span>
                <a 
                  href={banner.image_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-1 hover:text-[#6367FF] transition-colors"
                >
                  <ExternalLink size={12} />
                </a>
              </div>
              
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
                <button 
                  onClick={() => handleOpenModal(banner)}
                  className="p-2 text-gray-500 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all"
                  title="Edit Banner"
                >
                  <Edit size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(banner)}
                  className="p-2 text-red-500 border border-transparent hover:bg-red-50 rounded-lg transition-all"
                  title="Delete Banner"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {banners.length === 0 && !loading && (
          <div className="col-span-full py-16 bg-white rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300">
            <ImageIcon size={48} className="mb-3 opacity-30" />
            <p className="font-bold uppercase tracking-widest text-xs">Belum ada banner promo</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="flex items-center justify-between p-8 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">
                {currentBanner ? 'Edit Banner' : 'Add New Banner'}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Judul Promo</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#6367FF] transition-all font-bold text-sm"
                  placeholder="Contoh: Weekend Sale!"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">URL Gambar Banner</label>
                <input
                  type="url"
                  required
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#6367FF] transition-all font-bold text-sm"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Status Aktif</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    formData.is_active ? 'bg-[#6367FF]' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.is_active ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Preview */}
              {formData.image_url && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Preview</label>
                  <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-gray-100">
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1544333346-64e4fe18274b?auto=format&fit=crop&q=80&w=1200')}
                    />
                  </div>
                </div>
              )}

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
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    currentBanner ? 'Update Banner' : 'Simpan Banner'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

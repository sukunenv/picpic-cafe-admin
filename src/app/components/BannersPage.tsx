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
    subtitle: '',
    tag: '',
    image: '',
    gradient_start: '#6367FF',
    gradient_end: '#8B5CF6',
    type: 'image' as 'image' | 'gradient',
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
        subtitle: banner.subtitle || '',
        tag: banner.tag || '',
        image: banner.image || '',
        gradient_start: banner.gradient_start || '#6367FF',
        gradient_end: banner.gradient_end || '#8B5CF6',
        type: banner.type || 'image',
        is_active: banner.is_active
      });
    } else {
      setCurrentBanner(null);
      setFormData({
        title: '',
        subtitle: '',
        tag: '',
        image: '',
        gradient_start: '#6367FF',
        gradient_end: '#8B5CF6',
        type: 'image',
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
      alert('Gagal menyimpan data banner. Periksa kembali form Anda.');
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
          <h1 className="text-xl font-black text-gray-800 tracking-tight uppercase">Banner Management</h1>
          <p className="text-sm text-gray-500">Kelola visual promosi (Gambar atau Gradient)</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-[#6367FF] text-white rounded-2xl font-black shadow-lg shadow-[#6367FF]/20 hover:bg-[#5558DD] active:scale-95 transition-all text-xs uppercase tracking-widest"
        >
          <Plus size={18} />
          Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map(banner => (
          <div key={banner.id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-[#6367FF]/5 transition-all duration-500 group">
            <div className="relative h-44 overflow-hidden">
              {banner.type === 'image' && banner.image ? (
                <img 
                  src={banner.image} 
                  alt={banner.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div 
                  className="w-full h-full" 
                  style={{ background: `linear-gradient(to right, ${banner.gradient_start}, ${banner.gradient_end})` }} 
                />
              )}
              
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md border border-white/20 ${
                banner.is_active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
              }`}>
                {banner.is_active ? 'Active' : 'Draft'}
              </div>

              {banner.tag && (
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-[#2D2B55] uppercase tracking-widest shadow-sm">
                  {banner.tag}
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <h3 className="font-black text-[#2D2B55] text-lg leading-tight mb-1 truncate">
                  {banner.title}
                </h3>
                {banner.subtitle && (
                  <p className="text-xs text-gray-400 font-medium truncate">{banner.subtitle}</p>
                )}
              </div>
              
              <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Type:</span>
                  <span className="text-[10px] font-bold text-[#6367FF] uppercase">
                    {banner.type}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleOpenModal(banner)}
                    className="p-2.5 text-[#6367FF] bg-[#6367FF]/5 rounded-xl hover:bg-[#6367FF] hover:text-white transition-all shadow-sm"
                    title="Edit Banner"
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(banner)}
                    className="p-2.5 text-red-500 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    title="Delete Banner"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {banners.length === 0 && !loading && (
          <div className="col-span-full py-24 bg-white rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300">
            <ImageIcon size={64} className="mb-4 opacity-20" />
            <p className="font-black uppercase tracking-widest text-xs">No banners created yet</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2B55]/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-white">
              <div>
                <h2 className="text-xl font-black text-[#2D2B55] uppercase tracking-tight">
                  {currentBanner ? 'Edit Banner' : 'Create Banner'}
                </h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Atur visual promosi aplikasi</p>
              </div>
              <button onClick={handleCloseModal} className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all">
                <X size={20} className="text-gray-400 hover:text-inherit" />
              </button>
            </div>
            
            {/* Body - Scrollable */}
            <div className="flex-1 overflow-y-auto bg-white">
              <form id="bannerForm" onSubmit={handleSubmit} className="p-10 space-y-10">
                {/* Row 1: Judul + Tag */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Judul Promo</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-[#6367FF]/20 focus:bg-white rounded-3xl transition-all font-bold text-sm text-[#2D2B55] outline-none shadow-sm"
                      placeholder="Contoh: Flash Sale!"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tag / Label</label>
                    <input
                      type="text"
                      value={formData.tag}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-[#6367FF]/20 focus:bg-white rounded-3xl transition-all font-bold text-sm text-[#2D2B55] outline-none shadow-sm"
                      placeholder="Promo Hari Ini"
                    />
                  </div>
                </div>

                {/* Row 2: Subtitle */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subtitle (Deskripsi Singkat)</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-[#6367FF]/20 focus:bg-white rounded-3xl transition-all font-bold text-sm text-[#2D2B55] outline-none shadow-sm"
                    placeholder="Hanya berlaku hari ini untuk semua menu kopi"
                  />
                </div>

                {/* Visual Choice */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pilih Visual</label>
                    <span className="text-[10px] text-[#6367FF] font-black uppercase tracking-widest">
                      {formData.type === 'image' ? 'Mode Gambar' : 'Mode Gradient'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Option Image */}
                    <div 
                      onClick={() => setFormData({...formData, type: 'image'})}
                      className={`p-6 rounded-[32px] border-2 cursor-pointer transition-all ${formData.type === 'image' ? 'border-[#6367FF] bg-[#6367FF]/5' : 'border-gray-100 opacity-60'}`}
                    >
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">Pakai Gambar</label>
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value, type: 'image' })}
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:outline-none"
                        placeholder="https://cloudinary.com/..."
                      />
                    </div>

                    {/* Option Gradient */}
                    <div 
                      onClick={() => setFormData({...formData, type: 'gradient'})}
                      className={`p-6 rounded-[32px] border-2 cursor-pointer transition-all ${formData.type === 'gradient' ? 'border-[#6367FF] bg-[#6367FF]/5' : 'border-gray-100 opacity-60'}`}
                    >
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">Pakai Gradient</label>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 space-y-1">
                          <span className="text-[9px] font-bold text-gray-400 uppercase">Start</span>
                          <input
                            type="color"
                            value={formData.gradient_start}
                            onChange={(e) => setFormData({ ...formData, gradient_start: e.target.value, type: 'gradient' })}
                            className="w-full h-10 rounded-lg cursor-pointer bg-white"
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <span className="text-[9px] font-bold text-gray-400 uppercase">End</span>
                          <input
                            type="color"
                            value={formData.gradient_end}
                            onChange={(e) => setFormData({ ...formData, gradient_end: e.target.value, type: 'gradient' })}
                            className="w-full h-10 rounded-lg cursor-pointer bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[32px]">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${formData.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                    <span className="text-xs font-black text-[#2D2B55] uppercase tracking-widest">
                      {formData.is_active ? 'Banner Aktif' : 'Status: Draft'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                      formData.is_active ? 'bg-[#6367FF]' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                      formData.is_active ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Realistic Preview */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Live Preview</label>
                  <div 
                    className="aspect-[21/9] rounded-[32px] overflow-hidden relative shadow-2xl border border-gray-50"
                    style={formData.type === 'gradient' ? { background: `linear-gradient(to right, ${formData.gradient_start}, ${formData.gradient_end})` } : {}}
                  >
                    {formData.type === 'image' && formData.image && (
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1544333346-64e4fe18274b?auto=format&fit=crop&q=80&w=1200')}
                      />
                    )}
                    <div className="absolute inset-0 p-8 flex flex-col justify-center">
                      {formData.tag && (
                        <span className="inline-block self-start px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[8px] font-black text-white uppercase tracking-widest mb-2">
                          {formData.tag}
                        </span>
                      )}
                      <h4 className="text-white font-black text-2xl leading-tight drop-shadow-lg">{formData.title || 'Judul Promo'}</h4>
                      {formData.subtitle && (
                        <p className="text-white/80 text-xs font-medium mt-1 drop-shadow-md">{formData.subtitle}</p>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer - Fixed */}
            <div className="p-8 border-t border-gray-100 bg-white flex gap-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all font-bold"
              >
                Batalkan
              </button>
              <button
                type="submit"
                form="bannerForm"
                disabled={isSubmitting}
                className="flex-[2] py-4 bg-[#6367FF] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-[#6367FF]/20 hover:bg-[#5558DD] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    {currentBanner ? 'Update Banner' : 'Simpan Banner'}
                    <Plus size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

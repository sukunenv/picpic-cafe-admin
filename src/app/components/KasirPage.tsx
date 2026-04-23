import { useState, useEffect } from 'react';
import {
  Search, ChevronLeft, ChevronRight, Loader2, AlertCircle, X,
  LayoutGrid, Coffee, UtensilsCrossed, Croissant, IceCream2, Cookie, Soup, Droplets, Sandwich, GlassWater
} from 'lucide-react';
import api from '../../lib/api';

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  variants?: any[];
  promo?: {
    name: string;
    type: string;
    value: number;
    discounted_price: number;
  } | null;
}

interface KasirPageProps {
  onAddToOrder: (item: any, notes: string) => void;
}

export default function KasirPage({ onAddToOrder }: KasirPageProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [variantModal, setVariantModal] = useState<{
    open: boolean;
    menu: MenuItem | null;
  }>({ open: false, menu: null });
  const [categories, setCategories] = useState<Category[]>([
    { id: 'all', name: 'Semua', icon: LayoutGrid }
  ]);
  const [search, setSearch] = useState('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getDiscountedPrice = (price: number, promo: MenuItem['promo']) => {
    if (!promo) return price;
    if (promo.type === 'percent') {
      return price * (1 - promo.value / 100);
    } else {
      return Math.max(0, price - promo.value);
    }
  };

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

      const mappedMenus = menusRes.data.map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image || '/logo.png',
        category: item.category?.name || 'Lainnya',
        category_type: item.category?.type || 'food',
        is_available: item.is_available,
        variants: item.variants || [],
        promo: item.promo || null
      }));

      setMenuItems(mappedMenus);
      setCategories([
        { id: 'all', name: 'Semua', icon: LayoutGrid },
        ...catsRes.data.map((cat: any) => {
          const n = cat.name.toLowerCase();
          let icon: React.ElementType = UtensilsCrossed;
          if (n.includes('coffee') || n.includes('kopi') || n.includes('espresso') || n.includes('latte')) icon = Coffee;
          else if (n.includes('non coffee') || n.includes('noncoffee') || n.includes('non-coffee') || n.includes('minuman') || n.includes('juice') || n.includes('tea') || n.includes('teh') || n.includes('drink')) icon = GlassWater;
          else if (n.includes('food') || n.includes('makanan') || n.includes('rice') || n.includes('nasi') || n.includes('mie')) icon = Soup;
          else if (n.includes('pastry') || n.includes('roti') || n.includes('bread') || n.includes('sandwich')) icon = Croissant;
          else if (n.includes('dessert') || n.includes('sweet') || n.includes('cake') || n.includes('kue')) icon = IceCream2;
          else if (n.includes('snack') || n.includes('cemilan') || n.includes('gorengan')) icon = Cookie;
          else if (n.includes('salad') || n.includes('soup') || n.includes('sayur')) icon = Droplets;

          return { id: cat.name, name: cat.name, icon };
        })
      ]);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Gagal memuat data menu dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) { // Tablet Landscape / Desktop
        setItemsPerPage(12);
      } else if (width >= 768) { // Tablet Portrait
        setItemsPerPage(9);
      } else { // Mobile
        setItemsPerPage(6);
      }
      setCurrentPage(1); // Reset page on resize to avoid empty views
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredMenu = menuItems.filter(item => {
    if (!item.is_available) return false;
    const matchesCategory = activeCategory === 'all' ? true : item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredMenu.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMenu.slice(indexOfFirstItem, indexOfLastItem);

  const handleAddToOrder = (item: MenuItem) => {
    if (item.variants && item.variants.length > 0) {
      setVariantModal({ open: true, menu: item });
    } else {
      const finalPrice = getDiscountedPrice(item.price, item.promo);
      onAddToOrder({ ...item, price: finalPrice, variant_id: null }, '');
    }
  };

  const handleSelectVariant = (variant: any) => {
    if (variantModal.menu) {
      const finalPrice = getDiscountedPrice(variant.price, variantModal.menu.promo);
      onAddToOrder({
        ...variantModal.menu,
        variant_id: variant.id,
        variant_name: variant.name,
        price: finalPrice,
      }, '');
    }
    setVariantModal({ open: false, menu: null });
  };

  const handleCategoryChange = (id: string) => {
    setActiveCategory(id);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-[#6367FF] mb-4" size={48} />
        <p className="text-gray-500 font-bold animate-pulse">Memuat Menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] p-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Waduh! Galat</h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <button 
          onClick={() => fetchData()}
          className="px-6 py-2.5 bg-[#6367FF] text-white rounded-xl font-bold"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-gray-800 text-2xl">Kasir</h1>
        <div className="relative w-full max-w-sm ml-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:border-[#6367FF] shadow-sm transition-all text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => {
          const IconComponent = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap transition-all font-bold text-sm ${
                activeCategory === cat.id
                  ? 'bg-[#6367FF] text-white shadow-lg shadow-[#6367FF]/25'
                  : 'bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              <IconComponent size={15} strokeWidth={activeCategory === cat.id ? 2.5 : 2} />
              {cat.name}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-700">Menu {categories.find(c => c.id === activeCategory)?.name}</h2>
        <span className="text-[10px] font-black bg-[#6367FF]/10 text-[#6367FF] px-3 py-1.5 rounded-full uppercase tracking-widest">
          {filteredMenu.length} items
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
        {currentItems.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group flex flex-col">
            {/* Image removed for compact mode - ISSUE 6 */}
            <div className="p-3 flex-1 flex flex-col">
              <div className="mb-2">
                <div className="flex items-start justify-between gap-1 mb-1">
                   <h3 className="font-bold text-[13px] text-gray-800 leading-tight">{item.name}</h3>
                   <div className="flex flex-col items-end gap-1">
                      <span className="text-[8px] font-black bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded uppercase flex-shrink-0">
                         {item.category}
                      </span>
                      {item.promo && item.promo.name && (
                        <span className="text-[8px] font-black bg-orange-500 text-white px-1.5 py-0.5 rounded uppercase flex-shrink-0 shadow-sm shadow-orange-500/20">
                          {item.promo.name}
                        </span>
                      )}
                   </div>
                </div>
                <p className="text-[9px] text-gray-400 line-clamp-1">{item.description}</p>
              </div>
              
              <div className="mt-auto">
                <div className="mb-2">
                  {item.promo && item.promo.name && (
                    <p className="text-[10px] text-gray-400 line-through leading-none mb-1">
                      {item.variants && item.variants.length > 0 ? (
                        formatPrice(Math.min(...item.variants.map(v => v.price)))
                      ) : formatPrice(item.price)}
                    </p>
                  )}
                  <p className="font-black text-sm text-[#6367FF]">
                    {item.variants && item.variants.length > 0 ? (
                      formatPrice(getDiscountedPrice(Math.min(...item.variants.map(v => v.price)), item.promo))
                    ) : formatPrice(getDiscountedPrice(item.price, item.promo))}
                  </p>
                </div>

                {/* Variant dropdown for quick selection if multiple - ISSUE 6 */}
                {item.variants && item.variants.length > 0 && (
                  <div className="mb-2">
                    <select 
                      className="w-full text-[10px] bg-gray-50 border border-gray-100 rounded-lg px-2 py-1.5 outline-none focus:border-[#6367FF]"
                      onChange={(e) => {
                        const v = item.variants?.find(v => v.id.toString() === e.target.value);
                        if (v) {
                          const finalPrice = getDiscountedPrice(v.price, item.promo);
                          onAddToOrder({
                            ...item,
                            variant_id: v.id,
                            variant_name: v.name,
                            price: finalPrice,
                          }, '');
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>Pilih Varian...</option>
                      {item.variants.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.name} - {formatPrice(getDiscountedPrice(v.price, item.promo))}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {(!item.variants || item.variants.length === 0) && (
                  <button
                    onClick={() => handleAddToOrder(item)}
                    className="w-full py-2 text-[11px] font-black bg-[#6367FF] text-white rounded-lg hover:bg-[#5558DD] active:scale-[0.98] transition-all"
                  >
                    TAMBAH
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Container */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-4 mt-auto">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`p-2.5 rounded-xl border border-gray-200 transition-all ${
              currentPage === 1 ? 'text-gray-300 bg-gray-50 border-gray-100 cursor-not-allowed' : 'text-gray-600 bg-white hover:bg-gray-50 shadow-sm active:scale-90'
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Page</span>
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#6367FF] text-white text-xs font-black shadow-lg shadow-[#6367FF]/20">
              {currentPage}
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">of {totalPages}</span>
          </div>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`p-2.5 rounded-xl border border-gray-200 transition-all ${
              currentPage === totalPages ? 'text-gray-300 bg-gray-50 border-gray-100 cursor-not-allowed' : 'text-gray-600 bg-white hover:bg-gray-50 shadow-sm active:scale-90'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Variant Modal */}
      {variantModal.open && variantModal.menu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setVariantModal({ open: false, menu: null })}
          />
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden relative z-10 animate-in zoom-in duration-300">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
              <div>
                <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">
                  {variantModal.menu.name}
                </h2>
                <p className="text-xs text-gray-500 font-bold">Pilih varian</p>
              </div>
              <button onClick={() => setVariantModal({ open: false, menu: null })} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              <div className="space-y-3">
                {variantModal.menu.variants?.map((variant: any) => (
                  <button
                    key={variant.id}
                    onClick={() => handleSelectVariant(variant)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-[#6367FF] hover:bg-[#6367FF]/5 transition-all text-left group"
                  >
                    <span className="font-bold text-sm text-gray-700 group-hover:text-[#6367FF]">
                      {variant.name}
                    </span>
                    <div className="text-right">
                      {variantModal.menu?.promo && (
                        <p className="text-[10px] text-gray-400 line-through leading-none">
                          {formatPrice(variant.price)}
                        </p>
                      )}
                      <p className="font-black text-sm text-[#6367FF]">
                        {formatPrice(getDiscountedPrice(variant.price, variantModal.menu?.promo))}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-white">
              <button
                onClick={() => setVariantModal({ open: false, menu: null })}
                className="w-full py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import {
  Search, ChevronLeft, ChevronRight, Loader2, AlertCircle,
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
}

interface KasirPageProps {
  onAddToOrder: (item: MenuItem, notes: string) => void;
}

export default function KasirPage({ onAddToOrder }: KasirPageProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: 'all', name: 'Semua', icon: LayoutGrid }
  ]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
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
        is_available: item.is_available
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
    return activeCategory === 'all' ? true : item.category === activeCategory;
  });

  const totalPages = Math.ceil(filteredMenu.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMenu.slice(indexOfFirstItem, indexOfLastItem);

  const handleAddToOrder = (item: MenuItem) => {
    onAddToOrder(item, itemNotes[item.id] || '');
    setItemNotes({ ...itemNotes, [item.id]: '' });
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
        {currentItems.map(item => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
            <div className="relative">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold rounded-lg shadow-sm">
                  {item.category}
                </span>
              </div>
            </div>
            <div className="p-3">
              <div className="mb-2">
                <h3 className="font-bold text-sm text-gray-800 truncate mb-0.5">{item.name}</h3>
                <p className="text-[10px] text-gray-500 line-clamp-2 min-h-[2.5rem]">{item.description}</p>
              </div>
              <div className="flex items-center justify-between mb-3">
                <p className="font-black text-sm text-[#6367FF]">
                  {formatPrice(item.price)}
                </p>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Catatan..."
                  value={itemNotes[item.id] || ''}
                  onChange={(e) => setItemNotes({ ...itemNotes, [item.id]: e.target.value })}
                  className="w-full px-3 py-2 text-[10px] border border-gray-100 bg-gray-50 rounded-lg focus:outline-none focus:border-[#6367FF] focus:bg-white transition-all"
                />
                <button
                  onClick={() => handleAddToOrder(item)}
                  className="w-full py-2.5 text-xs font-bold bg-[#6367FF] text-white rounded-xl hover:bg-[#5558DD] active:scale-[0.98] transition-all shadow-md shadow-[#6367FF]/20"
                >
                  Tambah
                </button>
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
    </div>
  );
}

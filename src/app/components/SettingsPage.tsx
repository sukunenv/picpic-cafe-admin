import { useState, useEffect } from 'react';
import {
  Store,
  CreditCard,
  Printer,
  Bell,
  Save,
  CheckCircle2,
  Bluetooth,
  Globe,
  Phone,
  MapPin,
  Gift,
  RefreshCcw,
  Trash2,
  AlertCircle
} from 'lucide-react';
import api from '../../lib/api';

// --- Types ---
interface CafeProfile {
  name: string;
  description: string;
  address: string;
  phone: string;
  website: string;
  instagram: string;
}

const AtIcon = ({ size, className }: any) => (
  <span style={{ fontSize: size }} className={`font-black ${className}`}>@</span>
);

interface PaymentInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

interface PrinterSettings {
  serviceUUID: string;
  characteristicUUID: string;
  paperSize: string;
}

interface NotifSettings {
  newOrder: boolean;
  orderCompleted: boolean;
  lowStock: boolean;
}

// --- Toast ---
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-bottom duration-300">
      <CheckCircle2 size={18} className="text-green-400 shrink-0" />
      <span className="text-sm font-bold">{message}</span>
    </div>
  );
}

// --- Section Wrapper ---
function SettingSection({ icon: Icon, title, subtitle, children }: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="flex items-center gap-4 p-6 border-b border-gray-50">
        <div className="w-10 h-10 bg-[#6367FF]/10 rounded-xl flex items-center justify-center shrink-0">
          <Icon size={20} className="text-[#6367FF]" />
        </div>
        <div>
          <h2 className="font-black text-gray-800 text-base">{title}</h2>
          <p className="text-xs text-gray-400 font-medium">{subtitle}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// --- Input Field ---
function Field({ label, icon: Icon, ...props }: {
  label: string;
  icon?: React.ElementType;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />}
        <input
          {...props}
          className={`w-full ${Icon ? 'pl-9' : 'pl-4'} pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:border-[#6367FF] focus:bg-white transition-all`}
        />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [toast, setToast] = useState('');

  // State — loaded from localStorage
  const [cafe, setCafe] = useState<CafeProfile>(() => {
    try { return JSON.parse(localStorage.getItem('settings_cafe') || '{}'); } catch { return {}; }
  });

  const [payment, setPayment] = useState<PaymentInfo>(() => {
    try { return JSON.parse(localStorage.getItem('settings_payment') || '{}'); } catch { return {}; }
  });

  const [printer, setPrinter] = useState<PrinterSettings>(() => {
    const defaults = {
      serviceUUID: '000018f0-0000-1000-8000-00805f9b34fb',
      characteristicUUID: '00002af1-0000-1000-8000-00805f9b34fb',
      paperSize: '58mm'
    };
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem('settings_printer') || '{}') };
    } catch { return defaults; }
  });

  const [notif, setNotif] = useState<NotifSettings>(() => {
    const defaults = { newOrder: true, orderCompleted: false, lowStock: false };
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem('settings_notif') || '{}') };
    } catch { return defaults; }
  });

  // Loyalty Settings (API)
  const [loyalty, setLoyalty] = useState({ 
    point_value: '5000', 
    point_multiplier: '10',
    point_expiry_months: '3'
  });
  const [bankSettings, setBankSettings] = useState({
    bank_name: '',
    bank_account_number: '',
    bank_account_name: ''
  });
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // New Tiers State
  const [tiers, setTiers] = useState({
    regular: { name: 'Regular', min: '0', max: '500', color: '#9CA3AF' },
    silver: { name: 'Silver', min: '501', max: '1500', color: '#94A3B8' },
    gold: { name: 'Gold', min: '1501', max: '999999', color: '#F59E0B' }
  });

  useEffect(() => {
    fetchLoyaltySettings();
  }, []);

  const fetchLoyaltySettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      const settings = res.data;
      const pointValue = settings.find((s: any) => s.key === 'point_value')?.value || '5000';
      const pointMultiplier = settings.find((s: any) => s.key === 'point_multiplier')?.value || '10';
      const pointExpiry = settings.find((s: any) => s.key === 'point_expiry_months')?.value || '3';
      setLoyalty({ 
        point_value: pointValue, 
        point_multiplier: pointMultiplier,
        point_expiry_months: pointExpiry
      });

      // Bank Settings
      const bankName = settings.find((s: any) => s.key === 'bank_name')?.value || '';
      const bankNumber = settings.find((s: any) => s.key === 'bank_account_number')?.value || '';
      const bankHolder = settings.find((s: any) => s.key === 'bank_account_name')?.value || '';
      setBankSettings({
        bank_name: bankName,
        bank_account_number: bankNumber,
        bank_account_name: bankHolder
      });
      // Tier Settings
      setTiers({
        regular: {
          name: settings.find((s: any) => s.key === 'tier_regular_name')?.value || 'Regular',
          min: settings.find((s: any) => s.key === 'tier_regular_min')?.value || '0',
          max: settings.find((s: any) => s.key === 'tier_regular_max')?.value || '500',
          color: settings.find((s: any) => s.key === 'tier_regular_color')?.value || '#9CA3AF',
        },
        silver: {
          name: settings.find((s: any) => s.key === 'tier_silver_name')?.value || 'Silver',
          min: settings.find((s: any) => s.key === 'tier_silver_min')?.value || '501',
          max: settings.find((s: any) => s.key === 'tier_silver_max')?.value || '1500',
          color: settings.find((s: any) => s.key === 'tier_silver_color')?.value || '#94A3B8',
        },
        gold: {
          name: settings.find((s: any) => s.key === 'tier_gold_name')?.value || 'Gold',
          min: settings.find((s: any) => s.key === 'tier_gold_min')?.value || '1501',
          max: settings.find((s: any) => s.key === 'tier_gold_max')?.value || '999999',
          color: settings.find((s: any) => s.key === 'tier_gold_color')?.value || '#F59E0B',
        }
      });
    } catch (err) {
      console.error('Failed to fetch loyalty settings', err);
    }
  };

  const saveLoyaltySettings = async () => {
    try {
      await api.put('/admin/settings/point_value', { value: loyalty.point_value });
      await api.put('/admin/settings/point_multiplier', { value: loyalty.point_multiplier });
      await api.put('/admin/settings/point_expiry_months', { value: loyalty.point_expiry_months });
      setToast('Pengaturan Loyalty Poin berhasil disimpan!');
    } catch (err) {
      console.error('Failed to save loyalty settings', err);
      setToast('Gagal menyimpan pengaturan.');
    }
  };

  const saveTierSettings = async () => {
    try {
      const updates = [
        { key: 'tier_regular_name', value: tiers.regular.name },
        { key: 'tier_regular_min', value: tiers.regular.min },
        { key: 'tier_regular_max', value: tiers.regular.max },
        { key: 'tier_regular_color', value: tiers.regular.color },
        
        { key: 'tier_silver_name', value: tiers.silver.name },
        { key: 'tier_silver_min', value: tiers.silver.min },
        { key: 'tier_silver_max', value: tiers.silver.max },
        { key: 'tier_silver_color', value: tiers.silver.color },
        
        { key: 'tier_gold_name', value: tiers.gold.name },
        { key: 'tier_gold_min', value: tiers.gold.min },
        { key: 'tier_gold_max', value: tiers.gold.max },
        { key: 'tier_gold_color', value: tiers.gold.color },
      ];

      for (const update of updates) {
        await api.put(`/admin/settings/${update.key}`, { value: update.value });
      }

      setToast('Pengaturan Tier Member berhasil disimpan!');
    } catch (err) {
      console.error('Failed to save tier settings', err);
      setToast('Gagal menyimpan pengaturan tier.');
    }
  };

  const saveBankSettings = async () => {
    try {
      await api.put('/admin/settings/bank_name', { value: bankSettings.bank_name });
      await api.put('/admin/settings/bank_account_number', { value: bankSettings.bank_account_number });
      await api.put('/admin/settings/bank_account_name', { value: bankSettings.bank_account_name });
      setToast('Info rekening berhasil disimpan!');
    } catch (err) {
      console.error('Failed to save bank settings', err);
      setToast('Gagal menyimpan info rekening.');
    }
  };

  const handleResetPoints = async () => {
    try {
      setIsResetting(true);
      await api.post('/admin/settings/reset-points');
      setToast('Semua poin pelanggan berhasil direset!');
      setShowConfirmReset(false);
    } catch (err) {
      console.error('Failed to reset points', err);
      setToast('Gagal mereset poin.');
    } finally {
      setIsResetting(false);
    }
  };

  const save = (key: string, value: object, label: string) => {
    localStorage.setItem(key, JSON.stringify(value));
    setToast(`${label} berhasil disimpan!`);
  };

  const Toggle = ({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm font-bold text-gray-700">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-all ${value ? 'bg-[#6367FF]' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="p-6 font-['Plus_Jakarta_Sans',_sans-serif] max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-800">Pengaturan</h1>
        <p className="text-sm text-gray-500 font-medium">Konfigurasi sistem admin</p>
      </div>      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Kolom Kiri: Operational Stack */}
          <div className="flex flex-col gap-6">
            {/* 1. Profil Cafe */}
            <SettingSection icon={Store} title="Profil Cafe" subtitle="Informasi dasar yang tampil di struk dan aplikasi">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Field label="Nama Cafe" icon={Store} value={cafe.name || ''} onChange={e => setCafe(p => ({ ...p, name: e.target.value }))} placeholder="Picpic Cafe" />
                <Field label="Nomor Telepon" icon={Phone} value={cafe.phone || ''} onChange={e => setCafe(p => ({ ...p, phone: e.target.value }))} placeholder="08xx-xxxx-xxxx" />
              </div>
              <div className="mb-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Deskripsi Singkat</label>
                <textarea
                  value={cafe.description || ''}
                  onChange={e => setCafe(p => ({ ...p, description: e.target.value }))}
                  placeholder="kumpul mencerita..."
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:border-[#6367FF] focus:bg-white transition-all resize-none"
                />
              </div>
              <div className="mb-4">
                <Field label="Alamat" icon={MapPin} value={cafe.address || ''} onChange={e => setCafe(p => ({ ...p, address: e.target.value }))} placeholder="Jl. Mencerita No. 1 ..." />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Field label="Website" icon={Globe} value={cafe.website || ''} onChange={e => setCafe(p => ({ ...p, website: e.target.value }))} placeholder="https://kedaipicpic.com" />
                <Field label="Instagram" icon={AtIcon} value={cafe.instagram || ''} onChange={e => setCafe(p => ({ ...p, instagram: e.target.value }))} placeholder="kedaipicpic" />
              </div>
              <button onClick={() => save('settings_cafe', cafe, 'Profil cafe')}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#6367FF] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#5558DD] transition-all shadow-lg shadow-[#6367FF]/20">
                <Save size={14} /> Simpan Profil
              </button>
            </SettingSection>

            {/* 2. Info Pembayaran */}
            <SettingSection icon={CreditCard} title="Info Rekening Transfer" subtitle="Ditampilkan saat pelanggan memilih metode Transfer">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Field label="Nama Bank" value={bankSettings.bank_name} onChange={e => setBankSettings(p => ({ ...p, bank_name: e.target.value }))} placeholder="BCA, Mandiri, BRI..." />
                <Field label="Nomor Rekening" value={bankSettings.bank_account_number} onChange={e => setBankSettings(p => ({ ...p, bank_account_number: e.target.value }))} placeholder="1234567890" />
                <Field label="Atas Nama" className="md:col-span-2" value={bankSettings.bank_account_name} onChange={e => setBankSettings(p => ({ ...p, bank_account_name: e.target.value }))} placeholder="PICPIC CAFE" />
              </div>
              <button onClick={saveBankSettings}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#6367FF] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#5558DD] transition-all shadow-lg shadow-[#6367FF]/20">
                <Save size={14} /> Simpan Rekening
              </button>
            </SettingSection>

            {/* 3. Notifikasi */}
            <SettingSection icon={Bell} title="Notifikasi" subtitle="Atur alert yang ingin diterima admin">
              <Toggle value={notif.newOrder} onChange={v => setNotif(p => ({ ...p, newOrder: v }))} label="Order Masuk Baru" />
              <Toggle value={notif.orderCompleted} onChange={v => setNotif(p => ({ ...p, orderCompleted: v }))} label="Order Selesai (Lunas)" />
              <Toggle value={notif.lowStock} onChange={v => setNotif(p => ({ ...p, lowStock: v }))} label="Stok Menu Menipis" />
              <button onClick={() => save('settings_notif', notif, 'Pengaturan notifikasi')}
                className="flex items-center gap-2 px-5 py-2.5 mt-5 bg-[#6367FF] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#5558DD] transition-all shadow-lg shadow-[#6367FF]/20">
                <Save size={14} /> Simpan Notifikasi
              </button>
            </SettingSection>

            {/* 4. Printer Thermal */}
            <SettingSection icon={Printer} title="Pengaturan Printer Thermal" subtitle="Konfigurasi Bluetooth printer untuk cetak struk">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
                <Field label="Service UUID" icon={Bluetooth} value={printer.serviceUUID} onChange={e => setPrinter(p => ({ ...p, serviceUUID: e.target.value }))} />
                <Field label="Characteristic UUID" icon={Bluetooth} value={printer.characteristicUUID} onChange={e => setPrinter(p => ({ ...p, characteristicUUID: e.target.value }))} />
                
                <div className="pt-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Ukuran Kertas</label>
                  <div className="flex gap-3 mb-4">
                    {['58mm', '80mm'].map(size => (
                      <button key={size} onClick={() => setPrinter(p => ({ ...p, paperSize: size }))}
                        className={`flex-1 px-5 py-2.5 rounded-xl border-2 font-black text-sm transition-all ${printer.paperSize === size ? 'border-[#6367FF] bg-[#6367FF] text-white' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>
                        {size}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => save('settings_printer', printer, 'Pengaturan printer')}
                    className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#6367FF] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#5558DD] transition-all shadow-lg shadow-[#6367FF]/20">
                    <Save size={14} /> Simpan Printer
                  </button>
                </div>
              </div>
            </SettingSection>
          </div>

          {/* Kolom Kanan: Loyalty & Tiers (Satu Card Panjang) */}
          <div>
            <SettingSection icon={Gift} title="Loyalty Poin" subtitle="Atur sistem poin dan keanggotaan member">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Field label="Kelipatan Belanja (Rp)" value={loyalty.point_value} onChange={e => setLoyalty(p => ({ ...p, point_value: e.target.value }))} placeholder="5000" type="number" />
                <Field label="Poin per Kelipatan" value={loyalty.point_multiplier} onChange={e => setLoyalty(p => ({ ...p, point_multiplier: e.target.value }))} placeholder="10" type="number" />
                <Field label="Masa Berlaku (Bulan)" value={loyalty.point_expiry_months} onChange={e => setLoyalty(p => ({ ...p, point_expiry_months: e.target.value }))} placeholder="3" type="number" />
              </div>
              
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-6">
                <p className="text-xs font-bold text-indigo-600 flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  Preview: Setiap belanja Rp {Number(loyalty.point_value).toLocaleString('id-ID')} pelanggan mendapat {loyalty.point_multiplier} poin • Berlaku {loyalty.point_expiry_months} bulan
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mb-8">
                <button onClick={saveLoyaltySettings}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#6367FF] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#5558DD] transition-all shadow-lg shadow-[#6367FF]/20">
                  <Save size={14} /> Simpan Poin
                </button>
                
                <button onClick={() => setShowConfirmReset(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all">
                  <RefreshCcw size={14} /> Reset Semua Poin
                </button>
              </div>

              {/* Pengaturan Tier Member */}
              <div className="pt-8 border-t border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Pengaturan Tier Member</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Konfigurasi ambang batas loyalty pelanggan</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {[
                    { id: 'regular', label: 'Tier 1:', defaultName: 'Regular' },
                    { id: 'silver', label: 'Tier 2:', defaultName: 'Silver' },
                    { id: 'gold',  label: 'Tier 3:', defaultName: 'Gold' }
                  ].map((t) => {
                    const data = (tiers as any)[t.id];
                    return (
                      <div key={t.id} className="group relative bg-white border border-gray-100 rounded-[20px] p-5 transition-all hover:shadow-md" style={{ borderLeftWidth: '6px', borderLeftColor: data.color }}>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t.label}</span>
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-black text-white uppercase tracking-widest" style={{ backgroundColor: data.color }}>
                            {data.name}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <Field label="Nama Tier" value={data.name} onChange={e => setTiers(prev => ({ ...prev, [t.id]: { ...data, name: e.target.value } }))} />
                          <Field label="Poin Minimal" type="number" value={data.min} onChange={e => setTiers(prev => ({ ...prev, [t.id]: { ...data, min: e.target.value } }))} />
                          <Field label="Poin Maksimal" type="number" value={data.max} onChange={e => setTiers(prev => ({ ...prev, [t.id]: { ...data, max: e.target.value } }))} />
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <div className="flex-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Warna Badge (Hex)</label>
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <input
                                  type="text"
                                  value={data.color}
                                  onChange={e => setTiers(prev => ({ ...prev, [t.id]: { ...data, color: e.target.value } }))}
                                  className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-mono font-bold text-gray-700 focus:outline-none focus:border-[#6367FF]"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: data.color }} />
                              </div>
                            </div>
                          </div>
                          <div className="w-12 h-10 rounded-xl border-2 border-gray-50 flex items-center justify-center bg-gray-50/30">
                            <div className="w-6 h-6 rounded-lg shadow-sm" style={{ backgroundColor: data.color }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="bg-gray-900 rounded-[28px] p-6 text-white shadow-xl shadow-gray-200/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 relative z-10">Preview Struktur Tier</h4>
                    <div className="space-y-3 relative z-10">
                      {[tiers.regular, tiers.silver, tiers.gold].map((t, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 grow">
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color, boxShadow: `0 0 10px ${t.color}66` }} />
                            <span className="font-black text-sm tracking-tight">{t.name}</span>
                          </div>
                          <span className="text-xs font-bold text-gray-400 bg-white/5 px-3 py-1 rounded-lg">
                            {idx === 2 ? `${Number(t.min).toLocaleString()}+ poin` : `${Number(t.min).toLocaleString()} - ${Number(t.max).toLocaleString()} poin`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button onClick={saveTierSettings}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#2D2B55] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-[#2D2B55]/20 group">
                    <Save size={16} className="group-hover:rotate-12 transition-transform" />
                    Simpan Semua Pengaturan Tier
                  </button>
                </div>
              </div>
            </SettingSection>
          </div>
        </div>
      </div>

      {/* Tentang Aplikasi */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center h-24 mt-4">
        <p className="text-xs font-bold text-gray-500 mb-1">Picpic Cafe Admin • V02 Dev</p>
        <p className="text-[10px] text-gray-400 font-bold tracking-wide flex items-center justify-center">
          Built with <img src="/logo.png" alt="Picpic" className="w-3.5 h-3.5 inline-block mx-1 opacity-80" /> by Kalify.dev • 2026
        </p>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      {/* Confirmation Dialog */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle size={28} className="text-red-600" />
            </div>
            <h3 className="text-lg font-black text-gray-800 mb-2">Reset Semua Poin?</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">
              Tindakan ini akan menghapus semua akumulasi poin pelanggan dan mengembalikannya ke **0**. Data tidak dapat dipulihkan.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all">
                Batal
              </button>
              <button 
                onClick={handleResetPoints}
                disabled={isResetting}
                className="flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50">
                {isResetting ? 'Mereset...' : 'Ya, Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

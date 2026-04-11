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
  MapPin
} from 'lucide-react';

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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* --- KOLOM KIRI --- */}
        <div>
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
              <Field label="Nama Bank" value={payment.bankName || ''} onChange={e => setPayment(p => ({ ...p, bankName: e.target.value }))} placeholder="BCA, Mandiri, BRI..." />
              <Field label="Nomor Rekening" value={payment.accountNumber || ''} onChange={e => setPayment(p => ({ ...p, accountNumber: e.target.value }))} placeholder="1234567890" />
              <Field label="Atas Nama" className="md:col-span-2" value={payment.accountHolder || ''} onChange={e => setPayment(p => ({ ...p, accountHolder: e.target.value }))} placeholder="PICPIC CAFE" />
            </div>
            <button onClick={() => save('settings_payment', payment, 'Info rekening')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#6367FF] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#5558DD] transition-all shadow-lg shadow-[#6367FF]/20">
              <Save size={14} /> Simpan Rekening
            </button>
          </SettingSection>
        </div>

        {/* --- KOLOM KANAN --- */}
        <div>
          {/* 3. Printer Thermal */}
          <SettingSection icon={Printer} title="Pengaturan Printer Thermal" subtitle="Konfigurasi Bluetooth printer untuk cetak struk">
            <div className="grid grid-cols-1 gap-4 mb-4">
              <Field label="Service UUID" icon={Bluetooth} value={printer.serviceUUID} onChange={e => setPrinter(p => ({ ...p, serviceUUID: e.target.value }))} />
              <Field label="Characteristic UUID" icon={Bluetooth} value={printer.characteristicUUID} onChange={e => setPrinter(p => ({ ...p, characteristicUUID: e.target.value }))} />
            </div>
            <div className="mb-6">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Ukuran Kertas</label>
              <div className="flex gap-3">
                {['58mm', '80mm'].map(size => (
                  <button key={size} onClick={() => setPrinter(p => ({ ...p, paperSize: size }))}
                    className={`px-5 py-2.5 rounded-xl border-2 font-black text-sm transition-all ${printer.paperSize === size ? 'border-[#6367FF] bg-[#6367FF] text-white' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => save('settings_printer', printer, 'Pengaturan printer')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#6367FF] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#5558DD] transition-all shadow-lg shadow-[#6367FF]/20">
              <Save size={14} /> Simpan Pengaturan
            </button>
          </SettingSection>

          {/* 4. Notifikasi */}
          <SettingSection icon={Bell} title="Notifikasi" subtitle="Atur alert yang ingin diterima admin">
            <Toggle value={notif.newOrder} onChange={v => setNotif(p => ({ ...p, newOrder: v }))} label="Order Masuk Baru" />
            <Toggle value={notif.orderCompleted} onChange={v => setNotif(p => ({ ...p, orderCompleted: v }))} label="Order Selesai (Lunas)" />
            <Toggle value={notif.lowStock} onChange={v => setNotif(p => ({ ...p, lowStock: v }))} label="Stok Menu Menipis" />
            <button onClick={() => save('settings_notif', notif, 'Pengaturan notifikasi')}
              className="flex items-center gap-2 px-5 py-2.5 mt-5 bg-[#6367FF] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#5558DD] transition-all shadow-lg shadow-[#6367FF]/20">
              <Save size={14} /> Simpan Notifikasi
            </button>
          </SettingSection>

          {/* 5. Tentang Aplikasi */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center h-20">
            <p className="text-xs font-bold text-gray-500 mb-1">Picpic Cafe Admin • V02 Dev</p>
            <p className="text-[10px] text-gray-400 font-bold tracking-wide flex items-center justify-center">
              Built with <img src="/logo.png" alt="Picpic" className="w-3.5 h-3.5 inline-block mx-1 opacity-80" /> by Kalify.dev • 2026
            </p>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

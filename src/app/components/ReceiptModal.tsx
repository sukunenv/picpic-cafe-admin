import { useState } from 'react';
import { Printer, X, Loader2, Bluetooth, AlertCircle } from 'lucide-react';
import { connectPrinter, printReceipt, ReceiptData } from '../../lib/bluetooth-printer';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReceiptData | null;
}

export default function ReceiptModal({ isOpen, onClose, data }: ReceiptModalProps) {
  const [status, setStatus] = useState<'idle' | 'printing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [receiptType, setReceiptType] = useState<'consumer' | 'kitchen' | 'bar'>('consumer');

  if (!isOpen || !data) return null;

  const filteredItems = data.items.filter(item => {
    if (receiptType === 'consumer') return true;
    if (receiptType === 'kitchen') return item.type === 'food';
    if (receiptType === 'bar') return item.type === 'drink';
    return true;
  });

  const handlePrint = async () => {
    try {
      setStatus('printing');
      setErrorMessage(null);
      
      // We pass the filtered items to the printer function
      await printReceipt({
        ...data,
        items: filteredItems,
        isProductionCopy: receiptType !== 'consumer' // Signal to skip pricing if needed
      } as any);
      
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'Gagal tersambung ke printer.');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Cetak Struk</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-all">
              <X size={24} className="text-gray-400" />
            </button>
          </div>

          {/* Receipt Type Selector - ISSUE 7 */}
          <div className="flex gap-2 mb-6 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            {(['consumer', 'kitchen', 'bar'] as const).map(t => (
              <button
                key={t}
                onClick={() => setReceiptType(t)}
                className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${
                  receiptType === t 
                    ? 'bg-[#6367FF] text-white shadow-md' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {t === 'consumer' ? 'Konsumen' : t === 'kitchen' ? 'Dapur' : 'Bar'}
              </button>
            ))}
          </div>

          {/* Receipt Preview */}
          <div className="bg-[#F8F7FF] p-6 rounded-3xl border border-dashed border-gray-200 font-mono text-[11px] leading-tight text-gray-700 shadow-inner max-h-[350px] overflow-y-auto">
            <div className="text-center mb-4">
              {receiptType === 'consumer' ? (
                <>
                  <p>================================</p>
                  <p className="font-black text-base text-gray-800">PICPIC CAFE</p>
                  <p>kumpul mencerita</p>
                  <p className="text-gray-300 font-normal">================================</p>
                </>
              ) : (
                <>
                  <p className="font-black text-sm text-gray-800">
                    {receiptType === 'kitchen' ? '--- COPY DAPUR ---' : '--- COPY BAR ---'}
                  </p>
                  <p className="text-gray-300 font-normal">================================</p>
                </>
              )}
            </div>
            
            <div className="space-y-1 mb-4">
              {receiptType === 'consumer' && <p>Tgl: {data.date}</p>}
              <p>No : {data.order_number}</p>
              {receiptType === 'consumer' && <p>Customer: {data.customer_name}</p>}
              <p>Meja: {data.table_number || '-'}</p>
              <p className="text-gray-300">--------------------------------</p>
            </div>

            <div className="space-y-2 mb-4">
              {filteredItems.length === 0 ? (
                <p className="text-center italic opacity-50">Tidak ada item untuk kategori ini</p>
              ) : (
                filteredItems.map((item, i) => (
                  <div key={i}>
                    <p className="font-bold uppercase pr-2">{item.name}</p>
                    {item.notes && <p className="text-[10px] italic">Note: {item.notes}</p>}
                    <div className="flex justify-between">
                      {receiptType === 'consumer' ? (
                        <>
                          <span>{item.quantity} x {item.price.toLocaleString('id-ID')}</span>
                          <span>{(item.quantity * item.price).toLocaleString('id-ID')}</span>
                        </>
                      ) : (
                        <span className="text-sm font-black">QTY: {item.quantity}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
              <p className="text-gray-300 pt-2">--------------------------------</p>
            </div>

            {receiptType === 'consumer' && (
              <div className="space-y-1 mb-4">
                {data.discount && data.discount > 0 ? (
                  <>
                    <div className="flex justify-between text-[10px]">
                      <span>Subtotal</span>
                      <span>{data.subtotal?.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-green-600 italic">
                      <span>Disc {data.discount_name || 'Promo'}</span>
                      <span>-Rp {data.discount.toLocaleString('id-ID')}</span>
                    </div>
                    <p className="text-gray-300 font-normal">--------------------------------</p>
                  </>
                ) : null}
                <div className="flex justify-between font-black text-sm text-gray-800">
                  <span>TOTAL</span>
                  <span>{formatPrice(data.total)}</span>
                </div>
                <div className="flex justify-between italic">
                  <span>Bayar: {data.method}</span>
                </div>
                {data.change > 0 && (
                  <div className="flex justify-between">
                    <span>Kembali</span>
                    <span>{formatPrice(data.change)}</span>
                  </div>
                )}
                <p className="text-gray-300 pt-2">================================</p>
              </div>
            )}

            {receiptType === 'consumer' ? (
              <div className="text-center">
                <p className="font-bold">Terima kasih!</p>
                <p className="text-[9px]">kedaipicpic.com</p>
                <p>================================</p>
              </div>
            ) : (
              <div className="text-center">
                <p>================================</p>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-2xl flex items-start gap-3 border border-red-100 animate-in slide-in-from-top-2 duration-300">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1">Cetak Gagal</p>
                <p className="text-[10px] font-bold opacity-80 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          <div className="mt-8 space-y-3">
            <button
              onClick={handlePrint}
              disabled={status === 'printing'}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-lg ${
                status === 'success' 
                  ? 'bg-green-500 text-white shadow-green-500/30' 
                  : 'bg-[#6367FF] text-white shadow-[#6367FF]/30 hover:bg-[#5558DD]'
              } ${status === 'printing' ? 'opacity-80 cursor-wait' : 'active:scale-95'}`}
            >
              {status === 'printing' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : status === 'success' ? (
                <Bluetooth size={18} />
              ) : (
                <Printer size={18} />
              )}
              {status === 'printing' ? 'Hubungkan & Cetak...' : status === 'success' ? 'Berhasil Dicetak!' : 'Hubungkan & Cetak'}
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

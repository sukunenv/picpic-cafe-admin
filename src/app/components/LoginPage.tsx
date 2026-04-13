import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import api from '../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('admin_token', token);
      localStorage.setItem('user_role', user.role || 'kasir');
      navigate('/');
    } catch (err: any) {
      console.error('Login failed:', err);
      if (err.response?.status === 403) {
        setError('Akses ditolak! Akun ini bukan akun staff Picpic Cafe.');
      } else {
        setError(
          err.response?.data?.message || 
          'Login gagal. Silakan periksa email dan password Anda.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#6367FF] to-[#8494FF] flex flex-col items-center justify-center p-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Login Card */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 md:p-10 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8">
          <img 
            src="/logo.png" 
            alt="Picpic Logo" 
            className="w-16 h-16 object-contain mb-4" 
          />
          <h1 className="text-2xl font-black text-gray-800">Picpic Admin</h1>
          <p className="text-gray-500 font-medium">Masuk ke dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold animate-shake">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="admin@picpic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6367FF] focus:bg-white transition-all text-gray-800 font-bold"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6367FF] focus:bg-white transition-all text-gray-800 font-bold"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#6367FF] text-white rounded-xl font-black shadow-lg shadow-[#6367FF]/30 hover:bg-[#5558DD] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              'Masuk Sekarang'
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <footer className="mt-8">
        <p className="text-center text-[10px] text-white/80 font-bold uppercase tracking-[0.2em]">
          © 2026 PICPIC CAFE • Powered by Kalify.dev
        </p>
      </footer>
    </div>
  );
}

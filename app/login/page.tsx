'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // authentication logic goes here
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden font-sans">

      {/* Dark moody coffee background gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(145deg, #0a0604 0%, #1a110d 25%, #12090a 50%, #0d0806 75%, #050302 100%)',
        }}
      />

      {/* Subtle warm glow accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 20% 20%, rgba(139, 90, 43, 0.08) 0%, transparent 60%), radial-gradient(ellipse 40% 50% at 80% 80%, rgba(180, 120, 60, 0.05) 0%, transparent 50%), radial-gradient(ellipse 60% 30% at 50% 100%, rgba(100, 60, 30, 0.1) 0%, transparent 50%)',
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-8 py-10 shadow-2xl backdrop-blur-xl">

          {/* Logo + title */}
          <div className="mb-8 flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 p-2 shadow-lg ring-1 ring-white/10">
              <Image
                src="https://i.ibb.co.com/84c45Lcw/logo.png"
                alt="Picpic Admin Logo"
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
                unoptimized
              />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold tracking-tight text-white">
                Picpic Admin
              </h1>
              <p className="mt-1 text-sm text-white/40">
                Sistem Manajemen Kedai
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-widest text-white/50"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@picpic.id"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.06] py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-amber-400/60 focus:bg-white/[0.09] focus:ring-2 focus:ring-amber-400/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-widest text-white/50"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.06] py-3 pl-10 pr-11 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-amber-400/60 focus:bg-white/[0.09] focus:ring-2 focus:ring-amber-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 transition hover:text-white/60"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-amber-400 py-3 text-sm font-bold tracking-wide text-amber-950 shadow-md transition hover:bg-amber-300 active:scale-[0.98]"
            >
              Masuk
            </button>
          </form>
          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-white/25">
            Hanya untuk staf Picpic Cafe
          </p> 
		  <p className="text-center text-xs text-gray-600 mt-4">
		Powered by <span className="text-amber-500">Kalify.dev</span>
			</p>
        </div>
      </div>
    </div>
  )
}

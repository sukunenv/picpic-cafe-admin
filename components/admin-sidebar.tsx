'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  UtensilsCrossed,
  Image as ImageIcon,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kasir', label: 'Kasir', icon: ShoppingCart },
  { href: '/orders', label: 'Orders', icon: ClipboardList },
  { href: '/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/banners', label: 'Banners', icon: ImageIcon },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[220px] bg-sidebar font-sans">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-5">
          <Image
            src="https://i.ibb.co.com/84c45Lcw/logo.png"
            alt="Picpic Admin Logo"
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 object-contain"
            unoptimized
          />
          <span className="text-base font-bold leading-tight tracking-tight text-sidebar-foreground">
            Picpic Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 py-5">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-sidebar-border px-3 py-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}

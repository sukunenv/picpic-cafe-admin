'use client'

import { AdminSidebar } from './admin-sidebar'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="ml-[220px] min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}

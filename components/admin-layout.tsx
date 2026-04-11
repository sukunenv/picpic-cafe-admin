'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from './admin-sidebar'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    } else {
      setAuthorized(true)
    }
  }, [router])

  if (!authorized) return null

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="ml-[220px] min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}

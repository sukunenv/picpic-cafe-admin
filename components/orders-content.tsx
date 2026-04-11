'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ClipboardList,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  orders as initialOrders,
  formatCurrency,
  formatTime,
  getStatusLabel,
} from '@/lib/data'
import type { Order } from '@/lib/data'

type FilterTab = 'semua' | 'pending' | 'lunas' | 'belum_bayar'

function getStatusIcon(status: Order['status']) {
  switch (status) {
    case 'lunas':
      return <CheckCircle2 className="h-4 w-4" />
    case 'pending':
      return <Clock className="h-4 w-4" />
    case 'belum_bayar':
      return <AlertCircle className="h-4 w-4" />
  }
}

function getStatusBadgeVariant(status: Order['status']) {
  switch (status) {
    case 'lunas':
      return 'default'
    case 'pending':
      return 'secondary'
    case 'belum_bayar':
      return 'destructive'
    default:
      return 'outline'
  }
}

const ITEMS_PER_PAGE = 10

export function OrdersContent() {
  const [activeTab, setActiveTab] = useState<FilterTab>('semua')
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const filteredOrders =
    activeTab === 'semua'
      ? orders
      : orders.filter((order) => order.status === activeTab)

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE))
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate API refresh
    setTimeout(() => {
      setOrders([...initialOrders])
      setLastRefresh(new Date())
      setIsRefreshing(false)
    }, 500)
  }

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const statusCounts = {
    semua: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    lunas: orders.filter((o) => o.status === 'lunas').length,
    belum_bayar: orders.filter((o) => o.status === 'belum_bayar').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">Kelola semua pesanan</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>
              Update: {formatTime(lastRefresh)}
            </span>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as FilterTab)}>
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="semua" className="gap-2">
            Semua
            <Badge variant="secondary" className="ml-1">
              {statusCounts.semua}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            Pending
            <Badge variant="secondary" className="ml-1">
              {statusCounts.pending}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="lunas" className="gap-2">
            Lunas
            <Badge variant="secondary" className="ml-1">
              {statusCounts.lunas}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="belum_bayar" className="gap-2">
            Belum Bayar
            <Badge variant="secondary" className="ml-1">
              {statusCounts.belum_bayar}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Orders List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedOrders.map((order) => (
            <Card key={order.id} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ClipboardList className="h-4 w-4" />
                      {order.orderNumber}
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatTime(order.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant={getStatusBadgeVariant(order.status)}
                    className="flex items-center gap-1"
                  >
                    {getStatusIcon(order.status)}
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <User className="h-4 w-4" />
                    {order.customerName}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Meja {order.tableNumber}
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Items:
                  </p>
                  <ul className="space-y-1 text-sm">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span className="text-card-foreground">
                          {item.quantity}x {item.menuItem.name}
                        </span>
                        <span className="text-muted-foreground">
                          {formatCurrency(item.menuItem.price * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-sm font-medium text-card-foreground">Total</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(order.total)}
                  </span>
                </div>

                {order.status !== 'lunas' && (
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <Button size="sm" className="flex-1">
                        Selesaikan
                      </Button>
                    )}
                    {order.status === 'belum_bayar' && (
                      <Button size="sm" className="flex-1">
                        Tandai Lunas
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {paginatedOrders.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ClipboardList className="mb-3 h-12 w-12 opacity-50" />
              <p className="text-lg font-medium">Tidak ada pesanan</p>
              <p className="text-sm">Belum ada pesanan dengan status ini</p>
            </div>
          )}
        </div>

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Menampilkan{' '}
            <span className="font-medium text-foreground">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}
            </span>{' '}
            dari{' '}
            <span className="font-medium text-foreground">{filteredOrders.length}</span>{' '}
            pesanan
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

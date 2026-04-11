'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  ShoppingBag,
  Clock,
  DollarSign,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react'
import {
  trendData,
  formatCurrency,
  formatTime,
  getStatusLabel,
} from '@/lib/data'
import type { Order } from '@/lib/data'
import api from '@/lib/api'

const chartConfig = {
  orders: {
    label: 'Orders',
    color: 'var(--chart-1)',
  },
  revenue: {
    label: 'Revenue',
    color: 'var(--chart-2)',
  },
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

export function DashboardContent() {
  const [ordersData, setOrdersData] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/orders')
        setOrdersData(response.data)
      } catch (err) {
        console.error('Fetch dashboard error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const totalOrders = ordersData.length
  const pendingOrders = ordersData.filter((o) => o.status === 'pending').length
  const unpaidOrders = ordersData.filter((o) => o.status === 'belum_bayar').length
  const totalRevenue = ordersData
    .filter((o) => o.status === 'lunas')
    .reduce((sum, o) => sum + Number(o.total), 0)

  const completedOrders = ordersData.filter((o) => o.status === 'lunas').length
  const completedPercent = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0
  const pendingPercent = totalOrders > 0 ? Math.round((pendingOrders / totalOrders) * 100) : 0

  const dashboardStats = [
    {
      title: 'Total Order',
      value: totalOrders.toString(),
      icon: ShoppingBag,
      color: 'bg-primary',
    },
    {
      title: 'Pending',
      value: pendingOrders.toString(),
      icon: Clock,
      color: 'bg-warning',
    },
    {
      title: 'Pendapatan',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: 'bg-success',
    },
    {
      title: 'Belum Bayar',
      value: unpaidOrders.toString(),
      icon: AlertCircle,
      color: 'bg-destructive',
    },
  ]

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang di Picpic Admin Dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-card-foreground">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}
                >
                  <stat.icon className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Order Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No Order</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Meja</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersData.slice(0, 5).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>Meja {order.tableNumber}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(order.total))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatTime(new Date(order.createdAt))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Today's Insight */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {"Today's Insight"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="text-sm text-card-foreground">Order Selesai</span>
                </div>
                <span className="text-lg font-bold text-card-foreground">
                  {completedPercent}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-success transition-all"
                  style={{ width: `${completedPercent}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-warning" />
                  <span className="text-sm text-card-foreground">Pending</span>
                </div>
                <span className="text-lg font-bold text-card-foreground">
                  {pendingPercent}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-warning transition-all"
                  style={{ width: `${pendingPercent}%` }}
                />
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <p className="text-xs text-muted-foreground">Total Hari Ini (Lunas)</p>
              <p className="mt-1 text-2xl font-bold text-card-foreground">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 7-Day Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tren 7 Hari Terakhir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="orders"
                stackId="1"
                stroke="var(--chart-1)"
                fill="var(--chart-1)"
                fillOpacity={0.4}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

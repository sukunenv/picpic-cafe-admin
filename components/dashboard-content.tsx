'use client'

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
  orders,
  trendData,
  formatCurrency,
  formatTime,
  getStatusLabel,
} from '@/lib/data'
import type { Order } from '@/lib/data'

const stats = [
  {
    title: 'Total Order',
    value: '156',
    icon: ShoppingBag,
    color: 'bg-primary',
  },
  {
    title: 'Pending',
    value: '12',
    icon: Clock,
    color: 'bg-warning',
  },
  {
    title: 'Pendapatan',
    value: formatCurrency(12450000),
    icon: DollarSign,
    color: 'bg-success',
  },
  {
    title: 'Belum Bayar',
    value: '3',
    icon: AlertCircle,
    color: 'bg-destructive',
  },
]

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
  const completedOrders = orders.filter((o) => o.status === 'lunas').length
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const completedPercent = Math.round((completedOrders / orders.length) * 100)
  const pendingPercent = Math.round((pendingOrders / orders.length) * 100)

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
        {stats.map((stat) => (
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
                {orders.slice(0, 5).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>Meja {order.tableNumber}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatTime(order.createdAt)}
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
              <p className="text-xs text-muted-foreground">Total Hari Ini</p>
              <p className="mt-1 text-2xl font-bold text-card-foreground">
                {formatCurrency(2520000)}
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

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Plus, Minus, Trash2, ShoppingCart, User, Hash, ArrowLeft, Banknote, QrCode, CheckCircle } from 'lucide-react'
import { menuItems, formatCurrency } from '@/lib/data'
import type { MenuItem, CartItem } from '@/lib/data'

const categories = ['Semua', 'Kopi', 'Non-Kopi', 'Makanan', 'Snack']

type PaymentMethod = 'cash' | 'qris' | null
type CheckoutStep = 'cart' | 'payment' | 'success'

import api from '@/lib/api'

export function KasirContent() {
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null)
  const [cashReceived, setCashReceived] = useState('')

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await api.get('/menus')
        setMenus(response.data)
      } catch (err) {
        console.error('Fetch kasir menus error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMenus()
  }, [])

  const filteredMenu =
    selectedCategory === 'Semua'
      ? menus.filter((item) => item.status)
      : menus.filter(
          (item) => item.category === selectedCategory && item.status
        )

  if (isLoading) {
    return (
      <div className="flex h-[400px] flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id)
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      }
      return [...prev, { menuItem: item, quantity: 1 }]
    })
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.menuItem.id === itemId
            ? { ...c, quantity: Math.max(0, c.quantity + delta) }
            : c
        )
        .filter((c) => c.quantity > 0)
    )
  }

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.menuItem.id !== itemId))
  }

  const total = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  )

  const handleProceedToPayment = () => {
    if (!customerName || !tableNumber || cart.length === 0) {
      alert('Lengkapi data customer dan tambah item ke keranjang')
      return
    }
    setCheckoutStep('payment')
  }

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method)
    setCashReceived('')
  }

  const handleConfirmPayment = () => {
    if (paymentMethod === 'cash') {
      const received = parseInt(cashReceived) || 0
      if (received < total) {
        alert('Nominal uang diterima kurang dari total pembayaran')
        return
      }
    }
    setCheckoutStep('success')
  }

  const handleNewOrder = () => {
    setCart([])
    setCustomerName('')
    setTableNumber('')
    setCheckoutStep('cart')
    setPaymentMethod(null)
    setCashReceived('')
  }

  const handleBackToCart = () => {
    setCheckoutStep('cart')
    setPaymentMethod(null)
    setCashReceived('')
  }

  const cashChange = paymentMethod === 'cash' && cashReceived 
    ? Math.max(0, parseInt(cashReceived) - total) 
    : 0

  return (
    <div className="flex h-[calc(100vh-48px)] gap-6">
      {/* Left Side - Menu Grid */}
      <div className="flex flex-1 flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-foreground">Kasir</h1>
          <p className="text-muted-foreground">Pilih menu untuk ditambahkan ke pesanan</p>
        </div>

        {/* Category Filter */}
        <div className="mb-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Menu Grid */}
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 gap-4 pr-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredMenu.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer overflow-hidden transition-shadow hover:shadow-lg"
                onClick={() => addToCart(item)}
              >
                <div className="relative aspect-square">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  <Badge className="absolute right-2 top-2" variant="secondary">
                    {item.category}
                  </Badge>
                </div>
                <CardContent className="p-3">
                  <h3 className="line-clamp-1 font-medium text-card-foreground">
                    {item.name}
                  </h3>
                  <p className="text-sm font-bold text-primary">
                    {formatCurrency(item.price)}
                  </p>
                  <Button size="sm" className="mt-2 w-full" variant="outline">
                    <Plus className="mr-1 h-4 w-4" />
                    Tambah
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right Side - Cart Panel */}
      <Card className="w-96 flex-shrink-0">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Keranjang
            {cart.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} item
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[calc(100%-80px)] flex-col p-4">
          {/* Customer Info */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="customerName" className="flex items-center gap-1.5 text-sm">
                <User className="h-4 w-4" />
                Nama Customer
              </Label>
              <Input
                id="customerName"
                placeholder="Masukkan nama..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tableNumber" className="flex items-center gap-1.5 text-sm">
                <Hash className="h-4 w-4" />
                Nomor Meja
              </Label>
              <Input
                id="tableNumber"
                placeholder="Contoh: 5"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
              />
            </div>
          </div>

          <Separator className="my-4" />

          {/* Cart Items */}
          <ScrollArea className="flex-1">
            {cart.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-8 text-muted-foreground">
                <ShoppingCart className="mb-2 h-12 w-12 opacity-50" />
                <p>Keranjang kosong</p>
                <p className="text-sm">Pilih menu untuk menambahkan</p>
              </div>
            ) : (
              <div className="space-y-3 pr-2">
                {cart.map((item) => (
                  <div
                    key={item.menuItem.id}
                    className="flex items-center gap-3 rounded-lg border bg-card p-3"
                  >
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded">
                      <Image
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-medium text-card-foreground">
                        {item.menuItem.name}
                      </h4>
                      <p className="text-sm text-primary">
                        {formatCurrency(item.menuItem.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.menuItem.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.menuItem.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => removeFromCart(item.menuItem.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Total & Checkout */}
          <div className="mt-4 space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-card-foreground">Total</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(total)}
              </span>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={handleProceedToPayment}
              disabled={cart.length === 0}
            >
              Lanjut ke Pembayaran
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {checkoutStep === 'payment' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={handleBackToCart}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <CardTitle>Pilih Metode Pembayaran</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Order Summary */}
              <div className="rounded-lg bg-muted p-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Customer</span>
                  <span>{customerName}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Meja</span>
                  <span>{tableNumber}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              {!paymentMethod && (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex-col gap-2 hover:border-primary hover:bg-primary/5"
                    onClick={() => handleSelectPaymentMethod('cash')}
                  >
                    <Banknote className="h-8 w-8 text-primary" />
                    <span className="font-medium">CASH</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex-col gap-2 hover:border-primary hover:bg-primary/5"
                    onClick={() => handleSelectPaymentMethod('qris')}
                  >
                    <QrCode className="h-8 w-8 text-primary" />
                    <span className="font-medium">QRIS</span>
                  </Button>
                </div>
              )}

              {/* Cash Payment */}
              {paymentMethod === 'cash' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Banknote className="h-5 w-5" />
                    <span className="font-medium">Pembayaran Cash</span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cashReceived">Nominal Uang Diterima</Label>
                    <Input
                      id="cashReceived"
                      type="number"
                      placeholder="Masukkan nominal..."
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="text-lg"
                    />
                  </div>
                  {cashReceived && parseInt(cashReceived) >= total && (
                    <div className="rounded-lg border-2 border-success bg-success/10 p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-foreground font-medium">Kembalian</span>
                        <span className="text-2xl font-bold text-success">
                          {formatCurrency(cashChange)}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="flex-1" onClick={() => setPaymentMethod(null)}>
                      Kembali
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={handleConfirmPayment}
                      disabled={!cashReceived || parseInt(cashReceived) < total}
                    >
                      Konfirmasi Pembayaran
                    </Button>
                  </div>
                </div>
              )}

              {/* QRIS Payment */}
              {paymentMethod === 'qris' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <QrCode className="h-5 w-5" />
                    <span className="font-medium">Pembayaran QRIS</span>
                  </div>
                  <div className="flex flex-col items-center p-6 rounded-lg border-2 border-dashed">
                    <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center mb-4">
                      <div className="text-center">
                        <QrCode className="h-24 w-24 mx-auto text-foreground/30 mb-2" />
                        <p className="text-xs text-muted-foreground">QR Code Placeholder</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Scan QR code di atas untuk membayar
                    </p>
                    <p className="text-2xl font-bold text-primary mt-2">
                      {formatCurrency(total)}
                    </p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="flex-1" onClick={() => setPaymentMethod(null)}>
                      Kembali
                    </Button>
                    <Button className="flex-1" onClick={handleConfirmPayment}>
                      Konfirmasi Pembayaran
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success Modal */}
      {checkoutStep === 'success' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Pembayaran Berhasil!</h2>
              <p className="text-muted-foreground mb-6">
                Order untuk {customerName} (Meja {tableNumber}) telah selesai.
              </p>
              <div className="rounded-lg bg-muted p-4 mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span>Metode</span>
                  <span className="font-medium">{paymentMethod === 'cash' ? 'CASH' : 'QRIS'}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Total</span>
                  <span className="font-medium">{formatCurrency(total)}</span>
                </div>
                {paymentMethod === 'cash' && cashReceived && (
                  <>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Diterima</span>
                      <span className="font-medium">{formatCurrency(parseInt(cashReceived))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Kembalian</span>
                      <span className="font-medium text-success">{formatCurrency(cashChange)}</span>
                    </div>
                  </>
                )}
              </div>
              <Button className="w-full" size="lg" onClick={handleNewOrder}>
                Order Baru
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

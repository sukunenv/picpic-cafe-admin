// Types
export interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  category: string
  image: string
  status: boolean
}

export interface Order {
  id: string
  orderNumber: string
  customerName: string
  tableNumber: string
  items: { menuItem: MenuItem; quantity: number }[]
  total: number
  status: 'pending' | 'lunas' | 'belum_bayar'
  createdAt: Date
}

export interface Banner {
  id: string
  title: string
  image: string
  active: boolean
  createdAt: Date
}

export interface CartItem {
  menuItem: MenuItem
  quantity: number
}

// Mock Data
export const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Kopi Susu Gula Aren',
    description: 'Kopi espresso dengan susu dan gula aren pilihan',
    price: 25000,
    category: 'Kopi',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&h=200&fit=crop',
    status: true,
  },
  {
    id: '2',
    name: 'Americano',
    description: 'Espresso shot dengan air panas',
    price: 22000,
    category: 'Kopi',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&h=200&fit=crop',
    status: true,
  },
  {
    id: '3',
    name: 'Cappuccino',
    description: 'Espresso dengan steamed milk dan foam lembut',
    price: 28000,
    category: 'Kopi',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200&h=200&fit=crop',
    status: true,
  },
  {
    id: '4',
    name: 'Matcha Latte',
    description: 'Green tea matcha premium dengan susu segar',
    price: 30000,
    category: 'Non-Kopi',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=200&h=200&fit=crop',
    status: true,
  },
  {
    id: '5',
    name: 'Croissant',
    description: 'Croissant butter renyah dan lembut',
    price: 18000,
    category: 'Snack',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&h=200&fit=crop',
    status: true,
  },
  {
    id: '6',
    name: 'Nasi Goreng',
    description: 'Nasi goreng spesial dengan telur dan ayam',
    price: 35000,
    category: 'Makanan',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200&h=200&fit=crop',
    status: true,
  },
  {
    id: '7',
    name: 'Mie Goreng',
    description: 'Mie goreng dengan sayuran dan bumbu spesial',
    price: 32000,
    category: 'Makanan',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=200&fit=crop',
    status: true,
  },
  {
    id: '8',
    name: 'Es Teh Manis',
    description: 'Teh manis segar dengan es batu',
    price: 12000,
    category: 'Non-Kopi',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop',
    status: true,
  },
  {
    id: '9',
    name: 'Roti Bakar',
    description: 'Roti bakar dengan berbagai topping pilihan',
    price: 20000,
    category: 'Snack',
    image: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=200&h=200&fit=crop',
    status: false,
  },
  {
    id: '10',
    name: 'Lemon Tea',
    description: 'Teh segar dengan perasan lemon asli',
    price: 15000,
    category: 'Non-Kopi',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop',
    status: true,
  },
  {
    id: '11',
    name: 'French Fries',
    description: 'Kentang goreng crispy dengan saus pilihan',
    price: 22000,
    category: 'Snack',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&h=200&fit=crop',
    status: true,
  },
  {
    id: '12',
    name: 'Sandwich',
    description: 'Sandwich dengan daging, sayuran, dan keju',
    price: 28000,
    category: 'Makanan',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&h=200&fit=crop',
    status: true,
  },
]

export const orders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    customerName: 'Budi Santoso',
    tableNumber: '5',
    items: [
      { menuItem: menuItems[0], quantity: 2 },
      { menuItem: menuItems[4], quantity: 1 },
    ],
    total: 68000,
    status: 'lunas',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    customerName: 'Siti Rahayu',
    tableNumber: '3',
    items: [
      { menuItem: menuItems[3], quantity: 1 },
      { menuItem: menuItems[5], quantity: 1 },
    ],
    total: 65000,
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: '3',
    orderNumber: 'ORD-003',
    customerName: 'Ahmad Wijaya',
    tableNumber: '7',
    items: [
      { menuItem: menuItems[1], quantity: 3 },
      { menuItem: menuItems[6], quantity: 2 },
    ],
    total: 130000,
    status: 'belum_bayar',
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: '4',
    orderNumber: 'ORD-004',
    customerName: 'Dewi Lestari',
    tableNumber: '2',
    items: [{ menuItem: menuItems[2], quantity: 2 }],
    total: 56000,
    status: 'lunas',
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: '5',
    orderNumber: 'ORD-005',
    customerName: 'Rudi Hermawan',
    tableNumber: '1',
    items: [
      { menuItem: menuItems[7], quantity: 4 },
      { menuItem: menuItems[4], quantity: 2 },
    ],
    total: 84000,
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 10),
  },
  {
    id: '6',
    orderNumber: 'ORD-006',
    customerName: 'Maya Sari',
    tableNumber: '8',
    items: [
      { menuItem: menuItems[0], quantity: 1 },
      { menuItem: menuItems[11], quantity: 1 },
    ],
    total: 53000,
    status: 'lunas',
    createdAt: new Date(Date.now() - 1000 * 60 * 90),
  },
]

export const banners: Banner[] = [
  {
    id: '1',
    title: 'Promo Buy 1 Get 1 Kopi Susu',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=400&fit=crop',
    active: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  },
  {
    id: '2',
    title: 'Diskon 20% Semua Menu Makanan',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop',
    active: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
  {
    id: '3',
    title: 'Happy Hour 2-5 PM',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=400&fit=crop',
    active: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
  },
]

// Chart data for 7-day trend
export const trendData = [
  { day: 'Sen', orders: 45, revenue: 1250000 },
  { day: 'Sel', orders: 52, revenue: 1480000 },
  { day: 'Rab', orders: 38, revenue: 1120000 },
  { day: 'Kam', orders: 65, revenue: 1890000 },
  { day: 'Jum', orders: 78, revenue: 2340000 },
  { day: 'Sab', orders: 92, revenue: 2780000 },
  { day: 'Min', orders: 84, revenue: 2520000 },
]

// Utility functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(date)
}

export function getStatusLabel(status: Order['status']): string {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'lunas':
      return 'Lunas'
    case 'belum_bayar':
      return 'Belum Bayar'
    default:
      return status
  }
}

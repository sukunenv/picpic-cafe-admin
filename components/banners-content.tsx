'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Image as ImageIcon, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { banners as initialBanners } from '@/lib/data'
import type { Banner } from '@/lib/data'

export function BannersContent() {
  const [banners, setBanners] = useState<Banner[]>(initialBanners)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formImage, setFormImage] = useState('')

  const handleToggleStatus = (id: string) => {
    setBanners((prev) =>
      prev.map((banner) =>
        banner.id === id ? { ...banner, active: !banner.active } : banner
      )
    )
  }

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus banner ini?')) {
      setBanners((prev) => prev.filter((banner) => banner.id !== id))
    }
  }

  const openAddDialog = () => {
    setEditingBanner(null)
    setFormTitle('')
    setFormImage('')
    setIsDialogOpen(true)
  }

  const openEditDialog = (banner: Banner) => {
    setEditingBanner(banner)
    setFormTitle(banner.title)
    setFormImage(banner.image)
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!formTitle || !formImage) {
      alert('Lengkapi semua field yang diperlukan')
      return
    }

    if (editingBanner) {
      // Update existing
      setBanners((prev) =>
        prev.map((banner) =>
          banner.id === editingBanner.id
            ? {
                ...banner,
                title: formTitle,
                image: formImage,
              }
            : banner
        )
      )
    } else {
      // Add new
      const newBanner: Banner = {
        id: Date.now().toString(),
        title: formTitle,
        image: formImage,
        active: true,
        createdAt: new Date(),
      }
      setBanners((prev) => [...prev, newBanner])
    }

    setIsDialogOpen(false)
  }

  const activeBanners = banners.filter((b) => b.active).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Banners</h1>
          <p className="text-muted-foreground">
            Kelola banner promo yang ditampilkan
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? 'Edit Banner' : 'Tambah Banner Baru'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Judul Banner</Label>
                <Input
                  id="title"
                  placeholder="Contoh: Promo Buy 1 Get 1"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">URL Gambar</Label>
                <Input
                  id="image"
                  placeholder="https://..."
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                />
              </div>
              {formImage && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="relative aspect-[2/1] overflow-hidden rounded-lg border">
                    <Image
                      src={formImage}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleSubmit}>
                  {editingBanner ? 'Simpan Perubahan' : 'Tambah Banner'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <ImageIcon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Banner</p>
              <p className="text-2xl font-bold text-card-foreground">{banners.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success">
              <Eye className="h-6 w-6 text-success-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aktif</p>
              <p className="text-2xl font-bold text-card-foreground">{activeBanners}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <EyeOff className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tidak Aktif</p>
              <p className="text-2xl font-bold text-card-foreground">
                {banners.length - activeBanners}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Banners Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Daftar Banner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {banners.map((banner) => (
              <Card
                key={banner.id}
                className={`overflow-hidden ${!banner.active ? 'opacity-60' : ''}`}
              >
                <div className="relative aspect-[2/1]">
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-semibold text-white">
                      {banner.title}
                    </h3>
                  </div>
                  <Badge
                    className="absolute right-3 top-3"
                    variant={banner.active ? 'default' : 'secondary'}
                  >
                    {banner.active ? 'Aktif' : 'Tidak Aktif'}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={banner.active}
                        onCheckedChange={() => handleToggleStatus(banner.id)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {banner.active ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditDialog(banner)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(banner.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {banners.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ImageIcon className="mb-3 h-12 w-12 opacity-50" />
                <p className="text-lg font-medium">Belum ada banner</p>
                <p className="text-sm">Klik tombol Tambah Banner untuk memulai</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

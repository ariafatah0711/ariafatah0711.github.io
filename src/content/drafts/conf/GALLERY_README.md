# 📸 Gallery Management System

Gallery page sekarang menggunakan sistem dinamis yang mudah dikelola melalui file `_data/gallery.yml`.

## 🚀 Cara Menambah Foto Baru

### 1. Edit File `_data/gallery.yml`

```yaml
photos:
  - path: "assets/images/gallery/photo1.jpg"  # Path ke foto
    title: "Judul Foto"                       # Judul yang muncul
    size: "large"                            # Ukuran: large/medium/small
    category: "nature"                       # Kategori untuk filter
    description: "Deskripsi foto"            # Deskripsi yang muncul di overlay
```

### 2. Pilihan Size:
- **`large`** - 2x2 grid (foto utama, lebih besar)
- **`medium`** - 1x2 grid (foto vertikal)
- **`small`** - 1x1 grid (foto kecil)

### 3. Kategori yang Tersedia:
- `nature` - Foto alam
- `art` - Seni dan abstrak
- `urban` - Perkotaan
- `architecture` - Arsitektur
- `portrait` - Potret
- `minimal` - Minimalis
- `macro` - Close-up

## 📁 Struktur File Foto

Rekomendasi struktur folder:
```
assets/
└── images/
    └── gallery/
        ├── nature/
        │   ├── sunset1.jpg
        │   └── landscape1.jpg
        ├── art/
        │   ├── abstract1.jpg
        │   └── street-art1.jpg
        └── urban/
            ├── cityscape1.jpg
            └── street1.jpg
```

## 🔧 Contoh Menambah Foto

### Menambah Foto Baru:
```yaml
photos:
  # ... foto yang sudah ada ...
  
  - path: "assets/images/gallery/nature/sunset2.jpg"
    title: "Golden Hour"
    size: "large"
    category: "nature"
    description: "Sunset dengan warna emas yang indah"
    
  - path: "assets/images/gallery/art/abstract2.jpg"
    title: "Modern Art"
    size: "medium"
    category: "art"
    description: "Karya seni modern dengan warna kontras"
```

### Menambah Kategori Baru:
```yaml
categories:
  # ... kategori yang sudah ada ...
  
  - name: "Travel"
    slug: "travel"
    count: 5
```

## 🎨 Fitur Gallery

### ✅ Yang Sudah Tersedia:
- **Dynamic Loading** - Foto dimuat dari YAML
- **Category Filter** - Filter berdasarkan kategori
- **Responsive Design** - Mobile-friendly
- **Dark Mode** - Compatible dengan theme
- **Hover Effects** - Animasi saat hover
- **Lazy Loading** - Foto dimuat saat diperlukan

### 🔮 Fitur yang Bisa Ditambah:
- **Lightbox Modal** - View foto full size
- **Search Function** - Cari foto berdasarkan judul
- **Sort Options** - Urutkan berdasarkan tanggal/size
- **Infinite Scroll** - Load lebih banyak foto
- **Photo Upload** - Upload foto langsung dari admin

## 📝 Tips Management

### 1. Optimasi Foto:
- Gunakan format WebP untuk ukuran lebih kecil
- Resize foto sebelum upload (max 1200px width)
- Compress foto untuk loading yang cepat

### 2. Naming Convention:
- Gunakan nama file yang deskriptif
- Hindari spasi, gunakan dash atau underscore
- Contoh: `sunset-golden-hour.jpg`

### 3. Kategori Management:
- Update count di categories saat menambah foto
- Gunakan kategori yang konsisten
- Buat kategori baru jika diperlukan

## 🚀 Quick Start

1. **Upload foto** ke folder `assets/images/gallery/`
2. **Edit** `_data/gallery.yml`
3. **Tambah entry** baru di section `photos`
4. **Update count** di section `categories` jika perlu
5. **Save** dan refresh halaman gallery

## 📱 Responsive Behavior

- **Desktop**: Layout abstrak dengan berbagai ukuran
- **Tablet**: Grid yang lebih compact
- **Mobile**: Single column layout

## 🌙 Dark Mode

Gallery otomatis mengikuti theme:
- **Light Mode**: Subtle shadows dan borders
- **Dark Mode**: Enhanced shadows untuk contrast

---

**Happy Gallery Management! 📸✨**

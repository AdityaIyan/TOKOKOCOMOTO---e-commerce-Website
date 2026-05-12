
#set document(
  title: "X02 - Final Project: Eyewear Store",
  author: "[Nama Mahasiswa] ([NRP])"
)
#set text(
  font: "New Computer Modern",
  size: 11pt,
  lang: "id"
)
#set heading(numbering: "1.1")

// --- Judul Utama ---
#align(center)[
  #block(
    width: 100%,
    inset: 10pt,
    fill: luma(235),
    radius: 5pt,
  )[
    = X02 - Final Project: Eyewear Store
    #v(8pt)
    #text(12pt)[Laporan Implementasi Sistem E-Commerce Toko Kacamata]
  ]
]

// --- Identitas ---
== Identitas
#table(
  columns: (auto, 1fr),
  stroke: none,
  [Mata Kuliah], [Pemrograman Berbasis Kerangka Kerja],
  [Nama], [Aditya Fieansyah Putra Pratama],
  [NRP], [5025231309],
  [Judul Proyek], [Eyewear Store - E-Commerce],
)

== Ringkasan Eksekutif
Laporan ini mendokumentasikan pengembangan Eyewear Store, platform e-commerce berbasis web yang dirancang khusus untuk penjualan produk kacamata. Sistem ini dibangun untuk memenuhi kriteria proyek akhir dengan fokus pada keamanan, dan pengalaman pengguna.

Aplikasi mengadopsi arsitektur *monorepo* yang menggabungkan *NestJS* sebagai backend yang robust dan *Next.js* sebagai frontend responsif. Penyimpanan data ditangani oleh *SQLite* melalui *Prisma ORM* untuk tipe-aman database access. Fitur unggulan meliputi manajemen produk lengkap, otentikasi dengan dua role (Admin/seller dan buyer/user), analitik dashboard real-time, notifikasi email transaksional, dan CRUD oleh user maupun seller

== Arsitektur Sistem

Proyek ini dibangun di atas arsitektur *Client-Server* modern yang terpisah namun dikelola dalam satu repositori (monorepo):

#block(fill: luma(245), radius: 4pt, inset: 8pt)[
- *Frontend*: Next.js (React) dengan Tailwind CSS untuk styling modern dan responsif.
- *Backend*: NestJS (Node.js) menyediakan REST API yang terstruktur dan modular.
- *Database*: SQLite (via Prisma ORM) sebagai penyimpanan data relasional.
- *Storage*: Local Disk Storage (via Multer) untuk manajemen aset gambar produk.
- *Email Service*: Nodemailer (Gmail SMTP) untuk pengiriman notifikasi otomatis.
]

== Fitur Utama & Implementasi

=== 1. Manajemen Produk & Inventaris
Admin (Seller) memiliki akses penuh untuk mengelola katalog produk. Setiap produk dilengkapi dengan detail harga, stok, SKU yang unik, dan kategori. Sistem upload gambar menggunakan library `Multer` di NestJS, yang menyimpan file secara lokal dan menyajikannya melalui endpoint statis.

=== 2. Otentikasi & Otorisasi
Sistem keamanan menggunakan standar industri **JWT (JSON Web Token)** dengan mekanisme *Refresh Token Rotation* untuk keamanan jangka panjang.
- **Role-Based Access Control (RBAC)**: Memisahkan hak akses antara `ADMIN` (Seller) dan `BUYER`.
- **Secure Password**: Password pengguna di-hash menggunakan `bcryptjs` sebelum disimpan ke database.

=== 3. Keranjang & Pesanan
Fitur belanja mencakup:
- **Persistent Cart**: Keranjang belanja disimpan di database, memungkinkan akses lintas perangkat.
- **Order Lifecycle**: Pesanan memiliki status tracking lengkap (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
- **Validation**: Validasi stok otomatis saat checkout untuk mencegah overselling.

=== 4. Dashboard Admin & Analitik
Dashboard menyediakan wawasan bisnis bagi admin melalui visualisasi data:
- **Revenue Tracking**: Total pendapatan dari penjualan.
- **Order Statistics**: Jumlah total pesanan yang masuk.
- **Low Stock Alerts**: Daftar produk dengan stok menipis (< 10 unit) untuk restock segera.
- **Sales Trend**: Grafik tren penjualan harian selama 7 hari terakhir.

=== 5. Notifikasi Email Otomatis
Layanan email terintegrasi (`MailService`) memberikan pembaruan status real-time:
- **Buyer Confirmation**: Email konfirmasi saat pesanan berhasil dibuat.
- **Seller Alert**: Notifikasi ke admin saat ada pesanan baru masuk.
- **Delivery Update**: Pemberitahuan ke customer saat pesanan telah sampai (`DELIVERED`).

=== 6. Fitur Komunitas (Posts)
Platform dilengkapi fitur sosial dimana pengguna dapat:
- Membuat postingan diskusi.
- Membalas postingan pengguna lain (*nested replies*).
- Berbagi pengalaman atau review produk secara publik.

== Skema Database (ERD)

Desain database relasional menggunakan Prisma Schema:

#block(fill: luma(245), radius: 4pt, inset: 8pt)[
- **User**: Menyimpan data pengguna, role, dan kredensial (password/refresh token).
- **Product**: Data katalog produk, harga, stok, SKU, dan relasi ke Seller.
- **Order**: Data transaksi, status pesanan, dan total harga.
- **OrderItem**: Detail item dalam setiap pesanan (snapshot harga & qty).
- **Cart & CartItem**: Keranjang belanja sementara pengguna.
- **Post**: Data konten komunitas, mendukung relasi *self-referencing* untuk balasan (replies).
]

== Implementasi API (Backend)

Backend mengekspos RESTful API yang terorganisir per modul:

=== Autentikasi (`/auth`)
- `POST /auth/register`: Pendaftaran pengguna baru.
- `POST /auth/login`: Login user (return Access & Refresh Token).
- `POST /auth/refresh`: Memperbarui Access Token.
- `POST /auth/logout`: Invalidasi Refresh Token.

=== Produk (`/products`)
- `GET /products`: List publik produk.
- `POST /products`: (Admin) Tambah produk & upload gambar.
- `PUT /products/:id`: (Admin) Update produk.
- `DELETE /products/:id`: (Admin) Hapus produk.

=== Pesanan (`/orders`)
- `POST /orders`: Checkout keranjang.
- `GET /orders`: (Admin) Lihat semua pesanan.
- `GET /orders/me`: (Buyer) Lihat riwayat pesanan sendiri.
- `PUT /orders/:id/status`: Update status pesanan (Trigger Email).

=== Dashboard (`/dashboard`)
- `GET /dashboard/stats`: Mengambil data analitik untuk halaman admin.

=== Komunitas (`/posts`)
- `GET /posts`: Mengambil feed diskusi.
- `POST /posts`: Membuat postingan baru.
- `POST /posts/:id/reply`: Membalas postingan.





== Pemenuhan Kriteria E-Commerce

Proyek ini telah memenuhi seluruh spesifikasi User Stories utama:

#block(fill: luma(245), radius: 4pt, inset: 8pt)[
-  *Manage Products*: Admin dapat melakukan CRUD produk lengkap dengan gambar.
-  *Browse & Search*: User dapat melihat katalog dan filter produk.
-  *Shopping Cart*: Keranjang belanja yang tersimpan di database.
-  *Checkout Flow*: Konversi keranjang menjadi pesanan dengan alamat pengiriman.
-  *Order Management*: Admin dapat memantau dan mengubah status pesanan.
-  *Order History*: User dapat melihat status pesanan historis mereka.
-  *Sales Dashboard*: Visualisasi pendapatan dan produk stok rendah.
-  *Email Notifications*: Notifikasi otomatis untuk aksi-aksi kritikal.
-  *Authentication*: Sistem login aman dengan role separasi.
]

== Tantangan & Solusi

1.  **Handling Image Uploads**: Mengelola file upload dalam arsitektur REST API.
    -   *Solusi*: Menggunakan `Multer` di NestJS untuk menyimpan file ke disk lokal dan menyajikannya via `ServeStaticModule`.
2.  **Authentication State**: Menjaga user tetap login dengan aman.
    -   *Solusi*: Implementasi `Refresh Token Rotation` agar user tidak perlu login ulang namun tetap aman jika token dicuri.
3.  **Real-time Analytics**: Query data performa penjualan yang kompleks.
    -   *Solusi*: Optimasi query Prisma dan pemrosesan data di level service untuk mereturn format JSON yang siap dikonsumsi grafik Frontend.

== Kesimpulan
**Eyewear Store** berhasil diimplementasikan sebagai platform e-commerce modern yang fungsional. Integrasi teknologi **NestJS** dan **Next.js** memberikan performa tinggi dan pengalaman pengembangan yang baik. Fitur-fitur esensial e-commerce seperti manajemen transaksi, stok, dan notifikasi telah berjalan dengan baik, didukung oleh stabilitas pengujian dan kualitas kode yang terjaga.

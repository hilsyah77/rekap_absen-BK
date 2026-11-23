# Panduan Penggunaan & Pemindahan ke Komputer Lain
## Aplikasi Absensi Siswa Bulanan & Buku Register BK Madrasah / Sekolah

---

### 1. Ringkasan Status Aplikasi

- **Kondisi Data:** 100% **BERSIH (Clean Slate)**. Seluruh data tiruan (mock students, presensi tiruan, catatan konseling fiktif, profil madrasah contoh) telah dihapus total.
- **Aset Offline:** 100% **Mandiri Offline**. Script Tailwind CSS Engine dan SheetJS (Excel) telah diunduh ke folder `assets/js/` sehingga aplikasi dapat berjalan sempurna di sekolah tanpa koneksi internet sama sekali.
- **Penyimpanan Database Lokal:**
  - **Pada Mode Desktop Electron:** Database otomatis tersimpan permanen di folder sistem Windows:
    `%APPDATA%\AbsensiGuruBK\absensi_bk_database.json`
    *(Aman dari pembersihan cache browser).*
  - **Pada Mode Browser / Standalone Edge:** Database tersimpan di `localStorage` peramban lokal.
  - **Fitur Cadangkan & Pulihkan (.bkdb):** Tombol **"💾 Database Lokal"** di toolbar atas dapat digunakan kapan saja untuk mengunduh seluruh data dalam satu berkas `.bkdb` dan memulihkannya kembali.

---

### 2. Cara Menjalankan di Komputer Saat Ini

Cukup klik dua kali berkas:
```text
Jalankan-Aplikasi-Desktop.bat
```
Aplikasi akan langsung terbuka dalam jendela desktop mandiri tanpa address bar (seperti aplikasi Windows native).

---

### 3. Cara Memindahkan & Menjalankan di Komputer Lain (Opsi 1)

Ada **3 cara praktis** untuk memindahkan aplikasi ini ke komputer kepala madrasah, guru BK lain, atau laptop pribadi:

#### Metode A: Salin Seluruh Folder ke Flashdisk (Paling Cepat & Praktis)
1. Colokkan Flashdisk ke komputer ini.
2. Salin (Copy) seluruh folder `absensi guru bk` ke dalam flashdisk.
3. Colokkan flashdisk ke komputer/laptop tujuan.
4. Di komputer tujuan, buka folder tersebut dan klik dua kali:
   `Jalankan-Aplikasi-Desktop.bat`
5. **Otomatis Berjalan:** 
   - Jika di komputer tujuan tidak ada Node.js, skrip peluncur secara pintar akan membuka aplikasi dalam mode **Windows Chromium Standalone (Microsoft Edge App Mode)** yang sudah bawaan ada di setiap Windows 10 & Windows 11.
   - Tidak perlu install software tambahan apapun!

---

#### Metode B: Memaketkan Menjadi File Installer Tunggal (.exe)
Jika Anda ingin menghasilkan berkas installer portabel seperti software resmi:
1. Pastikan Anda berada di komputer utama yang terhubung internet sekali saja.
2. Klik dua kali berkas:
   `Buat-Installer-Windows.bat`
3. Tunggu proses pembungkusan selesai.
4. Buka folder baru bernama `dist/`. Di dalamnya akan ada berkas biner Windows:
   `Absensi-Guru-BK-Setup.exe` (atau varian portabel).
5. Anda cukup membawa satu file `.exe` tersebut ke komputer mana pun!

---

#### Metode C: Migrasi Data antar Komputer (Backup & Restore .bkdb)
Jika guru BK mengisi presensi di laptop pribadi di rumah dan ingin memasukkannya ke komputer sekolah:
1. Di komputer asal, buka aplikasi lalu klik tombol **"💾 Database Lokal"** di toolbar atas.
2. Klik tombol hijau **"⬇️ Unduh Berkas Cadangan (.bkdb)"**. Berkas dengan nama `Backup_Absensi_BK_YYYY-MM-DD.bkdb` akan tersimpan.
3. Kirim file `.bkdb` tersebut (lewat Flashdisk / WhatsApp / Email) ke komputer tujuan.
4. Di komputer tujuan, buka aplikasi lalu klik tombol **"💾 Database Lokal"**.
5. Di bagian **"Pulihkan Database"**, klik **"Pilih Berkas Cadangan (.bkdb / .json)"** dan pilih file tadi.
6. Seluruh data siswa, presensi, kelas, catatan konseling, dan profil sekolah akan sinkron 100%!

---

### 4. Langkah Mengisi Data Siswa Sekolah Anda

Saat aplikasi dibuka pertama kali, tabel akan menampilkan pesan:
*"Belum Ada Siswa di Kelas Ini"*.

Untuk memasukkan data siswa asli sekolah Anda:
1. **Pilih / Tambah Kelas:**
   - Gunakan menu pilihan kelas di pojok kiri atas.
   - Untuk menambah kelas baru (misal: `7A`, `8B`, `X-1`, `XII-IPA`), klik ikon tanda tambah (**`+`**) di samping dropdown kelas.
2. **Unggah Siswa dari File Excel / CSV:**
   - Klik tombol **"Upload Siswa"** di toolbar atas.
   - Anda dapat mengunduh format template dengan menekan tautan template.
   - File Excel cukup memiliki kolom minimal: `NIS` dan `NAMA SISWA` (opsional: `JENIS KELAMIN` dan `KELAS`).
   - Seret (drag-and-drop) file Excel Anda ke area unggah, lalu klik **"Impor Siswa"**.
3. **Atau Tambah Manual:**
   - Di modal yang sama, pilih tab **"Tambah 1 Siswa Manual"** untuk memasukkan siswa satu per satu.

---

### 5. Pengaturan Identitas Sekolah & Logo Resmi

1. Klik tombol **"Identitas Sekolah & Logo"** di toolbar atas (atau klik judul madrasah di header).
2. Di **Tab 1 (Logo & Simbol)**: Unggah logo madrasah/sekolah Anda (format PNG transparan/JPG) atau pilih preset Kemenag / Kemdikbud / Garuda.
3. Di **Tab 2 (Identitas Sekolah)**: Isi nama madrasah/sekolah, alamat, kontak, dan nomor NPSN.
4. Di **Tab 3 (Penandatangan)**: Masukkan nama & NIP Kepala Madrasah serta Guru BK untuk tanda tangan laporan cetak resmi.
5. Klik **"Simpan Pengaturan"**. Seluruh kop surat cetak PDF otomatis menyesuaikan!

---

### 6. Panduan Mencetak PDF / Print Kertas F4 (Folio) Landscape Presisi

Aplikasi ini telah didesain khusus agar laporan bulanan muat **100% Presisi** dalam 1 lembar lebar **Kertas F4 / Folio (330 mm &times; 215 mm) Landscape**:
1. Klik tombol **"Cetak Rekap F4"** di toolbar atas.
2. Pada jendela dialog cetak Windows / Browser:
   - **Tujuan / Destination:** Pilih printer fisik Anda atau *Save as PDF (Simpan sebagai PDF)*.
   - **Ukuran Kertas (Paper Size):** Pilih **F4**, **Folio**, atau **8.5 &times; 13 inch** (jika printer Anda menggunakan ukuran milimeter, atur ke *330 &times; 215 mm*).
   - **Orientasi (Orientation):** Pilih **Landscape** (Mendatar).
   - **Margin:** Pilih **Default** atau **Minimal** (CSS aplikasi sudah mengatur margin rapat 6-7mm).
   - **Skala (Scale):** Biarkan **100%** (atau *Fit to Printable Area*).
   - **Opsi:** Pastikan mencentang **Grafis Latar Belakang (Background Graphics)** agar warna sel status kehadiran tercetak jelas dan tajam.
3. Seluruh tabel absensi dari **No Absen, NIS, Nama Lengkap Siswa, Tanggal 1 s/d 31, Rekap Hadir, Sakit, Izin, Alfa, Libur, % Kehadiran, hingga Status Siswa** serta lembar tanda tangan pengesahan akan tercetak rapi tanpa terpotong!


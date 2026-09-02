# FinancialRecord 💰
> **Enterprise-Grade AI-Powered Personal Finance & Smart Income/Expense Breakdown Platform**

FinancialRecord adalah platform manajemen keuangan modern yang berfokus pada pencatatan akurat arus **Pemasukan (Income)** dan perincian alokasi **Pengeluaran (Expense)**. Dilengkapi dengan asisten AI multimodal untuk Natural Language Processing (NLP) Quick Entry, Kantong Pos Keuangan dinamis, Limit Budget bulanan otomatis, grafik visualisasi Arus Kas fleksibel (Per Tahun, Per Bulan, dan Harian), serta portal Admin lengkap untuk pemantauan token AI dan tata kelola sistem.

---

## 🏛️ Arsitektur & Tech Stack

### Monorepo Structure
- **`/backend`**: Spring Boot 3.3.x (Java 21, Maven, Spring Security JWT, Spring Data JPA, Flyway, Spring AI Gemini/OpenAI).
- **`/frontend`**: Next.js 14/15 App Router (TypeScript, TailwindCSS, Shadcn UI, TanStack Query, Lucide Icons, Recharts).
- **`/docker-compose.yml`**: PostgreSQL 16 & pgAdmin 4.

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Jalankan Database (Docker Compose)
Pastikan Docker Desktop aktif, lalu jalankan:
```bash
docker-compose up -d
```
- PostgreSQL berjalan di: `localhost:5432` (Database: `financialrecord_db`, User: `postgres`, Password: `postgrespassword`)
- pgAdmin 4 berjalan di: `http://localhost:5050` (Email: `admin@financialrecord.com`, Password: `adminpassword`)

### 2. Jalankan Backend (Spring Boot)
Masuk ke direktori backend:
```bash
cd backend
mvn clean spring-boot:run
```
- API Server berjalan di: `http://localhost:8080`
- Swagger OpenAPI Documentation: `http://localhost:8080/swagger-ui.html`

### 3. Jalankan Frontend (Next.js)
Buka terminal baru, masuk ke direktori frontend:
```bash
cd frontend
npm install
npm run dev
```
- Frontend berjalan di: `http://localhost:3000`

---

## 👤 Akun Bawaan (Default Seed Data)

| Role | Email | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@financialrecord.com` | `admin123` | Portal `/admin/*` (AI Monitoring, Users, Metrics) |
| **Demo User** | `user@financialrecord.com` | `user123` | Portal `/*` (Dashboard, Transactions, Wallets, Budgets, AI Advisor) |

---

## 🤖 Fitur AI & Finansial Unggulan
1. **NLP Quick Multi-Item Entry:** Ketik *"Beli makan siang nasi padang 25rb, bayar wifi 350rb, gajian 5jt"* -> AI mengekstrak nominal, jenis transaksi, dan kategori pos secara otomatis dalam 1 kali proses.
2. **Kantong Pos Keuangan Dinamis (`/wallets`):** Pengelompokan cerdas transaksi masuk dan keluar ke dalam pos-pos terpisah dengan penyaringan periode Bulanan, Tahunan, dan Semua Waktu.
3. **Limit & Target Budgeting (`/budgets`):** Pengendalian anggaran dengan indikator status visual Aman, Peringatan (≥ 80%), dan Overbudget (≥ 100%) serta rekomendasi penyeimbangan otomatis.
4. **Grafik Arus Kas Fleksibel (`/dashboard`):** Visualisasi tren pemasukan vs pengeluaran dalam 3 mode: Per Tahun (2022-2027), Per Bulan (12 Bulan), dan Harian dengan dropdown bulan dan tahun dinamis.
5. **AI Token & Cost Monitoring (`/admin/ai-monitoring`):** Pemantauan real-time penggunaan prompt tokens, completion tokens, estimasi biaya USD, dan rata-rata latensi API.

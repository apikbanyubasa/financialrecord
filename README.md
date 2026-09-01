# FinancialRecord 💰
> **Enterprise-Grade AI-Powered Personal Finance & Smart Income/Expense Breakdown Platform**

FinancialRecord adalah platform manajemen keuangan modern yang fokus pada pencatatan akurat arus **Pemasukan (Income)** dan perincian alokasi **Pengeluaran (Expense)**. Dilengkapi dengan asisten AI multimodal untuk OCR Struk belanja, Natural Language Processing (NLP) Quick Entry, Financial Advisor deteksi "bocor halus", serta portal Admin lengkap untuk pemantauan token AI dan tata kelola sistem.

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
| **Demo User** | `user@financialrecord.com` | `user123` | Portal `/*` (Dashboard, Transactions, Scan OCR, Wallets, Budgets, AI Advisor) |

---

## 🤖 Fitur AI Unggulan
1. **Multimodal Receipt OCR (`/transactions/scan`):** Upload struk belanja atau screenshot mutasi -> AI mengekstraksi merchant, nominal, tanggal, kategori, dan rincian item.
2. **NLP Quick Transaction Entry:** Ketik *"Beli makan siang nasi padang 25rb pake GoPay"* -> AI memproses otomatis ke form transaksi.
3. **Smart Financial Advisor & "Bocor Halus" Detector (`/advisor`):** Menganalisis rasio pengeluaran terhadap pemasukan, menghitung skor kesehatan finansial (1-100), mendeteksi pengeluaran mikro tersembunyi, dan memberikan tips penghematan konkret.
4. **AI Token & Cost Monitoring (`/admin/ai-monitoring`):** Pemantauan real-time penggunaan prompt tokens, completion tokens, estimasi biaya USD, dan rata-rata latensi API.

# Quick Start Guide

Panduan cepat untuk menjalankan backend dalam 5 menit.

## ⚡ Quick Steps

```bash
# 1. Install dependencies
npm install

# 2. Setup database
createdb campus_repository
psql -d campus_repository -f create-database.sql

# 3. Setup environment
cp env.example .env
# Edit .env dan isi DB_PASSWORD dan JWT_SECRET

# 4. Buat folder uploads
mkdir -p uploads

# 5. Jalankan aplikasi
npm run start:dev
```

## 📝 Detail Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database

**Buat database:**
```bash
createdb campus_repository
```

**Jalankan migration:**
```bash
psql -d campus_repository -f create-database.sql
```

### 3. Setup Environment Variables

**Copy template:**
```bash
cp env.example .env
```

**Edit `.env` dan ubah minimal:**
- `DB_PASSWORD` - Password PostgreSQL Anda
- `JWT_SECRET` - Generate dengan: `openssl rand -base64 32`

**Generate JWT Secret:**
```bash
openssl rand -base64 32
```

### 4. Buat Folder Uploads
```bash
mkdir -p uploads
```

### 5. Jalankan Aplikasi

**Development (recommended):**
```bash
npm run start:dev
```

**Production:**
```bash
npm run build
npm run start:prod
```

## ✅ Verifikasi

Setelah berjalan, Anda akan melihat:
```
Application is running on: http://localhost:3000/api
```

**Test API:**
```bash
# Test login (setelah buat user admin)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## 👤 Buat Admin User Pertama

```bash
node scripts/create-admin.js
```

Atau dengan custom values:
```bash
ADMIN_EMAIL=admin@example.com \
ADMIN_PASSWORD=admin123 \
node scripts/create-admin.js
```

## 🐛 Troubleshooting

**Database connection error?**
- Pastikan PostgreSQL berjalan
- Cek kredensial di `.env`

**Port already in use?**
- Ubah `PORT=3001` di `.env`
- Atau kill process: `lsof -i :3000`

**Module not found?**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Dokumentasi Lengkap

- `RUN.md` - Panduan lengkap
- `SETUP.md` - Setup detail
- `API.md` - API documentation
- `DATABASE-SETUP.md` - Database setup

---

**Selamat! Backend sudah berjalan di http://localhost:3000/api** 🎉


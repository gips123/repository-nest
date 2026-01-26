# Cara Menjalankan Backend NestJS

Panduan lengkap untuk menjalankan Campus Repository System Backend.

## Prerequisites

Pastikan sudah terinstall:
- Node.js (v18 atau lebih tinggi)
- npm atau yarn
- PostgreSQL (v12 atau lebih tinggi)

## Langkah-langkah

### 1. Install Dependencies

```bash
npm install
```

Ini akan menginstall semua package yang diperlukan dari `package.json`.

### 2. Setup Database

#### A. Buat Database

```bash
# Menggunakan createdb
createdb campus_repository

# Atau menggunakan psql
psql -U postgres -c "CREATE DATABASE campus_repository;"
```

#### B. Jalankan SQL Script

```bash
psql -d campus_repository -f create-database.sql
```

Ini akan membuat semua tabel, indexes, triggers, dan seed data roles.

### 3. Setup Environment Variables

```bash
# Copy file example
cp env.example .env

# Edit file .env
nano .env
# atau
code .env
```

**Isi minimal yang perlu diubah:**
```env
DB_PASSWORD=your_database_password
JWT_SECRET=your-secret-key-min-32-chars
```

**Generate JWT Secret:**
```bash
openssl rand -base64 32
```

### 4. Buat Folder Uploads (jika belum ada)

```bash
mkdir -p uploads
chmod 755 uploads
```

### 5. Jalankan Aplikasi

#### Development Mode (dengan hot reload):
```bash
npm run start:dev
```

#### Production Mode:
```bash
# Build dulu
npm run build

# Jalankan
npm run start:prod
```

#### Debug Mode:
```bash
npm run start:debug
```

### 6. Verifikasi

Setelah aplikasi berjalan, Anda akan melihat:
```
Application is running on: http://localhost:3000/api
```

Test dengan curl atau browser:
```bash
# Test health check (jika ada)
curl http://localhost:3000/api

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## Troubleshooting

### Error: Cannot find module
```bash
# Hapus node_modules dan install ulang
rm -rf node_modules package-lock.json
npm install
```

### Error: Database connection failed
- Pastikan PostgreSQL berjalan: `pg_isready` atau `sudo service postgresql status`
- Cek kredensial di `.env`
- Pastikan database sudah dibuat
- Test koneksi: `psql -U postgres -d campus_repository`

### Error: Port already in use
```bash
# Cek process yang menggunakan port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Atau ubah PORT di .env
PORT=3001
```

### Error: JWT secret is too short
- Pastikan JWT_SECRET minimal 32 karakter
- Generate baru: `openssl rand -base64 32`

### Error: Permission denied untuk uploads
```bash
chmod 755 uploads
```

## Scripts yang Tersedia

```bash
# Development
npm run start:dev      # Start dengan watch mode
npm run start:debug    # Start dengan debug mode

# Production
npm run build         # Build aplikasi
npm run start:prod    # Start production mode

# Code Quality
npm run lint          # Lint code
npm run format        # Format code dengan Prettier

# Testing
npm run test          # Run unit tests
npm run test:watch    # Run tests dengan watch mode
npm run test:cov      # Run tests dengan coverage
npm run test:e2e     # Run e2e tests
```

## Membuat Admin User Pertama

Setelah database setup, buat admin user:

### Opsi 1: Menggunakan Script Node.js

```bash
# Pastikan .env sudah di-setup
node scripts/create-admin.js

# Atau dengan custom values
ADMIN_EMAIL=admin@example.com \
ADMIN_PASSWORD=admin123 \
ADMIN_NAME="Admin User" \
node scripts/create-admin.js
```

### Opsi 2: Via SQL (Manual)

```sql
-- Generate bcrypt hash untuk password "admin123"
-- Gunakan tool online atau Node.js untuk generate hash
-- Contoh hash: $2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq

INSERT INTO users (email, password, name, role_id, created_at, updated_at)
SELECT 
    'admin@example.com',
    '$2a$10$YOUR_BCRYPT_HASH_HERE', -- Ganti dengan hash yang benar
    'Admin User',
    (SELECT id FROM roles WHERE name = 'admin'),
    NOW(),
    NOW();
```

## Testing API

### 1. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### 2. Get Profile (dengan token)
```bash
# Simpan token dari response login
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Get Folder Tree
```bash
curl -X GET http://localhost:3000/api/folders/tree \
  -H "Authorization: Bearer $TOKEN"
```

## Development Tips

1. **Hot Reload**: Gunakan `npm run start:dev` untuk auto-reload saat code berubah
2. **Logging**: Check console untuk melihat SQL queries (jika NODE_ENV=development)
3. **API Docs**: Gunakan Postman/Insomnia untuk test API endpoints
4. **Database**: Gunakan pgAdmin atau DBeaver untuk manage database
5. **Debugging**: Gunakan `npm run start:debug` dan attach debugger

## Next Steps

Setelah backend berjalan:
1. Test semua endpoints menggunakan Postman/Insomnia
2. Setup frontend dan integrasikan dengan API
3. Buat user pertama (admin)
4. Setup permissions untuk folder
5. Upload beberapa file untuk testing

## Production Deployment

Untuk production:
1. Set `NODE_ENV=production` di `.env`
2. Gunakan strong JWT_SECRET
3. Setup reverse proxy (Nginx)
4. Enable HTTPS
5. Setup process manager (PM2)
6. Setup database backup
7. Monitor logs dan errors

---

**Selamat! Backend Anda sudah berjalan! 🚀**


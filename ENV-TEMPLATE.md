# Environment Variables Template

File ini berisi template untuk membuat file `.env`. Copy isi file ini ke file `.env` di root project.

## Cara Menggunakan

1. Copy file `env.example` ke `.env`:
   ```bash
   cp env.example .env
   ```

2. Atau buat file `.env` manual dan copy isi dari bawah ini.

---

## Template Environment Variables

```env
# ============================================
# Campus Repository System - Environment Variables
# ============================================

# ============================================
# Server Configuration
# ============================================
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# ============================================
# Database Configuration
# ============================================
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=campus_repository

# ============================================
# JWT Configuration
# ============================================
# IMPORTANT: Change this to a strong random string in production!
# Generate a secure secret: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=24h

# ============================================
# Optional: File Upload Configuration
# ============================================
# MAX_FILE_SIZE=10485760
# UPLOAD_DEST=./uploads

# ============================================
# Optional: Logging
# ============================================
# LOG_LEVEL=debug
# LOG_FILE=logs/app.log
```

---

## Penjelasan Variabel

### Server Configuration

- **PORT**: Port untuk menjalankan server (default: 3000)
- **NODE_ENV**: Environment mode (`development`, `production`, `test`)
- **CORS_ORIGIN**: Origin yang diizinkan untuk CORS (gunakan `*` untuk development, spesifikkan domain di production)

### Database Configuration

- **DB_HOST**: Host PostgreSQL (default: localhost)
- **DB_PORT**: Port PostgreSQL (default: 5432)
- **DB_USERNAME**: Username database
- **DB_PASSWORD**: Password database
- **DB_NAME**: Nama database (default: campus_repository)

### JWT Configuration

- **JWT_SECRET**: Secret key untuk signing JWT token. **PENTING**: Gunakan string yang kuat dan random di production!
  - Generate secret: `openssl rand -base64 32`
  - Minimal 32 karakter
- **JWT_EXPIRES_IN**: Waktu kedaluwarsa token (format: `24h`, `7d`, `30m`)

---

## Production Checklist

Sebelum deploy ke production, pastikan:

- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` diganti dengan string random yang kuat (min 32 karakter)
- [ ] `DB_PASSWORD` menggunakan password yang kuat
- [ ] `CORS_ORIGIN` di-set ke domain frontend yang spesifik (bukan `*`)
- [ ] Database menggunakan kredensial production yang aman
- [ ] File `.env` tidak di-commit ke git (sudah ada di `.gitignore`)
- [ ] Gunakan environment variables dari hosting provider (jika tersedia)

---

## Generate JWT Secret

Untuk generate JWT secret yang aman:

```bash
# Menggunakan OpenSSL
openssl rand -base64 32

# Menggunakan Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Menggunakan Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Contoh .env untuk Development

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=mypassword
DB_NAME=campus_repository

JWT_SECRET=dev-secret-key-change-in-production-12345678901234567890
JWT_EXPIRES_IN=24h
```

## Contoh .env untuk Production

```env
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com

DB_HOST=your-db-host.com
DB_PORT=5432
DB_USERNAME=prod_user
DB_PASSWORD=super-secure-password-here
DB_NAME=campus_repository_prod

JWT_SECRET=K8xP2mN9qR5vW7yZ1aB3cD4eF6gH8iJ0kL2mN4pQ6rS8tU0vW2xY4zA6bC8dE0
JWT_EXPIRES_IN=24h
```

---

## Troubleshooting

### Error: Cannot find module 'dotenv'
```bash
npm install dotenv
```

### Error: Database connection failed
- Pastikan PostgreSQL berjalan
- Cek kredensial database
- Pastikan database sudah dibuat

### Error: JWT secret is too short
- Pastikan JWT_SECRET minimal 32 karakter
- Generate secret baru menggunakan command di atas

---

## Security Notes

1. **Jangan commit file `.env` ke git** - sudah ada di `.gitignore`
2. **Gunakan secret yang berbeda** untuk development dan production
3. **Jangan share `.env` file** - gunakan environment variables di hosting
4. **Rotate JWT secret** secara berkala di production
5. **Gunakan HTTPS** di production untuk mengamankan komunikasi


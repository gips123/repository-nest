# Database Setup Guide

Panduan lengkap untuk membuat database baru untuk Campus Repository System.

## Cara Menggunakan

### Opsi 1: Menggunakan psql (Command Line)

```bash
# 1. Buat database
createdb campus_repository

# 2. Jalankan script SQL
psql -d campus_repository -f create-database.sql
```

Atau dalam satu baris:
```bash
psql -U postgres -c "CREATE DATABASE campus_repository;" && \
psql -d campus_repository -f create-database.sql
```

### Opsi 2: Menggunakan psql Interactive

```bash
# 1. Masuk ke psql
psql -U postgres

# 2. Di dalam psql, jalankan:
CREATE DATABASE campus_repository;
\c campus_repository
\i create-database.sql
\q
```

### Opsi 3: Menggunakan pgAdmin atau DBeaver

1. Buka pgAdmin atau DBeaver
2. Buat koneksi ke PostgreSQL server
3. Buat database baru dengan nama `campus_repository`
4. Buka file `create-database.sql`
5. Jalankan seluruh script

### Opsi 4: Menggunakan Docker (jika menggunakan PostgreSQL di Docker)

```bash
# Copy file SQL ke container
docker cp create-database.sql postgres-container:/tmp/

# Jalankan script
docker exec -i postgres-container psql -U postgres -d postgres < create-database.sql

# Atau buat database dulu, lalu jalankan script
docker exec -i postgres-container psql -U postgres -c "CREATE DATABASE campus_repository;"
docker exec -i postgres-container psql -U postgres -d campus_repository -f /tmp/create-database.sql
```

## Verifikasi

Setelah menjalankan script, verifikasi dengan query berikut:

```sql
-- Cek semua tabel
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Cek roles yang sudah di-seed
SELECT id, name, description FROM roles ORDER BY name;

-- Cek struktur tabel users
\d users

-- Cek foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
```

## Struktur Database

Script akan membuat:

1. **5 Tabel Utama:**
   - `roles` - Role pengguna (admin, wd1, wd2, wd3, dosen, tendik)
   - `users` - Data pengguna
   - `folders` - Struktur folder hierarkis
   - `files` - Metadata file
   - `folder_permissions` - Permission untuk folder

2. **Indexes:**
   - Index untuk email, foreign keys, dan query patterns
   - Partial indexes untuk soft deletes

3. **Triggers:**
   - Auto-update `updated_at` timestamp

4. **Constraints:**
   - Foreign keys dengan CASCADE/SET NULL
   - Check constraint untuk permission (user_id atau role_id harus ada)

5. **Seed Data:**
   - 6 roles default sudah di-insert

## Membuat User Admin Pertama

Setelah database dibuat, buat user admin pertama:

### Opsi 1: Via SQL (dengan password yang sudah di-hash)

```sql
-- Generate bcrypt hash untuk password "admin123"
-- Gunakan tool online atau Node.js: bcrypt.hashSync('admin123', 10)

INSERT INTO users (email, password, name, role_id, created_at, updated_at)
SELECT 
    'admin@example.com',
    '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', -- Ganti dengan hash yang benar
    'Admin User',
    (SELECT id FROM roles WHERE name = 'admin'),
    NOW(),
    NOW();
```

### Opsi 2: Via API (setelah aplikasi berjalan)

```bash
# Login sebagai admin (jika sudah ada)
# Lalu create user via POST /api/users
```

### Opsi 3: Menggunakan Node.js script

Buat file `create-admin.js`:

```javascript
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'your_password',
  database: 'campus_repository',
});

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const result = await pool.query(
    `INSERT INTO users (email, password, name, role_id, created_at, updated_at)
     SELECT 
       $1,
       $2,
       $3,
       (SELECT id FROM roles WHERE name = 'admin'),
       NOW(),
       NOW()
     RETURNING id, email, name`,
    ['admin@example.com', hashedPassword, 'Admin User']
  );
  
  console.log('Admin user created:', result.rows[0]);
  await pool.end();
}

createAdmin();
```

Jalankan: `node create-admin.js`

## Troubleshooting

### Error: extension "uuid-ossp" does not exist
```sql
-- Jalankan ini dulu:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Error: permission denied to create database
```bash
# Login sebagai postgres superuser
psql -U postgres
# Atau gunakan sudo
sudo -u postgres psql
```

### Error: relation already exists
Script menggunakan `CREATE TABLE IF NOT EXISTS`, jadi aman dijalankan berulang kali. Tapi jika ingin reset:
```sql
DROP TABLE IF EXISTS folder_permissions CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS folders CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
```
Lalu jalankan `create-database.sql` lagi.

### Error: duplicate key value violates unique constraint
Jika roles sudah ada, script akan skip (menggunakan `ON CONFLICT DO NOTHING`).

## Catatan Penting

1. **UUID Extension**: Script otomatis membuat extension `uuid-ossp` jika belum ada
2. **Soft Deletes**: Tabel `folders` dan `files` menggunakan soft delete (`deleted_at`)
3. **Foreign Keys**: 
   - User role: SET NULL (jika role dihapus)
   - Folder parent: SET NULL (jika parent dihapus)
   - File folder: CASCADE (jika folder dihapus, file juga dihapus)
   - Permissions: CASCADE (jika folder/user/role dihapus)
4. **Indexes**: Sudah dioptimasi untuk query patterns yang umum
5. **Timestamps**: Auto-update via triggers

## Next Steps

Setelah database dibuat:

1. Update `.env` file dengan kredensial database
2. Jalankan aplikasi: `npm run start:dev`
3. Test API endpoints
4. Buat user admin pertama (lihat di atas)

## Backup & Restore

### Backup
```bash
pg_dump -U postgres -d campus_repository > backup.sql
```

### Restore
```bash
psql -U postgres -d campus_repository < backup.sql
```


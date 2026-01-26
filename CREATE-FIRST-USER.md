# Cara Membuat User Pertama (Admin)

Setelah setup database, **belum ada user**. Hanya roles yang sudah di-seed. Berikut cara membuat user pertama.

## Opsi 1: Menggunakan Script Node.js (Recommended)

### Langkah-langkah:

1. **Pastikan .env sudah di-setup:**
   ```bash
   cp env.example .env
   # Edit .env dan isi DB_PASSWORD dan JWT_SECRET
   ```

2. **Install dependencies (jika belum):**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Jalankan script:**
   ```bash
   node scripts/create-admin.js
   ```

4. **Atau dengan custom values:**
   ```bash
   ADMIN_EMAIL=admin@example.com \
   ADMIN_PASSWORD=admin123 \
   ADMIN_NAME="Admin User" \
   node scripts/create-admin.js
   ```

### Output:
```
Creating admin user...
Email: admin@example.com
Name: Admin User
Role: admin (uuid-here)
Password hashed successfully

✅ Admin user created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User ID: uuid-here
Email: admin@example.com
Name: Admin User
Role ID: uuid-here
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You can now login with:
  Email: admin@example.com
  Password: admin123
```

## Opsi 2: Menggunakan SQL Langsung

### Generate Bcrypt Hash

Pertama, generate bcrypt hash untuk password:

**Menggunakan Node.js:**
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(hash => console.log(hash));"
```

**Atau menggunakan online tool:**
- https://bcrypt-generator.com/
- Password: `admin123`
- Rounds: 10

### Insert User via SQL

```sql
-- Masuk ke psql
psql -d campus_repository

-- Insert user admin
INSERT INTO users (email, password, name, role_id, created_at, updated_at)
SELECT 
    'admin@example.com',
    '$2a$10$YOUR_BCRYPT_HASH_HERE', -- Ganti dengan hash dari step sebelumnya
    'Admin User',
    (SELECT id FROM roles WHERE name = 'admin'),
    NOW(),
    NOW();
```

## Opsi 3: Menggunakan Postman (Setelah ada admin)

Jika sudah ada admin user, bisa create user baru via API:

1. **Login sebagai admin** dulu
2. **Gunakan endpoint:** `POST /api/users`
3. **Body:**
   ```json
   {
     "email": "newuser@example.com",
     "password": "password123",
     "name": "New User",
     "role_id": "role-uuid-here"
   }
   ```

## Opsi 4: Membuat Multiple Users via Script

Buat file `scripts/create-users.js`:

```javascript
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'campus_repository',
});

const users = [
  { email: 'admin@example.com', password: 'admin123', name: 'Admin User', role: 'admin' },
  { email: 'dosen1@example.com', password: 'dosen123', name: 'Dosen 1', role: 'dosen' },
  { email: 'tendik1@example.com', password: 'tendik123', name: 'Tendik 1', role: 'tendik' },
];

async function createUsers() {
  for (const userData of users) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const roleResult = await pool.query(
        `SELECT id FROM roles WHERE name = $1`,
        [userData.role]
      );

      if (roleResult.rows.length === 0) {
        console.log(`❌ Role ${userData.role} not found`);
        continue;
      }

      const result = await pool.query(
        `INSERT INTO users (email, password, name, role_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (email) DO NOTHING
         RETURNING id, email, name`,
        [userData.email, hashedPassword, userData.name, roleResult.rows[0].id]
      );

      if (result.rows.length > 0) {
        console.log(`✅ Created: ${userData.email} (${userData.role})`);
      } else {
        console.log(`⏭️  Skipped: ${userData.email} (already exists)`);
      }
    } catch (error) {
      console.error(`❌ Error creating ${userData.email}:`, error.message);
    }
  }

  await pool.end();
}

createUsers();
```

Jalankan:
```bash
node scripts/create-users.js
```

## Verifikasi User

Setelah membuat user, verifikasi dengan:

```sql
-- List semua users
SELECT u.id, u.email, u.name, r.name as role_name
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
ORDER BY u.created_at;
```

## Test Login

Setelah user dibuat, test login:

**Via Postman:**
1. Buka request "Authentication > Login"
2. Body:
   ```json
   {
     "email": "admin@example.com",
     "password": "admin123"
   }
   ```
3. Send

**Via curl:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

## Troubleshooting

### Error: Role not found
- Pastikan sudah run `create-database.sql`
- Check roles: `SELECT * FROM roles;`

### Error: User already exists
- User dengan email tersebut sudah ada
- Gunakan email lain atau update user yang ada

### Error: Database connection failed
- Check `.env` file
- Pastikan PostgreSQL berjalan
- Test koneksi: `psql -d campus_repository`

### Error: Cannot find module 'bcryptjs'
```bash
npm install bcryptjs
```

## Default Users (Setelah Create)

Setelah membuat user, Anda bisa login dengan:
- **Email:** `admin@example.com`
- **Password:** `admin123` (atau sesuai yang Anda set)

---

**Recommended:** Gunakan **Opsi 1 (Script Node.js)** karena paling mudah dan aman.


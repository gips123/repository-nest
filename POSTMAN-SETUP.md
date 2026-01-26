# Postman Collection Setup Guide

## Cara Import Collection

1. **Buka Postman**
2. **Klik "Import"** di kiri atas
3. **Pilih file** `Campus-Repository-API.postman_collection.json`
4. **Klik "Import"**

## Setup Environment Variables

Collection ini menggunakan environment variables untuk memudahkan testing.

### Buat Environment Baru

1. Klik **"Environments"** di sidebar kiri
2. Klik **"+"** untuk buat environment baru
3. Beri nama: **"Campus Repository Local"**

### Tambahkan Variables

Tambahkan variables berikut:

| Variable | Initial Value | Current Value | Description |
|----------|---------------|---------------|-------------|
| `base_url` | `http://localhost:3000/api` | `http://localhost:3000/api` | Base URL API |
| `access_token` | (kosong) | (kosong) | JWT token (auto-set setelah login) |
| `user_id` | (kosong) | (kosong) | User ID (auto-set setelah login) |
| `user_email` | (kosong) | (kosong) | User email (auto-set setelah login) |
| `folder_id` | (kosong) | (kosong) | Folder ID untuk testing |
| `file_id` | (kosong) | (kosong) | File ID untuk testing |
| `permission_id` | (kosong) | (kosong) | Permission ID untuk testing |
| `role_id` | (kosong) | (kosong) | Role ID untuk testing |

### Select Environment

Setelah membuat environment, **pilih environment** di dropdown kanan atas Postman.

## Auto-Save Token

Collection sudah dikonfigurasi untuk **otomatis menyimpan token** setelah login:

1. Jalankan request **"Login"**
2. Token akan otomatis disimpan di `access_token` variable
3. Semua request berikutnya akan otomatis menggunakan token ini

## Testing Flow

### 1. Setup Awal

```bash
# Pastikan backend berjalan
npm run start:dev

# Pastikan database sudah setup
psql -d campus_repository -f create-database.sql
```

### 2. Login

1. Buka request **"Authentication > Login"**
2. Update email dan password sesuai user Anda
3. Klik **"Send"**
4. Token akan otomatis disimpan

### 3. Get Folder Tree

1. Buka request **"Folders > Get Folder Tree"**
2. Klik **"Send"**
3. Response akan menampilkan folder tree

### 4. Create Folder

1. Buka request **"Folders > Create Folder"**
2. Update body dengan nama folder
3. Set `parent_id` jika ingin membuat subfolder
4. Klik **"Send"**
5. Copy `id` dari response dan paste ke `folder_id` variable

### 5. Upload File

1. Buka request **"Files > Upload File"**
2. Update `:folderId` dengan folder_id
3. Pilih file di form-data
4. Klik **"Send"**
5. Copy `id` dari response dan paste ke `file_id` variable

### 6. Create Permission (Admin)

1. Buka request **"Permissions > Create Permission - Role"**
2. Update `folder_id` dan `role_id`
3. Set permissions (can_read, can_create, etc.)
4. Klik **"Send"**

## Tips

### 1. Quick Test

Gunakan collection runner untuk test semua endpoints sekaligus:
1. Klik **"..."** di collection
2. Pilih **"Run collection"**
3. Pilih requests yang ingin di-test
4. Klik **"Run Campus Repository API"**

### 2. Save Responses

Setelah mendapatkan ID dari response, simpan ke environment variables:
- Copy `id` dari response
- Paste ke variable yang sesuai di environment

### 3. Test Different Users

Buat multiple environments untuk test dengan user berbeda:
- `Campus Repository - Admin`
- `Campus Repository - User`

### 4. Export Collection

Setelah modify collection, export untuk backup:
1. Klik **"..."** di collection
2. Pilih **"Export"**
3. Save file

## Troubleshooting

### Token Expired

Jika mendapat 401 error:
1. Login lagi
2. Token akan otomatis di-update

### Variable Not Found

Pastikan:
1. Environment sudah di-select
2. Variable sudah dibuat
3. Variable name sesuai (case-sensitive)

### CORS Error

Jika mendapat CORS error:
1. Pastikan backend CORS sudah dikonfigurasi
2. Check `.env` file: `CORS_ORIGIN=http://localhost:3000`

### Connection Refused

Pastikan:
1. Backend berjalan: `npm run start:dev`
2. Port sesuai: `http://localhost:3000`
3. Base URL di environment benar

## Collection Structure

```
Campus Repository API
├── Authentication
│   └── Login
├── Users
│   ├── Get Current User Profile
│   ├── Get Current User Role
│   ├── List All Users (Admin)
│   ├── Create User (Admin)
│   ├── Update User (Admin)
│   └── Delete User (Admin)
├── Folders
│   ├── Get Folder Tree
│   ├── List Accessible Folders
│   ├── Get Folder Details
│   ├── Create Folder
│   ├── Update Folder
│   └── Delete Folder
├── Files
│   ├── Upload File
│   ├── List Files in Folder
│   ├── Get File Details
│   ├── Download File
│   └── Delete File
└── Permissions
    ├── List Permissions (Admin)
    ├── Get Permission Details (Admin)
    ├── Create Permission - Role (Admin)
    ├── Create Permission - User (Admin)
    ├── Update Permission (Admin)
    └── Delete Permission (Admin)
```

## Next Steps

1. Import collection ke Postman
2. Setup environment variables
3. Login dan mulai testing
4. Explore semua endpoints
5. Modify requests sesuai kebutuhan

---

**Happy Testing! 🚀**


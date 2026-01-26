# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": {
      "id": "uuid",
      "name": "dosen",
      "description": "Dosen/Lecturer"
    }
  }
}
```

---

### Users

#### Get Current User Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Get Current User Role
```http
GET /api/users/role
Authorization: Bearer <token>
```

#### List All Users (Admin Only)
```http
GET /api/users?page=1&limit=10
Authorization: Bearer <token>
```

#### Create User (Admin Only)
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "role_id": "role-uuid"
}
```

#### Update User (Admin Only)
```http
PATCH /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "role_id": "new-role-uuid"
}
```

#### Delete User (Admin Only)
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

---

### Folders

#### Get Folder Tree (Recursive)
```http
GET /api/folders/tree
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Root Folder",
    "parent_id": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "children": [
      {
        "id": "uuid",
        "name": "Subfolder",
        "parent_id": "parent-uuid",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "children": []
      }
    ]
  }
]
```

#### List Accessible Folders
```http
GET /api/folders
Authorization: Bearer <token>
```

#### Get Folder Details
```http
GET /api/folders/:id
Authorization: Bearer <token>
```

#### Create Folder
```http
POST /api/folders
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Folder",
  "parent_id": "parent-folder-uuid" // optional
}
```

#### Update Folder (Requires Update Permission)
```http
PATCH /api/folders/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Folder Name"
}
```

#### Delete Folder (Requires Delete Permission)
```http
DELETE /api/folders/:id
Authorization: Bearer <token>
```

---

### Files

#### Upload File
```http
POST /api/files/upload/:folderId
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file>
```

**Response:**
```json
{
  "id": "uuid",
  "name": "document.pdf",
  "path": "./uploads/abc123.pdf",
  "mime_type": "application/pdf",
  "size": 1024000,
  "folder_id": "folder-uuid",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

#### List Files in Folder
```http
GET /api/files/folder/:folderId
Authorization: Bearer <token>
```

#### Get File Details
```http
GET /api/files/:id
Authorization: Bearer <token>
```

#### Download File
```http
GET /api/files/:id/download
Authorization: Bearer <token>
```

#### Delete File (Requires Delete Permission)
```http
DELETE /api/files/:id
Authorization: Bearer <token>
```

---

### Permissions (Admin Only)

#### Create Permission
```http
POST /api/permissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "folder_id": "folder-uuid",
  "user_id": "user-uuid", // OR role_id (not both)
  "role_id": "role-uuid",  // OR user_id (not both)
  "can_read": true,
  "can_create": true,
  "can_update": false,
  "can_delete": false,
  "expires_at": "2024-12-31T23:59:59.000Z" // optional
}
```

#### List Permissions
```http
GET /api/permissions?folderId=folder-uuid
Authorization: Bearer <token>
```

#### Get Permission Details
```http
GET /api/permissions/:id
Authorization: Bearer <token>
```

#### Update Permission
```http
PATCH /api/permissions/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "can_read": true,
  "can_create": false,
  "can_update": true,
  "can_delete": true,
  "expires_at": "2025-12-31T23:59:59.000Z"
}
```

#### Delete Permission
```http
DELETE /api/permissions/:id
Authorization: Bearer <token>
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password must be longer than or equal to 6 characters"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You do not have read permission for this folder",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Folder not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

---

## Permission System

Permissions can be assigned to:
- **Roles**: Applies to all users with that role
- **Users**: Applies to a specific user

Each permission includes:
- `can_read`: Read access to folder and files
- `can_create`: Create files and subfolders
- `can_update`: Update folder name
- `can_delete`: Delete folder and files
- `expires_at`: Optional expiration date (ISO 8601 format)

**Important**: When checking permissions, the system checks:
1. Direct user permission (if exists)
2. Role permission (if exists)
3. Expiration date (if set)

If a permission has expired, it's not considered valid.

---

## Roles

Available roles:
- `admin` - Administrator with full access
- `wd1` - Wakil Dekan 1
- `wd2` - Wakil Dekan 2
- `wd3` - Wakil Dekan 3
- `dosen` - Dosen/Lecturer
- `tendik` - Tenaga Kependidikan/Staff

---

## Notes

1. All timestamps are in ISO 8601 format (UTC)
2. File uploads are stored in the `./uploads` directory
3. Folders and files use soft deletes (`deleted_at` field)
4. The folder tree endpoint only returns folders with READ permission
5. Permission checks are enforced at the service level for security


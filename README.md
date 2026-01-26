# Campus Repository System - NestJS Backend

A production-ready NestJS backend for a campus repository system (similar to Google Drive) with role-based access control, folder hierarchy, and file management.

## Features

- 🔐 **JWT Authentication** - Secure login with JWT tokens
- 👥 **User Management** - User CRUD operations with role assignment
- 📁 **Folder Management** - Hierarchical folder structure with CRUD operations
- 📄 **File Management** - File upload, download, and deletion
- 🔒 **Permission System** - Role and user-based permissions with expiration support
- 🌳 **Recursive Folder Tree** - Efficient sidebar tree generation with permission filtering
- 🛡️ **RBAC** - Role-Based Access Control with guards and decorators
- ✅ **Validation** - Input validation using class-validator

## Tech Stack

- **NestJS** (latest) - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Relational database
- **TypeORM** - Object-Relational Mapping
- **JWT** - JSON Web Tokens for authentication
- **Passport** - Authentication middleware
- **class-validator** - Validation decorators
- **Multer** - File upload handling

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database credentials and JWT secret:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=campus_repository
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. **Create the database:**
   ```bash
   createdb campus_repository
   ```

5. **Seed roles (optional):**
   ```bash
   psql -d campus_repository -f seed-roles.sql
   ```

## Database Schema

The system assumes the following tables already exist in PostgreSQL:

- `users` - User accounts
- `roles` - User roles (admin, wd1, wd2, wd3, dosen, tendik)
- `folders` - Hierarchical folder structure
- `files` - File metadata
- `folder_permissions` - Permission assignments (role or user-based)

See the entity files in `src/entities/` for the expected schema structure.

## Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000/api`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email and password

### Users
- `GET /api/users/profile` - Get current user profile
- `GET /api/users/role` - Get current user role
- `GET /api/users` - List all users (admin only)
- `POST /api/users` - Create user (admin only)
- `PATCH /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Folders
- `GET /api/folders/tree` - Get folder tree (recursive, permission-filtered)
- `GET /api/folders` - List accessible folders
- `GET /api/folders/:id` - Get folder details
- `POST /api/folders` - Create folder
- `PATCH /api/folders/:id` - Update folder (requires update permission)
- `DELETE /api/folders/:id` - Delete folder (requires delete permission)

### Files
- `POST /api/files/upload/:folderId` - Upload file to folder
- `GET /api/files/folder/:folderId` - List files in folder
- `GET /api/files/:id` - Get file details
- `GET /api/files/:id/download` - Download file
- `DELETE /api/files/:id` - Delete file (requires delete permission)

### Permissions
- `POST /api/permissions` - Create permission (admin only)
- `GET /api/permissions` - List permissions (admin only)
- `GET /api/permissions/:id` - Get permission details (admin only)
- `PATCH /api/permissions/:id` - Update permission (admin only)
- `DELETE /api/permissions/:id` - Delete permission (admin only)

## Authentication

All endpoints (except `/api/auth/login`) require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Permission System

Permissions are assigned to either:
- **Roles** - Applies to all users with that role
- **Users** - Applies to a specific user

Each permission includes:
- `can_read` - Read access
- `can_create` - Create files/folders
- `can_update` - Update folder/files
- `can_delete` - Delete folder/files
- `expires_at` - Optional expiration date

## Folder Tree Endpoint

The `/api/folders/tree` endpoint returns a recursive tree structure:

```json
[
  {
    "id": "uuid",
    "name": "Root Folder",
    "parent_id": null,
    "children": [
      {
        "id": "uuid",
        "name": "Subfolder",
        "parent_id": "parent-uuid",
        "children": []
      }
    ]
  }
]
```

Only folders with READ permission are included in the tree.

## Project Structure

```
src/
├── entities/           # TypeORM entities
├── auth/              # Authentication module
├── users/             # User management module
├── folders/           # Folder management module
├── files/             # File management module
├── permissions/       # Permission management module
├── common/            # Shared utilities
│   ├── guards/        # Auth and permission guards
│   ├── decorators/    # Custom decorators
│   ├── dto/           # Shared DTOs
│   └── interfaces/    # TypeScript interfaces
└── config/            # Configuration files
```

## Guards

- **JwtAuthGuard** - Validates JWT token (applied globally)
- **RolesGuard** - Checks user role
- **FolderPermissionGuard** - Checks folder-specific permissions

## Decorators

- `@Public()` - Makes endpoint public (bypasses JWT guard)
- `@Roles('admin', 'wd1')` - Requires specific roles
- `@RequirePermission(PermissionType.READ)` - Requires folder permission

## File Uploads

Files are stored in the `./uploads` directory. Make sure this directory exists and has write permissions:

```bash
mkdir uploads
chmod 755 uploads
```

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)

## Security Best Practices

1. **Change JWT_SECRET** in production
2. **Use HTTPS** in production
3. **Set proper CORS origins** in production
4. **Use environment variables** for sensitive data
5. **Enable database connection pooling** for production
6. **Implement rate limiting** for production
7. **Regular security audits** of dependencies

## Development

### Running tests
```bash
npm run test
```

### Linting
```bash
npm run lint
```

### Formatting
```bash
npm run format
```

## License

Private/Unlicensed

## Support

For issues and questions, please contact the development team.

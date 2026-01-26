# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create Environment File**
   ```bash
   # Create .env file with the following content:
   PORT=3000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=campus_repository
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=24h
   ```

3. **Create Database**
   ```bash
   createdb campus_repository
   ```

4. **Seed Roles (Optional)**
   ```bash
   psql -d campus_repository -f seed-roles.sql
   ```

5. **Create Uploads Directory**
   ```bash
   mkdir uploads
   chmod 755 uploads
   ```

6. **Run the Application**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000/api`

## Database Setup

Make sure your PostgreSQL database has the following tables:
- `users`
- `roles`
- `folders`
- `files`
- `folder_permissions`

The entities are defined in `src/entities/` and match the expected schema.

## First User Creation

After seeding roles, you can create your first admin user using the API:

```bash
# First, get an admin JWT token (if you have one)
# Or create a user directly in the database with hashed password

# Example: Create admin user via SQL
# Password: "admin123" (bcrypt hash)
INSERT INTO users (id, email, password, name, role_id, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'admin@example.com',
  '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', -- Replace with actual bcrypt hash
  'Admin User',
  (SELECT id FROM roles WHERE name = 'admin'),
  NOW(),
  NOW();
```

Or use a tool like Postman/Insomnia to create a user via the API (if you have admin access).

## Testing the API

1. **Login**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"admin123"}'
   ```

2. **Get Folder Tree**
   ```bash
   curl -X GET http://localhost:3000/api/folders/tree \
     -H "Authorization: Bearer <your-token>"
   ```

## Troubleshooting

### TypeScript Errors
If you see TypeScript errors about missing modules, run:
```bash
npm install
```

### Database Connection Errors
- Check your PostgreSQL is running
- Verify database credentials in `.env`
- Ensure the database exists

### Permission Errors
- Make sure you've seeded the roles
- Check that users have assigned roles
- Verify folder permissions are set up

### File Upload Errors
- Ensure `uploads` directory exists and is writable
- Check file size limits (may need to configure Multer)

## Next Steps

1. Review the API documentation in `API.md`
2. Check example SQL queries in `QUERIES.md`
3. Set up your frontend to consume the API
4. Configure production environment variables
5. Set up proper file storage (consider cloud storage for production)


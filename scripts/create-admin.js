/**
 * Script to create admin user
 * 
 * Usage:
 *   node scripts/create-admin.js
 * 
 * Or with custom values:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=admin123 ADMIN_NAME="Admin User" node scripts/create-admin.js
 */

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

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const name = process.env.ADMIN_NAME || 'Admin User';

  try {
    console.log('Creating admin user...');
    console.log(`Email: ${email}`);
    console.log(`Name: ${name}`);

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('❌ User already exists with email:', email);
      console.log('   User ID:', existingUser.rows[0].id);
      process.exit(1);
    }

    // Get admin role
    const roleResult = await pool.query(
      "SELECT id, name FROM roles WHERE name = 'admin'"
    );

    if (roleResult.rows.length === 0) {
      console.log('❌ Admin role not found. Please run create-database.sql first.');
      process.exit(1);
    }

    const roleId = roleResult.rows[0].id;
    console.log(`Role: ${roleResult.rows[0].name} (${roleId})`);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password, name, role_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, email, name, role_id`,
      [email, hashedPassword, name, roleId]
    );

    const user = result.rows[0];
    console.log('\n✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('User ID:', user.id);
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Role ID:', user.role_id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nYou can now login with:');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run script
createAdmin();


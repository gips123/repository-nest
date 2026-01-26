-- ============================================
-- Simple Database Creation Script
-- ============================================
-- Run this if you prefer a simpler approach
-- This creates the database and runs the schema

-- Step 1: Create database (run this first, outside of transaction)
-- CREATE DATABASE campus_repository;

-- Step 2: Connect to the database
-- \c campus_repository;

-- Step 3: Run the schema creation
-- Copy and paste the contents of create-database.sql here
-- OR run: \i create-database.sql

-- Alternative: Use psql command line
-- psql -U postgres -c "CREATE DATABASE campus_repository;"
-- psql -U postgres -d campus_repository -f create-database.sql


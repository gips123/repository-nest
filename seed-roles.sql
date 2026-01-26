-- Seed roles for campus repository system
-- Run this SQL script to populate the roles table

INSERT INTO roles (id, name, description, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'admin', 'Administrator with full access', NOW(), NOW()),
  (gen_random_uuid(), 'wd1', 'Wakil Dekan 1', NOW(), NOW()),
  (gen_random_uuid(), 'wd2', 'Wakil Dekan 2', NOW(), NOW()),
  (gen_random_uuid(), 'wd3', 'Wakil Dekan 3', NOW(), NOW()),
  (gen_random_uuid(), 'dosen', 'Dosen/Lecturer', NOW(), NOW()),
  (gen_random_uuid(), 'tendik', 'Tenaga Kependidikan/Staff', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Note: If your PostgreSQL version doesn't support gen_random_uuid(),
-- you can use uuid_generate_v4() instead (requires uuid-ossp extension):
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Then replace gen_random_uuid() with uuid_generate_v4()


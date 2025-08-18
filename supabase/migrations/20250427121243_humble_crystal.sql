/*
  # Fix admin registration policies

  1. Changes
    - Drop all existing user policies to avoid conflicts
    - Create consolidated policies for user management
    - Add proper admin registration policy with code verification
    
  2. Security
    - Maintains secure admin registration flow
    - Preserves existing security rules
*/

-- First, drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow admin registration" ON users;
DROP POLICY IF EXISTS "Allow first user or admin registration" ON users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
DROP POLICY IF EXISTS "Allow users to update own data" ON users;
DROP POLICY IF EXISTS "Allow admins to delete users" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Allow first admin registration" ON users;

-- Create base policies for user management
CREATE POLICY "Enable read access for users"
ON users FOR SELECT
TO authenticated
USING (
  -- Users can read their own data
  auth.uid() = id 
  OR 
  -- Admins can read all data
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy for user registration and admin creation
CREATE POLICY "Allow user registration"
ON users FOR INSERT
TO authenticated
WITH CHECK (
  -- First user can register as admin
  NOT EXISTS (SELECT 1 FROM users)
  OR
  -- Existing admin can create users
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
  OR
  -- Allow admin registration with correct code
  (
    role = 'admin' 
    AND current_setting('app.admin_registration_code', true) IS NOT NULL
    AND current_setting('app.admin_registration_code', true) = 
      (current_setting('request.jwt.claims', true)::jsonb ->> 'admin_code')
  )
  OR
  -- Regular users can register
  role = 'user'
);

-- Allow users to update their own data
CREATE POLICY "Allow self updates"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow admins to delete users
CREATE POLICY "Allow admin deletions"
ON users FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
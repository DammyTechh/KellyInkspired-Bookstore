/*
  # Fix Admin Registration Policies

  1. Changes
    - Simplify RLS policies for admin registration
    - Fix policy for first user registration
    - Ensure proper role checking
*/

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Allow first admin registration" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Admin can read all users" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;

-- Create simplified policies for user management
CREATE POLICY "Enable read access for authenticated users"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id OR EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

-- Allow first user registration as admin
CREATE POLICY "Allow first user or admin registration"
ON users FOR INSERT
TO authenticated
WITH CHECK (
  NOT EXISTS (SELECT 1 FROM users)
  OR (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

-- Allow users to update their own data
CREATE POLICY "Allow users to update own data"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow admins to delete users
CREATE POLICY "Allow admins to delete users"
ON users FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE id = auth.uid() AND role = 'admin'
));
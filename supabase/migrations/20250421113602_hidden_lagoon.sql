/*
  # Update RLS policies for users table

  1. Changes
    - Add policy to allow first admin registration
    - Modify existing policies to handle admin registration flow

  2. Security
    - Ensures only the first user can register as admin
    - Maintains existing security for subsequent registrations
*/

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Allow first user registration" ON users;
DROP POLICY IF EXISTS "Admin can insert users" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;

-- Create new policies for user registration
CREATE POLICY "Allow first admin registration" ON users
FOR INSERT TO authenticated
WITH CHECK (
  -- Allow if this is the first user OR if the inserting user is an admin
  (NOT EXISTS (SELECT 1 FROM users))
  OR
  (EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  ))
);

-- Update the admin management policy to handle the registration flow
CREATE POLICY "Admins can manage users" ON users
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
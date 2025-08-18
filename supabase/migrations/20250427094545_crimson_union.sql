/*
  # Update users table RLS policies

  1. Changes
    - Modify the "Allow first admin registration" policy to properly handle the first admin user
    - Add policy to allow authenticated users to update their own data
  
  2. Security
    - Maintains RLS enabled on users table
    - Ensures first admin can be created when no users exist
    - Allows users to update their own data
    - Maintains admin-only access for managing other users
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Allow first admin registration" ON users;

-- Create updated policy for first admin registration
CREATE POLICY "Allow first admin registration" ON users
FOR INSERT TO authenticated
WITH CHECK (
  -- Allow insert if no users exist (first admin)
  NOT EXISTS (SELECT 1 FROM users)
  OR
  -- Or if the authenticated user is an admin
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Add policy for users to update their own data
CREATE POLICY "Users can update own data" ON users
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
/*
  # Update users table RLS policies

  1. Changes
    - Add new policy to allow admin registration with admin code
    - Keep existing policies intact
  
  2. Security
    - Ensures admin registration is protected by secret code
    - Maintains existing security for regular user operations
*/

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Allow first user or admin registration" ON users;

-- Create new insert policy that checks for admin code
CREATE POLICY "Allow admin registration with code or first user" ON users
FOR INSERT TO authenticated
WITH CHECK (
  -- Allow first user registration (when table is empty)
  NOT EXISTS (SELECT 1 FROM users)
  OR
  -- Allow existing admin to create users
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
  OR
  -- Allow admin registration with correct code
  (
    current_setting('app.admin_registration_code', true) IS NOT NULL
    AND current_setting('app.admin_registration_code', true) = current_setting('request.jwt.claims', true)::jsonb->>'admin_code'
  )
);
/*
  # Update admin registration policy

  1. Changes
    - Update the admin registration policy to properly handle the admin code check
    - Add policy for inserting new users during registration
    
  2. Security
    - Ensures admin registration is only allowed with valid admin code
    - Maintains existing security for other operations
*/

-- First, drop the existing registration policy
DROP POLICY IF EXISTS "Allow admin registration with code or first user" ON users;

-- Create new policy for admin registration
CREATE POLICY "Allow admin registration" ON users
FOR INSERT TO authenticated
WITH CHECK (
  -- Allow if this is the first user (no users exist)
  (NOT EXISTS (SELECT 1 FROM users))
  OR
  -- Or if an existing admin is creating the user
  (EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  ))
  OR
  -- Or if the admin code matches
  (
    current_setting('app.admin_registration_code', true) IS NOT NULL
    AND
    current_setting('app.admin_registration_code', true) = 
    (current_setting('request.jwt.claims', true)::jsonb ->> 'admin_code')
  )
);
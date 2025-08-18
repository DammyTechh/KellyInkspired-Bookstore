/*
  # Add admin insert policy for users table
 
  1. Changes
    - Add new RLS policy allowing admins to insert new users
  
  2. Security
    - Only authenticated users with admin role can insert new users
    - Maintains existing policies for reading user data
*/

CREATE POLICY "Admin can insert users"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
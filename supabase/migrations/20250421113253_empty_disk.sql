/*
  # Update admin registration policies

  1. Changes
    - Add policy to allow first user registration
    - Add policy for admin user management
*/

-- Allow the first user to register as admin
CREATE POLICY "Allow first user registration"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM users
  )
);

-- Allow admins to manage users
CREATE POLICY "Admins can manage users"
ON public.users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
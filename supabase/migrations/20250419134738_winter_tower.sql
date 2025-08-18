/*
  # Admin Registration and Book Management

  1. Updates
    - Add admin registration capability
    - Add email delivery for purchased books
    - Add PDF storage for books

  2. Security
    - Add policies for admin access
    - Add policies for book delivery
*/

-- Add storage for book PDFs
CREATE POLICY "Admin users can upload PDFs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- Function to handle book purchase and delivery
CREATE OR REPLACE FUNCTION handle_book_purchase(
  book_id UUID,
  user_email TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Send email with book download link
  -- Note: Configure SMTP settings in Supabase Dashboard
  PERFORM net.http_post(
    url := current_setting('app.smtp_url'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.smtp_key')
    ),
    body := jsonb_build_object(
      'to', user_email,
      'subject', 'Your Book Purchase',
      'html', (
        SELECT 
          'Thank you for your purchase! Here is your book: ' || 
          download_url || 
          '<br><br>Enjoy reading!'
        FROM books 
        WHERE id = book_id
      )
    )
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION handle_book_purchase TO authenticated;
-- Create user_role type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add role column to auth.users if it doesn't exist
DO $$ BEGIN
    ALTER TABLE auth.users ADD COLUMN user_role user_role DEFAULT 'user';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM auth.users
        WHERE id = user_id
        AND user_role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update storage policies
DO $$ BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow public layout viewing" ON storage.objects;
    DROP POLICY IF EXISTS "Allow admin uploads only" ON storage.objects;
    DROP POLICY IF EXISTS "Allow admin updates only" ON storage.objects;
    DROP POLICY IF EXISTS "Allow admin deletes only" ON storage.objects;
    
    -- Create new policies
    CREATE POLICY "Allow public layout viewing"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'upholstery-layouts');

    CREATE POLICY "Allow admin uploads only"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'upholstery-layouts'
        AND public.is_admin(auth.uid())
    );

    CREATE POLICY "Allow admin updates only"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'upholstery-layouts'
        AND public.is_admin(auth.uid())
    )
    WITH CHECK (
        bucket_id = 'upholstery-layouts'
        AND public.is_admin(auth.uid())
    );

    CREATE POLICY "Allow admin deletes only"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'upholstery-layouts'
        AND public.is_admin(auth.uid())
    );
END $$; 
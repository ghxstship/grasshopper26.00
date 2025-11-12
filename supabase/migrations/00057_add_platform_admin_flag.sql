-- ============================================================================
-- Migration: Add Platform Admin Flag
-- Description: Add is_platform_admin flag to user_profiles for Legend access
-- ============================================================================

-- Add is_platform_admin column to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS is_platform_admin BOOLEAN DEFAULT FALSE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_platform_admin 
ON user_profiles(is_platform_admin) 
WHERE is_platform_admin = TRUE;

-- Add comment
COMMENT ON COLUMN user_profiles.is_platform_admin IS 
'Flag indicating if user has platform-level admin access (Legend dashboard)';

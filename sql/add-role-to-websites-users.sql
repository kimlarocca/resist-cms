-- Add a role column to websites_users for per-group roles
-- This allows users to have different roles in different groups
ALTER TABLE public.websites_users
  ADD COLUMN role public.roles NOT NULL DEFAULT 'member'::public.roles;

-- Migrate existing group-level roles from profiles to websites_users
-- For users with group-level roles, copy their current profile role to all their group memberships
UPDATE public.websites_users wu
SET role = p.role
FROM public.profiles p
WHERE wu.user_id = p.id
  AND p.role IN ('member', 'event_manager', 'group_manager', 'group_admin');

-- Reset profiles.role to 'member' for users who only had group-level roles
-- (Keep super_admin and election_manager as global roles on profiles)
UPDATE public.profiles
SET role = 'member'::public.roles
WHERE role IN ('event_manager', 'group_manager', 'group_admin');

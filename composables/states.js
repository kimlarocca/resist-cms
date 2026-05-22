// global state for the current user's profile
export const useCurrentUserProfile = () => useState('useCurrentUserProfile', () => null)

// per-group roles: { [groupId]: role }
export const useCurrentUserGroupRoles = () => useState('useCurrentUserGroupRoles', () => ({}))

// helper: get the effective role for a specific group
// super_admin/election_manager always come from profiles (global)
// group-level roles come from websites_users
export const useGroupRole = (groupId) => {
  const profile = useCurrentUserProfile()
  const groupRoles = useCurrentUserGroupRoles()
  return computed(() => {
    const globalRole = profile.value?.role
    if (globalRole === 'super_admin' || globalRole === 'election_manager') return globalRole
    return groupRoles.value?.[groupId.value ?? groupId] || 'member'
  })
}
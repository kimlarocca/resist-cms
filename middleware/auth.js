import {
  useCurrentUserProfile,
  useCurrentUserGroupRoles
} from '~/composables/states'

export default defineNuxtRouteMiddleware((to, from) => {
  const currentUser = useSupabaseUser()
  const currentUserProfile = useCurrentUserProfile()
  const currentUserGroupRoles = useCurrentUserGroupRoles()
  const client = useSupabaseClient()

  // get the current user's profile
  const getProfile = async () => {
    const {
      data,
      error
    } = await client
      .from('profiles')
      .select('*')
      .eq('id', currentUser.value.sub)
      .single()
    if (error) {
      console.error(error)
    } else if (data) {
      currentUserProfile.value = data
    }
  }

  // get the current user's per-group roles
  const getGroupRoles = async () => {
    const {
      data,
      error
    } = await client
      .from('websites_users')
      .select('website_id, role')
      .eq('user_id', currentUser.value.sub)
    if (error) {
      console.error(error)
    } else if (data) {
      const roles = {}
      for (const row of data) {
        roles[row.website_id] = row.role
      }
      currentUserGroupRoles.value = roles
    }
  }

  if (!currentUser.value) {
    // if the user is not authorized, redirect them to the login page
    return navigateTo('/')
  } else {
    // check if the profile is already loaded
    if (!currentUserProfile.value) {
      getProfile()
    }
    // load group roles if not already loaded
    if (!currentUserGroupRoles.value || Object.keys(currentUserGroupRoles.value).length === 0) {
      getGroupRoles()
    }
  }
})
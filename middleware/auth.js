import {
  useCurrentUserProfile
} from '~/composables/states'

export default defineNuxtRouteMiddleware((to, from) => {
  const currentUser = useSupabaseUser()
  const currentUserProfile = useCurrentUserProfile()
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

  if (!currentUser.value) {
    // if the user is not authorized, redirect them to the login page
    return navigateTo('/')
  } else {
    // check if the profile is already loaded
    if (!currentUserProfile.value) {
      getProfile()
    }
  }
})
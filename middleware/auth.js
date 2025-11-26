import {
  useCurrentUser,
  useCurrentUserProfile
}
from '~/composables/states'

export default defineNuxtRouteMiddleware( ( to, from ) => {
  const currentUser = useCurrentUser()
  const currentUserProfile = useCurrentUserProfile()
  const client = useSupabaseClient()

  // get the current user's profile
  const getProfile = async () => {
    const {
      data,
      error
    } = await client
      .from( 'profiles' )
      .select( '*' )
      .eq( 'id', currentUser.value.id )
      .single()
    if ( error ) {
      console.error( error )
    } else if ( data ) {
      currentUserProfile.value = data
      getSubscription( data.organization_id ? data.organization_id : null )
    }
  }

  // check the user's stripe subscription
  const getSubscription = async ( organizationId ) => {
    // don't do this if they are part of the equal time team
    if ( currentUser.value.email.includes( 'equalicert.com' ) || currentUser.value.email.includes( 'equaltime.io' ) ) {
      return
    }
    // don't do this if they are part of an organization
    if ( organizationId ) {
      return
    }
    const stripeData = await checkStripeSubscription( currentUser.value.email )
    if ( stripeData.active ) {
      if ( stripeData.subscription?.plan?.product === 'prod_O1cARLAnatq2gp' ) {
        // if the user has a equal time premium subscription, update their profile
        const {
          data,
          error
        } = await client
          .from( 'profiles' )
          .upsert( {
            id: currentUserProfile.value.id,
            product: 'equaltime-premium'
          } )
          .match( {
            id: currentUserProfile.value.id
          } )
        if ( error ) console.error( error )
      }
      if ( stripeData.subscription?.plan?.product === 'prod_ONR3h7gOpl0Lts' ) {
        // if the user has a equal time team subscription, update their profile 
        const {
          data,
          error
        } = await client
          .from( 'profiles' )
          .upsert( {
            id: currentUserProfile.value.id,
            product: 'equaltime-premium',
            organization_admin: true
          } )
          .match( {
            id: currentUserProfile.value.id
          } )
        if ( error ) console.error( error )
      }
    } else {
      // set their product as equaltime (free)
      const {
        data,
        error
      } = await client
        .from( 'profiles' )
        .upsert( {
          id: currentUserProfile.value.id,
          product: 'equaltime'
        } )
        .match( {
          id: currentUserProfile.value.id
        } )
      if ( error ) console.error( error )
    }
  }

  // check the dev environment for the auth token
  const supabaseAuthTokenDev = JSON.parse(
    window.localStorage.getItem( 'sb-dltcuuoimfzoticynpzy-auth-token' )
  )
  if ( supabaseAuthTokenDev ) {
    currentUser.value = supabaseAuthTokenDev.user
  }

  // check the prod environment for the auth token
  const supabaseAuthTokenProd = JSON.parse(
    window.localStorage.getItem( 'sb-brwzzilslduwostxbufg-auth-token' )
  )
  if ( supabaseAuthTokenProd ) {
    currentUser.value = supabaseAuthTokenProd.user
  }

  if ( !currentUser.value ) {
    // if the user is not authorized, redirect them to the login page
    return navigateTo( '/' )
  } else {
    // check if the profile is already loaded
    if ( !currentUserProfile.value ) {
      getProfile()
    } else {
      getSubscription( currentUserProfile.value?.organization_id )
    }

    // if the user IS authorized, log a GA event with their info
    window.dataLayer = window.dataLayer || [];

    function gtag() {
      dataLayer.push( arguments );
    }
    gtag( 'event', 'logged_in_user', {
      email: currentUser.value.email,
      to: to.path,
      from: from.path
    } )
  }
} )
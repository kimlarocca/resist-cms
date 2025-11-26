<template>
  <div class="pb-4 text-center">
    <animations-error-page aria-hidden="true" />
    <template v-if="errorMessage">
      <Message class="mb-4" severity="error">
        Sorry, there was a problem logging in to your account.
      </Message>
    </template>
    <p>
      <a href="/">
        Please wait a few moments. If you are not automatically logged in, click
        here! Your magic link may have expired.
      </a>
    </p>
  </div>
</template>

<script setup>
import { useCurrentUser } from '~/composables/states'
const currentUser = useCurrentUser()

definePageMeta({
  layout: 'blank',
})

// check the dev environment for the auth token
const supabaseAuthTokenDev = JSON.parse(
  window.localStorage.getItem('sb-dltcuuoimfzoticynpzy-auth-token')
)
if (supabaseAuthTokenDev) {
  currentUser.value = supabaseAuthTokenDev.user
}

// check the prod environment for the auth token
const supabaseAuthTokenProd = JSON.parse(
  window.localStorage.getItem('sb-brwzzilslduwostxbufg-auth-token')
)
if (supabaseAuthTokenProd) {
  currentUser.value = supabaseAuthTokenProd.user
}

// for some reason, navigateTo doesn't work here?!
window.location.href = '/dashboard'
</script>

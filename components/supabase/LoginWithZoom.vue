<template>
  <div>
    <template v-if="errorMessage">
      <Message class="mb-4" severity="error">
        Sorry, there was a problem logging in to your account:
        {{ errorMessage }}
      </Message>
    </template>
    <Button class="width400 w-full mb-2" @click="login">
      <svg
        class="zoom-logo"
        height="25"
        viewBox="0 0 472.4 472.4"
        width="25"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="236.2" cy="236.2" fill="#ffffff" r="236.2" />
        <path
          d="m84.65 162.25v111a45.42 45.42 0 0 0 45.6 45.2h161.8a8.26 8.26 0 0 0 8.3-8.2v-111a45.42 45.42 0 0 0 -45.6-45.2h-161.75a8.26 8.26 0 0 0 -8.35 8.2zm226 43.3 66.8-48.8c5.8-4.81 10.3-3.6 10.3 5.1v148.8c0 9.9-5.5 8.7-10.3 5.09l-66.8-48.69z"
          fill="#000000"
        />
      </svg>
      <span class="p-button-label">
        {{ label }}
      </span>
    </Button>
  </div>
</template>

<script setup>
const client = useSupabaseClient()
const config = useRuntimeConfig()

const errorMessage = ref('')

const props = defineProps({
  label: {
    type: String,
    default: 'Sign In With Zoom',
  },
})

const login = async () => {
  const error = await client.auth.signInWithOAuth(
    { provider: 'zoom' },
    { redirectTo: config.supabaseAuthSignInRedirectTo }
  )
  if (error.value) {
    console.log(error)
    errorMessage.value = `Sorry, there was a problem creating this account. Please try again! Error message: ${error}`
  }
}
</script>

<style lang="scss">
.zoom-logo {
  margin: 0 12px -8px 0;
}
</style>

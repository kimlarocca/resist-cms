<template>
  <div>
    <template v-if="errorMessage">
      <Message class="mb-4" severity="error">
        Sorry, there was a problem logging in to your account:
        {{ errorMessage }}
      </Message>
    </template>
    <Button
      :label="label"
      icon="pi pi-microsoft"
      class="width400 w-full mb-2"
      @click="login"
    />
  </div>
</template>

<script setup>
const client = useSupabaseClient()
const config = useRuntimeConfig()

const errorMessage = ref('')

const props = defineProps({
  label: {
    type: String,
    default: 'Sign In With Microsoft',
  },
})

const login = async () => {
  const error = await client.auth.signInWithOAuth(
    {
      provider: 'azure',
      options: {
        scopes: 'email',
      },
    },
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

<template>
  <div>
    <form class="password-reset" @submit.prevent="resetPassword">
      <h3 class="mb-6">Update Your Password</h3>
      <p class="mb-2">
        Email Address: <strong>{{ currentUser.email }}</strong>
      </p>
      <input
        v-if="!successMessage"
        v-model="password"
        type="password"
        placeholder="New Password"
        required
        class="mb-3"
      />
      <Button v-if="!successMessage" :loading="pending" type="submit">
        Update Password
      </Button>
      <template v-if="errorMessage">
        <Message :sticky="true" class="mt-4" severity="error">
          Sorry, there was an error updating your password: {{ errorMessage }}
        </Message>
      </template>
      <template v-if="successMessage">
        <Message
          :sticky="true"
          class="mt-4"
          severity="success"
          :closable="true"
          @close="successMessage = null"
        >
          {{ successMessage }}
        </Message>
      </template>
    </form>
  </div>
</template>

<script setup>
const currentUser = useSupabaseUser()
const client = useSupabaseClient()

const password = ref("")
const errorMessage = ref("")
const successMessage = ref(null)
const pending = ref(false)

const resetPassword = async () => {
  pending.value = true
  const { error } = await client.auth.updateUser({
    email: currentUser.value.email,
    password: password.value,
  })
  pending.value = false
  if (error) {
    console.log(error)
    if (error.toString().includes("8 characters")) {
      errorMessage.value = "Password should be at least 8 characters."
    } else {
      errorMessage.value = error
    }
  } else {
    successMessage.value = "Success! Your password has been updated."
  }
}
</script>

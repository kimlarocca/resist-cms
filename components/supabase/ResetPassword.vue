<template>
  <div>
    <Button v-if="!showForm" @click="showForm = true" class="uppercase font-semibold">
      Change Password
    </Button>
    <form v-else class="password-reset mt-8" @submit.prevent="resetPassword">
      <FloatLabel variant="on" class="mb-4">
        <Password
          id="currentPassword"
          v-model="currentPassword"
          toggleMask
          type="password"
          placeholder="Current Password"
          required
          class="mb-3 w-96"
        />
        <label for="currentPassword">Current Password</label>
      </FloatLabel>
      <FloatLabel variant="on" class="mb-4">
        <Password
          id="newPassword"
          v-model="newPassword"
          toggleMask
          type="password"
          placeholder="New Password"
          required
          class="mb-3 w-96"
        />
        <label for="newPassword">New Password</label>
      </FloatLabel>
      <div class="flex gap-3 align-items-center">
        <Button :loading="pending" type="submit">Update Password</Button>
        <Button severity="secondary" type="button" @click="cancel">Cancel</Button>
      </div>
      <template v-if="errorMessage">
        <Message :sticky="true" class="mt-4" severity="error">
          {{ errorMessage }}
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

const showForm = ref(false)
const currentPassword = ref("")
const newPassword = ref("")
const errorMessage = ref("")
const successMessage = ref(null)
const pending = ref(false)

const cancel = () => {
  showForm.value = false
  currentPassword.value = ""
  newPassword.value = ""
  errorMessage.value = ""
  successMessage.value = null
}

const resetPassword = async () => {
  errorMessage.value = ""
  pending.value = true

  // Verify current password by re-authenticating
  const { error: authError } = await client.auth.signInWithPassword({
    email: currentUser.value.email,
    password: currentPassword.value,
  })
  if (authError) {
    pending.value = false
    errorMessage.value = "Current password is incorrect."
    return
  }

  const { error } = await client.auth.updateUser({
    password: newPassword.value,
  })
  pending.value = false
  if (error) {
    if (error.toString().includes("8 characters")) {
      errorMessage.value = "New password should be at least 8 characters."
    } else {
      errorMessage.value = "Sorry, there was an error updating your password."
    }
  } else {
    successMessage.value = "Success! Your password has been updated."
    currentPassword.value = ""
    newPassword.value = ""
  }
}
</script>

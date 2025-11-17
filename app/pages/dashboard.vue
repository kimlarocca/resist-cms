<template>
  <div>
    <page-header message="Dashboard" />
    <div class="card">
      <h3 class="mb-4">Current User:</h3>
      <p class="mb-4">{{ currentUser }}</p>
      <h3 class="mb-4">User Profile Data:</h3>
      <p class="mb-4">{{ currentUserProfile }}</p>
    </div>
  </div>
</template>

<script setup>
import { useCurrentUser, useCurrentUserProfile } from '~/composables/states'

definePageMeta({
  middleware: 'auth',
})

const currentUser = useCurrentUser()
const currentUserProfile = useCurrentUserProfile()
</script>

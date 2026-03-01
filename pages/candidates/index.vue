<script setup>
import { useCurrentUserProfile } from "~/composables/states"

definePageMeta({
  middleware: "auth",
})

const user = useSupabaseUser()
const currentUserProfile = useCurrentUserProfile()

// Check if user is super admin
const isSuperAdmin = computed(() => currentUserProfile.value?.role === "super_admin")

// Redirect if not super admin
watch(
  currentUserProfile,
  (profile) => {
    if (profile && profile.role !== "super_admin") {
      navigateTo("/dashboard")
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Manage All Candidates</Title>
      </Head>
    </Html>

    <div v-if="!currentUserProfile">
      <ProgressSpinner />
    </div>

    <div v-else-if="!isSuperAdmin">
      <Message severity="error">
        Access denied. This page is only available to super administrators.
      </Message>
    </div>

    <div v-else>
      <h1>Manage All Candidates</h1>
      <Divider class="my-7" />
      <CandidatesManageCandidates />
    </div>
  </div>
</template>

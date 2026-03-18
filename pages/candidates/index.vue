<script setup>
import { useCurrentUserProfile } from "~/composables/states"

definePageMeta({
  middleware: "auth",
})

const user = useSupabaseUser()
const currentUserProfile = useCurrentUserProfile()

// Check if user is super admin or election manager
const hasAccess = computed(
  () =>
    currentUserProfile.value?.role === "super_admin" ||
    currentUserProfile.value?.role === "election_manager"
)

// Redirect if not authorized
watch(
  currentUserProfile,
  (profile) => {
    if (
      profile &&
      profile.role !== "super_admin" &&
      profile.role !== "election_manager"
    ) {
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
        <Title>Resist CMS | My Candidates</Title>
      </Head>
    </Html>

    <div v-if="!currentUserProfile">
      <ProgressSpinner />
    </div>

    <div v-else-if="!hasAccess">
      <Message severity="error">
        Access denied. This page is only available to super administrators and election
        managers.
      </Message>
    </div>

    <div v-else>
      <h1>My Candidates</h1>
      <Divider class="my-7" />
      <CandidatesManageCandidates />
    </div>
  </div>
</template>

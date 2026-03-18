<script setup>
import { useCurrentUserProfile } from "~/composables/states"

definePageMeta({
  middleware: "auth",
})

const route = useRoute()
const user = useSupabaseUser()
const currentUserProfile = useCurrentUserProfile()

// Get query parameters for filtering
const raceId = computed(() => {
  const value = route.query.race_id ? Number(route.query.race_id) : null
  console.log("key-links page raceId computed:", {
    queryParam: route.query.race_id,
    converted: value,
    type: typeof value,
  })
  return value
})

const candidateId = computed(() => {
  const value = route.query.candidate_id ? Number(route.query.candidate_id) : null
  console.log("key-links page candidateId computed:", {
    queryParam: route.query.candidate_id,
    converted: value,
    type: typeof value,
  })
  return value
})

// Check if user is super admin or race admin
const isSuperAdmin = computed(() => currentUserProfile.value?.role === "super_admin")
const isRaceAdmin = computed(() => currentUserProfile.value?.role === "election_manager")
const canAccess = computed(() => isSuperAdmin.value || isRaceAdmin.value)

// Redirect if not authorized
watch(
  currentUserProfile,
  (profile) => {
    if (profile && profile.role !== "super_admin" && profile.role !== "election_manager") {
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
        <Title>Resist CMS | Manage Key Links</Title>
      </Head>
    </Html>

    <div v-if="!currentUserProfile">
      <ProgressSpinner />
    </div>

    <div v-else-if="!canAccess">
      <Message severity="error">
        Access denied. This page is only available to super administrators and race
        administrators.
      </Message>
    </div>

    <div v-else>
      <h1>Manage Key Links</h1>
      <Divider class="my-7" />
      <KeylinksManageKeyLinks :race-id="raceId" :candidate-id="candidateId" />
    </div>
  </div>
</template>

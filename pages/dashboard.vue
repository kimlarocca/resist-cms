<script setup>
import { useCurrentUserProfile } from "~/composables/states"
definePageMeta({
  middleware: "auth",
})
const currentUserProfile = useCurrentUserProfile()
</script>
<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Dashboard</Title>
      </Head>
    </Html>
    <h1 class="mb-8">Dashboard</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
      <div
        v-if="
          currentUserProfile?.role === 'super_admin' ||
          currentUserProfile?.role === 'race_admin'
        "
        class="flex flex-col rounded-xl bg-gray p-4 shadow-lg text-center clickable"
        @click="$router.push('/races')"
      >
        <i class="pi pi-flag-fill text-2xl mx-auto mb-1"></i>
        <h2 class="mb-3">Races</h2>
        <p class="mb-3">Manage races including creating, updating, and deleting races.</p>
        <Button label="Manage Races" />
      </div>
    </div>
  </div>
</template>

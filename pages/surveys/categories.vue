<script setup>
import { useCurrentUserProfile } from "~/composables/states"
definePageMeta({
  middleware: "auth",
})
const currentUserProfile = useCurrentUserProfile()
const isSuperAdmin = computed(() => currentUserProfile.value?.role === "super_admin")
</script>

<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Manage Survey Categories</Title>
      </Head>
    </Html>
    <h1>Manage Survey Categories</h1>
    <Divider class="my-7" />
    <SurveysManageSurveyCategories v-if="isSuperAdmin" />
    <Message v-else severity="warn"
      >You do not have permission to manage survey categories.</Message
    >
  </div>
</template>

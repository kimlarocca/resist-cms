<script setup>
import { useCurrentUserProfile } from "~/composables/states"

definePageMeta({
  middleware: "auth",
})

const route = useRoute()
const surveyId = computed(() => route.params.id)
const currentUserProfile = useCurrentUserProfile()
const isSuperAdmin = computed(() => currentUserProfile.value?.role === "super_admin")
</script>

<template>
  <div class="container p-4" :key="`survey-questions-${surveyId}`">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Manage Survey Questions</Title>
      </Head>
    </Html>
    <h1 class="mb-6">Manage Survey Questions</h1>
    <p>
      <NuxtLink to="/surveys">All Surveys</NuxtLink>
    </p>
    <Divider class="mb-7" />
    <SurveysManageQuestions :survey-id="surveyId" />
  </div>
</template>

<script setup>
import { useCurrentUserProfile } from "~/composables/states"

definePageMeta({
  middleware: "auth",
})

const route = useRoute()
const surveyId = computed(() => route.params.id)
const questionId = computed(() => route.params.questionId)
const currentUserProfile = useCurrentUserProfile()
</script>

<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Manage Survey Choices</Title>
      </Head>
    </Html>
    <h1 class="mb-6">Manage Survey Choices</h1>
    <Divider class="mb-7" />
    <SurveysManageChoices :survey-id="surveyId" :question-id="questionId" />
  </div>
</template>

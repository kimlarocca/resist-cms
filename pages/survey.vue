<template>
  <SurveyComponent :model="survey" />
</template>

<script setup lang="ts">
import { Model } from "survey-core"
import { SurveyComponent } from "survey-vue3-ui"
import "survey-core/survey-core.min.css"
import { json } from "~/assets/json.js"

definePageMeta({
  layout: "blank",
})

const survey = new Model(json)
survey.onComplete.add((sender, options) => {
  console.log(JSON.stringify(sender.data, null, 3))
})
</script>

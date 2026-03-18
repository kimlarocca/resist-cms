<script setup>
import { useCurrentUserProfile } from "~/composables/states"
definePageMeta({
  middleware: "auth",
})
const user = useSupabaseUser()
const currentUserProfile = useCurrentUserProfile()
</script>

<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Manage Your Signup Form</Title>
      </Head>
    </Html>
    <h1>Manage Your Signup Form</h1>
    <Divider class="my-7" />
  </div>
</template>

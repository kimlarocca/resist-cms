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
        <Title>Dashboard</Title>
      </Head>
    </Html>
    <h1>Dashboard</h1>
    <Divider class="my-7" />
  </div>
</template>

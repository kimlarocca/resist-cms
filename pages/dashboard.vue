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
        <Title>Resist CMS | Dashboard</Title>
      </Head>
    </Html>
    <h1>Dashboard</h1>
    <Divider class="my-7" />
    user: {{ user }}
    <Divider class="my-7" />
    profile: {{ currentUserProfile }}
    <Divider class="my-7" />
    <NuxtLink to="/logout">Logout</NuxtLink>
  </div>
</template>

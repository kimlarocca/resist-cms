<script setup>
import { useCurrentUserProfile } from "~/composables/states"
definePageMeta({
  middleware: "auth",
})

const route = useRoute()
const websiteId = computed(() => route.params.id)
const currentUserProfile = useCurrentUserProfile()

const allowedRoles = ["super_admin", "group_admin", "event_manager"]
const hasAccess = computed(() => allowedRoles.includes(currentUserProfile.value?.role))

const { data: website } = await useAsyncData(`website-${websiteId.value}`, () =>
  getWebsiteData(websiteId.value)
)
</script>

<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Manage Events</Title>
      </Head>
    </Html>
    <div v-if="!hasAccess">
      <Message severity="error">You do not have permission to view this page.</Message>
    </div>
    <template v-else>
      <h1 class="mb-6">Manage Events</h1>
      <Divider class="my-7" />
      <h2 v-if="website?.title" class="mb-8">{{ website?.title }}</h2>
      <GroupsManageGroupEvents :website-id="websiteId" />
      <Divider class="my-7" />
      <NuxtLink :to="`/groups/${websiteId}/dashboard`">
        <i class="pi pi-arrow-left mr-2" />
        Back to the Dashboard
      </NuxtLink>
    </template>
  </div>
</template>

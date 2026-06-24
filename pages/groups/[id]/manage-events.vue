<script setup>
import { useCurrentUserProfile, useGroupRole } from "~/composables/states"
definePageMeta({
  middleware: "auth",
})

const route = useRoute()
const websiteId = computed(() => route.params.id)
const currentUserProfile = useCurrentUserProfile()
const groupRole = useGroupRole(websiteId)

const allowedRoles = ["super_admin", "group_admin", "event_manager"]
const hasAccess = computed(() => allowedRoles.includes(groupRole.value))

const { data: website } = await useAsyncData(`website-${websiteId.value}`, () =>
  getWebsiteData(websiteId.value)
)
</script>

<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Manage Events</Title>
      </Head>
    </Html>
    <div v-if="!hasAccess">
      <Message severity="error">You do not have permission to view this page.</Message>
    </div>
    <template v-else>
      <NuxtLink v-if="website?.title" :to="`/groups/${websiteId}/portal`" class="like-h3 plain flex items-center mb-4"><i class="pi pi-arrow-left mr-2" />{{ website?.title }}</NuxtLink>
      <h1 class="mb-12">Manage Events</h1>
      <GroupsManageGroupEvents :website-id="websiteId" />
      <Divider class="my-7" />
      <NuxtLink :to="`/groups/${websiteId}/portal`">
        <i class="pi pi-arrow-left mr-2" />
        Back to the Dashboard
      </NuxtLink>
    </template>
  </div>
</template>

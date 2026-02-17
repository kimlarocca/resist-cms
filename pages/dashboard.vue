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

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
      <div
        v-if="
          currentUserProfile?.role === 'super_admin' ||
          currentUserProfile?.role === 'race_admin'
        "
        class="flex flex-col justify-between rounded-xl bg-gray p-8 shadow-lg clickable"
        @click="$router.push('/races')"
      >
        <div>
          <Tag value="Race Admin" class="mb-3 w-fit mx-auto" />
          <h2 class="mb-3">Races</h2>
          <p class="mb-5">Manage races including adding, updating, and deleting races.</p>
        </div>
        <Button label="Manage Races" class="w-fit" />
      </div>
      <div
        v-if="currentUserProfile?.role === 'super_admin'"
        class="flex flex-col justify-between rounded-xl bg-gray p-8 shadow-lg clickable"
        @click="$router.push('/surveys')"
      >
        <div>
          <Tag value="Super Admin" class="mb-3 w-fit mx-auto" />
          <h2 class="mb-3">Manage Surveys</h2>
          <p class="mb-5">Manage surveys, categories and survey questions.</p>
        </div>
        <Button label="Manage Surveys" class="w-fit" />
      </div>
      <div
        v-if="currentUserProfile?.role === 'super_admin'"
        class="flex flex-col justify-between rounded-xl bg-gray p-8 shadow-lg clickable"
        @click="$router.push('/websites')"
      >
        <div>
          <Tag value="Super Admin" class="mb-3 w-fit mx-auto" />
          <h2 class="mb-3">Manage Websites</h2>
          <p class="mb-5">Manage all ResistCMS websites.</p>
        </div>
        <Button label="Manage Websites" class="w-fit" />
      </div>
      <div
        v-if="currentUserProfile?.website_id"
        class="flex flex-col justify-between rounded-xl bg-gray p-8 shadow-lg clickable"
        @click="$router.push(`/websites/${currentUserProfile.website_id}`)"
      >
        <div>
          <i class="pi pi-cog text-2xl mb-2" />
          <h2 class="mb-3">Website Settings</h2>
          <p class="mb-5">
            Manage your website settings including contact information, title, logo, and
            more.
          </p>
        </div>
        <Button label="Manage Settings" class="w-fit" />
      </div>
      <div
        v-if="currentUserProfile?.website_id"
        class="flex flex-col justify-between rounded-xl bg-gray p-8 shadow-lg clickable"
        @click="$router.push(`/websites/${currentUserProfile.website_id}/manage`)"
      >
        <div>
          <i class="pi pi-book text-2xl mb-2" />
          <h2 class="mb-3">Website Content</h2>
          <p class="mb-5">Manage your website content including text and images.</p>
        </div>
        <Button label="Manage Content" class="w-fit" />
      </div>
    </div>
  </div>
</template>

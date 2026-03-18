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
    <h1 class="mb-12">Dashboard</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
      <div
        v-if="
          currentUserProfile?.role === 'super_admin' ||
          currentUserProfile?.role === 'election_manager'
        "
        class="flex flex-col relative justify-between rounded-xl bg-gray p-8 shadow-lg clickable"
        @click="$router.push('/elections')"
      >
        <Tag
          value="Election Managers"
          class="absolute top-0 left-8 transform -translate-y-1/2 w-fit mx-auto"
        />
        <div>
          <h2 class="mb-4">My Elections</h2>
          <p>
            <a>Click here</a> to manage your elections and key links for your elections.
          </p>
        </div>
      </div>
      <div
        v-if="
          currentUserProfile?.role === 'super_admin' ||
          currentUserProfile?.role === 'election_manager'
        "
        class="flex relative flex-col justify-between rounded-xl bg-gray p-8 shadow-lg clickable"
        @click="$router.push('/candidates/')"
      >
        <div>
          <Tag
            value="Election Managers"
            class="absolute top-0 left-8 transform -translate-y-1/2 w-fit mx-auto"
          />
          <h2 class="mb-4">My Candidates</h2>
          <p>
            <a>Click here</a> to manage the candidates in your races and their key clinks.
          </p>
        </div>
      </div>
      <div
        v-if="
          currentUserProfile?.role === 'super_admin' ||
          currentUserProfile?.role === 'election_manager'
        "
        class="flex relative flex-col justify-between rounded-xl bg-gray p-8 shadow-lg clickable"
        @click="$router.push('/surveys')"
      >
        <div>
          <Tag
            value="Election Managers"
            class="absolute top-0 left-8 transform -translate-y-1/2 w-fit mx-auto"
          />
          <h2 class="mb-4">My Surveys</h2>
          <p>
            <a>Click here</a> to manage your surveys and their questions and categories.
          </p>
        </div>
      </div>
      <div
        v-if="currentUserProfile?.role === 'super_admin'"
        class="flex relative flex-col justify-between rounded-xl bg-gray p-8 shadow-lg clickable"
        @click="$router.push('/key-links')"
      >
        <div>
          <Tag
            value="Super Admin"
            class="absolute top-0 left-8 transform -translate-y-1/2 w-fit mx-auto"
          />
          <h2 class="mb-3">Manage Key Links</h2>
          <p class="mb-5">
            Manage key links, including adding, updating, and deleting links.
          </p>
        </div>
        <Button label="Manage Key Links" class="w-fit p-button-sm" />
      </div>
      <div
        v-if="currentUserProfile?.role === 'super_admin'"
        class="flex relative flex-col justify-between rounded-xl bg-gray p-8 shadow-lg clickable"
        @click="$router.push('/websites')"
      >
        <div>
          <Tag
            value="Super Admin"
            class="absolute top-0 left-8 transform -translate-y-1/2 w-fit mx-auto"
          />
          <h2 class="mb-3">Manage Websites</h2>
          <p class="mb-5">Manage all ResistCMS websites.</p>
        </div>
        <Button label="Manage Websites" class="w-fit p-button-sm" />
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
        <Button label="Manage Settings" class="w-fit p-button-sm" />
      </div>
      <div
        v-if="currentUserProfile?.website_id"
        class="flex flex-col justify-between rounded-xl bg-gray p-8 shadow-lg clickable"
        @click="$router.push(`/websites/${currentUserProfile.website_id}/manage-content`)"
      >
        <div>
          <i class="pi pi-book text-2xl mb-2" />
          <h2 class="mb-3">Website Content</h2>
          <p class="mb-5">Manage your website content including text and images.</p>
        </div>
        <Button label="Manage Content" class="w-fit p-button-sm" />
      </div>
      <div
        v-if="currentUserProfile?.website_id"
        class="flex flex-col justify-between rounded-xl bg-gray p-8 shadow-lg clickable"
        @click="$router.push(`/websites/${currentUserProfile.website_id}/manage-signup-form`)"
      >
        <div>
          <i class="pi pi-file-edit text-2xl mb-2" />
          <h2 class="mb-3">Signup Form</h2>
          <p class="mb-5">
            Manage your signup form questions, field types, and display order.
          </p>
        </div>
        <Button label="Manage Signup Form" class="w-fit p-button-sm" />
      </div>
    </div>
  </div>
</template>

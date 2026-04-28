<script setup>
import { useCurrentUserProfile } from "~/composables/states"
definePageMeta({
  middleware: "auth",
})
const currentUserProfile = useCurrentUserProfile()
const supabase = useSupabaseClient()
const router = useRouter()

// User's websites/groups
const userWebsites = ref([])
const loadingWebsites = ref(true)

// Fetch websites user has permission to manage
const fetchUserWebsites = async () => {
  if (!currentUserProfile.value?.id) {
    loadingWebsites.value = false
    return
  }

  loadingWebsites.value = true

  try {
    const { data, error } = await supabase
      .from("websites_users")
      .select(
        `
        website_id,
        websites:website_id (
          id,
          title,
          url,
          slug,
          email,
          type,
          published
        )
      `
      )
      .eq("user_id", currentUserProfile.value.id)

    if (error) throw error

    userWebsites.value = data?.map((item) => item.websites).filter(Boolean) || []
  } catch (error) {
    console.error("Error fetching user websites:", error)
  } finally {
    loadingWebsites.value = false
  }
}

// Navigate to edit group settings
const editGroupSettings = (websiteId) => {
  router.push(`/groups/${websiteId}`)
}

// Navigate to manage content
const manageContent = (websiteId) => {
  router.push(`/groups/${websiteId}/manage-content`)
}

// Navigate to manage signup form
const manageSignupForm = (websiteId) => {
  router.push(`/groups/${websiteId}/manage-signup-form`)
}

// Navigate to manage form submissions
const manageFormSubmissions = (websiteId) => {
  router.push(`/groups/${websiteId}/manage-form-submissions`)
}

// Watch for currentUserProfile to become available
watch(
  () => currentUserProfile.value?.id,
  (newId) => {
    if (newId) {
      fetchUserWebsites()
    }
  },
  { immediate: true }
)

// Fetch user websites on mount
onMounted(() => {
  fetchUserWebsites()
})
</script>
<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Dashboard</Title>
      </Head>
    </Html>
    <h1 class="mb-6">Dashboard</h1>
    <p class="mb-12">Welcome back, {{ currentUserProfile?.full_name }}!</p>

    <!-- super admins only -->
    <div
      v-if="currentUserProfile?.role === 'super_admin'"
      class="relative rounded-xl bg-gray shadow-xl p-8 mb-16"
    >
      <Tag
        value="Super Admin Quick Links"
        class="absolute top-0 left-8 transform -translate-y-1/2 w-fit mx-auto"
      />
      <div class="flex items-center gap-4">
        <NuxtLink to="/groups" class="plain block">
          <Button label="Manage Groups" class="white" />
        </NuxtLink>
        <NuxtLink to="/key-links" class="plain block">
          <Button label="Manage Key Links" class="white" />
        </NuxtLink>
        <NuxtLink to="/surveys/categories" class="plain block">
          <Button label="Manage Survey Categories" class="white" />
        </NuxtLink>
      </div>
    </div>

    <!-- election managers and super admins -->
    <div
      v-if="
        currentUserProfile?.role === 'super_admin' ||
        currentUserProfile?.role === 'election_manager'
      "
      class="relative rounded-xl bg-gray shadow-xl p-8 mb-16"
    >
      <Tag
        value="Election Manager Quick Links"
        class="absolute top-0 left-8 transform -translate-y-1/2 w-fit mx-auto"
      />
      <div class="flex items-center gap-4">
        <NuxtLink to="/elections" class="plain block">
          <Button label="My Elections" class="white" />
        </NuxtLink>
        <NuxtLink to="/candidates/" class="plain block">
          <Button label="My Candidates" class="white" />
        </NuxtLink>
        <NuxtLink to="/surveys" class="plain block">
          <Button label="My Surveys" class="white" />
        </NuxtLink>
      </div>
    </div>

    <!-- My Groups/Websites -->
    <div v-if="userWebsites.length > 0 || loadingWebsites">
      <div v-if="loadingWebsites" class="flex justify-center py-8">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      </div>

      <div v-else>
        <h2 class="mb-8">My Groups</h2>
        <div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div
              v-for="website in userWebsites"
              :key="website.id"
              class="flex flex-col rounded-xl bg-gray shadow-xl p-8"
            >
              <h3 class="mb-3">{{ website.title || "Untitled" }}</h3>
              <Tag
                :value="website.published ? 'Published' : 'Unpublished'"
                :severity="website.published ? 'success' : 'secondary'"
                class="mb-3 w-fit"
              />
              <p v-if="website.url" class="small mb-1">
                <a
                  :href="website.url"
                  target="_blank"
                  class="text-blue-600 hover:underline"
                >
                  View Public Site <i class="pi pi-arrow-right text-xs ml-1" />
                </a>
              </p>
              <p v-else-if="website.slug" class="small mb-1">
                <a :href="`https://resistcms.com/${website.slug}`" target="_blank">
                  View Public Site <i class="pi pi-arrow-right text-xs ml-1" />
                </a>
              </p>

              <Divider class="darker" />
              <h4>Admin Links</h4>
              <p class="text-sm flex flex-col space-y-1 mt-4">
                <NuxtLink :to="`/groups/${website.id}`" class="plain block">
                  Edit Group Settings
                </NuxtLink>
                <NuxtLink
                  :to="`/groups/${website.id}/manage-content`"
                  class="plain block"
                >
                  Manage Public Website Content
                </NuxtLink>
                <NuxtLink
                  :to="`/groups/${website.id}/manage-signup-form`"
                  class="plain block"
                >
                  Manage Public Signup Form
                </NuxtLink>
                <NuxtLink
                  :to="`/groups/${website.id}/manage-form-submissions`"
                  class="plain block"
                >
                  Manage Form Submissions
                </NuxtLink>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

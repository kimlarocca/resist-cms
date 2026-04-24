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
    <h1 class="mb-12">Dashboard</h1>

    <!-- super admins only -->
    <div
      v-if="currentUserProfile?.role === 'super_admin'"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
    >
      <div
        class="flex relative flex-col justify-between rounded-xl bg-gray p-8 shadow-lg clickable"
        @click="$router.push('/groups')"
      >
        <div>
          <Tag
            value="Super Admin"
            class="absolute top-0 left-8 transform -translate-y-1/2 w-fit mx-auto"
          />
          <h3 class="mb-3">Groups</h3>
          <p><a>Click here</a> to manage all Resist CMS groups.</p>
        </div>
      </div>
      <div
        class="flex relative flex-col justify-between rounded-xl bg-gray p-8 shadow-lg clickable"
        @click="$router.push('/key-links')"
      >
        <div>
          <Tag
            value="Super Admin"
            class="absolute top-0 left-8 transform -translate-y-1/2 w-fit mx-auto"
          />
          <h3 class="mb-3">Key Links</h3>
          <p><a>Click here</a> to manage all key links for elections and candidates.</p>
        </div>
      </div>
      <div
        class="flex relative flex-col justify-between rounded-xl bg-gray p-8 shadow-lg clickable"
        @click="$router.push('/surveys/categories')"
      >
        <div>
          <Tag
            value="Super Admin"
            class="absolute top-0 left-8 transform -translate-y-1/2 w-fit mx-auto"
          />
          <h3 class="mb-3">Survey Categories</h3>
          <p><a>Click here</a> to manage global survey categories.</p>
        </div>
      </div>
    </div>

    <!-- election managers and super admins -->
    <div
      v-if="
        currentUserProfile?.role === 'super_admin' ||
        currentUserProfile?.role === 'election_manager'
      "
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
    >
      <div
        class="flex flex-col relative justify-between rounded-xl bg-gray p-8 shadow-lg clickable"
        @click="$router.push('/elections')"
      >
        <Tag
          value="Election Managers"
          class="absolute top-0 left-8 transform -translate-y-1/2 w-fit mx-auto"
        />
        <div>
          <h3 class="mb-4">My Elections</h3>
          <p>
            <a>Click here</a> to manage your elections and key links for your elections.
          </p>
        </div>
      </div>
      <div
        class="flex relative flex-col justify-between rounded-xl bg-gray p-8 shadow-lg clickable"
        @click="$router.push('/candidates/')"
      >
        <div>
          <Tag
            value="Election Managers"
            class="absolute top-0 left-8 transform -translate-y-1/2 w-fit mx-auto"
          />
          <h3 class="mb-4">My Candidates</h3>
          <p>
            <a>Click here</a> to manage the candidates in your races and their key clinks.
          </p>
        </div>
      </div>
      <div
        class="flex relative flex-col justify-between rounded-xl bg-gray p-8 shadow-lg clickable"
        @click="$router.push('/surveys')"
      >
        <div>
          <Tag
            value="Election Managers"
            class="absolute top-0 left-8 transform -translate-y-1/2 w-fit mx-auto"
          />
          <h3 class="mb-4">My Surveys</h3>
          <p>
            <a>Click here</a> to manage your surveys and their questions and categories.
          </p>
        </div>
      </div>
    </div>

    <!-- My Groups/Websites -->
    <div v-if="userWebsites.length > 0 || loadingWebsites">
      <div v-if="loadingWebsites" class="flex justify-center py-8">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      </div>

      <div v-else>
        <div v-for="website in userWebsites" :key="website.id" class="mb-12">
          <h2 class="mb-3">{{ website.title || "Untitled" }}</h2>

          <div class="mb-6">
            <Tag
              :value="website.published ? 'Published' : 'Unpublished'"
              :severity="website.published ? 'success' : 'secondary'"
              class="mb-3"
            />
            <p v-if="website.url" class="mb-1">
              <a
                :href="website.url"
                target="_blank"
                class="text-blue-600 hover:underline"
              >
                {{ website.url }}
              </a>
            </p>

            <p v-if="website.slug" class="mb-1">
              <a
                :href="`https://resistcms.com/${website.slug}`"
                target="_blank"
                class="text-blue-600 hover:underline"
              >
                {{ `https://resistcms.com/${website.slug}` }}
              </a>
            </p>

            <p v-if="website.email">Email Address: {{ website.email }}</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div
              class="flex flex-col rounded-xl bg-gray p-8 shadow-lg clickable"
              @click="editGroupSettings(website.id)"
            >
              <h3 class="mb-3">Group Settings</h3>
              <p>
                <a>Click here</a> to manage your group's settings including contact
                information, logo, social media, and more.
              </p>
            </div>

            <div
              class="flex flex-col rounded-xl bg-gray p-8 shadow-lg clickable"
              @click="manageContent(website.id)"
            >
              <h3 class="mb-3">Public Website Content</h3>
              <p>
                <a>Click here</a> to manage your group's public website content including
                text and images.
              </p>
            </div>

            <div
              class="flex flex-col rounded-xl bg-gray p-8 shadow-lg clickable"
              @click="manageSignupForm(website.id)"
            >
              <h3 class="mb-3">Public Signup Form</h3>
              <p>
                <a>Click here</a> to manage your group's public signup form introduction,
                questions, and display order.
              </p>
            </div>

            <div
              class="flex flex-col rounded-xl bg-gray p-8 shadow-lg clickable"
              @click="manageFormSubmissions(website.id)"
            >
              <h3 class="mb-3">Form Submissions</h3>
              <p>
                <a>Click here</a> to manage your group's public signup form submissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

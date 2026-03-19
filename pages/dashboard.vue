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
          email,
          type
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

// Delete website (super admin only)
const deleteDialogVisible = ref(false)
const websiteToDelete = ref(null)

const confirmDeleteWebsite = (website) => {
  websiteToDelete.value = website
  deleteDialogVisible.value = true
}

const deleteWebsite = async () => {
  if (!websiteToDelete.value) return

  try {
    const { error } = await supabase
      .from("websites")
      .delete()
      .eq("id", websiteToDelete.value.id)

    if (error) throw error

    await fetchUserWebsites()
  } catch (error) {
    console.error("Error deleting website:", error)
  } finally {
    deleteDialogVisible.value = false
    websiteToDelete.value = null
  }
}

// Check if user is super admin
const isSuperAdmin = computed(() => {
  return currentUserProfile.value?.role === "super_admin"
})

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
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
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
          <h2 class="mb-3">Manage Groups</h2>
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
          <h2 class="mb-3">Manage Key Links</h2>
          <p>Manage all key links for elections and candidates.</p>
        </div>
      </div>
    </div>

    <!-- election managers and super admins -->
    <div
      v-if="
        currentUserProfile?.role === 'super_admin' ||
        currentUserProfile?.role === 'election_manager'
      "
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
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
          <h2 class="mb-4">My Elections</h2>
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
          <h2 class="mb-4">My Candidates</h2>
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
          <h2 class="mb-4">My Surveys</h2>
          <p>
            <a>Click here</a> to manage your surveys and their questions and categories.
          </p>
        </div>
      </div>
    </div>

    <!-- My Groups/Websites -->
    <div v-if="userWebsites.length > 0 || loadingWebsites" class="mb-16">
      <h2 class="mb-6">My Groups</h2>

      <div v-if="loadingWebsites" class="flex justify-center py-8">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      </div>

      <DataTable v-else :value="userWebsites" stripedRows class="p-datatable-sm">
        <Column field="title" header="Title" sortable>
          <template #body="{ data }">
            {{ data.title || "Untitled" }}
          </template>
        </Column>

        <Column field="url" header="URL" sortable>
          <template #body="{ data }">
            <a
              v-if="data.url"
              :href="data.url"
              target="_blank"
              class="text-blue-600 hover:underline"
            >
              {{ data.url }}
            </a>
          </template>
        </Column>

        <Column field="email" header="Email">
          <template #body="{ data }">
            {{ data.email }}
          </template>
        </Column>

        <Column header="Actions" style="width: 300px">
          <template #body="{ data }">
            <div class="flex gap-2 flex-wrap">
              <Button
                icon="pi pi-cog"
                severity="info"
                size="small"
                @click="editGroupSettings(data.id)"
                v-tooltip.top="'Edit Group Settings'"
              />
              <Button
                icon="pi pi-book"
                severity="secondary"
                size="small"
                @click="manageContent(data.id)"
                v-tooltip.top="'Manage Content'"
              />
              <Button
                icon="pi pi-file-edit"
                severity="secondary"
                size="small"
                @click="manageSignupForm(data.id)"
                v-tooltip.top="'Manage Signup Form'"
              />
              <Button
                v-if="isSuperAdmin"
                icon="pi pi-trash"
                severity="danger"
                size="small"
                @click="confirmDeleteWebsite(data)"
                v-tooltip.top="'Delete'"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="deleteDialogVisible"
      :style="{ width: '450px' }"
      header="Confirm Delete"
      :modal="true"
    >
      <div class="flex items-center gap-3">
        <i class="pi pi-exclamation-triangle text-3xl text-red-500"></i>
        <span>
          Are you sure you want to delete
          <strong>{{ websiteToDelete?.title || websiteToDelete?.url }}</strong
          >?
        </span>
      </div>
      <template #footer>
        <Button label="Cancel" @click="deleteDialogVisible = false" text />
        <Button label="Delete" @click="deleteWebsite" severity="danger" />
      </template>
    </Dialog>
  </div>
</template>

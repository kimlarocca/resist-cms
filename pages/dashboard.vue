<script setup>
import { useCurrentUserProfile, useCurrentUserGroupRoles } from "~/composables/states"
definePageMeta({
  middleware: "auth",
})
const currentUserProfile = useCurrentUserProfile()
const currentUserGroupRoles = useCurrentUserGroupRoles()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

// Complete profile dialog (shown to newly invited users)
const setupDialogVisible = ref(false)
const setupFullName = ref("")
const setupPhone = ref("")
const setupPassword = ref("")
const setupConfirmPassword = ref("")
const setupLoading = ref(false)
const setupError = ref("")

const checkIfNeedsSetup = () => {
  if (currentUserProfile.value && !currentUserProfile.value.onboarded) {
    setupDialogVisible.value = true
  }
}

const submitSetup = async () => {
  setupError.value = ""
  if (setupPassword.value.length < 8) {
    setupError.value = "Password must be at least 8 characters."
    return
  }
  if (setupPassword.value !== setupConfirmPassword.value) {
    setupError.value = "Passwords do not match."
    return
  }
  setupLoading.value = true
  const { error } = await supabase.auth.updateUser({
    password: setupPassword.value,
    data: { full_name: setupFullName.value, profile_complete: true },
  })
  if (error) {
    setupError.value = error.message
    setupLoading.value = false
    return
  }
  // Also update the profiles table
  if (currentUserProfile.value?.id) {
    await supabase
      .from("profiles")
      .update({
        full_name: setupFullName.value,
        phone: setupPhone.value || null,
        onboarded: true,
      })
      .eq("id", currentUserProfile.value.id)
  }
  setupLoading.value = false
  setupDialogVisible.value = false
  // Update in-memory profile so the redirect check sees onboarded: true
  if (currentUserProfile.value) {
    currentUserProfile.value.onboarded = true
    currentUserProfile.value.full_name = setupFullName.value
  }
  // Now that onboarding is complete, run the redirect check
  fetchUserWebsites()
}

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

    // Auto-redirect non-global-role users who belong to exactly one group
    const globalRole = currentUserProfile.value?.role
    if (
      globalRole !== 'super_admin' &&
      globalRole !== 'election_manager' &&
      userWebsites.value.length === 1 &&
      currentUserProfile.value?.onboarded
    ) {
      return navigateTo(`/groups/${userWebsites.value[0].id}/portal`)
    }

    // Fetch cross-group announcements if member of 2+ groups
    await fetchAllAnnouncements()
    await fetchAllEvents()
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

// Cross-group announcements feed (shown when member of 2+ groups)
const allAnnouncements = ref([])
const loadingAllAnnouncements = ref(false)

const fetchAllAnnouncements = async () => {
  if (userWebsites.value.length < 2) return
  loadingAllAnnouncements.value = true

  const websiteIds = userWebsites.value.map((w) => w.id)
  const supabase = useSupabaseClient()

  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .in("website_id", websiteIds)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching announcements:", error)
    loadingAllAnnouncements.value = false
    return
  }

  const rows = data || []
  const userIds = [...new Set(rows.map((r) => r.created_by).filter(Boolean))]
  let profileMap = {}
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, nickname")
      .in("id", userIds)
    if (profiles) {
      profileMap = Object.fromEntries(
        profiles.map((p) => [p.id, { full_name: p.full_name, nickname: p.nickname }])
      )
    }
  }

  const websiteMap = Object.fromEntries(userWebsites.value.map((w) => [w.id, w.title]))

  allAnnouncements.value = rows.map((r) => ({
    ...r,
    profiles: profileMap[r.created_by] || null,
    websiteTitle: websiteMap[r.website_id] || null,
  }))

  loadingAllAnnouncements.value = false
}

// Cross-group events feed (shown when member of 2+ groups)
const allEvents = ref([])
const loadingAllEvents = ref(false)

const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`
}

const fetchAllEvents = async () => {
  if (userWebsites.value.length < 2) return
  loadingAllEvents.value = true
  const websiteIds = userWebsites.value.map((w) => w.id)
  const supabase = useSupabaseClient()
  const { data, error } = await supabase
    .from("group_events")
    .select("*, group_event_locations(*)")
    .in("website_id", websiteIds)
    .gte("date", todayStr())
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })
  if (error) console.error("Error fetching events:", error)
  else {
    const websiteMap = Object.fromEntries(userWebsites.value.map((w) => [w.id, w.title]))
    allEvents.value = (data || []).map((e) => ({
      ...e,
      websiteTitle: websiteMap[e.website_id] || null,
    }))
  }
  loadingAllEvents.value = false
}

// Watch for currentUserProfile to become available
watch(
  () => currentUserProfile.value?.id,
  (newId) => {
    if (newId) {
      fetchUserWebsites()
      checkIfNeedsSetup()
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
        <Title>Dashboard</Title>
      </Head>
    </Html>
    <h1 class="mb-6">Dashboard</h1>
    <p v-if="currentUserProfile?.full_name" class="mb-12">
      Welcome back, {{ currentUserProfile?.full_name }}!
    </p>

    <!-- Complete profile dialog for newly invited users -->
    <Dialog
      v-model:visible="setupDialogVisible"
      modal
      header="Please Set Up Your Account"
      :closable="false"
      :style="{ width: '32rem' }"
    >
      <p class="mb-4 text-gray-500">
        Welcome to Resist CMS! Please set your name and create a password to complete your
        account setup.
      </p>
      <form @submit.prevent="submitSetup" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="setup-name">Full Name</label>
          <InputText
            id="setup-name"
            v-model="setupFullName"
            placeholder="Your full name"
            autocomplete="name"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="setup-phone"
            >Phone Number <span class="text-gray-400 font-normal">(optional)</span></label
          >
          <InputText
            id="setup-phone"
            v-model="setupPhone"
            placeholder="Your phone number"
            autocomplete="tel"
            type="tel"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="setup-password">Password</label>
          <Password
            id="setup-password"
            v-model="setupPassword"
            placeholder="Choose a password (min 8 characters)"
            :feedback="true"
            toggleMask
            class="w-full"
            inputClass="w-full"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="setup-confirm">Confirm Password</label>
          <Password
            id="setup-confirm"
            v-model="setupConfirmPassword"
            placeholder="Confirm your password"
            :feedback="false"
            toggleMask
            class="w-full"
            inputClass="w-full"
          />
        </div>
        <Message v-if="setupError" severity="error">{{ setupError }}</Message>
      </form>
      <template #footer>
        <Button
          label="Save & Continue"
          icon="pi pi-check"
          :loading="setupLoading"
          @click="submitSetup"
        />
      </template>
    </Dialog>

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
        <NuxtLink to="/users" class="plain block">
          <Button label="Manage Users" class="white" />
        </NuxtLink>
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
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div
              v-for="website in userWebsites"
              :key="website.id"
              class="flex flex-col rounded-xl bg-gray shadow-xl p-8"
            >
              <h3 class="mb-3">{{ website.title || "Untitled" }}</h3>
              <p v-if="website.url" class="mb-1">
                <a :href="website.url" target="_blank" class="plain text-sm">
                  View Public Site <i class="pi pi-arrow-right text-xs ml-1" />
                </a>
              </p>
              <p v-else-if="website.slug" class="mb-1">
                <a
                  :href="`https://resistcms.com/${website.slug}`"
                  target="_blank"
                  class="plain text-sm"
                >
                  View Public Site <i class="pi pi-arrow-right text-xs ml-1" />
                </a>
              </p>
              <p>
                <NuxtLink :to="`/groups/${website.id}/portal`" class="plain text-sm">
                  Team Member Portal <i class="pi pi-arrow-right text-xs ml-1" />
                </NuxtLink>
              </p>

              <template
                v-if="
                  [
                    'super_admin',
                    'group_admin',
                    'group_manager',
                    'event_manager',
                  ].includes(currentUserProfile?.role === 'super_admin' ? 'super_admin' : currentUserGroupRoles?.[website.id])
                "
              >
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cross-group events + announcements grid (2+ groups) -->
    <div
      v-if="userWebsites.length > 1"
      class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-start"
    >
      <!-- Events column -->
      <div>
        <EventsFeed :events="allEvents" :loading="loadingAllEvents" :page-size="10" />
      </div>

      <!-- Announcements column -->
      <div>
        <AnnouncementsFeed
          :announcements="allAnnouncements"
          :loading="loadingAllAnnouncements"
          :page-size="10"
        />
      </div>
    </div>
  </div>
</template>

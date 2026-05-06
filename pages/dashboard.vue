<script setup>
import { useCurrentUserProfile } from "~/composables/states"
definePageMeta({
  middleware: "auth",
})
const currentUserProfile = useCurrentUserProfile()
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

    // Auto-redirect members who belong to exactly one group (only if onboarding is complete)
    if (
      currentUserProfile.value?.role === "member" &&
      userWebsites.value.length === 1 &&
      currentUserProfile.value?.onboarded
    ) {
      return navigateTo(`/groups/${userWebsites.value[0].id}/dashboard`)
    }
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
        <Title>Resist CMS | Dashboard</Title>
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
                <NuxtLink :to="`/groups/${website.id}/dashboard`" class="plain text-sm">
                  View Team Only Site <i class="pi pi-arrow-right text-xs ml-1" />
                </NuxtLink>
              </p>

              <template
                v-if="
                  [
                    'super_admin',
                    'group_admin',
                    'group_manager',
                    'event_manager',
                  ].includes(currentUserProfile?.role)
                "
              >
                <Divider class="darker" />
                <h4>Admin Links</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-1 mt-4 text-sm">
                  <template v-if="currentUserProfile?.role !== 'event_manager'">
                    <NuxtLink :to="`/groups/${website.id}`" class="plain block">
                      Settings
                    </NuxtLink>
                    <NuxtLink
                      :to="`/groups/${website.id}/manage-content`"
                      class="plain block"
                    >
                      Content
                    </NuxtLink>
                    <NuxtLink
                      :to="`/groups/${website.id}/manage-signup-form`"
                      class="plain block"
                    >
                      Signup Form
                    </NuxtLink>
                    <NuxtLink
                      :to="`/groups/${website.id}/manage-members`"
                      class="plain block"
                    >
                      Members
                    </NuxtLink>
                    <NuxtLink
                      :to="`/groups/${website.id}/manage-announcements`"
                      class="plain block"
                    >
                      Announcements
                    </NuxtLink>
                    <NuxtLink
                      :to="`/groups/${website.id}/manage-links`"
                      class="plain block"
                    >
                      Links
                    </NuxtLink>
                  </template>
                  <NuxtLink
                    :to="`/groups/${website.id}/manage-events`"
                    class="plain block"
                  >
                    Events
                  </NuxtLink>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

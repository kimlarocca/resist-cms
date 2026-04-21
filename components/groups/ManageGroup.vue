<template>
  <div v-if="loading" class="flex justify-center items-center py-8">
    <ProgressSpinner
      style="width: 50px; height: 50px"
      strokeWidth="4"
      animationDuration="1s"
    />
  </div>
  <div v-else-if="website">
    <!-- User Management - super_admin only -->
    <div v-if="isSuperAdmin" class="border-blue p-4 mb-6">
      <Tag value="Super Admin" class="mb-6 w-fit" />
      <h3 class="text-lg font-bold mb-4">Manage User Access</h3>

      <Message
        v-if="userManagementError"
        severity="error"
        class="mb-4"
        @close="userManagementError = ''"
      >
        {{ userManagementError }}
      </Message>

      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">Add User to Website</label>
        <div class="flex gap-2">
          <Select
            v-model="selectedUser"
            :options="availableUsers"
            optionLabel="displayName"
            optionValue="id"
            placeholder="Select a user"
            filter
            class="w-full"
            :loading="loadingProfiles"
          />
          <Button
            icon="pi pi-plus"
            label="Add"
            @click="addUserToWebsite"
            :disabled="!selectedUser || addingUser"
            :loading="addingUser"
          />
        </div>
      </div>

      <div v-if="loadingAssignments" class="flex justify-center py-4">
        <ProgressSpinner style="width: 30px; height: 30px" />
      </div>

      <div v-else-if="assignedUsers.length > 0">
        <label class="block text-sm font-medium mb-2">Users with Access</label>
        <DataTable :value="assignedUsers" class="p-datatable-sm">
          <Column field="full_name" header="Name" />
          <Column field="role" header="Role">
            <template #body="{ data }">
              <Tag
                :value="data.role"
                :severity="data.role === 'super_admin' ? 'danger' : 'info'"
              />
            </template>
          </Column>
          <Column style="width: 5rem">
            <template #body="{ data }">
              <Button
                icon="pi pi-trash"
                severity="danger"
                size="small"
                text
                @click="confirmRemoveUser(data)"
                v-tooltip.top="'Remove Access'"
              />
            </template>
          </Column>
        </DataTable>
      </div>
      <div v-else>
        <p class="text-sm text-gray-500">No users assigned to this website yet.</p>
      </div>
    </div>
    <h3 class="text-lg font-bold mt-6 mb-4">Basic Information</h3>
    <div v-if="isSuperAdmin" class="border-blue p-4 mb-6">
      <Tag value="Super Admin" class="mb-6 w-fit" />
      <!-- URL field - editable for super_admin only -->
      <FloatLabel variant="on" class="mb-6">
        <InputText id="url" v-model="url" @change="updateWebsite" />
        <label for="url">Website URL</label>
      </FloatLabel>
      <!-- Slug field - editable for super_admin only -->
      <FloatLabel variant="on" class="mb-6">
        <InputText
          id="slug"
          v-model="slug"
          @blur="validateSlug"
          :class="{ 'p-invalid': slugError }"
        />
        <label for="slug">Slug</label>
      </FloatLabel>
      <small v-if="slugError" class="text-red-500 block -mt-4 mb-4">{{
        slugError
      }}</small>
      <!-- Type field - editable for super_admin only -->
      <FloatLabel variant="on" class="mb-6">
        <Select
          class="w-full"
          id="type"
          v-model="type"
          :options="typeOptions"
          @change="updateWebsite"
        />
        <label for="type">Type</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <Select
          class="w-full"
          id="product"
          v-model="product"
          :options="productOptions"
          @change="updateWebsite"
        />
        <label for="product">Product Tier</label>
      </FloatLabel>
    </div>

    <p v-else class="mb-8">
      <NuxtLink :to="website.url" target="_blank">
        {{ website.url }}<i class="pi pi-external-link plain ml-2" />
      </NuxtLink>
    </p>

    <div class="mb-8">
      <label class="block text-sm font-medium mb-2">Logo Image</label>
      <SupabaseImageUploader
        v-model="logo"
        bucket="logos"
        :website-id="effectiveWebsiteId"
        @update:modelValue="updateWebsite"
      />
    </div>

    <div class="mb-6">
      <FloatLabel variant="on">
        <InputText id="email" v-model="email" type="email" @change="updateWebsite" />
        <label for="email">Email Address</label>
      </FloatLabel>
    </div>

    <div class="mb-6">
      <FloatLabel variant="on">
        <InputText id="title" v-model="title" @change="updateWebsite" />
        <label for="title">Title</label>
      </FloatLabel>
      <p class="text-sm mt-3 text-gray-600">
        <em>
          Your website title is also used for search engine optimization purposes. The
          ideal length is about 50 characters, as longer titles get cut off by Google,
          impacting user clicks.
          <span
            v-if="title?.length"
            class="p-1 rounded text-white"
            :class="title?.length > 50 ? 'bg-red' : 'bg-blue'"
          >
            Characters used: {{ title?.length }}.
          </span></em
        >
      </p>
    </div>

    <div class="mb-4">
      <FloatLabel variant="on">
        <Textarea
          id="description"
          v-model="description"
          rows="3"
          @change="updateWebsite"
        />
        <label for="description">Description</label>
      </FloatLabel>
      <p class="text-sm mt-3 text-gray-600">
        <em>
          Your website description is for search engine optimization purposes. The ideal
          length is about 120 characters, as longer descriptions get cut off by Google,
          impacting user clicks.
          <span
            v-if="description?.length"
            class="p-1 rounded text-white"
            :class="description?.length > 120 ? 'bg-red' : 'bg-blue'"
          >
            Characters used: {{ description?.length }}.
          </span></em
        >
      </p>
    </div>

    <h3 class="text-lg font-bold mt-6 mb-4">Social Media Links</h3>

    <div class="mb-4" v-if="tiktok || showAllSocial">
      <FloatLabel variant="on">
        <InputText
          id="tiktok"
          class="w-full"
          v-model="tiktok"
          type="url"
          :class="{ 'p-invalid': tiktokError }"
          @blur="validateUrl('tiktok')"
        />
        <label for="tiktok">TikTok</label>
      </FloatLabel>
      <small v-if="tiktokError" class="text-red">{{ tiktokError }}</small>
      <small v-else class="text-gray-400">e.g. https://www.tiktok.com/@username</small>
    </div>

    <div class="mb-4" v-if="bluesky || showAllSocial">
      <FloatLabel variant="on">
        <InputText
          id="bluesky"
          class="w-full"
          v-model="bluesky"
          type="url"
          :class="{ 'p-invalid': blueskyError }"
          @blur="validateUrl('bluesky')"
        />
        <label for="bluesky">Bluesky</label>
      </FloatLabel>
      <small v-if="blueskyError" class="text-red">{{ blueskyError }}</small>
      <small v-else class="text-gray-400">e.g. https://bsky.app/profile/username</small>
    </div>

    <div class="mb-4" v-if="facebook || showAllSocial">
      <FloatLabel variant="on">
        <InputText
          id="facebook"
          class="w-full"
          v-model="facebook"
          type="url"
          :class="{ 'p-invalid': facebookError }"
          @blur="validateUrl('facebook')"
        />
        <label for="facebook">Facebook</label>
      </FloatLabel>
      <small v-if="facebookError" class="text-red">{{ facebookError }}</small>
      <small v-else class="text-gray-400">e.g. https://www.facebook.com/username</small>
    </div>

    <div class="mb-4" v-if="instagram || showAllSocial">
      <FloatLabel variant="on">
        <InputText
          id="instagram"
          class="w-full"
          v-model="instagram"
          type="url"
          :class="{ 'p-invalid': instagramError }"
          @blur="validateUrl('instagram')"
        />
        <label for="instagram">Instagram</label>
      </FloatLabel>
      <small v-if="instagramError" class="text-red">{{ instagramError }}</small>
      <small v-else class="text-gray-400">e.g. https://www.instagram.com/username</small>
    </div>

    <div class="mb-4" v-if="youtube || showAllSocial">
      <FloatLabel variant="on">
        <InputText
          id="youtube"
          class="w-full"
          v-model="youtube"
          type="url"
          :class="{ 'p-invalid': youtubeError }"
          @blur="validateUrl('youtube')"
        />
        <label for="youtube">YouTube</label>
      </FloatLabel>
      <small v-if="youtubeError" class="text-red">{{ youtubeError }}</small>
      <small v-else class="text-gray-400">e.g. https://www.youtube.com/@username</small>
    </div>

    <div class="mb-4" v-if="threads || showAllSocial">
      <FloatLabel variant="on">
        <InputText
          id="threads"
          class="w-full"
          v-model="threads"
          type="url"
          :class="{ 'p-invalid': threadsError }"
          @blur="validateUrl('threads')"
        />
        <label for="threads">Threads</label>
      </FloatLabel>
      <small v-if="threadsError" class="text-red">{{ threadsError }}</small>
      <small v-else class="text-gray-400">e.g. https://www.threads.net/@username</small>
    </div>

    <div class="mb-4" v-if="linktree || showAllSocial">
      <FloatLabel variant="on">
        <InputText
          id="linktree"
          class="w-full"
          v-model="linktree"
          type="url"
          :class="{ 'p-invalid': linktreeError }"
          @blur="validateUrl('linktree')"
        />
        <label for="linktree">Linktree</label>
      </FloatLabel>
      <small v-if="linktreeError" class="text-red">{{ linktreeError }}</small>
      <small v-else class="text-gray-400">e.g. https://linktr.ee/username</small>
    </div>

    <div class="mb-4" v-if="twitter || showAllSocial">
      <FloatLabel variant="on">
        <InputText
          id="twitter"
          class="w-full"
          v-model="twitter"
          type="url"
          :class="{ 'p-invalid': twitterError }"
          @blur="validateUrl('twitter')"
        />
        <label for="twitter">X / Twitter</label>
      </FloatLabel>
      <small v-if="twitterError" class="text-red">{{ twitterError }}</small>
      <small v-else class="text-gray-400">e.g. https://x.com/username</small>
    </div>

    <div class="mb-4" v-if="substack || showAllSocial">
      <FloatLabel variant="on">
        <InputText
          id="substack"
          class="w-full"
          v-model="substack"
          type="url"
          :class="{ 'p-invalid': substackError }"
          @blur="validateUrl('substack')"
        />
        <label for="substack">Substack</label>
      </FloatLabel>
      <small v-if="substackError" class="text-red">{{ substackError }}</small>
      <small v-else class="text-gray-400">e.g. https://username.substack.com</small>
    </div>

    <Button
      :label="showAllSocial ? 'Show Less' : 'Add More Social Networks'"
      :icon="showAllSocial ? 'pi pi-chevron-up' : 'pi pi-plus'"
      severity="secondary"
      text
      class="mb-4"
      @click="showAllSocial = !showAllSocial"
    />
    <div v-if="isPaidUser" class="border-blue p-4 my-6">
      <Tag value="Paid Users Only" class="mb-6 w-fit" />
      <h3 class="text-lg font-bold mb-4">Privacy Policy</h3>
      <SimpleEditor id="privacy_policy" v-model="privacyPolicy" rows="4" class="mb-4" />

      <h3 class="text-lg font-bold mt-6 mb-4">Terms &amp; Conditions</h3>
      <SimpleEditor id="terms" v-model="terms" rows="4" class="mb-4" />
    </div>
    <div>
      <Button
        label="Save Changes"
        icon="pi pi-check"
        class="mt-4"
        @click="updateWebsite"
        :disabled="!!slugError"
      />
    </div>
    <div class="changes-saved-toast">
      <Message
        v-if="successMessage"
        class="mb-4"
        severity="success"
        :closable="false"
        :sticky="false"
      >
        Your changes have been saved.
      </Message>
    </div>

    <!-- Confirm Remove User Dialog -->
    <Dialog
      v-model:visible="removeUserDialogVisible"
      header="Confirm Remove User"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="flex items-center gap-3">
        <i class="pi pi-exclamation-triangle text-red-500" style="font-size: 2rem"></i>
        <span>
          Are you sure you want to remove
          <strong>{{ userToRemove?.full_name || userToRemove?.email }}</strong> from this
          website? They will no longer be able to manage it.
        </span>
      </div>
      <template #footer>
        <Button
          label="Cancel"
          severity="secondary"
          @click="removeUserDialogVisible = false"
        />
        <Button
          label="Remove"
          severity="danger"
          @click="removeUserFromWebsite"
          :loading="removingUser"
        />
      </template>
    </Dialog>
  </div>
  <div v-else-if="!loading">
    <p class="text-sm">No website associated with your account.</p>
  </div>
</template>

<script setup>
// Accept website_id as a prop, fallback to currentUserProfile.website_id
const props = defineProps({
  websiteId: {
    type: [String, Number],
    default: null,
  },
})

const currentUserProfile = useCurrentUserProfile()
const supabase = useSupabaseClient()

const website = ref(null)
const loading = ref(true)
const successMessage = ref(false)
const userManagementError = ref("")

// Error states for URL validation
const tiktokError = ref(null)
const blueskyError = ref(null)
const facebookError = ref(null)
const instagramError = ref(null)
const youtubeError = ref(null)
const threadsError = ref(null)
const linktreeError = ref(null)
const twitterError = ref(null)
const substackError = ref(null)
const slugError = ref(null)

// User management refs
const assignedUsers = ref([])
const allProfiles = ref([])
const selectedUser = ref(null)
const loadingAssignments = ref(false)
const loadingProfiles = ref(false)
const addingUser = ref(false)
const removingUser = ref(false)
const userToRemove = ref(null)
const removeUserDialogVisible = ref(false)

// Check if user is super_admin
const isSuperAdmin = computed(() => {
  return currentUserProfile.value?.role === "super_admin"
})

// Check if website is not free (paid user)
const isPaidUser = computed(() => {
  return website.value?.product !== "free" || product.value === "paid"
})

// Type options for the select menu
const typeOptions = ref(["visibility-brigade"])

// Product options for the select menu
const productOptions = ref(["free", "paid"])

// Reactive form fields
const type = ref(null)
const url = ref(null)
const title = ref(null)
const description = ref(null)
const email = ref(null)
const tiktok = ref(null)
const bluesky = ref(null)
const facebook = ref(null)
const instagram = ref(null)
const youtube = ref(null)
const threads = ref(null)
const linktree = ref(null)
const twitter = ref(null)
const substack = ref(null)
const showAllSocial = ref(false)
const privacyPolicy = ref(null)
const terms = ref(null)
const logo = ref(null)
const slug = ref(null)
const product = ref(null)

// Compute the effective website ID to use
const effectiveWebsiteId = computed(() => {
  return props.websiteId || currentUserProfile.value?.website_id
})

// Filter out users who are already assigned
const availableUsers = computed(() => {
  const assignedIds = assignedUsers.value.map((u) => u.id)
  const available = allProfiles.value
    .filter((profile) => !assignedIds.includes(profile.id))
    .map((profile) => ({
      id: profile.id,
      displayName: profile.full_name || "No Name",
    }))
  return available
})

// Check if slug already exists
const checkSlugExists = async (slug, excludeId = null) => {
  const query = supabase.from("websites").select("id").eq("slug", slug)

  if (excludeId) {
    query.neq("id", excludeId)
  }

  const { data, error } = await query

  if (error) throw error
  return data && data.length > 0
}

// Validate slug on blur
const validateSlug = async () => {
  slugError.value = null

  if (!slug.value || slug.value.trim() === "") {
    updateWebsite()
    return
  }

  try {
    const exists = await checkSlugExists(slug.value, effectiveWebsiteId.value)

    if (exists) {
      slugError.value = "This slug is already in use. Please choose a different one."
    } else {
      updateWebsite()
    }
  } catch (error) {
    console.error("Error validating slug:", error)
  }
}

// Validate social media URLs
const normalizeSocialUrl = (field) => {
  const baseUrls = {
    tiktok: { prefix: "https://www.tiktok.com/@", stripAt: true },
    bluesky: { prefix: "https://bsky.app/profile/", stripAt: true },
    facebook: { prefix: "https://www.facebook.com/", stripAt: false },
    instagram: { prefix: "https://www.instagram.com/", stripAt: true },
    youtube: { prefix: "https://www.youtube.com/@", stripAt: true },
    threads: { prefix: "https://www.threads.net/@", stripAt: true },
    linktree: { prefix: "https://linktr.ee/", stripAt: false },
    twitter: { prefix: "https://x.com/", stripAt: true },
    substack: null, // subdomain-based, can't auto-normalize
  }

  const valueMap = {
    tiktok,
    bluesky,
    facebook,
    instagram,
    youtube,
    threads,
    linktree,
    twitter,
    substack,
  }
  const fieldRef = valueMap[field]
  const config = baseUrls[field]

  if (!fieldRef.value || !config) return

  const val = fieldRef.value.trim()
  if (!val || val.startsWith("http")) return

  // Strip leading @ if the platform doesn't use it in its URL
  const handle = config.stripAt ? val.replace(/^@/, "") : val
  fieldRef.value = config.prefix + handle
}

const validateUrl = (field) => {
  const errorMap = {
    tiktok: tiktokError,
    bluesky: blueskyError,
    facebook: facebookError,
    instagram: instagramError,
    youtube: youtubeError,
    threads: threadsError,
    linktree: linktreeError,
    twitter: twitterError,
    substack: substackError,
  }

  const valueMap = {
    tiktok: tiktok,
    bluesky: bluesky,
    facebook: facebook,
    instagram: instagram,
    youtube: youtube,
    threads: threads,
    linktree: linktree,
    twitter: twitter,
    substack: substack,
  }

  const error = errorMap[field]
  const value = valueMap[field]

  normalizeSocialUrl(field)
  error.value = null

  if (value.value && value.value.trim() !== "") {
    try {
      const url = new URL(value.value)
      if (!url.protocol.startsWith("http")) {
        error.value = "URL must start with http:// or https://"
        return
      }
    } catch {
      error.value = "Please enter a valid URL"
      return
    }
  }

  // If valid or empty, update website
  updateWebsite()
}

// Fetch the website data based on website_id from props or currentUserProfile
const fetchWebsite = async () => {
  if (!effectiveWebsiteId.value) {
    loading.value = false
    return
  }

  loading.value = true

  const { data, error } = await supabase
    .from("websites")
    .select("*")
    .eq("id", effectiveWebsiteId.value)
    .single()

  if (error) {
    console.error("Error fetching website:", error)
  } else if (data) {
    website.value = data
    // Populate form fields
    type.value = data.type
    url.value = data.url
    title.value = data.title
    description.value = data.description
    email.value = data.email
    tiktok.value = data.tiktok
    bluesky.value = data.bluesky
    facebook.value = data.facebook
    instagram.value = data.instagram
    youtube.value = data.youtube
    threads.value = data.threads
    linktree.value = data.linktree
    twitter.value = data.twitter
    substack.value = data.substack
    privacyPolicy.value = data.privacy_policy
    terms.value = data.terms
    logo.value = data.logo
    slug.value = data.slug
    product.value = data.product
  }

  loading.value = false
}

// Update website data
const updateWebsite = async () => {
  if (!effectiveWebsiteId.value) {
    return
  }

  // Prevent save if slug is invalid
  if (slugError.value) {
    return
  }

  // Validate slug uniqueness if super admin is updating it
  if (isSuperAdmin.value && slug.value) {
    try {
      const slugExists = await checkSlugExists(slug.value, effectiveWebsiteId.value)
      if (slugExists) {
        slugError.value = "This slug is already in use. Please choose a different one."
        return
      }
    } catch (error) {
      console.error("Error checking slug:", error)
      return
    }
  }

  successMessage.value = false

  const updateData = {
    title: title.value,
    description: description.value,
    email: email.value,
    tiktok: tiktok.value,
    bluesky: bluesky.value,
    facebook: facebook.value,
    instagram: instagram.value,
    youtube: youtube.value,
    threads: threads.value,
    linktree: linktree.value,
    twitter: twitter.value,
    substack: substack.value,
    privacy_policy: privacyPolicy.value,
    terms: terms.value,
    logo: logo.value,
  }

  // Only super_admin can update these fields
  if (isSuperAdmin.value) {
    updateData.type = type.value
    updateData.url = url.value
    updateData.slug = slug.value
    updateData.product = product.value
  }

  const { error } = await supabase
    .from("websites")
    .update(updateData)
    .eq("id", effectiveWebsiteId.value)

  if (error) {
    console.error("Error updating website:", error)
  } else {
    successMessage.value = true
    setTimeout(() => {
      successMessage.value = false
    }, 3000)
  }
}

// Clear slug error when user modifies the slug
watch(
  () => slug.value,
  () => {
    if (slugError.value) {
      slugError.value = null
    }
  }
)

// Fetch users assigned to this website
const fetchAssignedUsers = async () => {
  if (!effectiveWebsiteId.value) return

  loadingAssignments.value = true

  try {
    const { data, error } = await supabase
      .from("websites_users")
      .select(
        `
        user_id,
        profiles:user_id (
          id,
          full_name,
          role
        )
      `
      )
      .eq("website_id", effectiveWebsiteId.value)

    if (error) throw error

    assignedUsers.value =
      data?.map((item) => ({
        id: item.profiles.id,
        full_name: item.profiles.full_name,
        role: item.profiles.role,
      })) || []
  } catch (error) {
    console.error("Error fetching assigned users:", error)
  } finally {
    loadingAssignments.value = false
  }
}

// Fetch all profiles for user selection
const fetchAllProfiles = async () => {
  loadingProfiles.value = true

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .order("full_name", { ascending: true })

    if (error) throw error

    allProfiles.value = data || []
  } catch (error) {
    console.error("Error fetching profiles:", error)
  } finally {
    loadingProfiles.value = false
  }
}

// Add user to website
const addUserToWebsite = async () => {
  if (!selectedUser.value || !effectiveWebsiteId.value) return

  addingUser.value = true
  userManagementError.value = ""

  try {
    const { error } = await supabase.from("websites_users").insert({
      website_id: effectiveWebsiteId.value,
      user_id: selectedUser.value,
    })

    if (error) throw error

    successMessage.value = true
    setTimeout(() => {
      successMessage.value = false
    }, 3000)

    selectedUser.value = null
    await fetchAssignedUsers()
  } catch (error) {
    console.error("Error adding user to website:", error)
    userManagementError.value =
      error.message || "Failed to add user. They may already have access."
  } finally {
    addingUser.value = false
  }
}

// Confirm remove user
const confirmRemoveUser = (user) => {
  userToRemove.value = user
  removeUserDialogVisible.value = true
}

// Remove user from website
const removeUserFromWebsite = async () => {
  if (!userToRemove.value || !effectiveWebsiteId.value) return

  removingUser.value = true
  userManagementError.value = ""

  try {
    const { error } = await supabase
      .from("websites_users")
      .delete()
      .eq("website_id", effectiveWebsiteId.value)
      .eq("user_id", userToRemove.value.id)

    if (error) throw error

    successMessage.value = true
    setTimeout(() => {
      successMessage.value = false
    }, 3000)

    removeUserDialogVisible.value = false
    await fetchAssignedUsers()
  } catch (error) {
    console.error("Error removing user from website:", error)
    userManagementError.value = error.message || "Failed to remove user."
    removeUserDialogVisible.value = false
  } finally {
    removingUser.value = false
  }
}

// Watch for changes in websiteId prop and refetch
watch(
  () => props.websiteId,
  () => {
    fetchWebsite()
    if (isSuperAdmin.value) {
      fetchAssignedUsers()
    }
  }
)

// Watch for super admin status to load user management data
watch(
  [() => isSuperAdmin.value, () => effectiveWebsiteId.value],
  ([isAdmin, websiteId]) => {
    if (isAdmin && websiteId) {
      fetchAllProfiles()
      fetchAssignedUsers()
    }
  },
  { immediate: true }
)

// Fetch website data on component mount
fetchWebsite()
</script>

<style scoped>
.changes-saved-toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
}
</style>

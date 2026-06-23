<template>
  <div v-if="profile && profile.length > 0" class="settings container p-4">
    <Html lang="en">
      <Head>
        <Title>Account Settings</Title>
      </Head>
    </Html>
    <h1 class="mb-8">Account Settings</h1>
    <div id="profile">
      <h3 class="mb-4">Your Profile</h3>
      <manage-user-profile />
      <supabase-upload-image :image="avatarImage || ''" class="mb-6" />
    </div>
    <Divider class="my-16" />

    <!-- My Groups -->
    <div id="my-groups">
      <h3 class="mb-4">My Groups</h3>
      <ProgressSpinner v-if="loadingGroups" class="my-4" />
      <p v-else-if="myGroups.length === 0" class="text-gray-500">
        You are not a member of any groups.
      </p>
      <DataTable v-else :value="myGroups" class="mb-4">
        <Column field="title" header="Group Name">
          <template #body="{ data }">
            <a
              v-if="data.url || data.slug"
              :href="data.url || `https://resistcms.com/${data.slug}`"
              target="_blank"
              rel="noopener noreferrer"
              class="plain font-semibold"
            >
              {{ data.title || "Untitled" }}
              <i class="pi pi-external-link text-xs ml-1" />
            </a>
            <span v-else class="font-semibold">{{ data.title || "Untitled" }}</span>
          </template>
        </Column>
        <Column header="Team Site">
          <template #body="{ data }">
            <NuxtLink
              v-if="data.status === 'member'"
              :to="`/groups/${data.website_id}/portal`"
              class="plain text-sm"
            >
              Team Site <i class="pi pi-arrow-right text-xs ml-1" />
            </NuxtLink>
          </template>
        </Column>
        <Column header="Actions">
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button
                v-if="data.status === 'member'"
                label="Leave Group"
                icon="pi pi-sign-out"
                severity="danger"
                size="small"
                outlined
                @click="confirmLeave(data)"
              />
              <Button
                v-else-if="data.status === 'invited'"
                label="Join Group"
                icon="pi pi-check"
                severity="success"
                size="small"
                :loading="acceptingId === data.website_id"
                @click="acceptInvite(data)"
              />
              <Button
                v-if="data.status === 'invited'"
                label="Decline Invite"
                icon="pi pi-times"
                severity="secondary"
                size="small"
                outlined
                :loading="decliningId === data.website_id"
                @click="declineInvite(data)"
              />
              <Tag v-if="data.status === 'signup'" value="Under Review" severity="warn" />
            </div>
          </template>
        </Column>
      </DataTable>
      <Message v-if="groupActionError" severity="error" class="mt-2">{{
        groupActionError
      }}</Message>
    </div>

    <!-- Leave Group confirmation dialog -->
    <Dialog
      v-model:visible="leaveDialogVisible"
      modal
      header="Leave Group"
      :style="{ width: '24rem' }"
    >
      <p class="mb-0">
        Are you sure you want to leave
        <strong>{{ leaveTarget?.title }}</strong
        >?
      </p>
      <template #footer>
        <Button label="Cancel" severity="secondary" @click="leaveDialogVisible = false" />
        <Button
          label="Leave Group"
          icon="pi pi-sign-out"
          severity="danger"
          :loading="leavingGroup"
          @click="leaveGroup"
        />
      </template>
    </Dialog>

    <Divider class="my-16" />
    <div id="delete">
      <h3 class="mb-4">Delete Account</h3>
      <p>
        Please <a href="mailto:delete@resistcms.com">contact us</a> if you wish to delete
        your account.
      </p>
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
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "auth",
})

const currentUser = useSupabaseUser()
const supabase = useSupabaseClient()
const route = useRoute()

const avatarImage = ref(null)
const hash = ref(null)
const profile = ref([])
const successMessage = ref(false)
const userType = ref(null)

// My Groups
const myGroups = ref([])
const loadingGroups = ref(true)
const groupActionError = ref("")
const acceptingId = ref(null)
const decliningId = ref(null)
const leaveDialogVisible = ref(false)
const leaveTarget = ref(null)
const leavingGroup = ref(false)

const fetchMyGroups = async () => {
  if (!currentUser.value?.sub) return
  loadingGroups.value = true
  const { data, error } = await supabase
    .from("websites_users")
    .select(`website_id, status, websites:website_id (id, title, url, slug)`)
    .eq("user_id", currentUser.value.sub)
  if (!error && data) {
    myGroups.value = data.map((r) => ({
      website_id: r.website_id,
      status: r.status || "member",
      ...(r.websites || {}),
    }))
  }
  loadingGroups.value = false
}

const acceptInvite = async (group) => {
  acceptingId.value = group.website_id
  groupActionError.value = ""
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    await $fetch("/api/accept-group-invite", {
      method: "POST",
      body: { websiteId: group.website_id },
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    await fetchMyGroups()
  } catch (e) {
    groupActionError.value = e?.data?.message || "Failed to accept invitation."
  } finally {
    acceptingId.value = null
  }
}

const declineInvite = async (group) => {
  decliningId.value = group.website_id
  groupActionError.value = ""
  try {
    await supabase
      .from("websites_users")
      .delete()
      .eq("user_id", currentUser.value.sub)
      .eq("website_id", group.website_id)
    await fetchMyGroups()
  } catch (e) {
    groupActionError.value = "Failed to decline invitation."
  } finally {
    decliningId.value = null
  }
}

const confirmLeave = (group) => {
  leaveTarget.value = group
  leaveDialogVisible.value = true
}

const leaveGroup = async () => {
  if (!leaveTarget.value) return
  leavingGroup.value = true
  groupActionError.value = ""
  try {
    await supabase
      .from("websites_users")
      .delete()
      .eq("user_id", currentUser.value.sub)
      .eq("website_id", leaveTarget.value.website_id)
    leaveDialogVisible.value = false
    leaveTarget.value = null
    await fetchMyGroups()
  } catch (e) {
    groupActionError.value = "Failed to leave group."
  } finally {
    leavingGroup.value = false
  }
}

onMounted(() => {
  // set hash name
  hash.value = route.hash
  // if hash exists, scroll down to that id
  if (window.location.hash) {
    const element = document.getElementById(window.location.hash.slice(1))
    if (element) {
      element.scrollIntoView()
      hash.value = window.location.hash
    }
  }
  fetchMyGroups()
})

// watch for route.hash changes
watch(
  () => route.hash,
  (newVal) => {
    hash.value = newVal
  }
)

// get the profile for the logged in user
let { data } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", currentUser.value?.sub)
  .limit(1)
if (data) {
  profile.value = data
  avatarImage.value = data[0]?.avatar_url
  userType.value = data[0]?.user_type
}
</script>

<style lang="scss">
.settings {
  position: relative;
}
.settings nav {
  a,
  a:visited,
  a:active {
    color: var(--gray);
    font-weight: 500;
    &.active,
    &:hover {
      color: var(--green);
    }
  }
}
</style>

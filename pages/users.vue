<script setup>
import { useCurrentUserProfile } from "~/composables/states"
definePageMeta({
  middleware: "auth",
})

const supabase = useSupabaseClient()
const currentUserProfile = useCurrentUserProfile()

// Guard: only super_admin
watch(
  () => currentUserProfile.value?.role,
  (role) => {
    if (role && role !== "super_admin") navigateTo("/dashboard")
  },
  { immediate: true }
)

const users = ref([])
const loading = ref(true)
const search = ref("")
const roleFilter = ref(null)
const groupFilter = ref(null)
const electionFilter = ref(null)
const errorMessage = ref("")

// Groups and elections for filter dropdowns
const groups = ref([])
const elections = ref([])
const groupMemberSet = ref({}) // { userId: Set<websiteId> }
const raceAdminMap = ref({}) // { raceId: userId }

const allRoles = [
  { label: "Member", value: "member" },
  { label: "Event Manager", value: "event_manager" },
  { label: "Group Manager", value: "group_manager" },
  { label: "Group Admin", value: "group_admin" },
  { label: "Election Manager", value: "election_manager" },
  { label: "Super Admin", value: "super_admin" },
]

const roleSeverity = (role) => {
  if (role === "super_admin") return "danger"
  if (role === "group_admin") return "warn"
  if (role === "group_manager") return "info"
  if (role === "election_manager") return "info"
  if (role === "event_manager") return "secondary"
  return "secondary"
}

const roleCounts = computed(() => {
  const counts = { all: users.value.length }
  for (const r of allRoles) counts[r.value] = 0
  for (const u of users.value) {
    const role = u.role || "member"
    if (role in counts) counts[role]++
  }
  return counts
})

const filteredUsers = computed(() => {
  const q = search.value.trim().toLowerCase()
  return users.value.filter((u) => {
    const matchesSearch =
      !q ||
      u.email?.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q) ||
      u.nickname?.toLowerCase().includes(q)
    const matchesRole = !roleFilter.value || u.role === roleFilter.value
    const matchesGroup =
      !groupFilter.value || groupMemberSet.value[u.user_id]?.has(groupFilter.value)
    const matchesElection =
      !electionFilter.value || raceAdminMap.value[electionFilter.value] === u.user_id
    return matchesSearch && matchesRole && matchesGroup && matchesElection
  })
})

const fetchUsers = async () => {
  loading.value = true
  errorMessage.value = ""
  try {
    const [usersData, groupsData, racesData, membershipsData] = await Promise.all([
      $fetch("/api/users"),
      supabase.from("websites").select("id, title").order("title"),
      supabase.from("races").select("id, name, admin_id").order("name"),
      supabase.from("websites_users").select("user_id, website_id"),
    ])

    users.value = usersData || []

    groups.value = groupsData.data || []
    elections.value = (racesData.data || []).filter((r) => r.admin_id)

    // Build group membership lookup
    const memberMap = {}
    for (const row of membershipsData.data || []) {
      if (!memberMap[row.user_id]) memberMap[row.user_id] = new Set()
      memberMap[row.user_id].add(row.website_id)
    }
    groupMemberSet.value = memberMap

    // Build race admin lookup: raceId -> userId
    const adminMap = {}
    for (const race of elections.value) {
      adminMap[race.id] = race.admin_id
    }
    raceAdminMap.value = adminMap
  } catch (err) {
    console.error("Error fetching users:", err)
    errorMessage.value = "Failed to load users."
  } finally {
    loading.value = false
  }
}

const updateRole = async (userId, role) => {
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId)
  if (error) {
    console.error("Error updating role:", error)
    errorMessage.value = "Failed to update role."
  } else {
    const match = users.value.find((u) => u.user_id === userId)
    if (match) match.role = role
  }
}

const formatDate = (val) => {
  if (!val) return "—"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(val))
}

// Delete user
const userToDelete = ref(null)
const deleteDialogVisible = ref(false)
const deleting = ref(false)

const confirmDelete = (user) => {
  userToDelete.value = user
  deleteDialogVisible.value = true
}

const deleteUser = async () => {
  if (!userToDelete.value) return
  deleting.value = true
  try {
    const { error } = await $fetch("/api/delete-user", {
      method: "POST",
      body: { userId: userToDelete.value.user_id },
    })
    if (error) throw new Error(error)
    users.value = users.value.filter((u) => u.user_id !== userToDelete.value.user_id)
    deleteDialogVisible.value = false
    userToDelete.value = null
  } catch (err) {
    errorMessage.value = "Failed to delete user."
    console.error(err)
  } finally {
    deleting.value = false
  }
}

// Group membership dialog
const groupsDialogVisible = ref(false)
const expandedUser = ref(null)
const userGroups = ref([])
const loadingGroups = ref(false)

const toggleGroups = async (user) => {
  expandedUser.value = user
  userGroups.value = []
  loadingGroups.value = true
  groupsDialogVisible.value = true
  const { data, error } = await supabase
    .from("websites_users")
    .select("websites:website_id (id, title, slug)")
    .eq("user_id", user.user_id)
  if (!error) {
    userGroups.value = (data || []).map((r) => r.websites).filter(Boolean)
  }
  loadingGroups.value = false
}

// Elections dialog
const electionsDialogVisible = ref(false)
const electionsUser = ref(null)
const userElections = ref([])
const allRacesInDialog = ref([])
const loadingElections = ref(false)
const selectedElectionToAssign = ref(null)
const assigningElection = ref(false)

const availableRacesForAssign = computed(() =>
  allRacesInDialog.value.filter((r) => r.admin_id !== electionsUser.value?.user_id)
)

const toggleElections = async (user) => {
  electionsUser.value = user
  userElections.value = []
  allRacesInDialog.value = []
  selectedElectionToAssign.value = null
  loadingElections.value = true
  electionsDialogVisible.value = true
  const { data, error } = await supabase
    .from("races")
    .select("id, name, type, state, election_date, admin_id")
    .order("name")
  if (!error) {
    allRacesInDialog.value = data || []
    userElections.value = (data || []).filter((r) => r.admin_id === user.user_id)
  }
  loadingElections.value = false
}

const assignElection = async () => {
  if (!selectedElectionToAssign.value || !electionsUser.value) return
  assigningElection.value = true
  const { error } = await supabase
    .from("races")
    .update({ admin_id: electionsUser.value.user_id })
    .eq("id", selectedElectionToAssign.value)
  if (!error) {
    const race = allRacesInDialog.value.find(
      (r) => r.id === selectedElectionToAssign.value
    )
    if (race) {
      race.admin_id = electionsUser.value.user_id
      userElections.value = [...userElections.value, race]
    }
    selectedElectionToAssign.value = null
  }
  assigningElection.value = false
}

const removeFromElection = async (raceId) => {
  const { error } = await supabase
    .from("races")
    .update({ admin_id: null })
    .eq("id", raceId)
  if (!error) {
    const race = allRacesInDialog.value.find((r) => r.id === raceId)
    if (race) race.admin_id = null
    userElections.value = userElections.value.filter((r) => r.id !== raceId)
  }
}

// CSV export
const exportCSV = () => {
  const escape = (val) => '"' + String(val ?? "").replace(/"/g, '""') + '"'
  const rows = [["Email", "Full Name", "Nickname", "Role", "Created"]]
  for (const u of filteredUsers.value) {
    rows.push([u.email, u.full_name, u.nickname, u.role, u.created_at])
  }
  const csv = rows.map((r) => r.map(escape).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "users.csv"
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(fetchUsers)
</script>

<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Manage Users</Title>
      </Head>
    </Html>

    <h1 class="mb-4">Manage Users</h1>
    <NuxtLink to="/dashboard" class="plain text-sm">
      <i class="pi pi-arrow-left mr-1" />Back to Dashboard
    </NuxtLink>
    <Divider class="my-7" />

    <Message v-if="errorMessage" severity="error" class="mb-4">{{
      errorMessage
    }}</Message>

    <div v-if="loading" class="flex justify-center py-16">
      <ProgressSpinner />
    </div>

    <div v-else>
      <!-- Toolbar -->
      <div class="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <IconField iconPosition="left" class="w-full">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="search"
            placeholder="Search by name or email..."
            class="w-full"
          />
        </IconField>
        <Select
          v-model="groupFilter"
          :options="groups"
          optionLabel="title"
          optionValue="id"
          placeholder="Filter by Group..."
          showClear
          class="w-full md:w-56"
        />
        <Select
          v-model="electionFilter"
          :options="elections"
          optionLabel="name"
          optionValue="id"
          placeholder="Filter by Election..."
          showClear
          class="w-full md:w-56"
        />
        <div class="flex gap-2 shrink-0">
          <Button
            icon="pi pi-download"
            label="Export CSV"
            size="small"
            severity="secondary"
            @click="exportCSV"
          />
        </div>
      </div>

      <!-- Role filter chips -->
      <div class="flex gap-2 flex-wrap mb-6">
        <Button
          :label="`All (${roleCounts.all})`"
          :severity="roleFilter === null ? 'primary' : 'secondary'"
          size="small"
          @click="roleFilter = null"
        />
        <Button
          v-for="r in allRoles"
          :key="r.value"
          :label="`${r.label} (${roleCounts[r.value] ?? 0})`"
          :severity="roleFilter === r.value ? 'primary' : 'secondary'"
          size="small"
          @click="roleFilter = r.value"
        />
      </div>

      <!-- Table -->
      <DataTable
        :value="filteredUsers"
        :paginator="users.length > 50"
        :rows="50"
        :rowsPerPageOptions="[50, 100, 250]"
        stripedRows
        class="p-datatable-sm"
        emptyMessage="No users found."
        sortField="full_name"
        :sortOrder="1"
      >
        <Column field="email" header="Email" sortable style="min-width: 16rem" />
        <Column field="full_name" header="Name" sortable style="min-width: 12rem">
          <template #body="{ data }">
            <span>{{ data.full_name || "—" }}</span>
            <span v-if="data.nickname" class="text-gray-400 text-xs ml-1"
              >({{ data.nickname }})</span
            >
          </template>
        </Column>
        <Column field="role" header="Role" sortable style="min-width: 13rem">
          <template #body="{ data }">
            <Select
              :key="data.user_id"
              :model-value="data.role"
              :options="allRoles"
              option-label="label"
              option-value="value"
              @update:model-value="updateRole(data.user_id, $event)"
              class="status-select"
              :pt="{
                root: { class: 'border-0 shadow-none p-0 bg-transparent' },
                label: { class: 'p-0' },
                dropdown: { class: 'hidden' },
              }"
            >
              <template #value="{ value }">
                <Tag
                  :value="value.replace(/_/g, ' ')"
                  :severity="roleSeverity(value)"
                  class="capitalize cursor-pointer"
                />
              </template>
            </Select>
          </template>
        </Column>
        <Column field="created_at" header="Created" sortable style="min-width: 10rem">
          <template #body="{ data }">{{ formatDate(data.created_at) }}</template>
        </Column>
        <Column header="" style="width: 8rem">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Button
                icon="pi pi-sitemap"
                size="small"
                text
                severity="secondary"
                v-tooltip.top="'View groups'"
                @click="toggleGroups(data)"
              />
              <Button
                icon="pi pi-flag"
                size="small"
                text
                severity="secondary"
                v-tooltip.top="'View elections'"
                @click="toggleElections(data)"
              />
              <Button
                icon="pi pi-trash"
                size="small"
                text
                severity="danger"
                v-tooltip.top="'Delete user'"
                @click="confirmDelete(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>

      <!-- Groups Dialog -->
      <Dialog
        v-model:visible="groupsDialogVisible"
        modal
        :header="`Groups for ${expandedUser?.full_name || expandedUser?.email}`"
        :style="{ width: '30rem' }"
      >
        <ProgressSpinner v-if="loadingGroups" class="my-4" />
        <p v-else-if="userGroups.length === 0" class="text-gray-500 text-sm">
          Not a member of any groups.
        </p>
        <div v-else class="flex flex-wrap gap-2">
          <NuxtLink
            v-for="g in userGroups"
            :key="g.id"
            :to="`/groups/${g.id}/manage-members`"
            class="plain"
          >
            <Tag :value="g.title" severity="secondary" class="cursor-pointer" />
          </NuxtLink>
        </div>
        <template #footer>
          <Button
            label="Close"
            severity="secondary"
            @click="groupsDialogVisible = false"
          />
        </template>
      </Dialog>

      <!-- Elections Dialog -->
      <Dialog
        v-model:visible="electionsDialogVisible"
        modal
        :header="`Elections for ${electionsUser?.full_name || electionsUser?.email}`"
        :style="{ width: '36rem' }"
      >
        <ProgressSpinner v-if="loadingElections" class="my-4" />
        <div v-else>
          <p v-if="userElections.length === 0" class="text-gray-500 text-sm mb-4">
            Not an admin of any elections.
          </p>
          <div v-else class="flex flex-col gap-2 mb-4">
            <div
              v-for="e in userElections"
              :key="e.id"
              class="flex items-center justify-between rounded-lg bg-gray px-4 py-3"
            >
              <div>
                <p class="font-medium text-sm">{{ e.name }}</p>
                <p class="text-xs text-gray-500">
                  {{ [e.type, e.state].filter(Boolean).join(" · ") }}
                  <span v-if="e.election_date">
                    · {{ formatDate(e.election_date) }}
                  </span>
                </p>
              </div>
              <Button
                icon="pi pi-times"
                size="small"
                text
                severity="danger"
                v-tooltip.top="'Remove from election'"
                @click="removeFromElection(e.id)"
              />
            </div>
          </div>

          <Divider />
          <p class="text-sm font-medium mb-2">Assign to an election</p>
          <div class="flex gap-2">
            <Select
              v-model="selectedElectionToAssign"
              :options="availableRacesForAssign"
              optionLabel="name"
              optionValue="id"
              placeholder="Choose an election..."
              showClear
              class="flex-1"
            />
            <Button
              label="Assign"
              icon="pi pi-check"
              :disabled="!selectedElectionToAssign"
              :loading="assigningElection"
              @click="assignElection"
            />
          </div>
        </div>
        <template #footer>
          <Button
            label="Close"
            severity="secondary"
            @click="electionsDialogVisible = false"
          />
        </template>
      </Dialog>
    </div>

    <!-- Delete User Dialog -->
    <Dialog
      v-model:visible="deleteDialogVisible"
      modal
      header="Delete User"
      :style="{ width: '30rem' }"
    >
      <div class="flex items-center gap-3">
        <i class="pi pi-exclamation-triangle text-red-500" style="font-size: 2rem" />
        <span>
          Permanently delete <strong>{{ userToDelete?.email }}</strong
          >? This cannot be undone and will remove their account and all associated data.
        </span>
      </div>
      <template #footer>
        <Button
          label="Cancel"
          severity="secondary"
          @click="deleteDialogVisible = false"
          :disabled="deleting"
        />
        <Button
          label="Delete"
          severity="danger"
          :loading="deleting"
          @click="deleteUser"
        />
      </template>
    </Dialog>
  </div>
</template>

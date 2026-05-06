<script setup>
import { useCurrentUserProfile } from "~/composables/states"
definePageMeta({
  middleware: "auth",
})

const route = useRoute()
const supabase = useSupabaseClient()
const websiteId = computed(() => route.params.id)
const currentUserProfile = useCurrentUserProfile()

// Permission helpers
const myRole = computed(() => currentUserProfile.value?.role || "member")
const isSuperAdmin = computed(() => myRole.value === "super_admin")
const isGroupAdmin = computed(() => myRole.value === "group_admin")
const isGroupManager = computed(() => myRole.value === "group_manager")

// Can the current user edit THIS member's role?
const canEditRole = (memberRole) => {
  if (isSuperAdmin.value) return true
  if (isGroupAdmin.value) return true
  // Group managers cannot edit super_admin or group_admin
  if (isGroupManager.value)
    return memberRole !== "super_admin" && memberRole !== "group_admin"
  return false
}

// Role options available to the current user when editing a member
const roleOptionsForMember = (memberRole) => {
  const all = [
    { label: "Member", value: "member" },
    { label: "Event Manager", value: "event_manager" },
    { label: "Group Manager", value: "group_manager" },
    { label: "Group Admin", value: "group_admin" },
  ]
  if (isSuperAdmin.value || isGroupAdmin.value) return all
  // Group managers: cannot set group_admin, and current role must not be super_admin/group_admin
  return all.filter((o) => o.value !== "group_admin")
}

// Can the current user remove/ban THIS member?
const canRemoveMember = (memberRole) => {
  if (isSuperAdmin.value) return true
  if (isGroupAdmin.value)
    return memberRole !== "super_admin" && memberRole !== "group_admin"
  if (isGroupManager.value)
    return (
      memberRole !== "super_admin" &&
      memberRole !== "group_admin" &&
      memberRole !== "group_manager"
    )
  return false
}

const submissions = ref([])
const loading = ref(true)
const errorMessage = ref("")
const selectedSubmission = ref(null)
const dialogVisible = ref(false)
const submissionToDelete = ref(null)
const deleteDialogVisible = ref(false)
const deleting = ref(false)
const search = ref("")
const statusFilter = ref(null)
const inviteDialogVisible = ref(false)
const submissionToInvite = ref(null)
const inviting = ref(false)
const inviteError = ref("")

const statusSortOrder = { pending: 0, invited: 1, active: 2, denied: 3, banned: 4 }

const filteredSubmissions = computed(() => {
  return submissions.value
    .filter((s) => {
      const q = search.value.trim().toLowerCase()
      const firstName = s.form_data?.["First Name"]?.toLowerCase() || ""
      const lastName = s.form_data?.["Last Name"]?.toLowerCase() || ""
      const matchesEmail =
        !q ||
        s.email?.toLowerCase().includes(q) ||
        firstName.includes(q) ||
        lastName.includes(q) ||
        `${firstName} ${lastName}`.includes(q)
      const matchesStatus =
        !statusFilter.value || (s.status || "pending") === statusFilter.value
      return matchesEmail && matchesStatus
    })
    .sort((a, b) => {
      const statusDiff =
        (statusSortOrder[a.status || "pending"] ?? 0) -
        (statusSortOrder[b.status || "pending"] ?? 0)
      if (statusDiff !== 0) return statusDiff
      return (a.email || "").localeCompare(b.email || "")
    })
})

const fetchSubmissions = async () => {
  loading.value = true
  errorMessage.value = ""

  const { data, error } = await supabase
    .from("visibility-brigade-submissions")
    .select("*")
    .eq("website_id", websiteId.value)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching submissions:", error)
    errorMessage.value = "Failed to load submissions."
  } else {
    submissions.value = data.map((s) => ({
      ...s,
      full_name:
        [s.form_data?.["First Name"], s.form_data?.["Last Name"]]
          .filter(Boolean)
          .join(" ") || "",
    }))
  }

  loading.value = false
}

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Invited", value: "invited" },
  { label: "Denied", value: "denied" },
  { label: "Banned", value: "banned" },
]

const statusCounts = computed(() => {
  const counts = {
    all: submissions.value.length,
    pending: 0,
    invited: 0,
    active: 0,
    denied: 0,
    banned: 0,
  }
  for (const s of submissions.value) {
    const status = s.status || "pending"
    if (status in counts) counts[status]++
  }
  return counts
})

const statusSeverity = (status) => {
  if (status === "active") return "success"
  if (status === "denied") return "danger"
  if (status === "banned") return "danger"
  if (status === "invited") return "info"
  return "warn"
}

const confirmInvite = (submission) => {
  submissionToInvite.value = submission
  inviteError.value = ""
  inviteDialogVisible.value = true
}

const sendInvite = async () => {
  inviting.value = true
  inviteError.value = ""

  const { error } = await useFetch("/api/invite-user", {
    method: "POST",
    body: {
      email: submissionToInvite.value.email,
      websiteId: websiteId.value,
      submissionId: submissionToInvite.value.id,
    },
  })

  if (error.value) {
    inviteError.value = error.value?.data?.message || "Failed to send invitation."
    inviting.value = false
    return
  }

  await updateStatus(submissionToInvite.value.id, "invited")
  inviteDialogVisible.value = false
  submissionToInvite.value = null
  inviting.value = false
}

const updateStatus = async (submissionId, status) => {
  const { error } = await supabase
    .from("visibility-brigade-submissions")
    .update({ status })
    .eq("id", submissionId)

  if (error) {
    console.error("Error updating status:", error)
  } else {
    const match = submissions.value.find((s) => s.id === submissionId)
    if (match) match.status = status
  }
}

const viewSubmission = (submission) => {
  selectedSubmission.value = submission
  dialogVisible.value = true
}

const confirmDelete = (submission) => {
  submissionToDelete.value = submission
  deleteDialogVisible.value = true
}

const deleteSubmission = async () => {
  deleting.value = true
  const { error } = await supabase
    .from("visibility-brigade-submissions")
    .delete()
    .eq("id", submissionToDelete.value.id)

  if (error) {
    console.error("Error deleting submission:", error)
  } else {
    submissions.value = submissions.value.filter(
      (s) => s.id !== submissionToDelete.value.id
    )
    if (selectedSubmission.value?.id === submissionToDelete.value.id) {
      dialogVisible.value = false
      selectedSubmission.value = null
    }
    deleteDialogVisible.value = false
    submissionToDelete.value = null
  }
  deleting.value = false
}

const formDataEntries = computed(() => {
  if (!selectedSubmission.value?.form_data) return []
  return Object.entries(selectedSubmission.value.form_data).map(([key, value]) => ({
    key,
    value: Array.isArray(value)
      ? value.join(", ")
      : value === true
      ? "Yes"
      : value === false
      ? "No"
      : value || "—",
  }))
})

const clearFilters = () => {
  search.value = ""
  statusFilter.value = null
}

// Direct invite (new member)
const inviteNewDialogVisible = ref(false)
const inviteNewForm = ref({ email: "", firstName: "", lastName: "" })
const inviteNewLoading = ref(false)
const inviteNewError = ref("")

const openInviteNewDialog = () => {
  inviteNewForm.value = { email: "", firstName: "", lastName: "" }
  inviteNewError.value = ""
  inviteNewDialogVisible.value = true
}

const sendDirectInvite = async () => {
  inviteNewError.value = ""
  const email = inviteNewForm.value.email.trim()
  const firstName = inviteNewForm.value.firstName.trim()
  const lastName = inviteNewForm.value.lastName.trim()

  if (!email) {
    inviteNewError.value = "Email is required."
    return
  }
  if (!firstName) {
    inviteNewError.value = "First name is required."
    return
  }
  if (!lastName) {
    inviteNewError.value = "Last name is required."
    return
  }

  inviteNewLoading.value = true

  // Insert submission record first
  const { data: newSub, error: subError } = await supabase
    .from("visibility-brigade-submissions")
    .insert({
      website_id: websiteId.value,
      email,
      status: "invited",
      form_data: {
        "First Name": firstName,
        "Last Name": lastName,
        Email: email,
      },
    })
    .select()
    .single()

  if (subError) {
    inviteNewError.value = subError.message || "Failed to create submission."
    inviteNewLoading.value = false
    return
  }

  // Send invite email
  const { error: inviteError } = await useFetch("/api/invite-user", {
    method: "POST",
    body: { email, websiteId: websiteId.value, submissionId: newSub.id },
  })

  if (inviteError.value) {
    inviteNewError.value =
      inviteError.value?.data?.message || "Failed to send invitation."
    // Roll back the submission
    await supabase.from("visibility-brigade-submissions").delete().eq("id", newSub.id)
    inviteNewLoading.value = false
    return
  }

  // Add to local submissions list
  submissions.value.unshift({
    ...newSub,
    full_name: [firstName, lastName].filter(Boolean).join(" ") || "",
  })

  inviteNewDialogVisible.value = false
  inviteNewLoading.value = false
}
const members = ref([])
const loadingMembers = ref(true)
const memberSearch = ref("")
const memberRoleFilter = ref(null)

const memberRoleCounts = computed(() => {
  const counts = {
    all: members.value.length,
    member: 0,
    event_manager: 0,
    group_manager: 0,
    group_admin: 0,
  }
  for (const m of members.value) {
    const role = m.role || "member"
    if (role in counts) counts[role]++
  }
  return counts
})

const filteredMembers = computed(() => {
  const q = memberSearch.value.trim().toLowerCase()
  return members.value.filter((m) => {
    const matchesSearch =
      !q || m.full_name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q)
    const matchesRole =
      !memberRoleFilter.value || (m.role || "member") === memberRoleFilter.value
    return matchesSearch && matchesRole
  })
})

const memberRoleSeverity = (role) => {
  if (role === "super_admin") return "danger"
  if (role === "group_admin") return "warn"
  if (role === "group_manager") return "info"
  return "secondary"
}

const fetchMembers = async () => {
  loadingMembers.value = true
  try {
    const data = await $fetch("/api/group-members", {
      query: { websiteId: websiteId.value },
    })
    members.value = data || []
  } catch (err) {
    console.error("Error fetching members:", err)
  } finally {
    loadingMembers.value = false
  }
}

const updateMemberRole = async (userId, role) => {
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId)
  if (error) {
    console.error("Error updating member role:", error)
  } else {
    const match = members.value.find((m) => m.user_id === userId)
    if (match) match.role = role
  }
}

const memberRoleOptions = [
  { label: "Member", value: "member" },
  { label: "Event Manager", value: "event_manager" },
  { label: "Group Manager", value: "group_manager" },
  { label: "Group Admin", value: "group_admin" },
]

const memberToRemove = ref(null)
const removeMemberDialogVisible = ref(false)
const removingMember = ref(false)

const memberToBan = ref(null)
const banMemberDialogVisible = ref(false)
const banningMember = ref(false)

const confirmRemoveMember = (member) => {
  memberToRemove.value = member
  removeMemberDialogVisible.value = true
}

const confirmBanMember = (member) => {
  memberToBan.value = member
  banMemberDialogVisible.value = true
}

const removeMember = async () => {
  removingMember.value = true
  const { error } = await supabase
    .from("websites_users")
    .delete()
    .eq("website_id", websiteId.value)
    .eq("user_id", memberToRemove.value.user_id)
  if (error) {
    console.error("Error removing member:", error)
  } else {
    // Deny any form submissions from this member in this group
    if (memberToRemove.value.email) {
      const { error: subError } = await supabase
        .from("visibility-brigade-submissions")
        .update({ status: "denied" })
        .eq("website_id", websiteId.value)
        .eq("email", memberToRemove.value.email)
      if (subError) {
        console.error("Error updating submission status:", subError)
      } else {
        // Update local submissions state
        submissions.value.forEach((s) => {
          if (s.email === memberToRemove.value.email) s.status = "denied"
        })
      }
    }
    members.value = members.value.filter(
      (m) => m.user_id !== memberToRemove.value.user_id
    )
    removeMemberDialogVisible.value = false
    memberToRemove.value = null
  }
  removingMember.value = false
}

const banMember = async () => {
  banningMember.value = true
  const { error } = await supabase
    .from("websites_users")
    .delete()
    .eq("website_id", websiteId.value)
    .eq("user_id", memberToBan.value.user_id)
  if (error) {
    console.error("Error banning member:", error)
  } else {
    if (memberToBan.value.email) {
      const { error: subError } = await supabase
        .from("visibility-brigade-submissions")
        .update({ status: "banned" })
        .eq("website_id", websiteId.value)
        .eq("email", memberToBan.value.email)
      if (subError) {
        console.error("Error updating submission status:", subError)
      } else {
        submissions.value.forEach((s) => {
          if (s.email === memberToBan.value.email) s.status = "banned"
        })
      }
    }
    members.value = members.value.filter((m) => m.user_id !== memberToBan.value.user_id)
    banMemberDialogVisible.value = false
    memberToBan.value = null
  }
  banningMember.value = false
}

onMounted(() => {
  fetchSubmissions()
  fetchMembers()
})

const csvEscape = (val) => {
  if (val == null) return '""'
  const str = String(val)
  return '"' + str.replace(/"/g, '""') + '"'
}

const emailsCopied = ref(false)

const copyEmails = async () => {
  const emails = filteredMembers.value
    .map((m) => m.email)
    .filter(Boolean)
    .join(", ")
  await navigator.clipboard.writeText(emails)
  emailsCopied.value = true
  setTimeout(() => (emailsCopied.value = false), 2000)
}

const exportMembersCSV = () => {
  const rows = [["Email", "First Name", "Last Name"]]

  // Build a lookup map from submissions: email -> { firstName, lastName }
  const submissionMap = {}
  for (const s of submissions.value) {
    if (s.email) {
      submissionMap[s.email.toLowerCase()] = {
        firstName: s.form_data?.["First Name"] || "",
        lastName: s.form_data?.["Last Name"] || "",
      }
    }
  }

  for (const m of filteredMembers.value) {
    const email = m.email || ""
    const sub = submissionMap[email.toLowerCase()]
    let firstName = sub?.firstName || ""
    let lastName = sub?.lastName || ""

    // Fallback: split full_name if no submission data
    if (!firstName && !lastName && m.full_name) {
      const parts = m.full_name.trim().split(/\s+/)
      firstName = parts[0] || ""
      lastName = parts.slice(1).join(" ") || ""
    }

    rows.push([email, firstName, lastName])
  }

  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `group-members.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const { data: website } = await useAsyncData(`website-${websiteId.value}`, () =>
  getWebsiteData(websiteId.value)
)
</script>

<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Member Management</Title>
      </Head>
    </Html>
    <h1>Member Management</h1>
    <Divider class="my-7" />
    <div class="flex items-center justify-between mb-12">
      <h2 v-if="website?.title">{{ website?.title }}</h2>
      <Button
        label="Invite New Member"
        icon="pi pi-user-plus"
        @click="openInviteNewDialog"
      />
    </div>

    <Message v-if="errorMessage" severity="error" class="mb-4">{{
      errorMessage
    }}</Message>

    <!-- Members section -->
    <div class="mb-16">
      <div class="flex items-center gap-4 mb-6">
        <h3>Group Members</h3>
        <Button
          v-if="members.length > 0"
          label="Export CSV"
          icon="pi pi-download"
          size="small"
          severity="secondary"
          @click="exportMembersCSV"
        />
        <Button
          v-if="members.length > 0"
          :label="emailsCopied ? 'Copied!' : 'Copy Emails'"
          :icon="emailsCopied ? 'pi pi-check' : 'pi pi-copy'"
          size="small"
          severity="secondary"
          @click="copyEmails"
        />
      </div>
      <div v-if="loadingMembers" class="flex justify-center py-8">
        <ProgressSpinner />
      </div>
      <div v-else-if="members.length === 0">
        <p class="text-gray-500">No members yet.</p>
      </div>
      <div v-else>
        <div class="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          <IconField iconPosition="left" class="w-full">
            <InputIcon class="pi pi-search" />
            <InputText v-model="memberSearch" placeholder="Filter by name or email..." />
          </IconField>
          <div class="flex gap-2 shrink-0 flex-wrap">
            <Button
              :label="`All (${memberRoleCounts.all})`"
              :severity="memberRoleFilter === null ? 'primary' : 'secondary'"
              size="small"
              @click="memberRoleFilter = null"
            />
            <Button
              :label="`Member (${memberRoleCounts.member})`"
              :severity="memberRoleFilter === 'member' ? 'primary' : 'secondary'"
              size="small"
              @click="memberRoleFilter = 'member'"
            />
            <Button
              :label="`Event Manager (${memberRoleCounts.event_manager})`"
              :severity="memberRoleFilter === 'event_manager' ? 'primary' : 'secondary'"
              size="small"
              @click="memberRoleFilter = 'event_manager'"
            />
            <Button
              :label="`Group Manager (${memberRoleCounts.group_manager})`"
              :severity="memberRoleFilter === 'group_manager' ? 'primary' : 'secondary'"
              size="small"
              @click="memberRoleFilter = 'group_manager'"
            />
            <Button
              :label="`Group Admin (${memberRoleCounts.group_admin})`"
              :severity="memberRoleFilter === 'group_admin' ? 'primary' : 'secondary'"
              size="small"
              @click="memberRoleFilter = 'group_admin'"
            />
          </div>
        </div>
        <DataTable
          :value="filteredMembers"
          :paginator="members.length > 25"
          :rows="25"
          stripedRows
          class="p-datatable-sm"
          emptyMessage="No members found."
        >
          <Column field="full_name" header="Name" sortable style="min-width: 12rem">
            <template #body="{ data }">
              {{ data.full_name || "—" }}
            </template>
          </Column>
          <Column field="email" header="Email" sortable style="min-width: 14rem">
            <template #body="{ data }">
              {{ data.email || "—" }}
            </template>
          </Column>
          <Column field="role" header="Role" sortable style="min-width: 12rem">
            <template #body="{ data }">
              <Select
                v-if="canEditRole(data.role)"
                :key="data.user_id"
                :model-value="data.role"
                :options="roleOptionsForMember(data.role)"
                option-label="label"
                option-value="value"
                @update:model-value="updateMemberRole(data.user_id, $event)"
                class="status-select"
                :pt="{
                  root: { class: 'border-0 shadow-none p-0 bg-transparent' },
                  label: { class: 'p-0' },
                  dropdown: { class: 'hidden' },
                }"
              >
                <template #value="{ value }">
                  <Tag
                    :value="value.replace('_', ' ')"
                    :severity="memberRoleSeverity(value)"
                    class="capitalize cursor-pointer"
                  />
                </template>
              </Select>
              <Tag
                v-else
                :value="data.role.replace('_', ' ')"
                :severity="memberRoleSeverity(data.role)"
                class="capitalize"
              />
            </template>
          </Column>
          <Column field="joined_at" header="Joined" sortable style="min-width: 10rem">
            <template #body="{ data }">
              {{ formatDate(data.joined_at) }}
            </template>
          </Column>
          <Column header="" style="width: 8rem">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button
                  v-if="canRemoveMember(data.role)"
                  icon="pi pi-trash"
                  size="small"
                  severity="danger"
                  text
                  @click="confirmRemoveMember(data)"
                  v-tooltip.top="'Remove from group'"
                />
                <Button
                  v-if="canRemoveMember(data.role)"
                  icon="pi pi-ban"
                  size="small"
                  severity="danger"
                  @click="confirmBanMember(data)"
                  v-tooltip.top="'Ban from group'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-8">
      <ProgressSpinner />
    </div>

    <div v-else>
      <h3 class="mb-6">Signup Form Submissions</h3>
      <p v-if="submissions.length === 0">
        You have not had any Signup form submissions yet.
      </p>
      <template v-else>
        <div class="flex flex-col md:flex-row md:items-center gap-3 mb-6">
          <IconField iconPosition="left" class="w-full">
            <InputIcon class="pi pi-search"> </InputIcon>
            <InputText
              v-model="search"
              placeholder="Filter submissions by name or email..."
            />
          </IconField>
          <div class="flex gap-2 shrink-0 flex-wrap">
            <Button
              :label="`All (${statusCounts.all})`"
              :severity="statusFilter === null ? 'primary' : 'secondary'"
              size="small"
              @click="statusFilter = null"
            />
            <Button
              :label="`Pending (${statusCounts.pending})`"
              :severity="statusFilter === 'pending' ? 'primary' : 'secondary'"
              size="small"
              @click="statusFilter = 'pending'"
            />
            <Button
              :label="`Invited (${statusCounts.invited})`"
              :severity="statusFilter === 'invited' ? 'primary' : 'secondary'"
              size="small"
              @click="statusFilter = 'invited'"
            />
            <Button
              :label="`Active (${statusCounts.active})`"
              :severity="statusFilter === 'active' ? 'primary' : 'secondary'"
              size="small"
              @click="statusFilter = 'active'"
            />
            <Button
              :label="`Denied (${statusCounts.denied})`"
              :severity="statusFilter === 'denied' ? 'primary' : 'secondary'"
              size="small"
              @click="statusFilter = 'denied'"
            />
            <Button
              :label="`Banned (${statusCounts.banned})`"
              :severity="statusFilter === 'banned' ? 'primary' : 'secondary'"
              size="small"
              @click="statusFilter = 'banned'"
            />
          </div>
          <Button
            v-if="search"
            label="Clear"
            severity="secondary"
            size="small"
            icon="pi pi-times"
            @click="clearFilters"
            class="px-4"
          />
        </div>
        <DataTable
          :value="filteredSubmissions"
          :paginator="submissions.length > 25"
          :rows="25"
          :rowsPerPageOptions="[25, 50, 100]"
          stripedRows
          class="p-datatable-sm"
          emptyMessage="No submissions yet."
        >
          <Column field="email" header="Email" sortable style="min-width: 14rem" />
          <Column field="full_name" header="Name" sortable style="min-width: 12rem">
            <template #body="{ data }">
              {{ data.full_name || "—" }}
            </template>
          </Column>
          <Column field="created_at" header="Submitted" sortable style="min-width: 12rem">
            <template #body="{ data }">
              {{ formatDate(data.created_at) }}
            </template>
          </Column>
          <Column field="status" header="Status" sortable style="min-width: 10rem">
            <template #body="{ data }">
              <Select
                :key="data.id"
                :model-value="data.status || 'pending'"
                :options="statusOptions"
                option-label="label"
                option-value="value"
                @update:model-value="updateStatus(data.id, $event)"
                class="status-select"
                :pt="{
                  root: { class: 'border-0 shadow-none p-0 bg-transparent' },
                  label: { class: 'p-0' },
                  dropdown: { class: 'hidden' },
                }"
              >
                <template #value="{ value }">
                  <Tag
                    :value="value"
                    :severity="statusSeverity(value)"
                    class="capitalize cursor-pointer"
                  />
                </template>
              </Select>
            </template>
          </Column>
          <Column header="" style="width: 13rem">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button
                  icon="pi pi-eye"
                  size="small"
                  @click="viewSubmission(data)"
                  v-tooltip.top="'View Details'"
                />
                <Button
                  icon="pi pi-trash"
                  size="small"
                  severity="danger"
                  @click="confirmDelete(data)"
                  v-tooltip.top="'Delete'"
                />
                <Button
                  v-if="(data.status || 'pending') === 'pending'"
                  label="Invite"
                  icon="pi pi-envelope"
                  size="small"
                  severity="info"
                  @click="confirmInvite(data)"
                  v-tooltip.top="'Invite to become a member'"
                />
                <Button
                  v-if="data.status === 'invited'"
                  label="Resend"
                  icon="pi pi-refresh"
                  size="small"
                  severity="info"
                  @click="confirmInvite(data)"
                  v-tooltip.top="'Resend invitation email'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </div>

    <!-- Submission Detail Dialog -->
    <Dialog
      v-model:visible="dialogVisible"
      modal
      header="Form Submission"
      :style="{ width: '80rem', maxWidth: '95vw' }"
      :closable="true"
    >
      <div v-if="selectedSubmission">
        <div class="flex items-center justify-between mb-4">
          <div class="text-sm text-gray-500">
            Submitted: {{ formatDate(selectedSubmission.created_at) }}
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium">Status:</span>
            <Select
              :model-value="selectedSubmission.status || 'pending'"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              @update:model-value="updateStatus(selectedSubmission?.id, $event)"
              class="w-36"
            />
          </div>
        </div>
        <DataTable :value="formDataEntries" class="p-datatable-sm" stripedRows>
          <Column field="key" header="Question" style="width: 40%; font-weight: 600" />
          <Column
            field="value"
            header="Answer"
            style="width: 60%; word-break: break-word"
          />
        </DataTable>
        <div class="flex justify-end mt-6">
          <Button
            label="Delete Submission"
            icon="pi pi-trash"
            severity="danger"
            @click="confirmDelete(selectedSubmission)"
          />
        </div>
      </div>
    </Dialog>

    <!-- Invite New Member Dialog -->
    <Dialog
      v-model:visible="inviteNewDialogVisible"
      modal
      header="Invite New Member"
      :style="{ width: '32rem' }"
    >
      <div class="flex flex-col gap-4">
        <p class="text-sm text-gray-500">
          Enter the member's details below. They will receive an email invitation to
          create an account and join this group.
        </p>
        <FloatLabel variant="on">
          <InputText
            id="invite-email"
            v-model="inviteNewForm.email"
            type="email"
            class="w-full"
          />
          <label for="invite-email">Email <span class="text-red-500">*</span></label>
        </FloatLabel>
        <FloatLabel variant="on">
          <InputText
            id="invite-first-name"
            v-model="inviteNewForm.firstName"
            class="w-full"
          />
          <label for="invite-first-name"
            >First Name <span class="text-red-500">*</span></label
          >
        </FloatLabel>
        <FloatLabel variant="on">
          <InputText
            id="invite-last-name"
            v-model="inviteNewForm.lastName"
            class="w-full"
          />
          <label for="invite-last-name"
            >Last Name <span class="text-red-500">*</span></label
          >
        </FloatLabel>
        <Message v-if="inviteNewError" severity="error">{{ inviteNewError }}</Message>
      </div>
      <template #footer>
        <Button
          label="Cancel"
          severity="secondary"
          @click="inviteNewDialogVisible = false"
          :disabled="inviteNewLoading"
        />
        <Button
          label="Send Invitation"
          icon="pi pi-envelope"
          :loading="inviteNewLoading"
          @click="sendDirectInvite"
        />
      </template>
    </Dialog>

    <!-- Remove Member Confirmation Dialog -->
    <Dialog
      v-model:visible="removeMemberDialogVisible"
      modal
      header="Remove Member"
      :style="{ width: '28rem' }"
    >
      <div class="flex items-center gap-3">
        <i class="pi pi-exclamation-triangle text-red-500" style="font-size: 2rem" />
        <span>
          Are you sure you want to remove
          <strong>{{ memberToRemove?.full_name || memberToRemove?.email }}</strong> from
          this group? This will not delete their account, but will prevent them from
          accessing this group's dashboard and content.
        </span>
      </div>
      <template #footer>
        <Button
          label="Cancel"
          severity="secondary"
          @click="removeMemberDialogVisible = false"
          :disabled="removingMember"
        />
        <Button
          label="Remove"
          severity="danger"
          :loading="removingMember"
          @click="removeMember"
        />
      </template>
    </Dialog>

    <!-- Ban Member Confirmation Dialog -->
    <Dialog
      v-model:visible="banMemberDialogVisible"
      modal
      header="Ban Member"
      :style="{ width: '28rem' }"
    >
      <div class="flex items-center gap-3">
        <i class="pi pi-ban text-red-500" style="font-size: 2rem" />
        <span>
          Are you sure you want to ban
          <strong>{{ memberToBan?.full_name || memberToBan?.email }}</strong> from this
          group? They will be removed and their form submission will be marked as banned.
        </span>
      </div>
      <template #footer>
        <Button
          label="Cancel"
          severity="secondary"
          @click="banMemberDialogVisible = false"
          :disabled="banningMember"
        />
        <Button
          label="Ban"
          severity="danger"
          :loading="banningMember"
          @click="banMember"
        />
      </template>
    </Dialog>

    <!-- Invite Confirmation Dialog -->
    <Dialog
      v-model:visible="inviteDialogVisible"
      modal
      :header="
        submissionToInvite?.status === 'invited' ? 'Resend Invitation' : 'Invite Member'
      "
      :style="{ width: '32rem' }"
    >
      <div class="flex items-start gap-3">
        <i class="pi pi-envelope text-blue-500 mt-1" style="font-size: 2rem" />
        <div>
          <p v-if="submissionToInvite?.status === 'invited'">
            Resend the invitation to <strong>{{ submissionToInvite?.email }}</strong
            >. They will receive a new invitation link to create an account and join this
            group.
          </p>
          <p v-else>
            Send an invitation to <strong>{{ submissionToInvite?.email }}</strong> to
            create an account and join this group as a member.
          </p>
          <p class="text-sm text-gray-500 mt-2">
            Once they accept, their profile will be linked to this group automatically.
          </p>
          <Message v-if="inviteError" severity="error" class="mt-3">{{
            inviteError
          }}</Message>
        </div>
      </div>
      <template #footer>
        <Button
          label="Cancel"
          severity="secondary"
          @click="inviteDialogVisible = false"
          :disabled="inviting"
        />
        <Button
          :label="submissionToInvite?.status === 'invited' ? 'Resend' : 'Send Invitation'"
          icon="pi pi-envelope"
          severity="info"
          :loading="inviting"
          @click="sendInvite"
        />
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="deleteDialogVisible"
      modal
      header="Confirm Delete"
      :style="{ width: '28rem' }"
    >
      <div class="flex items-center gap-3">
        <i class="pi pi-exclamation-triangle text-red-500" style="font-size: 2rem" />
        <span>
          Are you sure you want to delete the submission from
          <strong>{{ submissionToDelete?.email }}</strong
          >? This cannot be undone.
        </span>
      </div>
      <template #footer>
        <Button
          label="Cancel"
          severity="secondary"
          @click="deleteDialogVisible = false"
        />
        <Button
          label="Delete"
          severity="danger"
          :loading="deleting"
          @click="deleteSubmission"
        />
      </template>
    </Dialog>
  </div>
</template>

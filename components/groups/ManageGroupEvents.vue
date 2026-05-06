<template>
  <div>
    <!-- Events Management -->
    <div class="flex items-center justify-end mb-6">
      <div class="flex gap-2">
        <Button
          label="Manage Locations"
          icon="pi pi-map-marker"
          severity="secondary"
          @click="manageLocationsDialogVisible = true"
        />
        <Button label="Add Event" icon="pi pi-plus" @click="openCreateEventDialog" />
      </div>
    </div>

    <Message v-if="errorMessage" severity="error" class="mb-4" @close="errorMessage = ''">
      {{ errorMessage }}
    </Message>
    <Message v-if="successMessage" severity="success" class="mb-4" :closable="false">
      {{ successMessage }}
    </Message>

    <ProgressSpinner v-if="loadingEvents" class="my-8" />
    <div v-else-if="events.length === 0">
      <p class="text-gray-500">No events yet.</p>
    </div>
    <DataTable
      v-else
      :value="events"
      tableStyle="min-width: 30rem"
      sortField="date"
      :sortOrder="1"
    >
      <Column field="name" header="Name" sortable style="min-width: 12rem">
        <template #body="{ data }">
          <strong>{{ data.name }}</strong>
          <Tag
            v-if="data.is_recurring"
            value="Recurring"
            severity="info"
            class="ml-2 text-xs"
          />
        </template>
      </Column>
      <Column field="date" header="Date" sortable style="width: 10rem">
        <template #body="{ data }">{{ formatDate(data.date) }}</template>
      </Column>
      <Column header="Time" style="width: 12rem">
        <template #body="{ data }">
          {{ formatTime(data.start_time) }}
          <span v-if="data.end_time"> – {{ formatTime(data.end_time) }}</span>
        </template>
      </Column>
      <Column header="Location" style="min-width: 10rem">
        <template #body="{ data }">
          {{ getLocationName(data.location_id) || "—" }}
        </template>
      </Column>
      <Column style="width: 8rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button
              icon="pi pi-pencil"
              size="small"
              text
              v-tooltip.top="'Edit'"
              @click="openEditEventDialog(data)"
            />
            <Button
              icon="pi pi-trash"
              size="small"
              text
              severity="danger"
              v-tooltip.top="'Delete'"
              @click="confirmDeleteEvent(data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Add/Edit Event Dialog -->
    <Dialog
      v-model:visible="eventDialogVisible"
      :header="editingEvent ? 'Edit Event' : 'Add Event'"
      :modal="true"
      :style="{ width: '640px' }"
    >
      <div class="flex flex-col gap-4 pt-4">
        <div class="flex flex-col gap-1">
          <FloatLabel variant="on">
            <InputText
              id="event-name"
              v-model="eventForm.name"
              class="w-full"
              :class="{ 'p-invalid': nameError }"
              @blur="nameError = eventForm.name.trim() ? '' : 'Event name is required.'"
            />
            <label for="event-name">Event Name <span class="text-red-500">*</span></label>
          </FloatLabel>
          <small v-if="nameError" class="text-red-500">{{ nameError }}</small>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium"
              >Date <span class="text-red-500">*</span></label
            >
            <DatePicker
              id="event-date"
              v-model="eventForm.date"
              class="w-full"
              dateFormat="mm/dd/yy"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium"
              >Start Time <span class="text-red-500">*</span></label
            >
            <DatePicker
              id="event-start-time"
              v-model="eventForm.start_time"
              timeOnly
              class="w-full"
              hourFormat="12"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium"
              >End Time <span class="text-gray-400 font-normal">(optional)</span></label
            >
            <DatePicker
              id="event-end-time"
              v-model="eventForm.end_time"
              timeOnly
              class="w-full"
              hourFormat="12"
            />
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium"
            >Location <span class="text-red-500">*</span></label
          >
          <div class="flex gap-2">
            <Select
              v-model="eventForm.location_id"
              :options="locationOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select a location"
              class="w-full"
              :class="{ 'p-invalid': locationError }"
              @change="locationError = ''"
            />
            <Button
              icon="pi pi-plus"
              severity="secondary"
              v-tooltip.top="'Add new location'"
              @click="openLocationDialog"
            />
          </div>
          <small v-if="locationError" class="text-red-500">{{ locationError }}</small>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium"
            >Description <span class="text-gray-400 font-normal">(optional)</span></label
          >
          <SimpleEditor
            id="event-description"
            v-model="eventForm.description"
            height="120px"
          />
        </div>

        <div class="flex items-center gap-3">
          <Checkbox
            id="event-recurring"
            v-model="eventForm.is_recurring"
            :binary="true"
          />
          <label for="event-recurring" class="text-sm font-medium">Recurring Event</label>
        </div>

        <template v-if="eventForm.is_recurring">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium"
                >Recurrence Pattern <span class="text-red-500">*</span></label
              >
              <Select
                v-model="eventForm.recurrence_pattern"
                :options="recurrenceOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select pattern"
                class="w-full"
              />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium"
                >Recurrence End Date <span class="text-red-500">*</span></label
              >
              <DatePicker
                id="event-recurrence-end"
                v-model="eventForm.recurrence_end_date"
                class="w-full"
                dateFormat="mm/dd/yy"
              />
            </div>
          </div>
          <small v-if="recurrenceEndError" class="text-red-500 -mt-3">{{
            recurrenceEndError
          }}</small>
        </template>
      </div>

      <template #footer>
        <Button label="Cancel" severity="secondary" @click="eventDialogVisible = false" />
        <Button
          :label="editingEvent ? 'Save Changes' : 'Add Event'"
          icon="pi pi-check"
          @click="saveEvent"
          :loading="savingEvent"
        />
      </template>
    </Dialog>

    <!-- Manage Locations Dialog -->
    <Dialog
      v-model:visible="manageLocationsDialogVisible"
      header="Manage Locations"
      :modal="true"
      :style="{ width: '75vw' }"
    >
      <div class="mb-4 flex justify-end">
        <Button
          label="Add Location"
          icon="pi pi-plus"
          size="small"
          @click="openLocationDialog"
        />
      </div>
      <ProgressSpinner v-if="loadingLocations" class="my-4" />
      <div v-else-if="locations.length === 0">
        <p class="text-sm text-gray-500">No locations yet.</p>
      </div>
      <DataTable
        v-else
        :value="locations"
        class="p-datatable-sm"
        tableStyle="min-width: 20rem"
      >
        <Column field="name" header="Name" />
        <Column field="address" header="Address">
          <template #body="{ data }">{{ data.address || "—" }}</template>
        </Column>
        <Column style="width: 5rem">
          <template #body="{ data }">
            <Button
              icon="pi pi-trash"
              size="small"
              text
              severity="danger"
              v-tooltip.top="'Delete Location'"
              @click="confirmDeleteLocation(data)"
            />
          </template>
        </Column>
      </DataTable>
      <template #footer>
        <Button
          label="Close"
          severity="secondary"
          @click="manageLocationsDialogVisible = false"
        />
      </template>
    </Dialog>

    <!-- Add Location Dialog -->
    <Dialog
      v-model:visible="locationDialogVisible"
      header="Add Location"
      :modal="true"
      :style="{ width: '480px' }"
    >
      <div class="flex flex-col gap-4 pt-4">
        <FloatLabel variant="on">
          <InputText id="loc-name" v-model="locationForm.name" class="w-full" />
          <label for="loc-name"
            >Location Name
            <span class="text-gray-400 font-normal">(optional)</span></label
          >
        </FloatLabel>
        <FloatLabel variant="on">
          <InputText id="loc-address" v-model="locationForm.address" class="w-full" />
          <label for="loc-address">Address <span class="text-red-500">*</span></label>
        </FloatLabel>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium"
            >Parking Information
            <span class="text-gray-400 font-normal">(optional)</span></label
          >
          <SimpleEditor
            id="loc-parking"
            v-model="locationForm.parking_info"
            height="80px"
          />
        </div>
      </div>
      <template #footer>
        <Button
          label="Cancel"
          severity="secondary"
          @click="locationDialogVisible = false"
        />
        <Button
          label="Add"
          icon="pi pi-check"
          @click="saveLocation"
          :loading="savingLocation"
          :disabled="!locationForm.address.trim()"
        />
      </template>
    </Dialog>

    <!-- Delete Event Dialog -->
    <Dialog
      v-model:visible="deleteEventDialogVisible"
      header="Delete Event"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="flex items-center gap-3">
        <i class="pi pi-exclamation-triangle text-red-500" style="font-size: 2rem" />
        <span
          >Are you sure you want to delete <strong>{{ eventToDelete?.name }}</strong
          >? This cannot be undone.</span
        >
      </div>
      <template #footer>
        <Button
          label="Cancel"
          severity="secondary"
          @click="deleteEventDialogVisible = false"
        />
        <Button
          label="Delete"
          severity="danger"
          @click="deleteEvent"
          :loading="deletingEvent"
        />
      </template>
    </Dialog>

    <!-- Delete Location Dialog -->
    <Dialog
      v-model:visible="deleteLocationDialogVisible"
      header="Delete Location"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="flex items-center gap-3">
        <i class="pi pi-exclamation-triangle text-red-500" style="font-size: 2rem" />
        <span
          >Are you sure you want to delete <strong>{{ locationToDelete?.name }}</strong
          >? Any events using this location will have it removed.</span
        >
      </div>
      <template #footer>
        <Button
          label="Cancel"
          severity="secondary"
          @click="deleteLocationDialogVisible = false"
        />
        <Button
          label="Delete"
          severity="danger"
          @click="deleteLocation"
          :loading="deletingLocation"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
const props = defineProps({
  websiteId: {
    type: [String, Number],
    required: true,
  },
})

const supabase = useSupabaseClient()

// ---- State ----
const events = ref([])
const locations = ref([])
const loadingEvents = ref(true)
const loadingLocations = ref(true)
const savingEvent = ref(false)
const savingLocation = ref(false)
const deletingEvent = ref(false)
const deletingLocation = ref(false)
const errorMessage = ref("")
const successMessage = ref("")

const eventDialogVisible = ref(false)
const locationDialogVisible = ref(false)
const manageLocationsDialogVisible = ref(false)
const deleteEventDialogVisible = ref(false)
const deleteLocationDialogVisible = ref(false)
const editingEvent = ref(null)
const eventToDelete = ref(null)
const locationToDelete = ref(null)
const recurrenceEndError = ref("")

const recurrenceOptions = [
  { label: "Weekly", value: "weekly" },
  { label: "Bi-Weekly", value: "bi-weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Annually", value: "annually" },
]

const emptyEventForm = () => ({
  name: "",
  date: null,
  start_time: null,
  end_time: null,
  location_id: null,
  description: "",
  is_recurring: false,
  recurrence_pattern: null,
  recurrence_end_date: null,
})

const eventForm = ref(emptyEventForm())
const locationForm = ref({ name: "", address: "", parking_info: "" })

const nameError = ref("")
const locationError = ref("")

// ---- Computed ----
const locationOptions = computed(() =>
  locations.value.map((l) => ({ label: l.name, value: l.id }))
)

const getLocationName = (id) => {
  if (!id) return null
  return locations.value.find((l) => l.id === id)?.name || null
}

// ---- Formatters ----
const formatDate = (val) => {
  if (!val) return ""
  // val may be a Date object or a date string
  const d = typeof val === "string" ? new Date(val + "T00:00:00") : val
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d)
}

const formatTime = (val) => {
  if (!val) return ""
  // val may be "HH:MM:SS" string or Date object
  if (typeof val === "string") {
    const [h, m] = val.split(":").map(Number)
    const d = new Date()
    d.setHours(h, m, 0)
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d)
  }
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(val)
}

// ---- Fetch ----
const fetchEvents = async () => {
  loadingEvents.value = true
  const { data, error } = await supabase
    .from("group_events")
    .select("*")
    .eq("website_id", props.websiteId)
    .order("date", { ascending: true })

  if (error) {
    console.error("Error fetching events:", error)
    errorMessage.value = "Failed to load events."
  } else {
    events.value = data || []
  }
  loadingEvents.value = false
}

const fetchLocations = async () => {
  loadingLocations.value = true
  const { data, error } = await supabase
    .from("group_event_locations")
    .select("*")
    .eq("website_id", props.websiteId)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching locations:", error)
  } else {
    locations.value = data || []
  }
  loadingLocations.value = false
}

// ---- Event CRUD ----
const openCreateEventDialog = () => {
  editingEvent.value = null
  eventForm.value = emptyEventForm()
  recurrenceEndError.value = ""
  nameError.value = ""
  locationError.value = ""
  eventDialogVisible.value = true
}

const openEditEventDialog = (event) => {
  editingEvent.value = event
  eventForm.value = {
    name: event.name,
    date: event.date ? new Date(event.date + "T00:00:00") : null,
    start_time: event.start_time ? parseTimeToDate(event.start_time) : null,
    end_time: event.end_time ? parseTimeToDate(event.end_time) : null,
    location_id: event.location_id,
    description: event.description || "",
    is_recurring: event.is_recurring,
    recurrence_pattern: event.recurrence_pattern,
    recurrence_end_date: event.recurrence_end_date
      ? new Date(event.recurrence_end_date + "T00:00:00")
      : null,
  }
  recurrenceEndError.value = ""
  nameError.value = ""
  locationError.value = ""
  eventDialogVisible.value = true
}

const parseTimeToDate = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}

const dateToTimeString = (val) => {
  if (!val) return null
  if (typeof val === "string") return val.substring(0, 5)
  return `${String(val.getHours()).padStart(2, "0")}:${String(val.getMinutes()).padStart(
    2,
    "0"
  )}`
}

const dateToDateString = (val) => {
  if (!val) return null
  if (typeof val === "string") return val
  const y = val.getFullYear()
  const m = String(val.getMonth() + 1).padStart(2, "0")
  const d = String(val.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const validateRecurrence = () => {
  recurrenceEndError.value = ""
  if (!eventForm.value.is_recurring) return true
  if (!eventForm.value.recurrence_pattern) {
    recurrenceEndError.value = "Please select a recurrence pattern."
    return false
  }
  if (!eventForm.value.recurrence_end_date) {
    recurrenceEndError.value = "Please provide a recurrence end date."
    return false
  }
  const startDate = eventForm.value.date
  const endDate = eventForm.value.recurrence_end_date
  if (startDate && endDate) {
    const start =
      typeof startDate === "string" ? new Date(startDate + "T00:00:00") : startDate
    const end = typeof endDate === "string" ? new Date(endDate + "T00:00:00") : endDate
    if (end <= start) {
      recurrenceEndError.value = "Recurrence end date must be after the event date."
      return false
    }
  }
  return true
}

const saveEvent = async () => {
  nameError.value = ""
  locationError.value = ""

  let valid = true
  if (!eventForm.value.name.trim()) {
    nameError.value = "Event name is required."
    valid = false
  }
  if (!eventForm.value.location_id) {
    locationError.value = "Location is required."
    valid = false
  }
  if (!eventForm.value.date || !eventForm.value.start_time) valid = false
  if (!validateRecurrence()) valid = false
  if (!valid) return

  savingEvent.value = true
  errorMessage.value = ""

  const payload = {
    name: eventForm.value.name,
    date: dateToDateString(eventForm.value.date),
    start_time: dateToTimeString(eventForm.value.start_time),
    end_time: dateToTimeString(eventForm.value.end_time) || null,
    location_id: eventForm.value.location_id || null,
    description: eventForm.value.description || null,
    is_recurring: eventForm.value.is_recurring,
    recurrence_pattern: eventForm.value.is_recurring
      ? eventForm.value.recurrence_pattern
      : null,
    recurrence_end_date: eventForm.value.is_recurring
      ? dateToDateString(eventForm.value.recurrence_end_date)
      : null,
  }

  try {
    if (editingEvent.value) {
      const { error } = await supabase
        .from("group_events")
        .update(payload)
        .eq("id", editingEvent.value.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from("group_events")
        .insert({ ...payload, website_id: props.websiteId })
      if (error) throw error
    }

    eventDialogVisible.value = false
    successMessage.value = editingEvent.value ? "Event updated." : "Event added."
    setTimeout(() => (successMessage.value = ""), 3000)
    await fetchEvents()
  } catch (error) {
    console.error("Error saving event:", error)
    errorMessage.value = error.message || "Failed to save event."
  } finally {
    savingEvent.value = false
  }
}

const confirmDeleteEvent = (event) => {
  eventToDelete.value = event
  deleteEventDialogVisible.value = true
}

const deleteEvent = async () => {
  if (!eventToDelete.value) return
  deletingEvent.value = true
  try {
    const { error } = await supabase
      .from("group_events")
      .delete()
      .eq("id", eventToDelete.value.id)
    if (error) throw error
    deleteEventDialogVisible.value = false
    successMessage.value = "Event deleted."
    setTimeout(() => (successMessage.value = ""), 3000)
    await fetchEvents()
  } catch (error) {
    errorMessage.value = error.message || "Failed to delete event."
  } finally {
    deletingEvent.value = false
    eventToDelete.value = null
  }
}

// ---- Location CRUD ----
const openLocationDialog = () => {
  locationForm.value = { name: "", address: "", parking_info: "" }
  locationDialogVisible.value = true
}

const saveLocation = async () => {
  if (!locationForm.value.address.trim()) return
  savingLocation.value = true
  try {
    const { error } = await supabase.from("group_event_locations").insert({
      website_id: props.websiteId,
      name: locationForm.value.name,
      address: locationForm.value.address || null,
      parking_info: locationForm.value.parking_info || null,
    })
    if (error) throw error
    locationDialogVisible.value = false
    await fetchLocations()
  } catch (error) {
    errorMessage.value = error.message || "Failed to add location."
  } finally {
    savingLocation.value = false
  }
}

const confirmDeleteLocation = (location) => {
  locationToDelete.value = location
  deleteLocationDialogVisible.value = true
}

const deleteLocation = async () => {
  if (!locationToDelete.value) return
  deletingLocation.value = true
  try {
    const { error } = await supabase
      .from("group_event_locations")
      .delete()
      .eq("id", locationToDelete.value.id)
    if (error) throw error
    deleteLocationDialogVisible.value = false
    await fetchLocations()
  } catch (error) {
    errorMessage.value = error.message || "Failed to delete location."
  } finally {
    deletingLocation.value = false
    locationToDelete.value = null
  }
}

onMounted(() => {
  fetchLocations()
  fetchEvents()
})
</script>

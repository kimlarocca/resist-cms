<script setup>
const props = defineProps({
  candidates: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
})

const selectedParties = ref([])
const selectedCandidates = ref([])
const filterDialogVisible = ref(false)

const parties = computed(() => {
  const uniqueParties = []
  props.candidates.forEach((candidate) => {
    if (candidate.party && !uniqueParties.includes(candidate.party)) {
      uniqueParties.push(candidate.party)
    }
  })
  return uniqueParties
})

const filteredCandidates = computed(() => {
  let filtered = props.candidates

  // Filter by party
  if (selectedParties.value.length > 0) {
    filtered = filtered.filter((candidate) =>
      selectedParties.value.includes(candidate.party)
    )
  }

  // Filter by specific candidates
  if (selectedCandidates.value.length > 0) {
    filtered = filtered.filter((candidate) =>
      selectedCandidates.value.includes(candidate.id)
    )
  }

  return filtered
})

const filterLabel = computed(() => {
  const totalFilters = selectedParties.value.length + selectedCandidates.value.length
  if (totalFilters === 0) {
    return "Filter"
  }
  return `Clear (${totalFilters} Filter${totalFilters > 1 ? "s" : ""}`
})

const clearFilters = () => {
  selectedParties.value = []
  selectedCandidates.value = []
}

const truncateText = (text, maxLength) => {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}
</script>

<template>
  <CandidatesSkeleton v-if="loading" />
  <section v-else-if="candidates.length" class="candidates">
    <!-- Filter Button -->
    <div class="filter-section mb-4 flex items-center justify-end gap-2">
      <div
        class="flex items-center gap-2 cursor-pointer"
        @click="filterDialogVisible = true"
      >
        <i class="pi pi-filter text-2xl" />
      </div>
      <Button
        v-if="selectedParties.length > 0 || selectedCandidates.length > 0"
        icon="pi pi-times"
        severity="secondary"
        variant="text"
        @click="clearFilters"
        size="small"
        aria-label="Clear filters"
        :label="filterLabel"
      />
    </div>

    <!-- Filter Dialog -->
    <Dialog
      v-model:visible="filterDialogVisible"
      modal
      header="Filter Candidates"
      :style="{ width: '90vw', maxWidth: '600px' }"
    >
      <div class="flex flex-col gap-4">
        <!-- Filter by Party Section -->
        <div>
          <h3 class="mb-3 font-bold">By Party</h3>
          <div class="flex flex-col gap-3">
            <div v-for="party in parties" :key="party" class="flex items-center gap-3">
              <Checkbox
                v-model="selectedParties"
                :inputId="`party-${party}`"
                :value="party"
                name="party"
              />
              <label :for="`party-${party}`" class="cursor-pointer">{{ party }}</label>
            </div>
          </div>
        </div>

        <Divider />

        <!-- Filter by Candidate Section -->
        <div>
          <h3 class="mb-3 font-bold">By Candidate</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            <div
              v-for="candidate in candidates"
              :key="candidate.id"
              class="flex items-center gap-3"
            >
              <Checkbox
                v-model="selectedCandidates"
                :inputId="`candidate-${candidate.id}`"
                :value="candidate.id"
                name="candidate"
              />
              <label :for="`candidate-${candidate.id}`" class="cursor-pointer">
                {{ candidate.name }}
              </label>
            </div>
          </div>
        </div>

        <Divider />

        <div class="flex gap-3">
          <Button
            label="Clear All"
            severity="secondary"
            @click="clearFilters"
            class="flex-1"
            size="small"
          />
          <Button
            label="Apply"
            @click="filterDialogVisible = false"
            class="flex-1"
            size="small"
          />
        </div>
      </div>
    </Dialog>

    <div
      class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
    >
      <NuxtLink
        :to="`/${candidate.slug}`"
        class="plain flex flex-col h-full"
        v-for="candidate in filteredCandidates"
        :key="candidate.id"
      >
        <div class="candidate-card rounded-xl">
          <div class="candidate-card-image z-0">
            <img
              :src="candidate.image"
              :alt="candidate.name"
              class="w-full h-auto rounded-xl"
            />
          </div>
          <div
            class="candidate-card-details bg-white z-10 rounded-xl p-2 text-center text-black"
            :class="{
              'border-blue': candidate.party === 'Democrat',
              'border-red': candidate.party === 'Republican',
              'border-purple': candidate.party === 'Independent',
            }"
          >
            <p class="small font-bold mb-1">{{ candidate.name }}</p>
            <p class="text-sm mb-2" style="height: 40px">
              {{ truncateText(candidate.micro_bio, 35) }}
            </p>
            <div class="flex space-x-3 items-center justify-center">
              <a
                v-if="candidate.tiktok"
                :href="`https://www.tiktok.com/@${candidate.tiktok}`"
                aria-label="tiktok"
                class="text-xl text-black plain block relative z-20"
                target="_blank"
                @click.stop
              >
                <i class="pi pi-tiktok"></i>
              </a>
              <a
                v-if="candidate.instagram"
                :href="`https://www.instagram.com/${candidate.instagram}`"
                aria-label="instagram"
                class="text-xl text-black plain block relative z-20"
                target="_blank"
                @click.stop
              >
                <i class="pi pi-instagram"></i>
              </a>
              <a
                v-if="candidate.bluesky"
                :href="`https://bsky.app/profile/${candidate.bluesky}.bsky.social`"
                aria-label="instagram"
                class="text-xl text-black plain block relative z-20"
                target="_blank"
                @click.stop
              >
                <Bluesky />
              </a>
              <a
                v-if="candidate.youtube"
                :href="`https://www.youtube.com/@${candidate.youtube}`"
                aria-label="youtube"
                class="text-xl text-black plain block relative z-20"
                target="_blank"
                @click.stop
              >
                <i class="pi pi-youtube"></i>
              </a>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>
  </section>
  <p v-else class="text-center">No candidates found.</p>
</template>

<style lang="scss">
.candidate-card-details {
  position: relative;
  margin: -2rem auto 0;
  width: calc(100% - 3rem);
}
</style>

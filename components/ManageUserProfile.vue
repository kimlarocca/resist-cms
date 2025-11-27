<template>
  <div v-if="profile && profile.length > 0">
    <p class="text-sm mb-6">Username: {{ currentUser?.email }}</p>
    <div class="mb-4">
      <FloatLabel variant="on">
        <InputText id="full_name" v-model="fullName" @change="updateProfile" />
        <label for="full_name">Full Name</label>
      </FloatLabel>
    </div>
    <div class="mb-4">
      <FloatLabel variant="on">
        <InputMask
          v-model="phone"
          date="phone"
          mask="(999) 999-9999"
          @change="updateProfile"
        />
        <label for="phone">Phone Number</label>
      </FloatLabel>
    </div>
    <!-- <div class="mb-4">
      <Button label="Save Changes" @click="updateProfile" />
    </div> -->
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
</template>

<script setup>
import { useCurrentUserProfile } from "~/composables/states"
const currentUser = useSupabaseUser()
const currentUserProfile = useCurrentUserProfile()
const supabase = useSupabaseClient()

const profile = ref([])
const successMessage = ref(false)

const fullName = ref(null)
const phone = ref(null)

// get the profile for the logged in user
let { data } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", currentUser.value.sub)
  .limit(1)
if (data) {
  profile.value = data
  fullName.value = data[0]?.full_name
  phone.value = data[0]?.phone
}

const updateProfile = async () => {
  successMessage.value = false
  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: currentUser.value.sub,
      updated_at: new Date().toISOString(),
      full_name: fullName.value,
      phone: phone.value,
    })
    .match({ id: currentUser.value.sub })
  if (error) {
    console.log("updateProfile error", error)
  } else {
    successMessage.value = true
    // update the state
    currentUserProfile.value.full_name = fullName.value
    currentUserProfile.value.phone = phone.value
  }
}
</script>

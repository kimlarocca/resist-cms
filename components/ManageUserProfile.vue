<template>
  <div v-if="profile && profile.length > 0">
    <p class="mb-3">Username: {{ currentUser?.email }}</p>
    <supabase-reset-password class="mb-12" />
    <div class="mb-4">
      <FloatLabel variant="on">
        <InputText id="full_name" v-model="fullName" @change="updateProfile" />
        <label for="full_name">Full Name</label>
      </FloatLabel>
    </div>
    <div class="mb-4">
      <FloatLabel variant="on">
        <InputText id="nickname" v-model="nickname" @change="updateProfile" />
        <label for="nickname">Nickname</label>
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
    <div class="flex items-center gap-3 mb-8">
      <Checkbox
        id="allow_notifications"
        v-model="allowNotifications"
        :binary="true"
        @change="updateProfile"
      />
      <label for="allow_notifications" class="text-sm">Allow email notifications</label>
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
const nickname = ref(null)
const phone = ref(null)
const allowNotifications = ref(false)

// get the profile for the logged in user
let { data } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", currentUser.value.sub)
  .limit(1)
if (data) {
  profile.value = data
  fullName.value = data[0]?.full_name
  nickname.value = data[0]?.nickname
  phone.value = data[0]?.phone
  allowNotifications.value = data[0]?.allow_notifications ?? false
}

const updateProfile = async () => {
  successMessage.value = false
  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: currentUser.value.sub,
      updated_at: new Date().toISOString(),
      full_name: fullName.value,
      nickname: nickname.value,
      phone: phone.value,
      allow_notifications: allowNotifications.value,
    })
    .match({ id: currentUser.value.sub })
  if (error) {
    console.log("updateProfile error", error)
  } else {
    successMessage.value = true
    // update the state
    currentUserProfile.value.full_name = fullName.value
    currentUserProfile.value.nickname = nickname.value
    currentUserProfile.value.phone = phone.value
    currentUserProfile.value.allow_notifications = allowNotifications.value
  }
}
</script>

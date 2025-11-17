<template>
  <div v-if="profile && profile.length > 0" class="profile">
    <page-header message="Account Settings" />
    <div class="card">
      <supabase-reset-password id="password" />
      <Divider class="my-8" />
      <h3 id="photo" class="mb-4">Profile Photo</h3>
      <supabase-upload-image :image="avatarImage" />
      <Divider class="my-8" />
      <h3 id="you" class="mb-4">About You</h3>
      <label class="mb-4">
        <p>Domain Name</p>
        <input disabled :placeholder="profile[0].url" type="text" />
      </label>
      <label class="mb-4">
        <p>Name</p>
        <input @change="updateProfile" v-model="fullName" type="text" />
      </label>
      <label class="mb-4">
        <p>Pronouns</p>
        <select @change="updateProfile" v-model="pronouns">
          <option value="He/Him" :selected="pronouns === 'He/Him'">
            He/Him
          </option>
          <option value="She/Her" :selected="pronouns === 'She/Her'">
            She/Her
          </option>
          <option value="They/Them" :selected="pronouns === 'They/Them'">
            They/Them
          </option>
          <option value="" :selected="pronouns === '' || pronouns === null">
            Prefer not to say
          </option>
        </select>
      </label>
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
  </div>
</template>

<script setup>
import { useCurrentUser } from '~/composables/states'
import { createClient } from '@supabase/supabase-js'

definePageMeta({
  middleware: 'auth',
})

const currentUser = useCurrentUser()
const config = useRuntimeConfig()
const supabase = createClient(config.supabaseUrl, config.supabaseKey)

const continuousPlay = ref('')
const defaultLiveStream = ref('')
const fullName = ref('')
const profile = ref([])
const avatarImage = ref(null)
const pronouns = ref('')
const successMessage = ref(false)

onMounted(() => {
  // if hash exists, scroll down to that id
  if (window.location.hash) {
    const element = document.getElementById(window.location.hash.slice(1))
    if (element) {
      element.scrollIntoView()
    }
  }
})

// get the profile for the logged in user
let { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', currentUser.value.id)
  .limit(1)
if (data) {
  profile.value = data
  avatarImage.value = data[0]?.avatar_image_url
  continuousPlay.value = data[0]?.continuous_play
  defaultLiveStream.value = data[0]?.default_live_stream
  fullName.value = data[0]?.full_name
  pronouns.value = data[0]?.pronouns
}

const updateProfile = async () => {
  successMessage.value = false
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: currentUser.value.id,
      updated_at: new Date().toISOString(),
      full_name: fullName.value,
      pronouns: pronouns.value,
      continuous_play: continuousPlay.value,
      default_live_stream: defaultLiveStream.value,
    })
    .match({ id: currentUser.value.id })
  if (error) {
    console.log(error)
  } else {
    successMessage.value = true
  }
}
</script>

<style lang="scss">
.profile {
  position: relative;
}
.profile div.sticky {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  padding: 2rem;
  background: var(--light-gray);
}
.profile .changes-saved-toast {
  position: fixed;
  bottom: 0;
  right: 25px;
  width: 350px;
}
</style>

<template>
  <div v-if="profile && profile.length > 0" class="settings container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Account Settings</Title>
      </Head>
    </Html>
    <div class="grid grid-cols-4 md:gap-8">
      <div class="hidden md:flex col-span-1">
        <nav class="bg-gray w-full h-fit rounded-xl p-4">
          <p>
            <nuxt-link
              to="#profile"
              class="plain text-red"
              :class="hash === '#profile' ? 'active' : ''"
            >
              <i class="pi pi-cog mr-2" /> Profile
            </nuxt-link>
          </p>
          <Divider class="darker my-3" />
          <p>
            <nuxt-link
              to="#password"
              class="plain text-red"
              :class="hash === '#password' ? 'active' : ''"
            >
              <i class="pi pi-lock mr-2" /> Change Password
            </nuxt-link>
          </p>
          <Divider class="darker my-3" />
          <p>
            <nuxt-link
              to="#delete"
              class="plain text-red"
              :class="hash === '#delete' ? 'active' : ''"
            >
              <i class="pi pi-trash mr-2" /> Delete Account
            </nuxt-link>
          </p>
        </nav>
      </div>
      <div class="col-span-4 md:col-span-3">
        <h1 class="mb-8">Account Settings</h1>
        <div id="profile">
          <h3 class="mb-4">Profile</h3>
          <supabase-upload-image :image="avatarImage || ''" class="mb-6" />
          <manage-user-profile />
        </div>
        <Divider class="my-16" />
        <div id="password">
          <supabase-reset-password />
        </div>
        <Divider class="my-16" />
        <div id="delete">
          <h3 class="mb-4">Delete Account</h3>
          <p>
            Please <a href="mailto:help@resistcms.com">contact us</a> if you wish to
            delete your account.
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

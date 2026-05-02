<script setup>
definePageMeta({
  layout: "blank",
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const route = useRoute()

const email = ref("")
const fullName = ref("")
const password = ref("")
const confirmPassword = ref("")
const loading = ref(false)
const errorMessage = ref("")
const ready = ref(false)
const session = ref(null)

// Exchange the PKCE code from the URL query (set by Supabase invite redirect).
// Use the user returned directly from the exchange rather than watching the
// reactive user ref, which may not update after a client-side code exchange.
onMounted(async () => {
  const code = route.query.code
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      errorMessage.value = "This invitation link is invalid or has expired."
      ready.value = true
    } else if (data?.user) {
      session.value = data.session
      email.value = data.user.email || ""
      fullName.value = data.user.user_metadata?.full_name || ""
      ready.value = true
    }
  } else {
    // No code in URL — check if already authenticated (e.g. page refresh)
    const { data } = await supabase.auth.getSession()
    if (data?.session?.user) {
      session.value = data.session
      email.value = data.session.user.email || ""
      fullName.value = data.session.user.user_metadata?.full_name || ""
      ready.value = true
    } else {
      errorMessage.value = "This invitation link is invalid or has expired."
      ready.value = true
    }
  }
})

watch(
  user,
  (val) => {
    if (val && !ready.value) {
      email.value = val.email || ""
      fullName.value = val.user_metadata?.full_name || ""
      ready.value = true
    }
  },
  { immediate: true }
)

const submit = async () => {
  errorMessage.value = ""

  if (password.value.length < 8) {
    errorMessage.value = "Password must be at least 8 characters."
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Passwords do not match."
    return
  }

  loading.value = true

  // Re-set the session to ensure it's active before calling updateUser
  if (session.value) {
    await supabase.auth.setSession({
      access_token: session.value.access_token,
      refresh_token: session.value.refresh_token,
    })
  }

  const { error } = await supabase.auth.updateUser({
    password: password.value,
    data: { full_name: fullName.value },
  })

  loading.value = false

  if (error) {
    errorMessage.value = error.message
    return
  }

  navigateTo("/dashboard")
}
</script>

<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Accept Invitation</Title>
      </Head>
    </Html>
    <Logo class="mb-3 ml-1" />
    <hr class="w-44 ml-0 mb-8" />

    <div v-if="!ready" class="flex items-center gap-3">
      <ProgressSpinner style="width: 2rem; height: 2rem" />
      <span>Verifying your invitation…</span>
    </div>

    <template v-else>
      <h1 class="mb-4">Create Your Account</h1>
      <p class="mb-6">
        You've been invited to join Resist CMS! Set your name and password below to
        activate your account.
      </p>

      <form @submit.prevent="submit" class="flex flex-col gap-4 max-w-sm">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium">Email Address</label>
          <p class="font-bold">{{ email }}</p>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="full-name">Full Name</label>
          <InputText
            id="full-name"
            v-model="fullName"
            placeholder="Your full name"
            autocomplete="name"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="password">Password</label>
          <Password
            id="password"
            v-model="password"
            placeholder="Choose a password (min 8 characters)"
            :feedback="true"
            toggleMask
            class="w-full"
            inputClass="w-full"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="confirm-password"
            >Confirm Password</label
          >
          <Password
            id="confirm-password"
            v-model="confirmPassword"
            placeholder="Confirm your password"
            :feedback="false"
            toggleMask
            class="w-full"
            inputClass="w-full"
          />
        </div>

        <Message v-if="errorMessage" severity="error">{{ errorMessage }}</Message>

        <Button type="submit" label="Activate Account" :loading="loading" />
      </form>
    </template>
  </div>
</template>

<template>
  <div>
    <template v-if="errorMessage">
      <Message class="mb-4" severity="error">
        Sorry, there was a problem logging in to your account:
        {{ errorMessage }}
      </Message>
    </template>
    <form @submit.prevent="login" class="width400">
      <input
        v-model="email"
        class="w-full mb-2"
        type="email"
        placeholder="Your email"
        required
      />
      <input
        v-model="password"
        class="w-full mb-2"
        type="password"
        placeholder="Your password"
        required
      />
      <Button label="Sign In With Email & Password" class="w-full" type="submit" />
    </form>
  </div>
</template>

<script setup>
const client = useSupabaseClient()
const user = useSupabaseUser()

const email = ref("")
const password = ref("")
const errorMessage = ref("")

const login = async () => {
  const { error } = await client.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (error) {
    console.log(error)
    if (error.message.includes("Invalid login credentials")) {
      errorMessage.value =
        "The email and password combination you entered is incorrect. Please try again!"
    } else {
      errorMessage.value = error.message
    }
  } else {
    if (user.value) {
      navigateTo("/dashboard")
    } else {
      const unwatch = watch(user, (newUser) => {
        if (newUser) {
          unwatch()
          navigateTo("/dashboard")
        }
      })
    }
  }
}
</script>

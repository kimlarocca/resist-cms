<script setup>
const currentUserProfile = useCurrentUserProfile()
const visible = ref(false)
const navItems = [
  {
    label: "Dashboard",
    to: "/dashboard",
  },
  {
    label: "Settings",
    to: "/settings",
  },
  {
    label: "Logout",
    to: "/logout",
  },
]
</script>

<template>
  <header class="bg-white-opacity-70 container rounded-xl !my-4">
    <div class="container p-4 flex justify-between items-center">
      <NuxtLink to="/dashboard" class="plain">
        <Logo />
      </NuxtLink>
      <div class="flex items-center gap-3">
        <nuxt-link to="/settings" class="plain clickable" aria-label="manage profile">
          <Avatar
            v-if="currentUserProfile && currentUserProfile.avatar_url"
            :image="currentUserProfile.avatar_url"
            size="large"
            shape="circle"
            aria-label="user avatar image"
          />
          <Avatar
            v-else
            size="large"
            shape="circle"
            icon="pi pi-user"
            aria-label="user avatar image"
          />
        </nuxt-link>
        <i class="pi pi-bars text-2xl cursor-pointer" @click="visible = true" />
      </div>
    </div>
    <Drawer v-model:visible="visible" position="right" header=" ">
      <Logo class="mb-3 ml-1" />
      <hr class="w-44 ml-0 mb-8" />
      <p v-for="item in navItems" :key="item.label" class="mb-5">
        <NuxtLink :to="item.to" @click="visible = false">
          {{ item.label }}
        </NuxtLink>
      </p>
    </Drawer>
  </header>
</template>

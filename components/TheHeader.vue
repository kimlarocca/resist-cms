<script setup>
const currentUserProfile = useCurrentUserProfile()
</script>

<template>
  <header class="bg-white-opacity-70 container rounded-xl !my-4">
    <div class="container p-4 flex justify-between items-center">
      <NuxtLink to="/dashboard" class="plain">
        <img
          v-if="currentUserProfile && currentUserProfile.role === 'election_manager'"
          src="/images/vbv-logo.png"
          alt="Vote by values logo"
          class="w-36"
        />
        <Logo v-else />
      </NuxtLink>
      <div class="flex items-center gap-4">
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
        <NuxtLink
          to="/logout"
          class="plain clickable flex items-center gap-1"
          aria-label="logout"
        >
          <i class="pi pi-sign-out text-2xl" /> Logout
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

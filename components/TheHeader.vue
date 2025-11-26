<script setup>
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
  <header class="bg-white-opacity-70 container rounded-xl !mt-4 !mb-8">
    <div class="container p-4 flex justify-between items-center">
      <NuxtLink to="/dashboard" class="plain">
        <Logo />
      </NuxtLink>
      <div>
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

<script setup>
const visible = ref(false)
const navItems = [
  {
    label: "Home",
    to: "/",
  },
  {
    label: "Candidates",
    to: "/",
  },
  {
    label: "Issues",
    to: "/",
  },
  { label: "News", to: "/" },
]
</script>

<template>
  <header class="bg-white-opacity-70 container rounded-xl !mt-4 !mb-8">
    <div class="container p-4 flex justify-between items-center">
      <NuxtLink to="/" class="plain">
        <Logo />
      </NuxtLink>
      <div>
        <i class="pi pi-bars text-2xl cursor-pointer" @click="visible = true" />
      </div>
    </div>
    <Drawer v-model:visible="visible" position="right" header=" ">
      <p v-for="item in navItems" :key="item.label" class="mb-5">
        <NuxtLink :to="item.to" @click="visible = false">
          {{ item.label }}
        </NuxtLink>
      </p>
      <a href="https://papnj.com/#volunteer" target="_blank">
        <Button size="small" label="Volunteer" class="mt-4 mb-4" />
      </a>
      <a href="https://secure.papnj.com/donate" target="_blank">
        <Button size="small" label="Donate" />
      </a>
    </Drawer>
  </header>
</template>

<style lang="scss" scoped></style>

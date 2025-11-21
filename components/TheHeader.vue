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
  <header class="mb-16">
    <div class="container p-4 flex justify-between">
      <div class="flex flex-col">
        <NuxtLink to="/" class="plain">
          <Logo />
        </NuxtLink>
      </div>
      <div class="flex flex-col">
        <nav class="hidden w-full xl:flex justify-end mt-4 gap-8">
          <p v-for="item in navItems" :key="item.label" class="small">
            <NuxtLink :to="item.to" @click="visible = false" class="plain">
              {{ item.label }}
            </NuxtLink>
          </p>
          <div class="xl:hidden ml-3" @click="visible = true">
            <i class="pi pi-bars text-4xl text-white cursor-pointer" />
          </div>
        </nav>
      </div>
      <div class="flex flex-col">
        <InputGroup>
          <InputText placeholder="Keyword" />
          <InputGroupAddon>
            <Button
              icon="pi pi-search"
              severity="secondary"
              variant="text"
              @click="toggle"
            />
          </InputGroupAddon>
        </InputGroup>
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

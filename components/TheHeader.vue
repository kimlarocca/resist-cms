<script setup>
const visible = ref(false)
const navItems = [
  {
    label: 'Playing Politics',
    to: '/#playing-politics'
  },
  {
    label: "We Don't Know Jack",
    to: '/we-dont-know-jack'
  },
  {
    label: 'The Issues',
    to: '/#issues'
  },
  { label: 'Compare Candidates', to: '/jack-vs-mikie' },
  {
    label: 'Key Dates',
    to: '/key-dates'
  },
  {
    label: 'Do Your Own Research',
    to: '/dyor'
  },
  {
    label: 'Request a Sign',
    to: '/request-a-sign'
  }
]
</script>

<template>
  <header>
    <div class="container px-4 xl:px-0 flex justify-between xl:justify-start">
      <NuxtLink to="/">
        <Logo />
      </NuxtLink>
      <div>
        <div class="flex items-center ml-12" style="height: 56px">
          <!-- <p
            class="text-white small hidden xl:flex mr-6"
            style="line-height: 56px"
          >
            <strong>It's time to take action!</strong>&nbsp;Contribute to the
            cause and stop NJ from turning red.
          </p> -->
          <a
            href="https://papnj.com/#volunteer"
            target="_blank"
            class="hidden md:block"
          >
            <Button size="small" label="Volunteer" class="mr-2" />
          </a>
          <a
            href="https://secure.papnj.com/donate"
            target="_blank"
            class="hidden md:block"
          >
            <Button size="small" label="Donate" />
          </a>
          <div class="xl:hidden ml-3" @click="visible = true">
            <i class="pi pi-bars text-4xl text-white cursor-pointer" />
          </div>
        </div>
        <nav class="hidden xl:flex justify-between ml-12 mt-4">
          <p v-for="item in navItems" :key="item.label" class="small mr-4">
            <NuxtLink :to="item.to" @click="visible = false" class="plain">
              {{ item.label }}
            </NuxtLink>
          </p>
        </nav>
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

<style lang="scss" scoped>
header {
  background: linear-gradient(
    to bottom,
    var(--red) 0px,
    var(--red) 56px,
    transparent 56px
  );
  width: 100%;
}
</style>

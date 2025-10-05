<script setup>
const router = useRouter()
const visible = ref(false)
const navItems = [
  {
    label: 'Jack playing politics',
    to: '/',
    command: () => {
      router.push('/jack-playing-politics')
    }
  },
  {
    label: "Jack's dangerous policies",
    to: '/jacks-dangerous-policies',
    command: () => {
      router.push('/jacks-dangerous-policies')
    }
  },
  {
    label: 'Jack the flipper',
    to: '/jack-the-flipper',
    command: () => {
      router.push('/jack-the-flipper')
    }
  },
  {
    label: 'Key dates',
    to: '/key-dates',
    command: () => {
      router.push('/key-dates')
    }
  },
  {
    label: 'DYOR',
    to: '/dyor',
    command: () => {
      router.push('/dyor')
    }
  },
  {
    label: 'Take action',
    to: '/take-action',
    command: () => {
      router.push('/take-action')
    }
  },
  {
    label: 'Issues affecting NJ',
    to: '/issues-affecting-nj',
    command: () => {
      router.push('/issues-affecting-nj')
    }
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
          <p
            class="text-white small hidden xl:flex mr-6"
            style="line-height: 56px"
          >
            <strong>It's time to take action!</strong>&nbsp;Contribute to the
            cause and stop NJ from turning red.
          </p>
          <a
            href="https://papnj.com/#volunteer"
            target="_blank"
            class="hidden md:block"
          >
            <Button size="small" label="Volunteer" class="mr-2" />
          </a>
          <a href="https://secure.papnj.com/donate" target="_blank">
            <Button size="small" label="Donate" />
          </a>
          <div class="xl:hidden ml-3" @click="visible = true">
            <i class="pi pi-bars text-4xl text-white cursor-pointer" />
          </div>
        </div>
        <nav class="hidden xl:flex justify-between ml-12 mt-4">
          <Menubar :model="navItems" />
        </nav>
      </div>
    </div>
    <Drawer v-model:visible="visible" position="right" header=" ">
      <p v-for="item in navItems" :key="item.label" class="mb-5">
        <NuxtLink :to="item.to" @click="visible = false">
          {{ item.label }}
        </NuxtLink>
      </p>
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

<script setup>
definePageMeta({
  middleware: "auth",
})
</script>

<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Manage Races</Title>
      </Head>
    </Html>
    <h1>Manage Races</h1>
    <Divider class="my-7" />
    <RacesManageRaces />
  </div>
</template>

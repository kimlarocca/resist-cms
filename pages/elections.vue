<script setup>
definePageMeta({
  middleware: "auth",
})
</script>

<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | My Elections</Title>
      </Head>
    </Html>
    <h1>My Elections</h1>
    <Divider class="my-7" />
    <ElectionsManageElections />
  </div>
</template>

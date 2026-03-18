<script setup>
definePageMeta({
  middleware: "auth",
})
</script>

<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Manage Elections</Title>
      </Head>
    </Html>
    <h1>Manage Elections</h1>
    <Divider class="my-7" />
    <ElectionsManageElections />
  </div>
</template>

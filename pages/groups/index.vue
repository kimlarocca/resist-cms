<script setup>
definePageMeta({
  middleware: "auth",
})
</script>

<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Manage Groups</Title>
      </Head>
    </Html>
    <h1>Manage Groups</h1>
    <Divider class="my-7" />
    <GroupsManageGroups />
  </div>
</template>

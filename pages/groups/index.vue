<script setup>
definePageMeta({
  middleware: "auth",
})

const client = useSupabaseClient()
const user = useSupabaseUser()
const currentUserProfile = useCurrentUserProfile()
</script>

<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Manage Websites</Title>
      </Head>
    </Html>
    <h1>Manage Websites</h1>
    <Divider class="my-7" />
    <WebsitesManageWebsites />
  </div>
</template>

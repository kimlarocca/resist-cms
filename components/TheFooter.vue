<script setup>
const currentYear = new Date().getFullYear()
const socialLinks = [
  { icon: "pi pi-link", url: "https://linktr.ee/papnj", label: "Linktree" },
  {
    icon: "pi pi-tiktok",
    url: "https://tiktok.com/@newjerseypeople",
    label: "TikTok",
  },
  {
    icon: "pi pi-facebook",
    url: "https://www.facebook.com/NewJerseyPeople",
    label: "Facebook",
  },
  {
    icon: "pi pi-twitter",
    url: "https://x.com/NewJerseyPeople",
    label: "X (Twitter)",
  },
  {
    icon: "pi pi-instagram",
    url: "https://instagram.com/NJPeopleArePeople",
    label: "Instagram",
  },
  {
    icon: "custom",
    iconSrc: "/bluesky.svg",
    url: "https://bsky.app/profile/newjerseypeople.bsky.social",
    label: "Bluesky",
  },
  {
    icon: "pi pi-youtube",
    url: "https://www.youtube.com/@PeopleArePeopleNJ",
    label: "YouTube",
  },
]
</script>

<template>
  <footer class="bg-white-opacity-70 rounded-tl-xl rounded-tr-xl">
    <div class="container p-12 text-center">
      <p class="small mb-3">
        This website was not requested or authorized by any candidate or candidate's
        committee. Paid for by
        <a href="https://papnj.com" target="_blank"> People Are People LLC</a>, 971 US
        Highway 202N #8014, Branchburg, NJ 08876.
      </p>
      <p class="small">
        Copyright © {{ currentYear }} — NJ11th.com. All Rights Reserved.
      </p>
    </div>
  </footer>
</template>

<style lang="scss">
.icon-link {
  display: flex;
  align-items: center;
  text-decoration: none;
}
.custom {
  max-width: 16px;
  width: 16px;
  height: 16px;
}
</style>

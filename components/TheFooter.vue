<script setup>
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="blue-section pb-2">
    <div class="bg-red" style="height: 56px" />
    <div class="relative container grid grid-cols-1 lg:grid-cols-4 gap-24">
      <div class="lg:col-span-2 order-2 lg:order-1 pt-12">
        <p class="mb-6">
          The views expressed herein are exclusively those of the authors and do
          not reflect the official stance of any political candidate or other
          organization and have not been requested or endorsed by any related
          entity. Information presented has been verified as accurate to the
          best of our ability.
        </p>
        <p class="mb-6">
          This advertisement was not requested or authorized by any candidate or
          candidate's committee.Paid for by People Are People LLC, 971 US
          Highway 202N #8014, Branchburg, NJ 08876.
        </p>
        <p>Copyright © {{ currentYear }}</p>
      </div>
      <div class="order-3 lg:order-2 pt-12">
        <p class="mb-3">
          <a href="https://papnj.com" target="_blank"> People Are People </a>
        </p>
        <p class="mb-3">
          <a href="https://secure.papnj.com/donate" target="_blank"> Donate </a>
        </p>
        <p class="mb-3">
          <a href="https://papnj.com/#volunteer" target="_blank"> Volunteer </a>
        </p>
      </div>
      <div
        class="order-1 lg:order-3 lg:absolute lg:right-0"
        style="margin-top: -56px"
      >
        <LogoFooter />
      </div>
    </div>
  </footer>
</template>

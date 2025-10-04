<script setup></script>

<template>
  <header>
    <div class="container flex">
      <Logo />
      <div class="flex items-center ml-12" style="height: 56px">
        <p
          class="text-white small hidden xl:flex mr-6"
          style="line-height: 56px"
        >
          <strong>It's time to take action!</strong>
          Contribute to the cause and stop NJ from turning red.
        </p>
        <Button size="small" label="Volunteer" class="mr-2" />
        <Button size="small" label="Donate" class="mr-2" />
      </div>
      <!-- <nav class="flex justify-between">
        <div>
          <a href="/" class="mr-4 hover:underline">Home</a>
        </div>
      </nav> -->
    </div>
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

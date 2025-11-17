<template>
  <main class="blank-template flex justify-content-center align-items-center">
    <div class="main-content w-10 xl:w-7 m-auto">
      <NuxtPage />
    </div>
    <MoleculesBackground />
  </main>
</template>

<style lang="scss">
.blank-template {
  height: 100vh;
  width: 100vw;
  .main-content {
    z-index: 10;
  }
}
</style>

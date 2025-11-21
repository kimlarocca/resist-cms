<script setup></script>

<template>
  <div class="home container">
    <section class="text-center">
      <h1 class="text-center mb-4">Choose wisely. Vote informed.</h1>
      <p>
        Click any photo or name to learn more about a candidate. Click and hold to select
        up to 4 candidates to compare.
      </p>
    </section>
    <section>
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-16"
      >
        <NuxtLink to="/" class="plain">
          <div class="candidate-card rounded-xl">
            <div class="candidate-card-image z-0">
              <img
                src="https://picsum.photos/200"
                alt="Candidate Name"
                class="w-full h-auto rounded-xl"
              />
            </div>
            <div class="candidate-card-details bg-blue z-10 rounded-xl p-4">
              <p class="like-h3">Candidate Name</p>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style lang="scss">
.candidate-card-details {
  margin: -2rem auto 0;
  width: calc(100% - 2rem);
}
</style>

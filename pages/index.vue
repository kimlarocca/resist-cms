<script setup></script>

<template>
  <div class="home container">
    <div class="hero pt-8 px-4 lg:px-16">
      <div class="hero-content">
        <h1 class="mb-3">
          Can New Jersey <br class="hidden xs:block" />Trust Jack Ciattarelli?
        </h1>
        <p class="mb-6">
          He shifts with the wind, leaving New Jersey behind. Jack Ciattarelli
          once admitted Trump was unfit, then flipped to embrace the MAGA
          agenda. He claims to put New Jersey first but backs policies that
          restrict freedoms and benefit the powerful, not everyday people. Our
          state needs consistent, common-sense leadership—not someone who bends
          to Trump.
        </p>
        <h2 class="mb-9">
          Can we trust Jack's values, <br class="hidden sm:block" />or will he
          say anything to win?
        </h2>
        <NuxtLink to="/take-action">
          <Button label="Take Action!" severity="secondary" class="mr-2 mb-9" />
        </NuxtLink>
        <div class="hidden lg:block">
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/2TnsMJn1pU0?si=2Us-4DKzCBsWVpu_"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          />
        </div>
      </div>
    </div>
    <div class="px-4">
      <div class="lg:hidden">
        <iframe
          width="100%"
          height="315"
          src="https://www.youtube.com/embed/2TnsMJn1pU0?si=2Us-4DKzCBsWVpu_"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.hero {
  background: url('/images/smaller-mobile-hero.jpg') no-repeat top center;
  background-size: contain;
  min-height: 1339px;
  @media (min-width: 429px) {
    background: url('/images/mobile-hero.jpg') no-repeat center center;
    background-size: cover;
  }
  @media (min-width: 769px) {
    background: url('/images/smaller-tablet-hero.jpg') no-repeat top center;
    min-height: 680px;
  }
  @media (min-width: 1024px) {
    background: url('/images/tablet-hero.jpg') no-repeat top left;
  }
  @media (min-width: 1250px) {
    background: url('/images/desktop-hero.jpg') no-repeat top right;
  }
}
.hero-content {
  @media (min-width: 769px) {
    max-width: 500px;
  }

  @media (min-width: 1024px) {
    max-width: 700px;
  }
}
</style>

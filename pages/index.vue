<script setup></script>

<template>
  <div class="home container">
    <!-- hero section -->
    <div class="hero pt-8 px-4 lg:px-16">
      <div class="hero-content">
        <h1 class="mb-4">
          Can New Jersey <br class="hidden xs:block" />Trust Jack Ciattarelli?
        </h1>
        <p class="mb-8">
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
    <!-- video for mobile -->
    <div class="lg:hidden mb-6">
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
    <!-- jack playing politics -->
    <div class="lg:px-24">
      <div class="grid grid-cols-1 lg:grid-cols-2 lg:gap-12 mt-4 xl:mt-0">
        <div class="px-6 lg:px-0">
          <h2 class="mb-4">Jack Playing Politics</h2>
          <p class="mb-8">
            Even when caught being dishonest Jack doubles down on hypocrisy.
          </p>
          <img
            src="/images/JackAndDonny.png"
            alt="Jack And Donny - Jack Playing Politics"
          />
        </div>
        <div class="self-center">
          <img
            src="/images/JackTheFlipper.jpg"
            alt="Are Jack's policies dangerous for New Jersey? - Jack The Flipper"
            class="w-full lg:w-fit"
          />
          <p class="mt-4 px-6 mx-auto lg:w-5/6">
            Jack the Flipper has been all over the map, from Sussex to Cape May,
            on some of the most important issues facing New Jersey and the
            country.
          </p>
        </div>
      </div>
    </div>
    <!-- jack vs mikie -->
    <div
      class="jack-vs-mikie flex md:items-center justify-center mt-12 lg:mt-0"
    >
      <div class="px-8 py-12 text-center">
        <h2 class="h1-static text-white mb-6">Jack vs. Mikie</h2>
        <p class="text-white mb-8">
          How does Jack compare to his opponent, Mikie Sherrill?
        </p>
        <NuxtLink to="/jack-vs-mikie">
          <Button label="See For Yourself" />
        </NuxtLink>
      </div>
    </div>
    <!-- key dates / DYOR -->
    <div class="p-8 lg:pt-10 lg:pb-24 lg:px-24">
      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-4 lg:gap-16 xl:gap-32 mt-12"
      >
        <div class="px-6 lg:px-0 text-center">
          <img src="/images/KeyDates.jpg" alt="Key Dates" />
        </div>
        <div class="px-6 lg:px-0 text-center">
          <img src="/images/DYOR.jpg" alt="DYOR - Do Your Own Research" />
        </div>
      </div>
    </div>
    <!-- take action -->
    <div class="take-action flex items-center justify-center mt-12 lg:mt-0">
      <div class="px-8 py-12 text-center">
        <h2 class="h1-static text-white mb-6">Take Action</h2>
        <p class="text-white mb-8">
          New Jersey deserves a leader with consistent values who puts people
          over politics.
        </p>
        <a href="https://papnj.com/#volunteer" target="_blank">
          <Button label="Join The Resistance" class="mr-2" />
        </a>
      </div>
    </div>
    <!-- important issues -->
    <div class="p-12 text-center">
      <h2 class="like-h1 mb-8">
        Issues important to the people of New Jersey:
      </h2>
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-fit m-auto"
      >
        <div class="text-center">
          <img src="/images/FreeSpeech.jpg" alt="Free Speech" />
        </div>
        <div class="text-center">
          <img src="/images/MilitaryTakeOver.jpg" alt="Military Take Over" />
        </div>
        <div class="text-center">
          <img src="/images/DueProcess.jpg" alt="Due Process" />
        </div>
        <div class="text-center">
          <img src="/images/PublicEducation.jpg" alt="Public Education" />
        </div>
        <div class="text-center">
          <img src="/images/VaccineRollback.jpg" alt="Vaccine Rollback" />
        </div>
        <div class="text-center">
          <img src="/images/BodilyAutonomy.jpg" alt="Bodily Autonomy" />
        </div>
        <div class="text-center">
          <img src="/images/FEMA.jpg" alt="FEMA" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
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
    min-height: 790px;
  }
  @media (min-width: 1250px) {
    background: url('/images/desktop-hero.jpg') no-repeat top right;
    min-height: 910px;
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
.jack-vs-mikie {
  background: url('/images/JackVsMikie-Mobile.jpg') no-repeat bottom center;
  background-size: cover;
  height: 720px;
  @media (min-width: 768px) {
    background: url('/images/JackVsMikie-Desktop.jpg') no-repeat top center;
    background-size: cover;
    height: auto;
    width: 100%;
  }
  @media (min-width: 1440px) {
    background-size: cover;
    height: 420px;
  }
}
.take-action {
  background: url('/images/TakeActionBackground.jpg') no-repeat center center;
  background-size: cover;
  height: 340px;
}
</style>

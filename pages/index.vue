<script setup>
const showFreeSpeech = ref(false)
const showMilitaryTakeOver = ref(false)
const showDueProcess = ref(false)
const showPublicEducation = ref(false)
const showVaccineRollback = ref(false)
const showBodilyAutonomy = ref(false)
const showFEMA = ref(false)
</script>

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
          Does Jack share our values, <br class="hidden sm:block" />
          or will he say anything to win?
        </h2>
        <NuxtLink to="#issues">
          <Button label="Learn More" severity="secondary" class="mr-2 mb-9" />
        </NuxtLink>
        <div class="hidden lg:block">
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/ZW0S74-4b68?si=CkoQ2lKMcHOQt2-K"
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
    <div id="playing-politics" class="lg:px-24">
      <div class="grid grid-cols-1 lg:grid-cols-2 lg:gap-12 mt-4 xl:mt-0">
        <div class="px-6 lg:px-0">
          <h2 class="mb-4">Jack Playing Politics</h2>
          <p class="mb-8">
            Jack the Flipper was asked about voting for somebody he said brings
            out our worst instincts and fears, he just smirks his way to
            hypocrisy. How can NJ trust him on anything?
          </p>
          <img
            src="/images/JackAndDonny.png"
            alt="Jack And Donny - Jack Playing Politics"
          />
        </div>
        <div class="self-center">
          <NuxtLink to="/we-dont-know-jack" class="plain">
            <img
              src="/images/JackTheFlipper.jpg"
              alt="Are Jack's policies dangerous for New Jersey? - Jack The Flipper"
              class="w-full lg:w-fit"
            />
          </NuxtLink>
          <p class="mt-4 px-6 mx-auto lg:w-5/6">
            He's been running for Governor forever, but we still don't know
            Jack. Get to know Jack's history publishing Opioid propaganda,
            accessing Mikie's personal information, and the horrific act
            committed by one of his supporters.
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
          <NuxtLink to="/key-dates" class="plain">
            <img src="/images/KeyDates.jpg" alt="Key Dates" />
          </NuxtLink>
        </div>
        <div class="px-6 lg:px-0 text-center">
          <NuxtLink to="/dyor" class="plain">
            <img src="/images/DYOR.jpg" alt="DYOR - Do Your Own Research" />
          </NuxtLink>
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
    <div id="issues" class="p-12 text-center">
      <h2 class="like-h1 mb-8">
        Issues important to the people of New Jersey:
      </h2>
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-fit m-auto"
      >
        <div class="text-center">
          <img
            src="/images/FreeSpeech.jpg"
            alt="Free Speech"
            class="plain"
            @click="showFreeSpeech = true"
          />
        </div>
        <div class="text-center">
          <img
            src="/images/MilitaryTakeOver.jpg"
            alt="Military Take Over"
            class="plain"
            @click="showMilitaryTakeOver = true"
          />
        </div>
        <div class="text-center">
          <img
            src="/images/DueProcess.jpg"
            alt="Due Process"
            class="plain"
            @click="showDueProcess = true"
          />
        </div>
        <div class="text-center">
          <img
            src="/images/PublicEducation.jpg"
            alt="Public Education"
            class="plain"
            @click="showPublicEducation = true"
          />
        </div>
        <div class="text-center">
          <img
            src="/images/VaccineRollback.jpg"
            alt="Vaccine Rollback"
            class="plain"
            @click="showVaccineRollback = true"
          />
        </div>
        <div class="text-center">
          <img
            src="/images/BodilyAutonomy.jpg"
            alt="Bodily Autonomy"
            class="plain"
            @click="showBodilyAutonomy = true"
          />
        </div>
        <div class="text-center">
          <img
            src="/images/FEMA.jpg"
            alt="FEMA"
            class="plain"
            @click="showFEMA = true"
          />
        </div>
      </div>
    </div>
    <!-- Dialogs -->
    <Dialog v-model:visible="showFreeSpeech" modal :style="{ width: '90vw' }">
      <FreeSpeech />
    </Dialog>
    <Dialog
      v-model:visible="showMilitaryTakeOver"
      modal
      :style="{ width: '90vw' }"
    >
      <MilitaryTakeOver />
    </Dialog>
    <Dialog v-model:visible="showDueProcess" modal :style="{ width: '90vw' }">
      <DueProcess />
    </Dialog>
    <Dialog
      v-model:visible="showPublicEducation"
      modal
      :style="{ width: '90vw' }"
    >
      <PublicEducation />
    </Dialog>
    <Dialog
      v-model:visible="showVaccineRollback"
      modal
      :style="{ width: '90vw' }"
    >
      <VaccineRollback />
    </Dialog>
    <Dialog
      v-model:visible="showBodilyAutonomy"
      modal
      :style="{ width: '90vw' }"
    >
      <BodilyAutonomy />
    </Dialog>
    <Dialog v-model:visible="showFEMA" modal :style="{ width: '90vw' }">
      <FEMA />
    </Dialog>
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

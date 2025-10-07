<script setup>
const topics = [
  {
    jack: '[crickets]',
    topic: 'Federal Troops In Cities',
    mikie: 'Defend Our Cities'
  },
  {
    jack: 'Republicans Only',
    topic: 'Gerrymandering',
    mikie: 'Supports Anti-Gerrymandering Policies'
  },
  {
    jack: 'Opposes or [crickets]',
    topic: 'PBS Funding',
    mikie: 'Supports'
  },
  {
    jack: '[crickets]',
    topic: 'Fed Independence',
    mikie: 'Supports'
  },
  {
    jack: 'Democrats Only',
    topic: 'Attorney General Independence',
    mikie: 'Supports'
  },
  {
    jack: 'Supports',
    topic: 'Defunding the Department of Education',
    mikie: 'Opposes'
  },
  { jack: 'Supports', topic: 'School Voucher Programs', mikie: 'Opposes' },
  { jack: '[crickets]', topic: 'FEMA Funding', mikie: 'Supports' },
  { jack: '[crickets]', topic: 'Masked ICE Agents', mikie: 'Opposes' },
  { jack: 'For Gun Owners Only', topic: 'Due Process', mikie: 'For All' },
  {
    jack: 'Republicans Only',
    topic: 'Government by Executive Order',
    mikie: 'Opposes'
  },
  { jack: 'Opposes', topic: 'Teaching Actual History', mikie: 'Supports' },
  { jack: 'Opposes', topic: 'Recreational Marijuana', mikie: 'Supports' },
  {
    jack: 'Sometimes Supports',
    topic: 'Right To Choose',
    mikie: 'Supports, Including NJ Protections'
  },
  {
    jack: 'Supports',
    topic: 'Deport Violent Immigrant Criminals',
    mikie: 'Supports'
  },
  {
    jack: '[crickets]',
    topic: 'Deport Non-Violent Immigrant Criminals',
    mikie: 'Opposes'
  },
  {
    jack: '[crickets]',
    topic: 'Sue Universities Who Are Neutral Or Disagree Politically',
    mikie: 'Opposes'
  },
  {
    jack: '[crickets]',
    topic: 'Sue Media Who Are Neutral Or Disagree Politically',
    mikie: 'Opposes'
  },
  { jack: '[crickets]', topic: 'Vaccine Research', mikie: 'Supports' },
  {
    jack: 'Supports',
    topic: 'Authoritarian Aid Withholding',
    mikie: 'Opposes'
  },
  {
    jack: '[crickets]',
    topic: 'Protect Medicare & Medicaid',
    mikie: 'Supports'
  },
  { jack: '[crickets]', topic: 'Private ICE Prisons', mikie: 'Opposes' },
  {
    jack: 'Supports',
    topic: 'Local Police & Immigrant Enforcement',
    mikie: 'Opposes'
  },
  { jack: 'Supports', topic: 'Frantic Tariff Policy', mikie: 'Opposes' },
  { jack: 'When Convenient', topic: 'Unions', mikie: 'Supports 100%' }
]
</script>

<template>
  <div>
    <div
      class="jack-vs-mikie text-white flex md:items-center justify-center mt-12 lg:mt-0 relative"
    >
      <div class="px-8 py-12 text-center">
        <h1 class="text-white mb-1">Jack vs. Mikie</h1>
        <h2 class="mb-6 text-white">the tale of the tape</h2>
        <p class="pb-8">
          How does Jack compare to his opponent, Mikie Sherrill?
        </p>
      </div>
      <div class="container grid grid-cols-3 absolute px-4 bottom-4">
        <h3>JACK</h3>
        <h3 class="text-center">TOPIC</h3>
        <h3 class="text-right">MIKIE</h3>
      </div>
    </div>
    <div class="container p-4">
      <div v-for="(topic, index) in topics" :key="index">
        <div class="flex w-full my-3">
          <p class="flex-1 text-red">{{ topic.jack }}</p>
          <p class="flex-1 text-center">{{ topic.topic }}</p>
          <p class="flex-1 text-blue text-right">{{ topic.mikie }}</p>
        </div>
        <hr />
      </div>
    </div>
    <!-- key dates / DYOR -->
    <div class="container p-8 lg:pt-10 lg:pb-24 lg:px-24">
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
  </div>
</template>

<style lang="scss" scoped>
p {
  font-weight: 700;
  font-size: 14px;
  @media (min-width: 768px) {
    font-size: 18px;
  }
}
</style>

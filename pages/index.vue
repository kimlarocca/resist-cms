<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Banner - Mikie Made Millions Style -->
    <section
      class="relative bg-gradient-to-r from-purple-900 via-blue-900 to-green-800 text-white py-32 overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-20">
        <div class="absolute inset-0 bg-repeat bg-center"
          style="background-image: radial-gradient(circle, rgba(255,255,255,0.1) 2px, transparent 2px); background-size: 30px 30px;">
        </div>
      </div>

      <div class="container mx-auto px-4 text-center relative z-10">
        <!-- Main Title Split Like Mikie Made Millions -->
        <div class="mb-8">
          <h1 class="text-6xl md:text-8xl font-bold mb-4 tracking-wider">
            <span class="block">Jack Can't</span>
            <span class="block text-yellow-400">Millions</span>
          </h1>
        </div>

        <!-- Hero Image/Cutout Area -->
        <div class="relative mb-8">
          <div class="w-96 h-96 mx-auto bg-gray-300 rounded-lg opacity-80 flex items-center justify-center">
            <span class="text-gray-600 text-xl">Jack Ciattarelli Image</span>
          </div>
        </div>

        <!-- Main Statement - Similar to Mikie's -->
        <h2 class="text-2xl md:text-4xl font-bold mb-8 max-w-5xl mx-auto leading-tight">
          <span class="text-white">Since coming to power in New Jersey politics, </span>
          <span class="text-yellow-400">Jack Ciattarelli </span>
          <span class="text-white">has </span>
          <span class="text-yellow-400">flip-flopped his way</span>
          <span class="text-white"> through an estimated </span>
          <span class="text-yellow-400">300+ policy reversals.</span>
        </h2>

        <!-- Stats Display -->
        <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
          <div>
            <h3 class="text-5xl md:text-6xl font-bold text-yellow-400 mb-2">
              300+
              <br>
              <span class="text-2xl">Flip-Flops</span>
            </h3>
          </div>
          <div>
            <h3 class="text-5xl md:text-6xl font-bold text-yellow-400">
              $7 Million+ In Campaign Promises Broken
            </h3>
          </div>
        </div>
      </div>
    </section>

    <!-- Video Section - Similar to Mikie Made Millions -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <Card class="shadow-2xl overflow-hidden">
            <template #content>
              <div class="relative">
                <!-- Video Placeholder -->
                <div class="bg-gray-900 aspect-video flex items-center justify-center">
                  <div class="text-center text-white">
                    <div
                      class="w-20 h-20 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 5v10l8-5z" />
                      </svg>
                    </div>
                    <p class="text-lg">Jack at the "Stop the Steal" Rally</p>
                    <p class="text-sm opacity-75">YouTube: https://www.youtube.com/watch?v=R7cr_UfRkyE</p>
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </section>

    <!-- Image Gallery Section - Trading Cards Style -->
    <section class="py-16 bg-gray-100">
      <div class="container mx-auto px-4">
        <h2 class="text-4xl font-bold mb-8 text-center text-gray-800">
          Jack's Greatest Flip-Flops
        </h2>
        <p class="text-center text-gray-600 mb-12 text-lg">
          According to <a href="#" class="text-blue-600 underline">PublicRecords.org</a>,
          <span class="font-bold text-red-600">Jack Ciattarelli's largest policy reversals include:</span>
        </p>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <!-- Flip-Flop Card 1 -->
          <Card class="shadow-lg bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-300">
            <template #content>
              <div class="p-6 text-center">
                <div class="text-2xl font-bold text-red-800 mb-2">Trump Position</div>
                <div class="text-lg mb-4">December 2015</div>
                <div class="bg-white p-4 rounded-lg shadow-inner">
                  <p class="text-gray-800 font-medium">"Trump is a charlatan... an embarrassment to the Republican
                    Party."</p>
                </div>
                <div class="mt-4 text-sm text-red-600">
                  <strong>Current Status:</strong> Full MAGA supporter
                </div>
              </div>
            </template>
          </Card>

          <!-- Flip-Flop Card 2 -->
          <Card class="shadow-lg bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-300">
            <template #content>
              <div class="p-6 text-center">
                <div class="text-2xl font-bold text-orange-800 mb-2">Stop the Steal</div>
                <div class="text-lg mb-4">November 2020</div>
                <div class="bg-white p-4 rounded-lg shadow-inner">
                  <p class="text-gray-800 font-medium">Spoke at Bedminster rally, then claimed "I didn't know what it
                    was"</p>
                </div>
                <div class="mt-4 text-sm text-orange-600">
                  <strong>Evidence:</strong> Official flyer shows his name
                </div>
              </div>
            </template>
          </Card>

          <!-- Flip-Flop Card 3 -->
          <Card class="shadow-lg bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-300">
            <template #content>
              <div class="p-6 text-center">
                <div class="text-2xl font-bold text-blue-800 mb-2">Jan 6 Pardons</div>
                <div class="text-lg mb-4">January 2025</div>
                <div class="bg-white p-4 rounded-lg shadow-inner">
                  <p class="text-gray-800 font-medium">From "lawbreakers shouldn't be pardoned" to embracing "national
                    reconciliation"</p>
                </div>
                <div class="mt-4 text-sm text-blue-600">
                  <strong>Impact:</strong> Silent on Officer Sicknick's killers
                </div>
              </div>
            </template>
          </Card>

          <!-- Flip-Flop Card 4 -->
          <Card class="shadow-lg bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-300">
            <template #content>
              <div class="p-6 text-center">
                <div class="text-2xl font-bold text-green-800 mb-2">Education Policy</div>
                <div class="text-lg mb-4">2024-2025</div>
                <div class="bg-white p-4 rounded-lg shadow-inner">
                  <p class="text-gray-800 font-medium">From supporting public education to echoing Trump's DOE
                    dismantling</p>
                </div>
                <div class="mt-4 text-sm text-green-600">
                  <strong>Result:</strong> Threatens Title I funding
                </div>
              </div>
            </template>
          </Card>

          <!-- Flip-Flop Card 5 -->
          <Card class="shadow-lg bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-purple-300">
            <template #content>
              <div class="p-6 text-center">
                <div class="text-2xl font-bold text-purple-800 mb-2">Due Process</div>
                <div class="text-lg mb-4">2024</div>
                <div class="bg-white p-4 rounded-lg shadow-inner">
                  <p class="text-gray-800 font-medium">"Defend due process" for guns, but supports warrantless ICE raids
                  </p>
                </div>
                <div class="mt-4 text-sm text-purple-600">
                  <strong>Hypocrisy:</strong> Selective constitutional protection
                </div>
              </div>
            </template>
          </Card>

          <!-- Flip-Flop Card 6 -->
          <Card class="shadow-lg bg-gradient-to-br from-pink-100 to-pink-200 border-2 border-pink-300">
            <template #content>
              <div class="p-6 text-center">
                <div class="text-2xl font-bold text-pink-800 mb-2">Medicare Promise</div>
                <div class="text-lg mb-4">Campaign Trail</div>
                <div class="bg-white p-4 rounded-lg shadow-inner">
                  <p class="text-gray-800 font-medium">"Never support cuts" while party slashes $880 billion</p>
                </div>
                <div class="mt-4 text-sm text-pink-600">
                  <strong>Reality:</strong> Empty promises to seniors
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </section>

    <!-- Background Video Section -->
    <section class="py-16 relative overflow-hidden">
      <!-- Background Video Placeholder -->
      <div class="absolute inset-0 bg-gray-800">
        <div class="absolute inset-0 bg-black bg-opacity-50"></div>
        <div class="absolute inset-0 flex items-center justify-center text-white">
          <div class="text-center">
            <div class="text-6xl mb-4">🎭</div>
            <p class="text-xl">Background: Jack's Political Theater</p>
          </div>
        </div>
      </div>

      <div class="relative z-10 container mx-auto px-4 py-20">
        <div class="max-w-4xl mx-auto bg-black bg-opacity-70 p-8 rounded-lg text-white text-center">
          <h3 class="text-3xl font-bold mb-6 text-yellow-400">
            According to Fact-Checkers and Public Records
          </h3>
          <p class="text-xl leading-relaxed">
            <span class="text-yellow-400 font-bold">Jack Ciattarelli's largest political flip-flops include:</span>
            abandoning core principles whenever Trump changes direction,
            claiming ignorance of events he publicly participated in,
            and promising protections while supporting policies that eliminate them.
          </p>
        </div>
      </div>
    </section>

    <!-- Jack's Wind Vane -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-4xl font-bold mb-8 text-gray-800">Jack's Wind Vane</h2>
        <div class="max-w-2xl mx-auto mb-8">
          <Card class="shadow-lg">
            <template #content>
              <div class="p-8">
                <div class="text-6xl mb-4">🎯</div>
                <div class="space-y-2 text-lg">
                  <div class="animate-pulse">• Trump Lapdog</div>
                  <div class="animate-pulse">• MAGA the Next</div>
                  <div class="animate-pulse">• Moderate One Day</div>
                  <div class="animate-pulse">• DeSantis Copycat</div>
                </div>
              </div>
            </template>
          </Card>
        </div>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Jack will go whichever way the wind blows—because he's not leading,
          he's following.
        </p>
      </div>
    </section>

    <!-- Issue Breakdown -->
    <section id="issues" class="py-16 bg-gray-100">
      <div class="container mx-auto px-4">
        <h2 class="text-4xl font-bold mb-12 text-center text-gray-800">
          Issue Breakdown
        </h2>

        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <!-- Education Rollbacks -->
          <Card class="shadow-lg hover:shadow-xl transition-shadow">
            <template #header>
              <div class="bg-red-600 text-white p-4">
                <h3 class="text-xl font-bold">
                  Education Rollbacks & DOE Dismantling
                </h3>
              </div>
            </template>
            <template #content>
              <div class="p-4">
                <p class="mb-4 text-gray-700">
                  Jack is terrified to teach real history—slavery, Jim Crow,
                  labor battles, civil-rights protests vanish from classrooms.
                  He echoes Trump's push to gut the U.S. Department of
                  Education.
                </p>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• Manages Title I grants for low-income schools</li>
                  <li>
                    • Enforces IDEA protections for special-needs students
                  </li>
                  <li>• Conducts civil-rights investigations</li>
                  <li>
                    • Provides teacher training and literacy interventions
                  </li>
                </ul>
                <blockquote class="mt-4 p-3 bg-gray-200 border-l-4 border-red-500 italic">
                  "We'll rename the state Comptroller NJDOGE, elevate him to a
                  cabinet post, and weed out fraud."
                </blockquote>
              </div>
            </template>
          </Card>

          <!-- Private Prisons -->
          <Card class="shadow-lg hover:shadow-xl transition-shadow">
            <template #header>
              <div class="bg-red-600 text-white p-4">
                <h3 class="text-xl font-bold">
                  Private Prisons & Jan. 6 Pardons
                </h3>
              </div>
            </template>
            <template #content>
              <div class="p-4">
                <p class="text-gray-700">
                  Jack preaches "law and order"—while cheering private-prison
                  profiteers and staying stone-cold silent when Trump pardoned
                  Jan. 6 rioters who beat and murdered Officer Brian Sicknick.
                </p>
              </div>
            </template>
          </Card>

          <!-- ICE Raids -->
          <Card class="shadow-lg hover:shadow-xl transition-shadow">
            <template #header>
              <div class="bg-red-600 text-white p-4">
                <h3 class="text-xl font-bold">
                  Masked ICE Raids & Due Process Hypocrisy
                </h3>
              </div>
            </template>
            <template #content>
              <div class="p-4">
                <p class="text-gray-700">
                  Jack champions "defend due process" only for gun owners; on
                  immigration, he backs masked ICE agents snatching neighbors
                  without warrants.
                </p>
              </div>
            </template>
          </Card>

          <!-- Social Security -->
          <Card class="shadow-lg hover:shadow-xl transition-shadow">
            <template #header>
              <div class="bg-red-600 text-white p-4">
                <h3 class="text-xl font-bold">
                  Social Security & Medicare Betrayal
                </h3>
              </div>
            </template>
            <template #content>
              <div class="p-4">
                <p class="text-gray-700">
                  "Jack will never support cuts to Social Security or Medicare
                  for seniors"? His party in Washington just rammed a budget
                  slashing $880 billion from Medicare/Medicaid.
                </p>
              </div>
            </template>
          </Card>

          <!-- Authoritarian Aid -->
          <Card class="shadow-lg hover:shadow-xl transition-shadow">
            <template #header>
              <div class="bg-red-600 text-white p-4">
                <h3 class="text-xl font-bold">Authoritarian Aid Withholding</h3>
              </div>
            </template>
            <template #content>
              <div class="p-4">
                <p class="text-gray-700">
                  Jack warns that cities "who disobey could have municipal aid
                  withheld from Trenton until they comply." Strongman tactics
                  straight from Trump's playbook.
                </p>
              </div>
            </template>
          </Card>

          <!-- Public Health -->
          <Card class="shadow-lg hover:shadow-xl transition-shadow">
            <template #header>
              <div class="bg-red-600 text-white p-4">
                <h3 class="text-xl font-bold">
                  Public Health & Vaccine Rollbacks
                </h3>
              </div>
            </template>
            <template #content>
              <div class="p-4">
                <p class="text-gray-700">
                  He'd gut scientific advisory panels, block vaccine mandates
                  under broad religious exemptions, and starve routine
                  immunization programs.
                </p>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </section>

    <!-- Trump Echo Table -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <h2 class="text-4xl font-bold mb-8 text-center text-gray-800">
          Trump Echo Table
        </h2>
        <div class="overflow-x-auto">
          <DataTable :value="trumpEchoData" class="shadow-lg">
            <Column field="policy" header="Policy" class="font-semibold"></Column>
            <Column field="trump" header="Trump" class="text-center">
              <template #body="slotProps">
                <span v-if="slotProps.data.trump === 'yes'" class="text-green-600 text-xl">✅</span>
                <span v-else class="text-red-600 text-xl">❌</span>
              </template>
            </Column>
            <Column field="jack" header="Jack Ciattarelli" class="text-center">
              <template #body="slotProps">
                <span v-if="slotProps.data.jack === 'yes'" class="text-green-600 text-xl">✅</span>
                <span v-else-if="slotProps.data.jack === 'crickets'" class="text-red-600">❌ crickets</span>
                <span v-else class="text-red-600 text-xl">❌</span>
              </template>
            </Column>
          </DataTable>
        </div>
        <p class="text-center text-gray-600 mt-4 text-lg">
          Jack isn't an exception—he echoes Trump's worst ideas without a
          moment's hesitation.
        </p>
      </div>
    </section>

    <!-- Stop The Steal Video -->
    <section class="py-16 bg-gray-100">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-4xl font-bold mb-8 text-gray-800">
          Jack at the "Stop the Steal" Rally
        </h2>
        <div class="max-w-4xl mx-auto">
          <Card class="shadow-lg">
            <template #content>
              <div class="p-8">
                <p class="text-xl mb-6 text-gray-700">
                  On January 6, 2021, Jack Ciattarelli spoke at the same
                  Bedminster stage as Stop the Steal organizers—then claimed he
                  "didn't know" its purpose, despite being on the official
                  flyer.
                </p>
                <div class="bg-gray-200 p-8 rounded-lg mb-4">
                  <p class="text-gray-500 text-lg">
                    [Video Embed: Jack at Stop the Steal Rally]
                  </p>
                  <p class="text-sm text-gray-400 mt-2">
                    YouTube: https://www.youtube.com/watch?v=R7cr_UfRkyE
                  </p>
                </div>
                <p class="text-gray-600 italic">
                  Jack at the Stop the Steal rally—his ignorance excuse fell
                  flat.
                </p>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </section>

    <!-- MAGA Confusion Carousel -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <h2 class="text-4xl font-bold mb-8 text-center text-gray-800">
          MAGA Confusion Carousel
        </h2>
        <div class="max-w-4xl mx-auto">
          <p class="text-xl mb-8 text-center text-gray-700">
            Jack's journey from Trump critic to MAGA acolyte twists faster than
            a weathervane:
          </p>

          <Timeline :value="timelineEvents" class="w-full">
            <template #marker="slotProps">
              <span class="flex w-8 h-8 items-center justify-center bg-red-500 text-white rounded-full z-10 shadow-lg">
                <i class="pi pi-calendar"></i>
              </span>
            </template>
            <template #content="slotProps">
              <Card class="shadow-md">
                <template #title>
                  <div class="text-red-600 font-bold">
                    {{ slotProps.item.date }}
                  </div>
                </template>
                <template #content>
                  <div class="text-gray-700" v-html="slotProps.item.content"></div>
                </template>
              </Card>
            </template>
          </Timeline>
        </div>
      </div>
    </section>

    <!-- Rights At Risk -->
    <section class="py-16 bg-gray-100">
      <div class="container mx-auto px-4">
        <h2 class="text-4xl font-bold mb-8 text-center text-gray-800">
          Rights Jack Puts At Risk
        </h2>
        <div class="overflow-x-auto">
          <DataTable :value="rightsData" class="shadow-lg">
            <Column field="right" header="Right" class="font-semibold w-1/4"></Column>
            <Column field="threat" header="How Jack Threatens It" class="w-3/4"></Column>
          </DataTable>
        </div>
      </div>
    </section>

    <!-- NJ at Risk - Satirical Futures -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <h2 class="text-4xl font-bold mb-8 text-center text-gray-800">
          NJ at Risk — Satirical Futures
        </h2>
        <p class="text-center text-gray-600 italic mb-8">
          Not far-fetched under today's overreach.
        </p>

        <div class="grid gap-6 md:grid-cols-2">
          <Card class="shadow-lg hover:shadow-xl transition-shadow">
            <template #title>
              <div class="text-red-600 font-bold">Jersey Shore Alcatraz</div>
            </template>
            <template #content>
              <p class="text-gray-700">
                Beach-side prison moat patrolled by Snooki and ICE SWAT.
              </p>
            </template>
          </Card>

          <Card class="shadow-lg hover:shadow-xl transition-shadow">
            <template #title>
              <div class="text-red-600 font-bold">Camden Camps</div>
            </template>
            <template #content>
              <p class="text-gray-700">
                Barbed-wire "processing centers" for immigrants—no due process
                required.
              </p>
            </template>
          </Card>

          <Card class="shadow-lg hover:shadow-xl transition-shadow">
            <template #title>
              <div class="text-red-600 font-bold">Drowning Suburbs</div>
            </template>
            <template #content>
              <p class="text-gray-700">
                No FEMA, no flood insurance; your street becomes a canal.
              </p>
            </template>
          </Card>

          <Card class="shadow-lg hover:shadow-xl transition-shadow">
            <template #title>
              <div class="text-red-600 font-bold">Medicare Mausoleum</div>
            </template>
            <template #content>
              <p class="text-gray-700">
                Senior centers turned relic warehouses once benefits vanish.
              </p>
            </template>
          </Card>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="py-16 bg-red-800 text-white">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-4xl font-bold mb-12">Take Action Now</h2>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
          <Button label="Request a Yard Sign" severity="secondary" size="large"
            class="bg-white text-red-800 hover:bg-gray-100 font-semibold py-3" @click="requestYardSign" />
          <Button label="Volunteer for the Resistance" severity="secondary" size="large"
            class="bg-white text-red-800 hover:bg-gray-100 font-semibold py-3" @click="openVolunteerLink" />
          <Button label="Share This Site" severity="secondary" size="large"
            class="bg-white text-red-800 hover:bg-gray-100 font-semibold py-3" @click="shareWebsite" />
          <Button label="Donate Now" severity="secondary" size="large"
            class="bg-white text-red-800 hover:bg-gray-100 font-semibold py-3" @click="openDonateLink" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// SEO Meta
useSeoMeta({
  title: 'Jack Can\'t Millions – Exposing Jack Ciattarelli\'s Political Flip-Flops',
  description:
    "Watch Jack Ciattarelli flip-flop through 300+ policy reversals. From Trump critic to MAGA supporter, see how Jack can't stick to any position for millions of reasons.",
  keywords:
    'Jack Ciattarelli, NJ politics, MAGA, Stop the Steal, Super PAC, Trump ties, flip-flops, policy reversals, political theater'
})

// Data for Trump Echo Table
const trumpEchoData = ref([
  {
    policy: 'Dismantle Dept. of Education',
    trump: 'yes',
    jack: 'yes'
  },
  {
    policy: 'Private Prison Profit Motive',
    trump: 'yes',
    jack: 'yes'
  },
  {
    policy: 'Jan. 6 Pardons',
    trump: 'yes',
    jack: 'crickets'
  },
  {
    policy: 'ICE Raids & Sanctuary Repeal',
    trump: 'yes',
    jack: 'yes'
  },
  {
    policy: 'Fiscal "Conservatism" Fallout (NJDOGE)',
    trump: 'yes',
    jack: 'yes'
  }
])

// Timeline data for MAGA Confusion Carousel
const timelineEvents = ref([
  {
    date: 'December 2015',
    content: '"Trump is a charlatan… an embarrassment to the Republican Party."'
  },
  {
    date: 'October 2016',
    content:
      'Praised Trump to "end gridlock," then flipped when the Access Hollywood tape dropped—"I will not vote for any presidential candidate."'
  },
  {
    date: 'November 2020',
    content:
      'Spoke at Bedminster\'s Stop the Steal rally, then claimed, "I didn\'t know what it was," even as Confederate flags waved behind him.'
  },
  {
    date: 'January 6, 2021',
    content:
      'Refused to acknowledge Biden\'s victory until <em>after</em> the Capitol was breached—then "congratulated" Biden while condemning the violence.'
  },
  {
    date: 'Early 2025',
    content: `
      <strong>Phase 1:</strong> "People who broke the law should not be pardoned."<br>
      <strong>Phase 2:</strong> Praised limited clemency for non-violent offenders.<br>
      <strong>Phase 3:</strong> Embraced Trump's blanket Jan. 6 pardons as "national reconciliation"—exactly what "Daddy Trump" demanded.
    `
  },
  {
    date: 'Silence on Officer Brian Sicknick',
    content:
      'Not a single public word on the pardon of the rioters who killed him—a family called it "an insult to justice."'
  }
])

// Rights at Risk data
const rightsData = ref([
  {
    right: 'Due Process',
    threat: 'Masked ICE raids without warrants'
  },
  {
    right: 'Equal Education',
    threat: 'Gutting DOE functions; censoring real history'
  },
  {
    right: "Seniors' Security",
    threat: 'Endorsing Medicare/Medicaid cuts'
  },
  {
    right: 'Free Speech',
    threat:
      '"Stop WOKE" bans; political aid withheld from "non-compliant" cities'
  },
  {
    right: 'Public Safety',
    threat: 'Private-prison pleas; pardons for Jan. 6 rioters'
  },
  {
    right: 'Disaster Preparedness',
    threat: 'Cheering FEMA cuts; zero flood resilience planning'
  }
])

// Smooth scroll to section
const scrollToSection = elementId => {
  const element = document.getElementById(elementId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

// Action handlers
const openDonateLink = () => {
  window.open('https://papnj.com/donate', '_blank')
}

const openVolunteerLink = () => {
  window.open('https://papnj.com/#volunteer', '_blank')
}

const requestYardSign = () => {
  const subject = encodeURIComponent('Yard Sign Request - Jack Can\'t Millions')
  const body = encodeURIComponent('Hi,\n\nI would like to request a yard sign for the Jack Can\'t Millions campaign.\n\nPlease let me know what information you need from me.\n\nThanks!')
  window.location.href = `mailto:info@papnj.com?subject=${subject}&body=${body}`
}

const shareWebsite = async () => {
  const shareData = {
    title: 'Jack Can\'t Millions – Exposing Jack Ciattarelli\'s Political Flip-Flops',
    text: 'Watch Jack Ciattarelli flip-flop through 300+ policy reversals. From Trump critic to MAGA supporter, see how Jack can\'t stick to any position for millions of reasons.',
    url: window.location.href
  }

  try {
    // Try native Web Share API first (mobile devices)
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard! Share it with your friends.')
    }
  } catch (error) {
    // Final fallback: Manual copy with prompt
    const url = window.location.href
    if (window.prompt('Copy this link to share:', url)) {
      // User can manually copy
    }
  }
}
</script>

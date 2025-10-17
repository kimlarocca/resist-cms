<script setup>
const topics = [
  {
    jack: '',
    topic: '<h4>Authoritarian Cruelty</h4>',
    mikie: ''
  },
  {
    jack: 'Whatever Trump Says',
    topic: 'National Guard & Military in Cities',
    mikie: "Opposes (Pro-States' Rights)"
  },
  {
    jack: 'Whatever Trump Says',
    topic: 'Withhold Aid From Political Opponents',
    mikie: 'Aid Regardless of Politics'
  },
  {
    jack: 'Negotiating Tactic',
    topic: 'Weaponizing Gateway Tunnel Funding',
    mikie: 'Opposes'
  },
  {
    jack: 'Colleges, Corporations, and Political Opponents',
    topic: 'Sue Whoever Disagrees With Me',
    mikie: 'Freedom of Speech'
  },
  {
    jack: '<a href="https://www.youtube.com/shorts/dUz7gwEk39Q" target="_blank">Only Trust Results if Republicans Win</a>',
    topic: 'Election Integrity',
    mikie:
      '<a href="https://www.youtube.com/shorts/Dz6d8I7xFgg" target="_blank">Not Campaigning with Election Deniers</a>'
  },
  {
    jack: '',
    topic: '<h4>Federal Government Overreach</h4>',
    mikie: ''
  },
  {
    jack: 'Whatever Trump Says',
    topic: 'Independence of Federal Reserve',
    mikie: 'Supports'
  },
  {
    jack: 'Whatever Trump Says',
    topic: 'Weaponization of Dept of Justice',
    mikie: 'Supports Independence'
  },
  {
    jack: 'Republicans Only',
    topic: 'Government by Executive Order',
    mikie: 'Limited Use (Energy Freeze!)'
  },
  {
    jack: 'OK for Republicans',
    topic: 'President & FCC Bullying Networks',
    mikie: 'Opposes'
  },
  {
    jack: 'Whatever Trump Says',
    topic: 'Politicization of the FTC',
    mikie: 'Independence not Politics'
  },
  {
    jack: 'Whatever Trump Says, Sorry NJ',
    topic: "States' Rights",
    mikie: "Respect State's Right"
  },
  {
    jack: '',
    topic: '<h4>Energy & Environment</h4>',
    mikie: ''
  },
  {
    jack: 'Supports Trump Ending Them',
    topic: 'Solar Incentives',
    mikie: 'For Solar Incentives'
  },
  {
    jack: 'Blame Murphy, Fire Everyone',
    topic: 'Energy Price Spikes',
    mikie: 'Supports Energy Rate Freeze'
  },
  {
    jack: 'Hates Wind',
    topic: 'Wind Energy',
    mikie: 'Supports in the Mix'
  },
  {
    jack: 'As Much As Possible',
    topic: 'Fossil Fuels',
    mikie: 'Supports Alongside Clean Energy Goals'
  },
  {
    jack: '<a href="https://www.seemorefacts.com/uploads/1/6/8/4/16843972/ciattarelli_climate_change_excerpts_01a_3.pdf" target="_blank">Used to Support</a>, Now Crickets',
    topic: 'Clean Energy & Emissions Goals',
    mikie: 'Supports Alongside Clean Energy Goals'
  },
  {
    jack: '<a href="https://www.lcv.org/blog/trumps-public-lands-sale-didnt-end-with-the-big-beautiful-bill-heres-how-hes-trying-to-sell-off-public-lands-and-gut-national-parks-and-how-were-fighting-back/" target="_blank">Defund the Parks, Sell the Land</a>',
    topic: 'National Parks & Federal Lands',
    mikie: 'Fund the Parks, Protect the Land'
  },
  {
    jack: '',
    topic: '<h4>Immigration</h4>',
    mikie: ''
  },
  {
    jack: 'Supports',
    topic: 'Masked Unidentified ICE Agents',
    mikie: 'Opposes Unidentified Kidnapping'
  },
  {
    jack: 'Whatever Trump Says',
    topic: 'Cruel Prisons for Immigrants',
    mikie: 'Opposes'
  },
  {
    jack: 'Opposes (finally!)',
    topic: 'Imprison Immigrants in Military Bases',
    mikie: 'Opposes'
  },
  {
    jack: 'Supports',
    topic: 'Local Police Supporting ICE',
    mikie: 'Opposes'
  },
  {
    jack: 'Deport Neighbors without Legal Status',
    topic: 'Deportation',
    mikie: 'Deport Violent Criminals Only'
  },
  {
    jack: '<a href="https://www.npr.org/2025/09/13/nx-s1-5507125/the-supreme-court-clears-the-way-for-ice-agents-to-treat-race-as-grounds-for-immigration-stops" target="_blank">Racial Profiling is OK</a>',
    topic: 'ICE Detainments of Citizens',
    mikie: 'Strongly Opposed'
  },
  {
    jack: '',
    topic: '<h4>Education</h4>',
    mikie: ''
  },
  {
    jack: 'Public Funding for Private Schools',
    topic: 'School Voucher Programs',
    mikie: 'Fund Public Schools'
  },
  {
    jack: 'Envious of Low-Ranked States',
    topic: 'State of NJ Education',
    mikie: 'Top Ranked & Can Improve'
  },
  {
    jack: 'Supports',
    topic: 'Defunding the Dept of Education',
    mikie: 'Opposes'
  },
  {
    jack: 'Opposes (if it makes him sad)',
    topic: 'Honest & Inclusive Education',
    mikie: 'Supports'
  },
  {
    jack: 'Privatize Everything',
    topic: 'Pre-K Education',
    mikie: 'Expand Universal Pre-K'
  },
  {
    jack: '',
    topic: '<h4>Public Funding</h4>',
    mikie: ''
  },
  {
    jack: 'Opposes (<a href="https://www.cbsnews.com/newyork/news/nj-pbs-shutting-down-in-2026/" target="_blank">killing PBS in NJ</a>)',
    topic: 'Funding PBS',
    mikie: 'Supports'
  },
  {
    jack: 'Opposes (conglomerate news only)',
    topic: 'Funding NPR',
    mikie: 'Supports'
  },
  {
    jack: 'OK to Repurpose for Immigration',
    topic: 'Significant FEMA and NOAA Cuts',
    mikie: 'Fund FEMA and NOAA'
  },
  {
    jack: '<a href="https://www.youtube.com/shorts/RKGoyTOe5zI" target="_blank">Voted Against</a>',
    topic: 'Fund Pensions for Public Servants',
    mikie: 'Supports'
  },
  {
    jack: '',
    topic: '<h4>Healthcare</h4>',
    mikie: ''
  },
  {
    jack: 'Whatever Trump Says',
    topic: 'Medicare & Medicaid Cuts',
    mikie: 'Opposes Cuts'
  },
  {
    jack: 'Cuts & Policy Based on Pseudoscience',
    topic: 'Vaccine Research for Public Health',
    mikie: 'Trusts Science and Data'
  },
  {
    jack: '',
    topic: '<h4>Individual Freedoms & Rights</h4>',
    mikie: ''
  },
  {
    jack: '<a href="https://www.njleg.state.nj.us/bill-search/2012/S1" target="_blank">Voted Against</a>',
    topic: 'Marriage Equality',
    mikie: 'Supports'
  },
  {
    jack: 'Opposes',
    topic: 'Responsible Access to Cannabis',
    mikie: 'Supports'
  },
  {
    jack: '20-Week Abortion Bans',
    topic: 'Reproductive Rights',
    mikie:
      '<a href="https://www.plannedparenthoodaction.org/planned-parenthood-action-fund-new-jersey-inc/newsroom/planned-parenthood-action-fund-of-new-jersey-endorses-mikie-sherrill-for-governor" target="_blank">Trusts Women & Doctors</a>'
  },
  {
    jack: 'Only Mentioned for Gun Owners',
    topic: 'Due Process',
    mikie: 'Supports for All Residents'
  },
  {
    jack: 'Republicans Only',
    topic: 'Freedom of Speech',
    mikie: 'All Americans'
  },
  {
    jack: 'Villify Protesters like Trump',
    topic: 'Right to Protest',
    mikie: 'Supports Peaceful Protesting'
  },
  {
    jack: '',
    topic: '<h4>Sketchy Behavior</h4>',
    mikie: ''
  },
  {
    jack: '<a href="https://dearestjack.com/" target="_blank">[crickets]</a>',
    topic: 'Epstein Files',
    mikie:
      '<a href="https://dearestjack.com/" target="_blank">Release the Files!</a>'
  },
  {
    jack: '<a href="https://www.youtube.com/shorts/mpsL_jeO4As" target="_blank">"Honored and Humbled"</a>',
    topic: 'Endorsements from Felons',
    mikie: 'n/a'
  },
  {
    jack: 'Election Deniers & White Nationalists',
    topic: 'Who to Campaign With',
    mikie: 'Democrats, Republicans, Independents'
  },
  {
    jack: '',
    topic: '<h4>Taxation & Spending</h4>',
    mikie: ''
  },
  {
    jack: 'Raised at Every Level of Government',
    topic: 'Raising Taxes in NJ',
    mikie: 'Never Raised Taxes'
  },
  {
    jack: '"Everything on the Table" Except Taxing the Rich',
    topic: 'Tax Policy',
    mikie: 'Expand Tax Credits; Close Loopholes'
  },
  {
    jack: 'NJ DOGE / Mass Layoffs',
    topic: 'How to Run NJ Efficiently',
    mikie: 'Oversight & NJ Report Card for Transparency'
  },
  {
    jack: 'Whatever Trump Says',
    topic: 'Haphazard Tariff Policies',
    mikie: 'Thoughtful Tariff Policy'
  },
  {
    jack: '',
    topic: '<h4>More Important Topics</h4>',
    mikie: ''
  },
  {
    jack: '<a href="https://njaflcio.org/codeu-2025/ciatterellis-record/" target="_blank">Untrusted</a>',
    topic: 'Labor/Union Rights',
    mikie:
      '<a href="https://aflcio.org/scorecard/legislators/mikie-sherrill" target="_blank">Supports</a>'
  },
  {
    jack: '<a href="https://www.youtube.com/shorts/K5o8j9qQuBw" target="_blank">Campaigning with Hateful Liars</a>',
    topic: 'Political Rhetoric Tone',
    mikie:
      '<a href="https://sherrill.house.gov/media/press-releases/rep-sherrill-statement-on-house-passage-of-charlie-kirk-resolution" target="_blank">Condemns All Political Violence</a>'
  },
  {
    jack: '<a href="https://www.insidernj.com/ciattarelli-outlines-10-point-garden-state-affordability-agenda/" target="_blank">NIMBY</a>',
    topic: 'Affordable Housing',
    mikie:
      '<a href="https://www.mikiesherrill.com/files/05fcbbdf-a115-4bfe-91f4-200835f30713/Aff_Agenda_Website_Version-873f.pdf" target="_blank">Affordability Agenda</a>'
  },
  {
    jack: "Jack's son serves",
    topic: 'Military Service',
    mikie: 'Proud Navy veteran'
  },
  {
    jack: 'Released 1 Year + Summaries',
    topic: 'Financial Disclosure',
    mikie:
      '<a href="https://newjerseyglobe.com/governor/sherrill-releases-exact-values-of-her-finances-showing-no-unusual-stock-gains/" target="_blank">Overly Transparent</a>'
  },
  {
    jack: 'Whatever You Want To Hear',
    topic: 'Taylor Ham vs. Pork Roll',
    mikie: 'Taylor Ham'
  }
]
</script>

<template>
  <div
    class="jack-vs-mikie text-white flex md:items-center justify-center mt-0 relative"
  >
    <div class="px-8 py-12 text-center">
      <h1 class="text-white mb-1">Jack vs. Mikie</h1>
      <h2 class="mb-6 text-white">the tale of the tape</h2>
      <p class="pb-8">How does Jack compare to his opponent, Mikie Sherrill?</p>
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
        <div class="flex-1 topic text-red" v-html="topic.jack" />
        <div class="flex-1 topic text-center" v-html="topic.topic" />
        <div class="flex-1 topic text-blue text-right" v-html="topic.mikie" />
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
</template>

<style lang="scss">
.topic {
  font-weight: 700;
  font-size: 14px;
  @media (min-width: 768px) {
    font-size: 18px;
  }
}
</style>

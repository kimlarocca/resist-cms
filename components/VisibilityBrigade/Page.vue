<template>
  <div class="visibility-brigade">
    <Html lang="en">
      <Head>
        <Title>{{ websiteData.title }}</Title>
        <Meta :name="'description'" :content="websiteData.description" />
      </Head>
    </Html>
    <VisibilityBrigadeVbHeader />
    <section
      class="hero inverse pt-32"
      :style="{ backgroundImage: `url(${content?.hero_image || '/images/hero.jpg'})` }"
    >
      <div class="p-6 h-full flex flex-col justify-between">
        <h1
          class="like-h1 text-white mb-12"
          v-html="content?.hero_headline || 'Action Is The Antidote For Despair'"
        />
        <div class="mb-12">
          <p
            class="mb-6 text-xl sm:text-2xl font-semibold text-white"
            v-html="
              content?.hero_text ||
              'We provide physical messaging in the real world to connect with and activate voters to demonstrate that resistance is possible.'
            "
          />
          <NuxtLink :to="content?.cta_link || '#'" class="plain">
            <Button :label="content?.cta_text || 'Join The Resistance'" class="white" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="about-us">
      <img
        :src="content?.hero_sub_image || '/images/about-us.jpg'"
        alt="About the Morris Essex Visibility Brigade"
      />
    </section>

    <section
      class="relative contrast rounded-xl mx-6 lg:mr-48 mt-8 lg:mt-16 mb-32"
      id="about-us"
    >
      <div class="p-8 sm:p-16 lg:p-24">
        <h2 class="like-h2 mb-8">{{ content?.about_us_headline || "About Us" }}</h2>
        <p
          v-html="
            content?.about_us_text ||
            'Our goal is to remind neighbors of our nation\'s emergency, to protect democracy, and suggest simple actions they can take every day to resist.'
          "
        />
      </div>
    </section>

    <VisibilityBrigadeInstagramGallery v-if="content?.instagram_widget_id" />

    <section
      class="relative contrast rounded-xl mx-6 mt-8 lg:mt-16 mb-32"
      id="get-involved"
    >
      <div class="grid lg:grid-cols-3 gap-4">
        <div class="p-8 sm:p-16 lg:p-24 lg:col-span-2">
          <h2 class="like-h2 mb-8">
            {{ content?.get_involved_headline || "Get Involved" }}
          </h2>
          <h3 class="like-h3 mb-4">
            {{ content?.get_involved_sub_header || "We Host Weekly Events!" }}
          </h3>
          <p
            class="mb-4"
            v-html="
              content?.get_involved_text ||
              'We typically meet up on high-traffic pedestrian bridges during rush hour with pre-determined messages and stand over our messages, waving at passing cars.'
            "
          />
          <p class="mb-8">
            Visit our
            <a :href="content?.cta_link || '#'" target="_blank" rel="nofollow noreferrer">
              new member request form</a
            >
            to get started. Together, we can make a difference!
          </p>
          <NuxtLink :to="content?.cta_link || '#'" class="plain">
            <Button :label="content?.cta_text || 'Join The Resistance'" class="white" />
          </NuxtLink>
        </div>
        <div>
          <NuxtLink
            :to="content?.cta_link || '#'"
            target="_blank"
            rel="nofollow noreferrer"
            class="plain"
          >
            <img
              :src="
                content?.get_involved_image || '/images/join-the-visibility-brigade.jpg'
              "
              alt="Join the Morris Essex Visibility Brigade"
              class="w-full lg:w-fit lg:-mt-16 lg:pr-10"
            />
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
  <VisibilityBrigadeVbFooter />
</template>

<script setup>
const props = defineProps({
  websiteId: {
    type: Number,
    required: true,
  },
})

const { data: content } = await useAsyncData("visibility-content", () =>
  getVisibilityBrigadeContent(props.websiteId)
)
const { data: websiteData } = await useAsyncData("website-data", () =>
  getWebsiteData(props.websiteId)
)
</script>

<style lang="scss" scoped>
@tailwind base;

.visibility-brigade {
  p {
    font-size: 16px;
    line-height: 26px;
    @screen md {
      font-size: 18px;
      line-height: 28px;
    }
  }

  h1,
  .like-h1 {
    font-family: var(--font-family-header);
    font-size: 55px;
    line-height: 65px;
    font-weight: 600;
    text-transform: uppercase;
    text-shadow: 2px 2px 12px rgba(0, 0, 0, 0.25);
    width: 100%;
    max-width: 1000px;
    margin-top: 130px;
    @screen sm {
      width: 90%;
      font-size: 80px;
      line-height: 80px;
    }
    @screen md {
      width: 80%;
      font-size: 100px;
      line-height: 100px;
    }
    @screen lg {
      font-size: 110px;
      line-height: 110px;
    }
    @screen xl {
      font-size: 120px;
      line-height: 120px;
    }
  }

  h2,
  .like-h2 {
    font-family: var(--font-family-header);
    font-size: 50px;
    line-height: 50px;
    font-weight: 600;
    text-transform: uppercase;
    @screen md {
      font-size: 80px;
      line-height: 80px;
    }
    @screen lg {
      font-size: 100px;
      line-height: 100px;
    }
  }

  h3,
  .like-h3 {
    font-family: var(--font-family-header);
    font-size: 25px;
    line-height: 25px;
    font-weight: 400;
    @screen md {
      font-size: 30px;
      line-height: 30px;
    }
  }

  h4,
  .like-h4 {
    font-family: var(--font-family-header);
    font-size: 22px;
    line-height: 22px;
    font-weight: 400;
    @screen md {
      font-size: 25px;
      line-height: 25px;
    }
  }

  .hero {
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
    height: 100vh;
    min-height: fit-content;
    p {
      max-width: 800px;
    }
  }

  .about-us {
    width: 100%;
    text-align: right;
    margin-top: 2rem;
    @screen lg {
      margin-top: -8rem;
    }
    img {
      width: 70%;
      margin: 0 2rem 0 auto;
      @screen lg {
        width: auto;
        max-height: 20rem;
        margin: 0 4rem 0 auto;
      }
    }
  }
}
</style>

<template>
  <ProgressSpinner v-if="!website || !content || !websiteData" class="m-auto mt-32" />
  <template v-else>
    <div class="visibility-brigade">
      <Html lang="en">
        <Head>
          <Title>{{ websiteData.title }} | Join The Resistance</Title>
          <Meta :name="'description'" :content="websiteData.description" />
        </Head>
      </Html>
      <VisibilityBrigadeVbHeader :website-id="websiteId" />
      <section
        class="hero inverse py-8"
        :style="{ backgroundImage: `url(${content?.hero_image || '/images/hero.jpg'})` }"
      >
        <div class="p-6 h-full flex flex-col justify-between">
          <h1 class="like-h1 text-white">
            {{ content?.signup_form_h1_text || "Join The Resistance" }}
          </h1>
        </div>
      </section>
      <section class="p-6 py-16" id="form">
        <div class="mb-12">
          <div v-if="content?.signup_form_text" v-html="content?.signup_form_text" />
          <p v-else>Please fill out the form below to join the resistance.</p>
        </div>
        <VisibilityBrigadeSignupForm :website-id="websiteId" />
      </section>
    </div>
    <VisibilityBrigadeVbFooter :website-id="websiteId" />
  </template>
</template>

<script setup>
definePageMeta({
  layout: "empty",
})

const route = useRoute()
const supabase = useSupabaseClient()
const slug = computed(() => route.params.slug)

const { data: website } = await useAsyncData(`website-${slug.value}`, async () => {
  const { data, error } = await supabase
    .from("websites")
    .select("*")
    .eq("slug", slug.value)
    .single()
  if (error) throw error
  if (!data?.published) return null
  return data
})

const websiteId = computed(() => website.value?.id)

const { data: content } = await useAsyncData(`signup-content-${slug.value}`, () =>
  getVisibilityBrigadeContent(websiteId.value)
)
const { data: websiteData } = await useAsyncData(
  `signup-website-data-${slug.value}`,
  () => getWebsiteData(websiteId.value)
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

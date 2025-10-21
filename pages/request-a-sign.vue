<script setup>
onMounted(() => {
  if (process.client) {
    // Load the Noteforms widget script
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://noteforms.com/widgets/iframe.min.js'
    script.onload = () => {
      // Call initEmbed after script loads
      if (window.initEmbed) {
        window.initEmbed('request-a-sign-pcxro7')
      }
    }
    document.head.appendChild(script)
  }
})
</script>
<template>
  <div class="container px-4 xl:px-0 pt-4 lg:pt-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
      <div>
        <h1>Request A Yard Sign</h1>
        <h2 class="mb-6">Spread the Word - Jack Ciattarelli Can't Fix Jack!</h2>
        <img
          class="mb-6"
          src="/images/yard-sign.jpg"
          alt="Can't Fix Jack Yard Sign"
        />
        <iframe
          aria-label="request a sign form"
          style="border: none; width: 100%; height: 700px"
          id="request-a-sign-pcxro7"
          src="https://noteforms.com/forms/request-a-sign-pcxro7"
        ></iframe>
      </div>
      <div class="hidden lg:block text-right">
        <img
          src="/images/PuppetJack.jpg"
          alt="Donald Trump's Puppet - Jack the Flipper"
          class="w-full lg:w-fit"
        />
      </div>
    </div>
  </div>
</template>

<template>
  <div class="container px-4 xl:px-0">
    <Html lang="en">
      <Head>
        <Title>Styleguide</Title>
      </Head>
    </Html>
    <h1>Styleguide</h1>
    <Divider class="my-7" />
    <h1 class="mb-3">H1 Lorem Ipsum Dolor Sit Amet</h1>
    <h2 class="mb-3">H2 Lorem Ipsum Dolor Sit Amet</h2>
    <h3 class="mb-3">
      H3 Lorem Ipsum Dolor Sit Amet, consectetur adipisicing elit.
    </h3>
    <p class="mb-3">
      This is a paragraph. Lorem ipsum dolor sit amet, consectetur adipisicing
      elit. Asperiores, esse eum ex explicabo facere maiores minus mollitia
      nulla qui saepe tempora veritatis. Dolore ducimus fuga provident sed
      temporibus. Ab, perspiciatis.
    </p>
    <p class="mb-3">
      <NuxtLink to="/">This is an inline link.</NuxtLink>
    </p>
    <p class="mb-3">
      Text with a tooltip!
      <i
        class="pi pi-info-circle clickable"
        v-tooltip.right="'Here is the tooltip!'"
      />
    </p>
    <p class="mb-3">
      Here is some <strong>bold text</strong> and some <em>italic text</em>.
    </p>
    <p class="mb-3 small">Here is a paragraph with small text.</p>
    <Divider class="my-7" />
    <Button label="Call To Action" class="mr-2" />
    <Button label="Call To Action" severity="secondary" class="mr-2" />
    <Button icon="pi pi-plus" class="mr-2" />
    <Button icon="pi pi-plus" severity="secondary" class="mr-2" />
    <Button size="small" label="Volunteer" class="mr-2" />
    <divider class="my-7" />
  </div>
</template>

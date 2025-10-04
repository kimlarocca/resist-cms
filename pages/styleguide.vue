<script setup>
const checked = ref(false)
const cities = ref([
  { name: 'New York', code: 'NY' },
  { name: 'Rome', code: 'RM' },
  { name: 'London', code: 'LDN' },
  { name: 'Istanbul', code: 'IST' },
  { name: 'Paris', code: 'PRS' },
  { name: 'Tokyo', code: 'TKY' },
  { name: 'Berlin', code: 'BER' },
  { name: 'Madrid', code: 'MAD' },
  { name: 'Moscow', code: 'MSC' },
  { name: 'Beijing', code: 'BJS' }
])
const date = ref(new Date())
const ingredient = ref('Cheese')
const options = ref(['Long', 'Medium', 'Short'])
const selectButtonValue = ref('Medium')
const selectedCity = ref()
const starRating = ref(4)
const value = ref('sample text')
const valueNumber = ref(12345)
</script>

<template>
  <div class="container">
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

    <!-- <div class="mb-3">
      <InputText placeholder="Email Address" v-model="value" />
    </div> -->
    <!-- <div class="mb-3">
      <Password
        toggleMask
        placeholder="Password"
        v-model="value"
        class="w-full"
      />
    </div>
    <div class="mb-3">
      <InputText disabled placeholder="Disabled" />
    </div>
    <div class="mb-3">
      <InputNumber v-model="valueNumber" inputId="integeronly" prefix="$" />
    </div>
    <div class="mb-3">
      <Select
        v-model="selectedCity"
        :options="cities"
        optionLabel="name"
        placeholder="Select a City"
      />
    </div>
    <div class="mb-3">
      <InputGroup>
        <InputText placeholder="Search" />
        <InputGroupAddon>
          <Button icon="pi pi-search" />
        </InputGroupAddon>
      </InputGroup>
    </div>
    <div class="flex align-items-center mb-3">
      <Checkbox
        v-model="checked"
        inputId="checkbox"
        name="checkbox"
        value="checkbox"
        binary
      />
      <label for="checkbox" class="ml-2"> Checkbox </label>
    </div>
    <div class="flex flex-wrap gap-4 mb-3">
      <div class="flex items-center gap-2">
        <RadioButton
          v-model="ingredient"
          inputId="ingredient1"
          name="pizza"
          value="Cheese"
        />
        <label for="ingredient1">Cheese</label>
      </div>
      <div class="flex items-center gap-2">
        <RadioButton
          v-model="ingredient"
          inputId="ingredient2"
          name="pizza"
          value="Mushroom"
        />
        <label for="ingredient2">Mushroom</label>
      </div>
      <div class="flex items-center gap-2">
        <RadioButton
          v-model="ingredient"
          inputId="ingredient3"
          name="pizza"
          value="Pepper"
        />
        <label for="ingredient3">Pepper</label>
      </div>
    </div> -->
    <!-- <Textarea v-model="value" rows="5" cols="30" class="mb-3" /> -->
    <!-- <div class="flex justify-center mb-3">
      <SelectButton v-model="selectButtonValue" :options="options" />
    </div>
    <ToggleSwitch v-model="checked" /> -->
    <!-- <divider class="my-7" />
    <VCard
      image="https://placehold.co/600x400"
      imageAltText="Image Alt Text"
      header="Card Header"
      buttonText="Learn More"
      buttonUrl="/"
      icon="pi-bolt"
      class="mb-32"
    >
      <p class="mb-4">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed
        consequuntur error repudiandae numquam deserunt quisquam repellat libero
        asperiores earum nam nobis, culpa ratione quam perferendis esse,
        cupiditate neque quas!
      </p>
      <ul class="checkmark-list">
        <li>Lorem ipsum dolor sit amet consectetur adipisicing</li>
        <li>Lorem ipsum dolor sit amet consectetur adipisicing</li>
        <li>Lorem ipsum dolor sit amet consectetur adipisicing</li>
      </ul>
    </VCard>
    <VCard
      image="https://placehold.co/600x400"
      imageAltText="Image Alt Text"
      header="Card Header"
      buttonText="Learn More"
      buttonUrl="/"
      icon="pi-bolt"
      class="mb-32"
      imagePosition="right"
    >
      <p class="mb-4">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed
        consequuntur error repudiandae numquam deserunt quisquam repellat libero
        asperiores earum nam nobis, culpa ratione quam perferendis esse,
        cupiditate neque quas!
      </p>
      <ul class="checkmark-list">
        <li>Lorem ipsum dolor sit amet consectetur adipisicing</li>
        <li>Lorem ipsum dolor sit amet consectetur adipisicing</li>
        <li>Lorem ipsum dolor sit amet consectetur adipisicing</li>
      </ul>
    </VCard> -->
  </div>
</template>

<script setup>
definePageMeta({
  layout: "blank",
})

const { setDarkMode, setLightMode, isDarkMode } = useDarkMode()
const checked = ref(false)
const cities = ref([
  { name: "New York", code: "NY" },
  { name: "Rome", code: "RM" },
  { name: "London", code: "LDN" },
  { name: "Istanbul", code: "IST" },
  { name: "Paris", code: "PRS" },
  { name: "Tokyo", code: "TKY" },
  { name: "Berlin", code: "BER" },
  { name: "Madrid", code: "MAD" },
  { name: "Moscow", code: "MSC" },
  { name: "Beijing", code: "BJS" },
])
const options = ref(["Long", "Medium", "Short"])
const selectButtonValue = ref("Medium")
const selectedCity = ref()
const value = ref("sample text")
const valueNumber = ref(12345)
const ingredient = ref("Cheese")
</script>
<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Styleguide</Title>
      </Head>
    </Html>
    <i v-if="isDarkMode" @click="setLightMode" class="pi pi-sun clickable" />
    <i v-else @click="setDarkMode" class="pi pi-moon clickable mr-2" />
    <Divider class="my-7" />
    <h1 class="mb-5">H1 Lorem Ipsum Dolor Sit Amet, consectetur adipisicing elit.</h1>
    <h2 class="mb-5">H2 Lorem Ipsum Dolor Sit Amet, consectetur adipisicing elit.</h2>
    <h3 class="mb-5">H3 Lorem Ipsum Dolor Sit Amet, consectetur adipisicing elit.</h3>
    <h4 class="mb-5">H4 Lorem Ipsum Dolor Sit Amet, consectetur adipisicing elit.</h4>
    <p class="mb-3">
      This is a paragraph. Lorem ipsum dolor sit amet, consectetur adipisicing elit.
      Asperiores, esse eum ex explicabo facere maiores minus mollitia nulla qui saepe
      tempora veritatis. Dolore ducimus fuga provident sed temporibus. Ab, perspiciatis.
    </p>
    <p class="mb-3">
      <NuxtLink to="/">This is an inline link.</NuxtLink>
    </p>
    <p class="mb-3">
      Text with a tooltip!
      <i class="pi pi-info-circle clickable" v-tooltip.right="'Here is the tooltip!'" />
    </p>
    <p class="mb-3">
      Here is some <strong>bold text</strong> and some <em>italic text</em>.
    </p>
    <p class="mb-3 small">Here is a paragraph with small text.</p>
    <div class="contrast p-6 mb-8">
      <h1 class="mb-3">Contrast Section</h1>
      <p class="mb-3">
        This is a paragraph. Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        Asperiores, esse eum ex explicabo facere maiores minus mollitia nulla qui saepe
        tempora veritatis. Dolore ducimus fuga provident sed temporibus. Ab, perspiciatis.
      </p>
      <Button label="Example Button" />
    </div>
    <div class="highlight p-6">
      <h1 class="mb-3">Highlighted Section</h1>
      <p>
        This is a paragraph. Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        Asperiores, esse eum ex explicabo facere maiores minus mollitia nulla qui saepe
        tempora veritatis. Dolore ducimus fuga provident sed temporibus. Ab, perspiciatis.
      </p>
    </div>
    <Divider class="my-7" />

    <div class="mb-3">
      <InputText placeholder="Email Address" v-model="value" />
    </div>
    <div class="mb-3">
      <Password toggleMask placeholder="Password" v-model="value" class="w-full" />
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
    </div>
    <Textarea v-model="value" rows="5" cols="30" class="mb-3" />
    <div class="flex justify-center mb-3">
      <SelectButton v-model="selectButtonValue" :options="options" />
    </div>
    <ToggleSwitch v-model="checked" />
    <divider class="my-7" />
    <Button label="Example Button" class="block mb-3" />
    <Button icon="pi pi-home" label="Button With Icon" class="mb-3 mr-2" />
    <Button
      icon="pi pi-check"
      label="Button With Icon"
      iconPos="right"
      class="mb-3 mr-2"
    />
    <Button icon="pi pi-heart" aria-label="Favorite" />
    <Button label="Outlined Button" class="block mb-3" variant="outlined" />
    <Button label="Loading State" icon="pi pi-check" :loading="true" class="mb-3" />
    <Button label="Disabled" disabled class="block mb-3" />
    <Button label="small button" size="small" class="mr-2" />
    <Button icon="pi pi-external-link" size="small" class="mb-3" />
    <Button
      label="Small Outlined Button"
      class="block mb-3"
      size="small"
      variant="outlined"
    />
    <Tag class="mr-3" value="Primary"></Tag>
    <Tag class="mr-3" severity="secondary" value="Secondary"></Tag>
    <Tag class="mr-3" severity="success" value="Success"></Tag>
    <Tag class="mr-3" severity="info" value="Info"></Tag>
    <Tag class="mr-3" severity="warn" value="Warn"></Tag>
    <Tag class="mr-3" severity="danger" value="Danger"></Tag>
    <Tag class="mr-3" severity="contrast" value="Contrast"></Tag>
    <divider class="my-7" />
    <ProgressSpinner class="mb-3" />
    <Card style="width: 400px" class="mb-3">
      <template #header>
        <img alt="user header" src="https://picsum.photos/400/300?grayscale" />
      </template>
      <template #title>Card Example</template>
      <template #subtitle>This is the card subtitle</template>
      <template #content>
        <p class="m-0">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed
          consequuntur error repudiandae numquam deserunt quisquam repellat libero
          asperiores earum nam nobis, culpa ratione quam perferendis esse, cupiditate
          neque quas!
        </p>
      </template>
      <template #footer>
        <div class="flex gap-4 mt-2">
          <Button label="Learn More" />
        </div>
      </template>
    </Card>
    <divider class="my-7" />
    <Message severity="info" class="mb-3" closable>
      An informative message goes here.
    </Message>
    <Message severity="warn" class="mb-3" closable>
      A warning message goes here.
    </Message>
    <Message severity="error" class="mb-3" closable>
      Sorry, there was a problem logging in to your account.
    </Message>
    <Message class="mb-3" severity="success" closable>
      Success! Please check your email for the magic link.
    </Message>
  </div>
</template>

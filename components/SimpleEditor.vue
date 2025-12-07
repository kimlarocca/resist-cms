<template>
  <Editor
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :editorStyle="editorStyle"
    :placeholder="placeholder"
  >
    <template v-slot:toolbar>
      <span class="ql-formats">
        <button v-tooltip.bottom="'Bold'" class="ql-bold" aria-label="bold"></button>
        <button
          v-tooltip.bottom="'Italic'"
          class="ql-italic"
          aria-label="italic"
        ></button>
        <button
          v-tooltip.bottom="'Underline'"
          class="ql-underline"
          aria-label="underline"
        ></button>
        <button v-tooltip.bottom="'Link'" class="ql-link" aria-label="link"></button>
      </span>
    </template>
  </Editor>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  height: {
    type: String,
    default: "120px",
  },
  placeholder: {
    type: String,
    default: "",
  },
})

defineEmits(["update:modelValue"])

const editorStyle = computed(() => `height: ${props.height}`)
</script>

<style lang="scss">
.ql-tooltip {
  left: 0 !important;
}
</style>

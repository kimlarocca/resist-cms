<template>
  <div class="simple-editor">
    <div class="toolbar" v-if="editor">
      <button
        @click="editor.chain().focus().toggleBold().run()"
        :class="{ 'is-active': editor.isActive('bold') }"
        type="button"
        v-tooltip.bottom="'Bold'"
        aria-label="bold"
      >
        <strong>B</strong>
      </button>
      <button
        @click="editor.chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editor.isActive('italic') }"
        type="button"
        v-tooltip.bottom="'Italic'"
        aria-label="italic"
      >
        <em>I</em>
      </button>
      <button
        @click="editor.chain().focus().toggleUnderline().run()"
        :class="{ 'is-active': editor.isActive('underline') }"
        type="button"
        v-tooltip.bottom="'Underline'"
        aria-label="underline"
      >
        <span style="text-decoration: underline">U</span>
      </button>
      <button
        @click="setLink"
        :class="{ 'is-active': editor.isActive('link') }"
        type="button"
        v-tooltip.bottom="'Text Link'"
        aria-label="link"
      >
        <i class="pi pi-link"></i>
      </button>
      <button
        @click="setButtonLink"
        :class="{ 'is-active': editor.isActive('link', { class: 'btn' }) }"
        type="button"
        v-tooltip.bottom="'Button Link'"
        aria-label="button link"
      >
        <span class="btn-icon">Btn</span>
      </button>
      <button
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="{ 'is-active': editor.isActive('bulletList') }"
        type="button"
        v-tooltip.bottom="'Bullet List'"
        aria-label="bullet list"
      >
        <i class="pi pi-list"></i>
      </button>
      <button
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="{ 'is-active': editor.isActive('orderedList') }"
        type="button"
        v-tooltip.bottom="'Ordered List'"
        aria-label="ordered list"
      >
        <i class="pi pi-sort-numeric-down"></i>
      </button>
    </div>
    <editor-content :editor="editor" :style="{ minHeight: height }" />
  </div>
</template>

<script setup>
import { useEditor, EditorContent } from "@tiptap/vue-3"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"

const CustomLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: null,
        parseHTML: (element) => element.getAttribute("class"),
        renderHTML: (attributes) => {
          if (!attributes.class) return {}
          return { class: attributes.class }
        },
      },
    }
  },
})

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

const emit = defineEmits(["update:modelValue", "blur"])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Underline,
    CustomLink.configure({
      openOnClick: false,
      HTMLAttributes: {
        target: "_blank",
        rel: "noopener noreferrer",
      },
    }),
  ],
  editorProps: {
    attributes: {
      class: "prose prose-sm focus:outline-none",
    },
  },
  onUpdate: ({ editor }) => {
    emit("update:modelValue", editor.getHTML())
  },
  onBlur: () => {
    emit("blur")
  },
})

const setLink = () => {
  const previousUrl = editor.value.getAttributes("link").href
  const url = window.prompt("URL", previousUrl)

  if (url === null) return

  if (url === "") {
    editor.value.chain().focus().extendMarkRange("link").unsetLink().run()
    return
  }

  editor.value.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
}

const setButtonLink = () => {
  const previousUrl = editor.value.getAttributes("link").href
  const url = window.prompt("URL", previousUrl)

  if (url === null) return

  if (url === "") {
    editor.value.chain().focus().extendMarkRange("link").unsetLink().run()
    return
  }

  const { from, to } = editor.value.state.selection
  const hasSelection = from !== to

  if (!hasSelection) {
    const label = window.prompt("Button Label", "Click Here")
    if (!label) return
    editor.value
      .chain()
      .focus()
      .insertContent(
        `<a href="${url}" class="btn" target="_blank" rel="noopener noreferrer">${label}</a>`
      )
      .run()
    return
  }

  editor.value
    .chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href: url, class: "btn" })
    .run()
}

watch(
  () => props.modelValue,
  (value) => {
    const isSame = editor.value.getHTML() === value
    if (!isSame) {
      editor.value.commands.setContent(value, false)
    }
  }
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style lang="scss" scoped>
.simple-editor {
  border: 1px solid var(--p-surface-300);
  border-radius: 6px;
  background: var(--p-surface-0);

  .toolbar {
    display: flex;
    gap: 4px;
    padding: 8px;
    border-bottom: 1px solid var(--p-surface-300);
    background: var(--p-surface-50);
    border-radius: 6px 6px 0 0;

    button {
      padding: 6px 10px;
      border: none;
      background: transparent;
      border-radius: 4px;
      cursor: pointer;
      color: var(--p-text-color);
      transition: all 0.2s;
      font-size: 14px;
      font-weight: 600;
      min-width: 32px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: var(--p-surface-200);
      }

      &.is-active {
        background: var(--p-primary-color);
        color: white;
      }

      strong,
      em,
      span,
      i {
        font-size: 14px;
        display: inline-block;
      }

      .btn-icon {
        font-size: 11px;
        font-weight: 700;
        border: 1.5px solid currentColor;
        border-radius: 3px;
        padding: 0 3px;
        line-height: 16px;
      }
    }
  }
}

:deep(.tiptap) {
  padding: 12px;
  min-height: v-bind(height);

  &:focus {
    outline: none;
  }

  p {
    margin: 0 0 8px 0;

    &:last-child {
      margin-bottom: 0;
    }
  }

  ul,
  ol {
    padding-left: 24px;
    margin: 8px 0;
  }

  a {
    color: var(--p-primary-color);
    text-decoration: underline;
    cursor: pointer;

    &.btn {
      display: inline-block;
      padding: 8px 16px;
      background: var(--p-primary-color);
      color: white !important;
      text-decoration: none !important;
      border-radius: 4px;
      font-weight: 600;

      &:hover {
        opacity: 0.85;
      }
    }
  }

  strong {
    font-weight: 600;
  }
}
</style>

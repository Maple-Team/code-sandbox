<template>
  <div class="cb-textarea">
    <p class="cb-textarea-filename">{{ filename }}</p>
    <textarea
      class="cb-textarea-code"
      @input="onTextareaInput"
      @change="onTextareaChange"
      :rows="row"
      :placeholder="placeholder"
    ></textarea>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    filename: { type: String, required: true },
    modelValue: { type: String },
    row: { type: Number, default: 5 },
    placeholder: { type: String, default: "请在此输入代码" },
  },
  emits: ["update:modelValue"],
  methods: {
    onTextareaChange(e: Event) {
      this.$emit("update:modelValue", (e.target as HTMLTextAreaElement).value);
    },
    onTextareaInput(e: Event) {
      const input = (e as InputEvent).data;
      console.log("onInput", input);
    },
  },
});
</script>

<style lang="less">
.cb-textarea {
  .cb-textarea-filename {
    padding: 5px 0;
  }
  .cb-textarea-code {
    width: 100%;
    min-height: 160px;
    padding: 10px;
  }
}
</style>

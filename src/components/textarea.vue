<template>
  <div class="cb-textarea">
    <p class="cb-textarea-path">{{ content?.path }}</p>
    <textarea
      class="cb-textarea-code"
      :rows="row"
      :placeholder="placeholder"
      :value="content?.code || ''"
      @change="onTextareaChange"
    ></textarea>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from "vue";
interface CodeObj {
  path: string;
  code: string;
}

export default defineComponent({
  props: {
    content: { type: Object as PropType<CodeObj> },
    row: { type: Number, default: 5 },
    placeholder: { type: String, default: "请在此输入代码" },
  },
  emits: ["update:content"],
  methods: {
    onTextareaChange(e: Event) {
      this.$emit("update:content", {
        path: this.content?.path,
        code: (e.target as HTMLTextAreaElement).value,
      });
    },
  },
  watch: {
    content: {
      handler(n, o) {
        console.log(n, o);
      },
      immediate: true,
    },
  },
});
</script>

<style lang="less">
.cb-textarea {
  .cb-textarea-path {
    padding: 5px 0;
  }
  .cb-textarea-code {
    width: 100%;
    min-height: 160px;
    padding: 10px;
  }
}
</style>

<template>
  <div class="cb-textarea">
    <p class="cb-textarea-path">{{ codeObj?.path }}</p>
    <textarea
      class="cb-textarea-code"
      :rows="row"
      :placeholder="placeholder"
      :value="codeObj?.code || ''"
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
    codeObj: { type: Object as PropType<CodeObj> },
    row: { type: Number, default: 5 },
    placeholder: { type: String, default: "请在此输入代码" },
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

<template>
  <Codemirror
    ref="editor"
    v-model="value"
    :options="cmOptions"
    :key="codeMirrorTheme"
  ></Codemirror>
</template>

<script>
import Codemirror from '@/components/Codemirror.vue';

import 'codemirror/addon/mode/simple.js';
import 'codemirror/addon/display/autorefresh.js';
import 'codemirror/addon/search/searchcursor.js';
import 'codemirror/theme/darcula.css';
import 'codemirror/theme/neo.css';

import { create } from "@/utils/codemirror.js";

export default {
  name: "Michelson",
  props: {
    code: String,
    firstLineNumber: Number,
    mark: Object,
    mutable: Boolean,
  },
  components: {
    Codemirror,
  },
  computed: {
    editor() {
      return this.$refs.editor.editor;
    },
    codeMirrorTheme() {
      return this.$vuetify.theme.dark ? "darcula" : "neo";
    },
  },
  data: () => ({
    value: "",
    cmOptions: {
      mode: "michelson",
      theme: "neo",
      lineWrapping: true,
      lineNumbers: true,
      viewportMargin: Infinity,
      readOnly: true,
      autoRefresh: true,
    },
  }),
  created() {
    if (this.firstLineNumber) this.cmOptions.firstLineNumber = this.firstLineNumber;
    if (this.code !== null) this.value = this.code;
    if (this.mutable) this.cmOptions.readOnly = false;
    this.cmOptions.theme = this.codeMirrorTheme;

    create();
  },
  mounted() {
    if (this.editor && this.mark) {
      this.editor.markText(
        { line: this.mark.row, ch: this.mark.start },
        { line: this.mark.row, ch: this.mark.end },
        { className: "error-mark" }
      );
    }
  },
  watch: {
    value(newValue) {
      this.$emit("input", newValue);
    },
    code(newValue) {
      if (newValue === null) {
        this.value = "";
      } else {
        this.value = newValue;
      }
    },
    codeMirrorTheme(theme) {
      this.cmOptions.theme = theme;
    },
  },
};
</script>

<style>
.CodeMirror {
  background-color: var(--v-data-base) !important;
  height: auto;
  padding-top: 10px;
  padding-bottom: 5px;
  padding-left: 5px;
}
.CodeMirror-gutters {
  border-right: none !important;
}
.CodeMirror-linenumbers {
  background-color: var(--v-data-base) !important;
  border-right: none !important;
}
.CodeMirror-linenumber {
  color: #99999980 !important;
}
.CodeMirror-line {
  padding-left: 15px !important;
}
.error-mark {
  background-color: #f4433625;
  color: var(--v-error-base) !important;
}
</style>

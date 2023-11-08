<template>
  <v-container fluid class="pa-8 canvas fill-canvas">
      <div class="d-flex justify-end" v-if="rawData">
        <v-btn small text @click="downloadFile" class="text--secondary ml-2">
          <v-icon class="mr-1 text--secondary" small>mdi-download-outline</v-icon>
          <span>Download</span>
        </v-btn>
      </div>    
      <v-card tile flat outlined class="mt-2">   
          <v-card-title>TZIP-16</v-card-title>       
        <v-card-text class="data pa-0">
          <v-alert v-if="error && metadata.metadata === null" type="error" prominent text class="ma-0 align-center">
            <div class="overline">Resolving metadata error</div>
            <div class="text--primary"> {{ error }}</div>
          </v-alert>
          <vue-json-pretty
            v-if="rawData"
            :data="rawData"
            :highlightMouseoverNode="true"
            :customValueFormatter="formatValue"
        ></vue-json-pretty>
        </v-card-text>
      </v-card>
  </v-container>
</template>

<script>
import { mapActions } from "vuex";
import VueJsonPretty from "vue-json-pretty";
import '@/styles/vue-json-pretty.css';

export default {
  name: "MetadataTab",
  components: { VueJsonPretty },
  props: {
    metadata: Object,
    network: String,
    address: String,
  },
  data: () => {
    return {
      showRaw: false
    };
  },
  computed: {
    rawData() {
      if (this.metadata && this.metadata.metadata) {
        return this.metadata.metadata;
      } else {
        return null;
      }
    },
    error() {
      if (this.metadata && this.metadata.error) {
        return this.metadata.error;
      } else {
        return null;
      }
    }
  },
  methods: {
    ...mapActions(["showError"]),
    downloadFile() {
      const element = document.createElement("a");
      element.setAttribute(
          "href",
          "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(this.rawData))
      );
      element.setAttribute("download", `${this.address}.json`);
      element.style.display = "none";
      document.body.appendChild(element);

      element.click();
      document.body.removeChild(element);
    },
    formatValue(_data, _key, _path, defaultFormatResult) {
      return defaultFormatResult
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  },
};
</script>

<template>
  <v-container fluid class="pa-8 canvas fill-canvas">
    <v-skeleton-loader v-if="loading" type="card-heading, image" />
    <div v-else-if="selectedCode">
      <v-card tile flat outlined class="pa-0">
        <v-card-title class="d-flex sidebar px-4 py-2">
          <span
              v-if="!isCodeRendered && selectedCode && selectedCode.length > freezingAmount"
              class="ml-4 text--disabled rendering-percents"
          >
            Rendering: {{Math.floor(loadedPercentage)}}%
          </span>
          <v-spacer></v-spacer>
          <v-btn
            class="mr-1 text--secondary"
            v-clipboard="getValueToCopy"
            v-clipboard:success="showSuccessCopy"
            small
            text
          >
            <v-icon class="mr-1" small>mdi-content-copy</v-icon>
            <span>Copy</span>
          </v-btn>
          <v-btn @click="showRaw = true" small text class="text--secondary">
            <v-icon class="mr-1" small>mdi-code-json</v-icon>
            <span>Raw JSON</span>
          </v-btn>
          <v-btn small text @click="downloadFile" class="text--secondary ml-2">
            <v-icon class="mr-1 text--secondary" small>mdi-download-outline</v-icon>
            <span>Download</span>
          </v-btn>
          <v-btn small text :to="{name: 'interact'}" class="text--secondary ml-2">
            <v-icon class="mr-1 text--secondary" small>mdi-play-box-outline</v-icon>
            <span>Interact</span>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <Michelson :code="loadedCode"></Michelson>
        </v-card-text>
      </v-card>
    </div>
    <ErrorState v-else />
    <RawJsonViewer
      :show.sync="showRaw"
      type="code"
      :network="network"
      :address="address"
      :level="getFallbackLevel(selectedProtocol)" />
  </v-container>
</template>

<script>
import Vue from 'vue';
import { mapActions } from "vuex";
import Michelson from "@/components/Michelson.vue";
import ErrorState from "@/components/ErrorState.vue";
import RawJsonViewer from "@/components/Dialogs/RawJsonViewer.vue";

export default {
  props: {
    contract: Object,
    migrations: Array,
    address: String,
    network: String,
  },
  components: {
    ErrorState,
    Michelson,
    RawJsonViewer
  },
  data: () => ({
    code: {},
    renderingInterval: null,
    lastSubstring: 0,
    freezingAmount: 35000,
    loadedPercentage: 0,
    isCodeRendered: false,
    loadedCode: "",
    loading: true,
    selectedProtocol: "",
    showRaw: false
  }),
  created() {
    if (this.$route.query.protocol) {
      this.selectedProtocol = this.$route.query.protocol;
      this.$nextTick(() => {
        this.getCode(this.$route.query.protocol);
      });
    } else {
      this.$nextTick(() => {
        this.getCode();
      });
    }
  },
  computed: {
    selectedCode() {
      if (!this.loading) {
        return this.code[this.selectedProtocol];
      }
      return null;
    },
  },
  destroyed() {
    clearInterval(this.renderingInterval);
  },
  methods: {
    ...mapActions(["showError", "showClipboardOK", "showClipboardWarning"]),
    showSuccessCopy() {
      if (this.selectedCode.length <= this.freezingAmount) {
        this.showClipboardOK();
      }
    },
    getValueToCopy() {
      if (this.selectedCode.length > this.freezingAmount) {
        this.showClipboardWarning();
      }

      return this.selectedCode;
    },
    setCodeByParts() {
      const code = this.code[this.selectedProtocol];
      this.renderingInterval = setInterval(() => {
        if (!this.isCodeRendered) {
          this.setLoadedCode(code);
        } else {
          clearInterval(this.renderingInterval);
        }
      }, 0);
    },
    setLoadedCode(code) {
      this.loadedCode += code.substring(this.lastSubstring, this.lastSubstring + this.freezingAmount);
      if (this.lastSubstring + this.freezingAmount >= code.length) {
        this.isCodeRendered = true;
      }
      this.lastSubstring = this.lastSubstring + this.freezingAmount;
      this.loadedPercentage = this.lastSubstring / code.length * 100;
    },
    getFallbackLevel(protocol = "") {
      if (protocol !== "" && this.migrations) {
        for (var i = 0; i < this.migrations.length; i++) {
          if (this.migrations[i].prev_protocol === protocol) {
            return Math.max(0, this.migrations[i].level - 4096);
          }
        }
      }
      return 0;
    },
    getCode(protocol = "") {
      this.loading = true;
      if (this.code[protocol]) {
        this.loading = false;
        return;
      }

      let level = this.getFallbackLevel(protocol);
      this.api
        .getContractCode(this.network, this.address, protocol, level)
        .then(res => {
          if (!res) return;
          Vue.set(this.code, protocol, res);
          this.$nextTick(() => {
            this.setCodeByParts();
          });
        })
        .catch(err => {
          this.showError(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    downloadFile() {
      var element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(this.selectedCode)
      );
      element.setAttribute("download", this.address + ".tz");
      element.style.display = "none";
      document.body.appendChild(element);

      element.click();
      document.body.removeChild(element);
    },
  },
  watch: {
    address: function() {
      this.selectedProtocol = "";
      this.getCode();
    },
    selectedProtocol: function(newValue) {
      if (newValue !== "") {
        this.$router.replace({ query: { protocol: newValue } });
      } else {
        this.$router.replace({ query: null });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.rendering-percents {
  font-size: 0.65em;
}
</style>

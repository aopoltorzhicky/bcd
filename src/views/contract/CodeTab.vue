<template>
  <v-container fluid class="pa-8 canvas fill-canvas">
    <v-row>
      <v-col cols="12">
        <v-skeleton-loader v-if="loading" type="card-heading, image"/>
        <div v-else-if="selectedCode">
          <div class="d-flex justify-space-between">
            <v-select
                v-if="codeVersions.length > 0"
                v-model="selectedProtocol"
                @change="getCode(selectedProtocol)"
                :items="codeVersions"
                item-text="proto"
                item-value="protocol"
                style="max-width: 160px;"
                rounded
                dense
                background-color="data"
                class="mb-1"
                hide-details
            ></v-select>
            <span
                v-if="!isCodeRendered && selectedCode && selectedCode.length > freezingAmount"
                class="ml-4 text--disabled rendering-percents"
            >
            Rendering: {{ Math.floor(loadedPercentage) }}%
          </span>
            <v-spacer></v-spacer>
            <UsingConstantsDialog :network="network" :address="address"/>

            <v-btn
                class="mr-1 text--secondary"
                @click="() => {
                  copy(getValueToCopy())
                }"
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
          </div>
          <v-card tile flat outlined class="pa-0 mt-2">
            <v-card-text class="pa-0">
              <Michelson :code="loadedCode"></Michelson>
            </v-card-text>
          </v-card>
        </div>
        <ErrorState v-else/>
      </v-col>
    </v-row>
    <RawJsonViewer
        v-model="showRaw"
        type="code"
        :network="network"
        :address="address"
        :level="0"/>
  </v-container>
</template>

<script>
import Vue from 'vue';
import {mapActions} from "vuex";
import Michelson from "@/components/Michelson.vue";
import ErrorState from "@/components/ErrorState.vue";
import RawJsonViewer from "@/components/Dialogs/RawJsonViewer.vue";
import {downloadFileFormContent} from "@/utils/download.js";
import UsingConstantsDialog from "@/components/UsingConstantsDialog.vue";
import { copyToClipboard } from "@/utils/clipboard.js";

export default {
  props: {
    contract: Object,
    address: String,
    network: String,
  },
  components: {
    UsingConstantsDialog,
    ErrorState,
    Michelson,
    RawJsonViewer,
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
    showRaw: false,
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
    isContract() {
      return this.address.startsWith("KT");
    },
    selectedCode() {
      if (!this.loading) {
        return this.code[this.selectedProtocol];
      }
      return null;
    },
    codeVersions() {
      let versions = [];
      versions.unshift({proto: "Latest", protocol: ""});
      return versions;
    }
  },
  destroyed() {
    clearInterval(this.renderingInterval);
  },
  methods: {
    ...mapActions(["showError", "showClipboardOK", "showClipboardWarning", "showClipboardFail"]),
    copy(text, successMessage, failMessage) {
      copyToClipboard(text, this.showSuccessCopy.bind(null, successMessage), this.showClipboardFail.bind(null, failMessage));
    },
    showSuccessCopy(successMessage) {
      if (this.selectedCode.length <= this.freezingAmount) {
        this.showClipboardOK(successMessage);
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
    getCode(protocol = "") {
      this.loading = true;
      if (this.code[protocol]) {
        this.loading = false;
        return;
      }

      this.api
          .getContractCode(this.network, this.address, protocol, 0)
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
      downloadFileFormContent(this.selectedCode, this.address)
    },
  },
  watch: {
    address() {
      this.selectedProtocol = "";
      this.getCode();
    },
    selectedProtocol(newValue) {
      if (newValue !== "") {
        this.$router.replace({query: {protocol: newValue}});
      } else {
        this.$router.replace({query: null});
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

<template>
  <div class="fill-height canvas" :key="address">
    <v-list-item style="height: 74px">
      <v-list-item-content two-line>
        <v-list-item-title class="headline">
          <v-tooltip bottom v-if="alias" :disabled="alias.length < 15">
            <template v-slot:activator="{ on, attrs }">
              <span v-bind="attrs" v-on="on">{{ alias }}</span>
            </template>
            <span>{{ alias }}</span>
          </v-tooltip>
          <span v-else v-html="helpers.shortcut(address)"></span>&nbsp;
          <v-btn
            icon
            target="_blank"
            :href="contract.verification_source"
            v-if="contract && contract.verified"
          >
            <v-icon small color="primary">mdi-shield-check</v-icon>
          </v-btn>
        </v-list-item-title>
        <v-list-item-subtitle>
          <span
            class="overline"
            :class="network === 'mainnet' ? 'secondary--text' : ''"
            >{{ network }}</span
          >
        </v-list-item-subtitle>
      </v-list-item-content>
      <v-list-item-action v-if="tags">
        <v-list-item-action-text>
          <v-chip
            small
            class="caption"
            :to="`/search?text=${tags.tag}`"
            target="_blank"
            >{{ tags.text }}</v-chip
          >
        </v-list-item-action-text>
      </v-list-item-action>
    </v-list-item>
    <v-divider></v-divider>
    <div class="d-flex align-center px-4 sidebar" style="height: 48px">
      <span class="caption font-weight-bold text-uppercase text--secondary"
        >Actions</span
      >
    </div>
    <div class="d-flex align-center justify-start pa-2 px-4">
      <v-tooltip bottom v-if="isContract">
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" icon class="mr-2" @click="onForkClick">
            <v-icon class="text--secondary">mdi-source-fork</v-icon>
          </v-btn>
        </template>
        Fork contract
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            icon
            class="mr-2"
            @click="
              () => {
                $clipboard(address);
                showClipboardOK();
              }
            "
          >
            <v-icon class="text--secondary">mdi-content-copy</v-icon>
          </v-btn>
        </template>
        Copy address
      </v-tooltip>
      <ShareLink
        :alias="alias"
        :link="link"
        bottom
      />
    </div>
    <v-divider></v-divider>

    <v-skeleton-loader
      :loading="loading"
      type="list-item-two-line, list-item-two-line, list-item-two-line, list-item-two-line, list-item-two-line"
    >
      <v-expansion-panels flat tile mandatory active-class="opened-panel">
        <v-expansion-panel class="ma-0 bb-1">
          <v-expansion-panel-header color="sidebar" class="pl-4 py-0">
            <span
              class="caption font-weight-bold text-uppercase text--secondary"
              >Details</span
            >
          </v-expansion-panel-header>
          <v-expansion-panel-content color="canvas">
            <v-list class="contract-list">
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-subtitle class="overline"
                    >Was active</v-list-item-subtitle
                  >
                  <v-list-item-title class="body-2" v-if="isContract">
                    {{ helpers.formatDatetime(contract.timestamp) }}
                    <span v-if="contract.last_action > contract.timestamp"
                      >—
                      {{ helpers.formatDatetime(contract.last_action) }}</span
                    >
                  </v-list-item-title>
                  <v-list-item-title class="body-2" v-else>
                    {{ helpers.formatDatetime(contract.last_action) }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-subtitle class="overline"
                    >Balance</v-list-item-subtitle
                  >
                  <v-list-item-title class="body-2">
                    <span>{{ balance | uxtz }}</span>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-if="domain">
                <v-list-item-content>
                  <v-list-item-subtitle class="overline"
                    >Domain</v-list-item-subtitle
                  >
                  <v-list-item-title class="body-2">
                    <span>{{ domain }}</span>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <AccountBox
                v-if="contract.manager"
                title="Deployed by"
                :address="contract.manager"
                :network="contract.network"
                gutters
              />
              <AccountBox
                v-if="contract.delegate"
                title="Delegated to"
                :address="contract.delegate"
                :network="contract.network"
                :alias="contract.delegate_alias"
                gutters
              />
            </v-list>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel
            v-if="isContract && contract.same_count > 0"
            class="ma-0 bb-1"
            @click="requestSame"
        >
          <v-expansion-panel-header color="sidebar" class="pl-4 py-0">
              <span
                  class="caption font-weight-bold text-uppercase text--secondary"
              >Same contracts ({{ contract.same_count }})</span
              >
          </v-expansion-panel-header>
          <v-skeleton-loader
              v-if="isSameInitialLoading"
              type="image"
              :loading="isSameInitialLoading"
          >
          </v-skeleton-loader>
          <v-expansion-panel-content color="data">
            <v-list class="contract-list">
              <template v-for="(contract, i) in same">
                <v-divider v-if="i > 0" :key="'divider' + i"></v-divider>
                <SimilarItem
                  :key="i"
                  :item="contract"
                  :address="address"
                  :network="network"
                />
              </template>
              <v-divider></v-divider>
              <v-list-item v-if="same.length < same_count">
                <v-list-item-content>
                  <v-list-item-title class="d-flex align-center justify-center">
                    <v-btn
                      v-if="!isSameInitialLoading"
                      class="text--secondary"
                      :loading="sameLoading"
                      text
                      small
                      @click="requestMoreSame"
                      >Load more</v-btn
                    >
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel
            v-if="isContract && contract.similar_count > 0"
            class="ma-0 bb-1"
            @click="requestSimilar"
        >
          <v-expansion-panel-header color="sidebar" class="pl-4 py-0">
              <span
                  class="caption font-weight-bold text-uppercase text--secondary"
              >Similar contracts ({{ contract.similar_count }})</span
              >
          </v-expansion-panel-header>
          <v-skeleton-loader
              v-if="isSimilarInitialLoading"
              type="image"
              :loading="isSimilarInitialLoading"
          >
          </v-skeleton-loader>
          <v-expansion-panel-content color="data">
            <v-list class="contract-list">
              <template v-for="(contract, i) in similar">
                <v-divider v-if="i > 0" :key="'divider' + i"></v-divider>
                <SimilarItem
                  :key="i"
                  :diff="true"
                  :item="contract"
                  :address="address"
                  :network="network"
                />
              </template>
              <v-divider></v-divider>
              <v-list-item v-if="similar.length < similar_count">
                <v-list-item-content>
                  <v-list-item-title class="d-flex align-center justify-center">
                    <v-btn
                      v-if="!isSimilarInitialLoading"
                      class="text--secondary"
                      :loading="similarLoading"
                      text
                      small
                      @click="requestMoreSimilar"
                      >Load more</v-btn
                    >
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel class="ma-0 bb-1" v-if="migrations.length > 0">
          <v-expansion-panel-header color="sidebar" class="pl-4 py-0">
            <span
              class="caption font-weight-bold text-uppercase text--secondary"
              >Logs ({{ migrations.length }})</span
            >
          </v-expansion-panel-header>
          <v-expansion-panel-content color="data">
            <v-list class="contract-list">
              <template v-for="(log, i) in migrations">
                <v-divider v-if="i > 0" :key="'divider' + i"></v-divider>
                <LogItem
                  :key="i"
                  :log="log"
                  :network="network"
                  :address="address"
                />
              </template>
            </v-list>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-skeleton-loader>

    <BakingBadFooter />
  </div>
</template>

<script>
import { mapActions } from "vuex";
import SimilarItem from "@/views/contract/SimilarItem.vue";
import LogItem from "@/views/contract/LogItem.vue";
import AccountBox from "@/components/Dialogs/AccountBox.vue";
import BakingBadFooter from "@/components/BakingBadFooter.vue";
import { DATA_LOADING_STATUSES } from "@/utils/network";
import ShareLink from "../../components/Buttons/ShareLink";

export default {
  name: "SideBar",
  props: {
    loading: Boolean,
    contract: Object,
    metadata: Object,
    address: String,
    network: String,
    migrations: Array,
    balance: Number,
  },
  components: {
    ShareLink,
    SimilarItem,
    LogItem,
    AccountBox,
    BakingBadFooter,
  },
  data: () => ({
    same: [],
    same_count: 0,
    similar: [],
    similar_count: 0,
    similarLoading: false,
    sameLoading: false,
    domain: undefined,
    sameInitialLoadingStatus: DATA_LOADING_STATUSES.NOTHING,
    similarInitialLoadingStatus: DATA_LOADING_STATUSES.NOTHING,
  }),
  created() {
    this.resolveDomain();
  },
  computed: {
    isSameInitialLoading() {
      return this.sameInitialLoadingStatus === DATA_LOADING_STATUSES.PROGRESS;
    },
    isSimilarInitialLoading() {
      return this.similarInitialLoadingStatus === DATA_LOADING_STATUSES.PROGRESS;
    },
    isContract() {
      return this.address.startsWith("KT");
    },
    alias() {
      if (this.contract) {
        if (this.contract.alias) {
          return this.contract.alias;
        } else if (this.metadata && this.metadata.name) {
          return this.metadata.name;
        }
      }
      return null;
    },
    tags() {
      const standards = {
        fa2: "FA2",
        fa12: "FA1.2",
        fa1: "FA1",
        delegator: "Delegator",
        multisig: "Multisig",
      };
      if (this.contract && this.contract.tags) {
        for (var tag in standards) {
          if (this.contract.tags.includes(tag)) {
            return { tag, text: standards[tag] };
          }
        }
      }
      return null;
    },
    link() {
      let routeData = {};
      if (this.contract && this.contract.slug) {
        routeData = {href:`/@${this.contract.slug}`};
      } else {
        routeData = this.$router.resolve({
          name: "contract",
          params: {
            address: this.address,
            network: this.network,
          },
        });
      }
      return `${window.location.protocol}//${window.location.host}${routeData.href}`;
    },
  },
  methods: {
    ...mapActions(["showError", "showClipboardOK"]),
    requestSame() {
      if (!this.isContract
          || this.sameInitialLoadingStatus !== DATA_LOADING_STATUSES.NOTHING
      ) return;

      this.sameInitialLoadingStatus = DATA_LOADING_STATUSES.PROGRESS;
      this.same = [];
      this.sameCount = 0;
      this.api
          .getSameContracts(this.network, this.address, 0)
          .then((res) => {
            if (!res) return;
            this.same = res.contracts;
            this.sameCount = res.count;
            this.sameInitialLoadingStatus = DATA_LOADING_STATUSES.SUCCESS;
          })
          .catch((err) => {
            this.showError(err);
            console.log(err);
            this.sameInitialLoadingStatus = DATA_LOADING_STATUSES.ERROR;
          });
    },
    requestSimilar() {
      if (!this.isContract
        || this.similarInitialLoadingStatus !== DATA_LOADING_STATUSES.NOTHING
      ) return;

      this.similarInitialLoadingStatus = DATA_LOADING_STATUSES.PROGRESS;
      this.similar = [];
      this.similarCount = 0;
      this.api
        .getSimilarContracts(this.network, this.address, 0)
        .then((res) => {
          if (!res) return;
          this.similar = res.contracts;
          this.similarCount = res.count;
          this.similarInitialLoadingStatus = DATA_LOADING_STATUSES.SUCCESS;
        })
        .catch((err) => {
          this.showError(err);
          console.log(err);
          this.similarInitialLoadingStatus = DATA_LOADING_STATUSES.ERROR;
        });
    },
    requestMoreSame() {
      this.sameLoading = true;
      this.api
        .getSameContracts(this.network, this.address, this.same.length)
        .then((res) => {
          if (!res) return;
          this.same.push(...res.contracts);
        })
        .catch((err) => {
          this.showError(err);
          console.log(err);
        })
        .finally(() => (this.sameLoading = false));
    },
    requestMoreSimilar() {
      this.similarLoading = true;
      this.api
        .getSimilarContracts(this.network, this.address, this.similar.length)
        .then((res) => {
          if (!res) return;
          this.similar.push(...res.contracts);
        })
        .catch((err) => {
          this.showError(err);
          console.log(err);
        })
        .finally(() => (this.similarLoading = false));
    },
    onForkClick() {
      this.$emit("fork", {
        address: this.address,
        network: this.network,
      });
    },
    resolveDomain() {
      this.api.resolveDomain(this.network, this.address).then((res) => {
        if (!res && res.name && res.name !== "") return;
        this.domain = res.name;
      });
    },
  },
  watch: {
    contract(newVal) {
      this.same_count = newVal.same_count;
      this.similar_count = newVal.similar_count;
      this.sameInitialLoadingStatus = DATA_LOADING_STATUSES.NOTHING;
      this.similarInitialLoadingStatus = DATA_LOADING_STATUSES.NOTHING;
      this.same = [];
      this.similar = [];
    }
  }
};
</script>

<style scss>
.opened-panel {
  border-bottom: none !important;
}
.opened-panel > .v-expansion-panel-content > .v-expansion-panel-content__wrap {
  padding: 0;
}
.opened-panel > .v-expansion-panel-header {
  min-height: 48px;
}
.contract-list {
  max-height: calc(100vh - 75px - 5 * 48px);
  overflow-y: auto;
  border-radius: 0;
  padding: 0;
  z-index: 1;
}
</style>

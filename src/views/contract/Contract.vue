<template>
  <div class="fill-height bg-canvas-base">
    <v-row class="bg-canvas-base">
      <v-col cols="9" class="pr-4 pb-4 d-flex align-center" style="padding-top: 10px;">
        <v-breadcrumbs
          class="pl-0 pb-0 pt-0 ml-10"
          divider="/"
          :items="breadcrumbsItems"
        />
        <Tags :tags="contract.tags"/>
      </v-col>
      <v-col cols="3" class="d-flex justify-end pr-7">
        <div class="d-flex align-center justify-start pa-2 px-4">
          <BookmarkButton
            :customClass="'mr-2 pl-2 pr-2 text--secondary'"
            :isTextButton=true
            :showEmpty=true
            :network="network"
            :address="address"
            :alias="alias"
          />
          <v-btn
            class="mr-2 pl-2 pr-2 text--secondary"
            outlined
            small
            @click="
              () => {
                $clipboard(address);
                showClipboardOK();
              }
            "
          >
            <v-icon class="text--secondary" small>mdi-content-copy</v-icon>
            <span class="ml-1 text--secondary">
              Copy address
            </span>
          </v-btn>
          <v-btn
            class="mr-2 pl-2 pr-2 text--secondary"
            outlined
            small
            @click="
              () => {
                openInTzkt();
              }
            "
          >
            <v-icon class="text--secondary" small>mdi-logout-variant</v-icon>
            <span class="ml-1 text--secondary">
              Open in TZKT
            </span>
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <MenuToolbar
      class="pl-7"
      :contract="contract"
      :network="network"
      :address="address"
      :tokensTotal="tokensTotal"
      :metadata="metadata"
      :is-anything-loading="isLoadingDataForTabs"
      :on-chain-views="onChainViews"
    />

    <VContainer fluid class="pt-0">
      <router-view
        :accountType="accountType"
        :address="address"
        :network="network"
        :alias="alias"
        :contract="contract"
        :balance="balance"
        :tokensTotal="tokensTotal"
        :metadata="metadata"
        :same-count="contract ? contract.same_count: 0"
        :on-chain-views="onChainViews"
      ></router-view>

    </VContainer>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import { cancelRequests } from "@/utils/cancellation.js";
import { toTitleCase } from "../../utils/string.js";
import { shortcutOnly } from "../../utils/tz.js";
import MenuToolbar from "./MenuToolbar.vue";
import Tags from "../../components/Tags.vue";
import BookmarkButton from "../../components/Bookmarks/BookmarkButton.vue";
import { openTzktContract } from "../../utils/tzkt.js";
import { DATA_LOADING_STATUSES } from "../../utils/network.js";
import { applyStyles } from "../../utils/styles.js";

const MIN_SEARCHBOX_WIDTH = 240;

export default {
  name: "Contract",
  components: {
    Tags,
    MenuToolbar,
    BookmarkButton,
  },
  props: {
    network: String,
    address: String,
  },
  data: () => ({
    accountType: '',
    contract: {},
    contractInfo: {},
    balance: 0,
    metadata: null,
    tokensTotal: 0,
    contractTags: null,
    contractLink: '',
    isComboBoxExpanded: false,
    onChainViews: [],
    onChainViewsLoadingStatus: DATA_LOADING_STATUSES.NOTHING,
    alias: undefined
  }),
  computed: {
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
    isOnChainsLoading() {
      return this.offChainViewsLoadingStatus === DATA_LOADING_STATUSES.PROGRESS;
    },
    isLoadingDataForTabs() {
      return this.isOnChainsLoading;
    },
    isContract() {
      return this.accountType === 'contract';
    },
    breadcrumbsItems() {
      return [
        {
          text: 'Home',
          to: '/',
        },
        {
          to: {
            name: "recently_called",
            params: {
              network: this.network
            }
          },
          text: toTitleCase(this.network),
        },
        {
          text: this.alias ? this.alias : shortcutOnly(this.address),
          to: `/${this.network}/${this.address}`,
          disabled: false,
        },
      ];
    },
  },
  destroyed() {
    this.hideError();
  },
  methods: {
    ...mapActions({
      showError: "showError",
      hideError: "hideError",
      showClipboardOK: "showClipboardOK",
    }),
    loadOnChainViews() {
      if (!this.network || !this.address) {
        return
      }
      this.onChainViewsLoadingStatus = DATA_LOADING_STATUSES.PROGRESS;

      this.api.getMetadataViewsSchema(this.network, this.address, 'on-chain')
        .then(views => {
          views.forEach(view => applyStyles(view.schema));
          this.onChainViews = views;
        })
        .catch(err => {
          this.showError(`Error while fetching off-chain views: ${err}`);
        })
        .finally(() => {
          this.onChainViewsLoadingStatus = DATA_LOADING_STATUSES.NOTHING;
        })
    },
    openInTzkt() {
      openTzktContract(this.network, this.contract);
    },
    handleSearchBoxFocus() {
      const { width } = this.$refs.searchbox.$el.getBoundingClientRect();
      if (width < MIN_SEARCHBOX_WIDTH) {
        this.isComboBoxExpanded = true;
      }
    },
    handleSearchBoxBlur() {
      this.isComboBoxExpanded = false;
    },
    init() {
      this
        .getInfo()
        .then((res) => {
          this.handleInfo(res);

          return this.getAlias(this.network, this.address);
        })
        .then((alias) => {
          this.alias = alias;
          this.fetchContractData();
        })
        .catch((err) => {
          this.showError(err);
        })
    },
    getContract() {
      if (
        this.contract.network === this.network &&
        this.contract.address === this.address
      ) {
        return;
      }
      this.api
        .getContract(this.network, this.address)
        .then((res) => {
          if (!res) return;
          this.contract = {...this.contractInfo, ...res};
        })
        .catch((err) => {
          if (err.code === 204) {
            return this.$router.push({
              name: 'not_found',
            });
          } else {
            this.showError(err);
          }
        })
    },
    fetchContractData() {
      if (this.isContract) {
        this.getContract();
        this.loadOnChainViews();
      } else {
        this.contract = this.contractInfo;
      }
      this.getMetadata();
    },
    getInfo() {
      this.onChainViews = [];
      this.tokensTotal = 0;
      this.metadata = null;

      return this.api.getAccountInfo(this.network, this.address)
    },
    handleInfo(info) {
      if (!info) return;
      this.contractInfo = info;
      this.accountType = info.account_type;
      if (info.balance !== undefined) {
        this.balance = info.balance || 0;
      }
    },
    getMetadata() {
      if (!this.metadataService.created()) return;

      this.metadataService
        .get(this.network, this.address)
        .then((res) => {
          if (!res) return;
          this.metadata = res;
        })
        .catch((err) => {
          this.showError(err);
        });
    },
  },
  watch: {
    address: {
      immediate: true,
      handler() {
        cancelRequests();
        this.init();
      }
    },
  },
};
</script>

<style>
.main-navigation > .v-navigation-drawer__content {
  overflow: hidden;
}
.v-tabs {
  font-family: "Roboto Condensed", sans-serif;
  font-weight: 500;
}
</style>

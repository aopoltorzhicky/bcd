<template>
  <v-container class="fill-height canvas main-rows-wrapper" fluid>
    <v-row no-gutters class="search-row">
      <v-col
        cols="12"
        class="d-flex flex-column align-center justify-center primary--text"
      >
          <span
            class="script-casual"
            style="font-size: 72px"
          >
            Better Call Dev
          </span>
      </v-col>
    </v-row>
    <v-row justify="center" no-gutters>
      <v-col cols="12" sm="8" lg="6" xl="5">
        <SearchBox />
        <div class="text-center text--secondary" style="position: relative; margin-top: -1em; margin-bottom: 2em;">
          <v-chip outlined label color="secondary" x-small class="mr-2">ads</v-chip>
          <span class="caption">Need a custom API for your dapp? Try <a href="https://dipdup.io" target="_blank" rel="noopener">DipDup</a> framework</span>
        </div>
      </v-col>
    </v-row>
    <v-row justify="center" no-gutters>
      <v-col cols="12" sm="8" lg="6" xl="5" style="min-height: 450px;" >
        <header class="d-flex justify-space-between align-center">
          <h3 class="text--secondary font-weight-regular header-table">Recently called contracts</h3>
          <div>
            <v-btn-toggle v-model="selectedNetwork" color="primary" dense mandatory>
              <v-btn
                small
                :value="data"
                v-for="data in networks"
                :key="data"
              >
                {{ data }}
                <div
                  v-if="networksStats.length > 0"
                  :class="getSyncClass(data)"
                ></div>
              </v-btn>
            </v-btn-toggle>
          </div>
        </header>
        <RecentlyCalledContracts class="mt-4" :network="selectedNetwork" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="8" class="ml-auto mr-auto">
        <v-footer
          color="transparent"
          bottom
          absolute
          class="d-flex justify-center align-center text--disabled"
          style="z-index: 0"
        >
          <span class="overline">Created by</span>
          <a href="https://bakingbad.dev/" target="_blank" rel="noopener" class="text--secondary text-small ml-1 pa-1 no-decoration overline">Baking Bad</a>
          <span class="ml-1 mr-2">·</span>
          <span class="overline">Hosted on</span>
          <a href="https://www.netlify.com" target="_blank" rel="noopener" class="text--secondary text-small ml-1 pa-1 no-decoration overline">Netlify</a>
        </v-footer>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions } from "vuex";
import SearchBox from "@/components/SearchBox.vue";
import { DATA_LOADING_STATUSES } from "../../utils/network.js";
import RecentlyCalledContracts from "../../components/Tables/RecentlyCalledContracts.vue";

export default {
  name: "Home",
  components: {
    RecentlyCalledContracts,
    SearchBox,
  },
  data: () => ({
    stats: [],
    loadingHead: true,
    selectedNetwork: null,
    networks: window.config.networks,
    networksStats: [],
    listenerNetworksSync: null,
    aliasMaxLength: 20,
  }),
  computed: {
    isNetworkSyncStatsLoading() {
      return this.loadingNetworkSync === DATA_LOADING_STATUSES.PROGRESS;
    }
  },
  destroyed() {
    this.stopListeningNetworksSync();
  },
  mounted() {
    this.listenNetworksSync();

    if (this.$route.name !== this.config.HOME_PAGE) {
      this.$router.push({ path: this.config.HOME_PAGE });
    }
  },
  methods: {
    ...mapActions(["showError"]),
    getSyncClass(value) {
      return this.networksStats !== null && this.networksStats.find((item) => item.network === value).synced ? 'synced' : 'unsynced';
    },
    requestNetworkSync() {
      this.loadingNetworkSync = DATA_LOADING_STATUSES.PROGRESS;
      this.api.getHead()
        .then((data) => {
          this.networksStats = data;
          this.loadingNetworkSync = DATA_LOADING_STATUSES.SUCCESS;
        });
    },
    listenNetworksSync() {      
      this.requestNetworkSync();
      this.listenerNetworksSync = setTimeout(() => {
        this.listenNetworksSync();
      }, 30 * 1000);
    },
    stopListeningNetworksSync() {
      this.networksStats = [];
      clearTimeout(this.listenerNetworksSync);
    },
    getHead() {
      this.api
        .getHead()
        .then((res) => {
          this.stats = res;
        })
        .catch((err) => {
            console.log(err);
            this.showError(err);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.main-rows-wrapper {
  .search-row {
    align-items: flex-end;
    margin-top: 4rem;
  }
  .stats-row {
    height: 50%;
  }
  .synced,
  .unsynced {
    width: 0.25rem;
    height: 0.25rem;
    margin-left: 0.25rem;
    border-radius: 100%;
  }
  .synced {
    background: green;
  }
  .unsynced {
    background: red;
  }
  .header-table {
    padding-left: 3px;
  }
}
</style>
<style lang="scss">
button.pick-random-button {
  padding-right: 0 !important;
  & > .v-btn__content {
    height: inherit;
    border-top-right-radius: inherit;
    border-bottom-right-radius: inherit;
    .network-select {
      margin-left: 1em;
      width: 3em;
      height: 100%;
      margin-top: 0;
      padding-top: 0;
      border-top-right-radius: inherit;
      border-bottom-right-radius: inherit;
      border-left: 1px solid var(--v-data-lighten2);
      color: inherit !important;
      &.theme--light {
        border-color: rgba(0,0,0,0.06) !important;
      }
      &:not(.theme--light):active {
        background: darken(#414141, 1);
      }
      &.theme--light:active {
        background: darken(#dddddd, 15);
      }
      & > .v-input__control {
        height: inherit;
        & > .v-input__slot {
          height: inherit;
          margin-bottom: 0;
          &::before,
          &::after {
            border: none;
          }
          .v-select__slot {
            height: inherit;
            .v-input__append-inner {
              margin: 0;
              padding: 0;
              height: inherit;
              width: 100%;
              .v-input__icon {
                height: inherit;
                .v-icon {
                  height: inherit;
                  color: inherit !important;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>

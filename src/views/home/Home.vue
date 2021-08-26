<template>
  <v-container class="fill-height canvas" fluid>
    <HomeToolbar />
    <v-container class="fill-height canvas main-rows-wrapper" fluid>
      <v-row no-gutters class="search-row">
        <v-col cols="12">
          <v-row>
            <v-col
              cols="12"
              class="d-flex align-center justify-center primary--text"
            >
              <span style="font-family: Script1-Casual, monospace; font-size: 72px"
                >Better Call Dev</span
              >
            </v-col>
          </v-row>
          <v-row justify="center" no-gutters>
            <v-col cols="12" sm="8" lg="6" xl="4">
              <SearchBox />
            </v-col>
            <v-col cols="12" align="center">
              <v-btn
                large
                depressed
                color="border"
                class="text--secondary mr-5"
                to="/dapps"
                ><v-icon left color="error">mdi-fire</v-icon>Explore
                DApps</v-btn
              >
              <v-btn
                large
                depressed
                color="border"
                class="text--secondary mr-5"
                to="/search"
                >Advanced Search</v-btn
              >
              <v-btn
                large
                depressed
                color="border"
                class="text--secondary pick-random-button"
                :loading="pickingRandom"
                @click="pickRandom"
                >
                Pick Random
                <v-select
                    class="network-select"
                    :items="stats.map(item => item.network)"
                    :menu-props="{ top: true, offsetY: true }"
                    @change="pickRandom"
                >
                </v-select>
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-fade-transition>
        <v-row justify="center" align="center" class="stats-row">
          <v-col cols="6">
            <v-row
              class="caption font-weight-medium text-uppercase text-center text--secondary"
              v-show="stats.length > 0"
              no-gutters
            >
              <v-col class="pl-12"></v-col>
              <v-col>Unique contracts</v-col>
              <v-col>
                <router-link
                  v-if="stats.length > 0"
                  style="text-decoration: none"
                  :to="`/stats/${stats[0].network}/fa2`"
                >
                  <span class="secondary--text">FA tokens</span>
                </router-link>
              </v-col>
              <v-col>Contract calls</v-col>
              <v-col class="text-center pl-12">Synced</v-col>
            </v-row>
            <v-row
              v-for="(item, idx) in stats"
              :key="idx"
              class="text-center my-2"
              justify="center"
              align="center"
              no-gutters
            >
              <v-col class="text-left pl-12">
                <v-btn
                  small
                  text
                  :to="`/stats/${item.network}/general`"
                  :class="
                    item.network === 'mainnet'
                      ? 'secondary--text'
                      : 'text--primary'
                  "
                >
                  <span>{{ item.network }}</span>
                </v-btn>
              </v-col>
              <v-col>{{ item.unique_contracts }}</v-col>
              <v-col>{{ item.fa_count }}</v-col>
              <v-col>{{ item.contract_calls }}</v-col>
              <v-col class="body-2 text-center pl-12">{{
                helpers.formatDatetime(item.time, { val: 1, unit: "day", isArticle: false })
              }}</v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-fade-transition>
    </v-container>

    <v-footer
      color="transparent"
      absolute
      bottom
      class="d-flex justify-center align-center text--disabled"
      style="z-index: 0"
    >
      <span class="overline">Tezos smart contract explorer by</span>
      <v-btn
        small
        text
        href="https://baking-bad.org/docs"
        target="_blank"
        class="text--secondary ml-1 pa-1"
        style="margin-bottom: 2px;"
      >
        <span>Baking Bad</span>
      </v-btn>
    </v-footer>
  </v-container>
</template>

<script>
import { mapActions } from "vuex";
import HomeToolbar from "@/views/home/HomeToolbar.vue";
import SearchBox from "@/components/SearchBox.vue";

export default {
  name: "Home",
  components: {
    HomeToolbar,
    SearchBox,
  },
  data: () => ({
    stats: [],
    pickingRandom: false,
    loadingHead: true
  }),
  mounted() {
    if (this.$route.name != this.config.HOME_PAGE) {
      this.$router.push({ path: this.config.HOME_PAGE });
    }
    this.getHead();
  },
  methods: {
    ...mapActions(["showError"]),
    getHead() {
      this.api
        .getHead()
        .then((res) => {
          this.stats = res;
        })
        .catch((err) => {
            console.log(err);
            this.showError(err);
        })
        .finally(() => {
          this.pickingRandom = false;
        });
    },
    pickRandom(val) {
      const isSelectPressed = val.target && val.target.closest('.network-select');
      if (isSelectPressed || this.pickingRandom) return;
      this.pickingRandom = true;
      this.api
        .getRandomContract(val.target ? '' : val)
        .then((res) => {
          this.$router.push({ path: `/${res.network}/${res.address}` });
        })
        .catch((err) => {
          if (err.response.status === 404) {
            this.showError("The network does not have enough contracts");
          } else if (err.code !== 204) {
            console.log(err);
            this.showError(err);
          }
        })
        .finally(() => {
          this.pickingRandom = false;
        });
    },
  },
};
</script>

<style lang="scss">
@font-face {
  font-family: "Script1-Casual";
  src: url("/fonts/script1-script-casual-normal.ttf");
}
</style>
<style lang="scss" scoped>
.main-rows-wrapper {
  .search-row {
    align-items: flex-end;
    height: 50%;
  }
  .stats-row {
    height: 50%;
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

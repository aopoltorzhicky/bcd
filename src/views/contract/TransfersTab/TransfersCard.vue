<template>
  <div class="ma-0 pa-0">
    <v-card flat outlined>
      <v-list class="ma-0 pa-0 data">
        <v-list-item-group
          active-class="token-card-selected"
          mandatory
        >
          <template v-for="(item, i) in tokens">
            <v-divider v-if="i !== 0" :key="`${i}-divider`" />
            <v-list-item two-line @click="selectedToken = item" :key="`${item.contract}:${item.token_id}`"
                class="token-card">
              <v-list-item-avatar class="my-0 mr-2">
                <v-tooltip :class="item === selectedToken ? 'token-card token-card-selected' : ''" left>
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on" small icon class="text--disabled" @click.prevent.stop="openToken(item)">
                      <v-icon small>mdi-open-in-new</v-icon>
                    </v-btn>
                  </template>
                  <span>View contract</span>
                </v-tooltip>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>
                  <span
                      v-if="item.name"
                      @mouseover="(e) => e.target.textContent = item.name"
                      @mouseout="(e) => e.target.textContent = cutItemName(item.name)"
                  >
                    {{ cutItemName(item.name) }}
                  </span>
                  <span v-else v-html="helpers.shortcut(item.contract)"></span>
                </v-list-item-title>
                <v-list-item-subtitle>
                  <span class="caption text--disabled">token ID:</span>
                  <span>&nbsp;{{ item.token_id }}</span>
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action v-if="isLackMetadata(item)">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-icon
                        v-on="on"
                        small
                        :color="warningColor"
                        title="No metadata"
                    >
                      mdi-alert
                    </v-icon>
                  </template>
                  <span>No metadata</span>
                </v-tooltip>
              </v-list-item-action>
              <v-list-item-action v-else>
                <v-list-item-action-text>
                  <span
                      class="hash text--primary"
                      style="font-size: 1.2em;"
                      @mouseover="(e) => e.target.textContent = getItemValue(item)"
                      @mouseout="(e) => e.target.textContent = cutItemValue(item)"
                  >
                    {{ cutItemValue(item) }}
                  </span>
                  <span class="caption text-uppercase font-weight-regular text--secondary">
                    &nbsp;{{ item.symbol ? item.symbol : '' }}
                  </span>
                </v-list-item-action-text>
                <v-list-item-action-text>
                  <span class="text--disabled">balance</span>
                </v-list-item-action-text>
              </v-list-item-action>
            </v-list-item>
        </template>
        </v-list-item-group>
      </v-list>
    </v-card>
    <div class="text-center mt-2">
      <v-pagination
        v-model="tokensPage"
        :length="tokensPageCount"
        v-if="tokenBalancesTotal > itemsPerPage"
      ></v-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: "TransfersCard",
  props: {
    network: String,
    address: String,
    tokenBalancesTotal: Number
  },
  watch: {
    tokensPage: {
      handler(newVal) {
        this.getTokenBalances((newVal - 1) * this.itemsPerPage, this.itemsPerPage)
      },
      immediate: true
    },
    tokenBalancesTotal: {
      handler(newVal) {
        this.tokensPageCount = Math.ceil(newVal / this.itemsPerPage);
      },
      immediate: true
    },
    selectedToken: {
      handler(newVal) {
        this.$emit('selectedToken', newVal)
      },
      deep: true,
      immediate: true
    },
  },
  methods: {
    cutItemName(name) {
      if (name.length > this.maxLengthTokenName) {
        return `${name.slice(0, -3)}...`;
      }
      return name;
    },
    cutItemValue(item) {
      return Number(item.balance/Math.pow(10, item.decimals)).toFixed(this.maxLengthTokenDecimals);
    },
    getTokenBalances(offset, size) {
      this.api
        .getAccountTokenBalances(this.network, this.address, offset, size)
        .then((res) => {
          if (!res) return;
          this.tokens = res.balances;
          this.selectedToken = this.tokens[0];
        })
        .catch((err) => {
          this.showError(err);
        })
    },
    getItemValue(item) {
      return this.helpers
          .round(
              item.balance,
              item.decimals ? item.decimals : 0
          )
          .toLocaleString(undefined, {
            maximumFractionDigits: item.decimals
                ? item.decimals
                : 0,
          })
    },
    openToken(item) {
      const path = {path: `/${item.network}/${item.contract}/tokens?token_id=${item.token_id}`};
      window.open(this.$router.resolve(path).href, "_blank");
    },
    isLackMetadata(item) {
      const isMetadata = 'decimals' in item && 'symbol' in item;
      return !isMetadata;
    },
  },
  computed: {
    theme() {
      return this.$vuetify.theme.themes[this.$vuetify.theme.isDark ? 'dark' : 'light'];
    },
    warningColor() {
      return this.theme.warning;
    }
  },
  data() {
    return {
      tokens: [],
      selectedToken: null,
      isHovered: false,
      maxLengthTokenName: 16,
      maxLengthTokenDecimals: 2,
      tokensPage: 1,
      tokensPageCount: 0,
      itemsPerPage: 9,
    }
  }
}
</script>

<style scoped>
.token-card {
  border-bottom: 1px solid var(--v-border-base);
}

.token-card:last-child {
  border-bottom: none !important;
}

.token-card-selected {
  border-left: 2px solid var(--v-primary-base);
  background-color: var(--v-sidebar-base);
}
</style>

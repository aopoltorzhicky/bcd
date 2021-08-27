<template>
  <div class="ma-0 pa-0">
    <v-card flat outlined>
      <v-list class="ma-0 pa-0 data">
        <v-skeleton-loader
          v-if="isLoading"
          :loading="isSpecificLoaded"
          type="image"
        >
        </v-skeleton-loader>
        <v-list-item-group
          v-else
          active-class="token-card-selected"
          mandatory
        >
          <template v-for="(item, i) in tokens">
            <v-divider :key="item.token_id" v-if="i !== 0" />
            <v-list-item @click="selectedToken = item" :key="`${item.contract}:${item.token_id}`" class="token-card">
              <v-list-item-content>
                <v-list-item-title>
                  <span v-if="item.name">{{ item.name }}</span>
                  <span v-else class="text--disabled">NO NAME</span>
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-list-item-action-text>
                  <span class="caption text--disabled">token ID:</span>
                  <span>&nbsp;{{ item.token_id }}</span>
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
        v-if="tokensTotal > itemsPerPage"
      ></v-pagination>
    </div>
  </div>
</template>

<script>
import { getQuery, isQuery } from "../../../utils/url";

const TOKEN_ID_QUERY = 'token_id';

export default {
  name: "TokensList",
  props: {
    network: String,
    address: String,
    tokensTotal: Number
  },
  computed: {
    isLoading() {
      return !this.isSpecificLoaded && !this.isTokensLoaded;
    }
  },
  methods: {
    getTokens(offset, size) {
      this.isTokensLoaded = false;
      this.api
        .getContractTokens(this.network, this.address, offset, size)
        .then((res) => {
          if (!res) return;
          if (this.tokensPage === 1) {
            const token_id = getQuery(TOKEN_ID_QUERY);
            if (isQuery(TOKEN_ID_QUERY) && !this.tokens.length) {
              this.getSpecificToken(token_id).then((res) => {
                this.tokens = this.tokens.filter(token => token.token_id !== Number(token_id)).concat(res);
              });
            } else if (isQuery(TOKEN_ID_QUERY) && this.tokens.length) {
              this.tokens = this.tokens.filter(token => token.token_id !== Number(token_id)).concat(res);
            } else {
              this.tokens = res;
            }
          } else {
            this.tokens = res.filter(token => token.token_id !== Number(getQuery(TOKEN_ID_QUERY)));
          }
          if (this.tokensPage === 1 && !isQuery(TOKEN_ID_QUERY) || this.tokensPage > 1) {
            this.selectedToken = this.tokens[0];
          }
        })
        .catch((err) => {
          this.showError(err);
        })
        .finally(() => {
          this.isTokensLoaded = true;
        })
    },
    getSpecificToken(token_id) {
      this.isSpecificLoaded = false;
      return this.api
        .getContractToken(this.network, this.address, token_id)
        .then((res) => {
          if (res && res[0]) {
            this.tokens = res;
            this.selectedToken = res[0];
          }
        })
        .finally(() => {
          this.isSpecificLoaded = true;
        })
    },
    getNextTokensAmount() {
      const minusator = isQuery(TOKEN_ID_QUERY) && this.tokensPage === 1 ? 1 : 0;
      return this.itemsPerPage - minusator;
    },
  },
  watch: {
    tokensPage: {
      handler(newVal) {
        if (newVal === 1 && isQuery(TOKEN_ID_QUERY)) {
          const token_id = getQuery(TOKEN_ID_QUERY);
          this.getSpecificToken(token_id)
            .then(() => {
              this.getTokens((this.tokensPage - 1) * this.itemsPerPage, this.getNextTokensAmount());
            })
        } else {
          this.getTokens((newVal - 1) * this.itemsPerPage, this.getNextTokensAmount());
        }
      },
      immediate: true
    },
    tokensTotal: {
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
    }
  },
  data() {
    return {
      tokens: [],
      selectedToken: null, 
      tokensPage: 1,
      itemsPerPage: 10,
      tokensPageCount: 0,
      isSpecificLoaded: false,
      isTokensLoaded: false,
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
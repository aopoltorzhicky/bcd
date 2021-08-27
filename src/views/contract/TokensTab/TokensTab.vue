<template>
  <v-container class="canvas fill-canvas pa-8 ma-0" fluid>
    <v-row no-gutters>
      <v-col cols="8" class="pa-2">
        <div
          v-if="selectedToken"
        >
          <TokenMetadata :token="selectedToken"/>
          <TokenHolders class="mt-3" :token="selectedToken" />
        </div>
        <v-skeleton-loader
          v-else
          :loading="typeof selectedToken !== 'number'"
          type="image"
        >
        </v-skeleton-loader>
      </v-col>
      <v-col cols="4" class="pa-2">
        <TokensList :network="network" :address="address" :tokensTotal="tokensTotal" @selectedToken="updateSelectedToken"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import TokenMetadata from "@/views/contract/TokensTab/TokenMetadata";
import TokenHolders from "@/views/contract/TokensTab/TokenHolders";
import TokensList from "@/views/contract/TokensTab/TokensList";

export default {
  name: "ContractTokensTab",
  props: {
    network: String,
    address: String,
    tokensTotal: Number
  },
  components: {
    TokensList,
    TokenMetadata,
    TokenHolders
  },
  data: () => ({
    holders: {},
    selectedToken: null
  }),
  methods: {
    async updateSelectedToken(newVal) {
      this.selectedToken = newVal;
    },
  }
};
</script>

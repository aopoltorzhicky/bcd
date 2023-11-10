<template>
  <div>
    <v-menu offset-y tile v-if="!account">
      <template v-slot:activator="{ on, attrs }">
      <v-btn icon class="text--secondary" v-bind="attrs" v-on="on" >
        <v-icon size="26">mdi-wallet</v-icon>
      </v-btn>
      </template>
      <v-list class="py-0">
        <v-subheader class="overline">Select network</v-subheader>
          <v-divider/>
        <v-list-item class="pr-8 pl-4 cursor-pointer" @click="auth(network)" v-for="network in config.networks" :key="network">
          <v-list-item-title class="text-capitalize">{{network}}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <div v-else>
      <v-menu offset-y tile v-model="isOpened" :close-on-content-click="false">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon style="padding-top: 4px" v-on="on" v-bind="attrs">
            <img alt="avatar" class="avatar" :src="`https://catava.dipdup.net/${account.address}`">
          </v-btn>
        </template>
        <v-list class="py-0" max-width="250">
          <v-list-item three-line>
            <v-list-item-content>
              <v-list-item-title>{{account.walletName}}</v-list-item-title>
              <v-list-item-subtitle class="hash" v-past-html="helpers.shortcut(account.address, 6)"></v-list-item-subtitle>
              <v-list-item-subtitle class="overline">{{ account.network.name }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                    <v-btn v-on="on" class="mt-2" icon @click="{
                      $clipboard(account.address);
                      showClipboardOK();
                    }">
                        <v-icon class="text--secondary">mdi-content-copy</v-icon>
                    </v-btn>
                </template>
                <span>Copy wallet address</span>
              </v-tooltip>
            </v-list-item-action>
          </v-list-item>
          <v-divider/>
          <template v-if="!isChangeWallet">
            <v-list-item class="px-4 cursor-pointer" @click="isChangeWallet = true">
              <v-list-item-title>Change wallet</v-list-item-title>
            </v-list-item>
            <v-list-item class="px-4 cursor-pointer" @click="logOut">
              <v-list-item-title>Log out</v-list-item-title>
            </v-list-item>
          </template>
          <v-list-item v-else class="pr-8 pl-4 cursor-pointer" @click="auth(network, false)" v-for="network in config.networks" :key="network">
            <v-list-item-title class="text-capitalize">{{network}}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<script>
import {Wallet} from "@/utils/wallet";
import { mapActions } from "vuex";

export default {
  name: "ConnectWallet",
  data() {
    return {
      isOpened: false,
      wallet: null,
      account: null,
      isChangeWallet: false,
      isGettingWalletProgress: false
    }
  },
  created() {
    Wallet.changeWalletState(() => {
      this.account = Wallet.getLastUsedAccount();
    });
  },
  mounted() {
    this.account = Wallet.getLastUsedAccount();
  },
  watch: {
    isOpened() {
      this.isChangeWallet = false
    }
  },
  methods: {
    ...mapActions(["showClipboardOK"]),
    async auth(network = 'mainnet', isLast = true) {
      this.isOpened = false;
      try {
        await Wallet.getClient(network.toLowerCase(), [], isLast);
      } catch (e) {
        console.error(e);
      }
      this.account = Wallet.getLastUsedAccount();
      this.isChangeWallet = false;
    },
    async logOut() {
      this.isOpened = false;
      if (Wallet.wallet) {
        await Wallet.wallet.clearActiveAccount();
      }
      localStorage.removeItem('beacon:accounts')
      localStorage.setItem('beacon:active-peer', '');
      localStorage.setItem('beacon:active-account', '');
      Wallet.wallet = null
      Wallet.isPermissionGiven = false
      this.account = null
    }
  },
  computed: {
    selectedNetwork() {
      return 'mainnet'
    }
  }
}
</script>

<style scoped lang="scss">
.avatar {
  width: 34px;
  height: 34px;
}

.text--secondary {
  margin-top: 2px;
}

.wallet-info {
  display: flex;
  flex-direction: column;
  padding: 12px 12px 12px 0;  
}
</style>
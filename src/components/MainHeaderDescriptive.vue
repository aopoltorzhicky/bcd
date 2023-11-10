<template>
  <header class="header-class pl-4 pr-4" :class="headerAdditionalClass">
    <div class="d-flex align-center">
      <RouterLink to="/" class="no-decoration d-flex align-center">
        <h2 class="script-casual primary--text">BCD</h2>
        <span class="ml-3 text-small overline text--secondary">Tezos Contract Explorer</span>
      </RouterLink>
    </div>
    <div>
      <v-btn v-if="!isSandbox"
        @click="bcdModeRedirect"
        text
        small
        class="text--secondary"
        active-class="bg-before-transparent"
        > {{ bcdInMainMode ? 'Periodic BCD' : 'Main BCD' }}
      </v-btn>
      <v-btn v-if="searchService.created()" text small :to="{ name: 'search' }" class="text--secondary" active-class="bg-before-transparent">
        Search
      </v-btn>
      <v-btn text small :to="{ path: networksPath }" class="text--secondary" active-class="bg-before-transparent">
        Networks
      </v-btn>
       <v-btn text small :to="{ name: 'deploy' }" class="text--secondary" active-class="bg-before-transparent">
        Deploy
      </v-btn>
    </div>
    <div class="searchbox-wrapper">
      <SearchBox v-if="!noSearch" :inplace="true"></SearchBox>
      <SocialsList class="socials-list ml-3"/>
      <Bookmarks />
      <ThemeSwitcher />
      <ConnectWallet :network="network"/>
    </div>
  </header>
</template>

<script>
import SocialsList from "./SocialsList.vue";
import SearchBox from "./SearchBox.vue";
import ThemeSwitcher from "./ThemeSwitcher.vue";
import Bookmarks from "./Bookmarks/Bookmarks.vue";
import ConnectWallet from "@/components/ConnectWallet.vue";

export default {
  name: "MainHeaderDescriptive",
  components: {
    ConnectWallet,
    ThemeSwitcher,
    SearchBox,
    SocialsList,
    Bookmarks
  },
  props: {
    noSearch: Boolean,
    network: String,
  },
  computed: {
    headerAdditionalClass() {
      return this.isHome ? 'home-header ' : '';
    },
    isHome() {
      return this.$route.path === '/';
    },
    isDarkTheme() {
      return this.$vuetify.theme.dark;
    },
    isSandbox() {
      return this.config.sandbox_mode;
    },
    networksPath() {
      if (this.isSandbox) {
        return `/${this.$route.params.network || 'sandboxnet'}/`
      }
      if ('mainnet' in this.config.networks) {
        return `/${this.$route.params.network || 'mainnet'}/`
      }
      return `/${this.$route.params.network || this.config.networks[0]}/`
    },
    bcdInMainMode() {
      return !window.location.hostname.startsWith('teztnets');
    },
  },
  methods: {
    bcdModeRedirect() {
      if (this.bcdInMainMode) {
        window.location.href = 'https://teztnets.better-call.dev/';
      } else {
        window.location.href = 'https://better-call.dev/';
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.header-class {
  position: fixed;
  background: var(--v-canvas-base);
  height: var(--main-header-weight);
  top: 0;
  left: 0;
  width: 100%;
  z-index: var(--z-index-main-header);
  display: flex;
  align-items: center;
  justify-content: space-between;
  &:not(.home-header) {
    border-bottom-width: thin;
    border-bottom-style: solid;
    border-bottom-color: var(--v-border-base);
  }
}
.searchbox-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 2.5rem;
  gap: 0.75rem;
  & > * {
    height: 2.5rem;
  }
}
.list-class {
  padding: 0;
  background: transparent;
}
.socials-list {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.list-item-group-class {
  display: flex;
  & > a {
    height: 2.5rem !important;
  }
}
</style>

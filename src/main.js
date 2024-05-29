import Vue from 'vue'
import Clipboard from 'v-clipboard'
import App from './App.vue'

import './styles';

import store from '@/store'
import { newRouter } from '@/router/index.js'

import VueGtag from "vue-gtag";
import VueMeta from 'vue-meta';
import VueSanitize from "vue-sanitize";

import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/tracing";

import { shortcut, shortcutOnly, formatDatetime, formatDate, plural, urlExtractBase58, checkAddress, round } from "@/utils/tz.js";
import { BetterCallApi } from "@/api/bcd.js";
import { TokenMetadataApi } from "@/api/token_metadata.js";
import { NodeRPC } from "@/api/rpc.js";
import { Bookmarks } from "@/utils/bookmarks.js";
import { Aliases } from '@/utils/aliases.js';
import { SearchService } from "@/api/search.js";
import { MetadataAPI } from "@/api/metadata.js";
import { StatsAPI } from "@/api/stats.js";

import { makeVuetify } from '@/plugins/vuetify';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import PortalVue from 'portal-vue'

import { fixNavigationCurrentLocationProblem } from '@/setups/router';

fixNavigationCurrentLocationProblem();

import VJsf from '@baking-bad/vjsf/lib/VJsf.js';
import '@baking-bad/vjsf/lib/VJsf.css';

import draggable from 'vuedraggable';
import {roundDownSignificantDigits, SIFormatter} from "./utils/number";
import {isKT1Address, isOperationHash, isTzAddress} from "./utils/tz";
import {isOldBigMapRoute} from "./utils/url";

Vue.component('draggable', draggable);
Vue.component('VJsf', VJsf)

Vue.config.productionTip = false;

dayjs.extend(relativeTime);
dayjs.extend(utc);

Vue.use(PortalVue);

Vue.use(Clipboard);
Vue.use(VueSanitize);

Vue.filter('numberToCompactSIFormat', function (value, decimals) {
  let num = Number(value);
  if (num > 1000){
    return SIFormatter.format(roundDownSignificantDigits(num, decimals));
  }
  return `${num}`;
});

Vue.filter('formatDate', function (value) {
  if (value) {
    return dayjs(value).format('D MMMM YYYY');
  }
})

Vue.filter('formatTime', function (value) {
  if (value) {
    return dayjs(value).format('D MMMM YYYY HH:mm');
  }
})


Vue.filter('formatShortTime', function (value) {
  if (value) {
    return dayjs(value).format('D MMM YYYY HH:mm');
  }
})

Vue.filter('fromNow', function (value) {
  if (value) {
    return dayjs(value).fromNow();
  }
})

Vue.filter('uxtz', function (value) {
  let xtz = (value / 1000000).toLocaleString(undefined, { maximumFractionDigits: 6 });
  return `${xtz} \uA729`;
})


Vue.filter('milligas', function (value) {
  let gas = (value / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 });
  return `${gas}`;
})

Vue.filter('mutez', function (value) {
  let xtz = (value / 1000000).toLocaleString(undefined, { maximumFractionDigits: 6 });
  return `${xtz}`;
})

Vue.filter('bytes', function (value) {
  return `${value} bytes`;
});

Vue.filter('snakeToCamel', (str) => {
  if (!(/[_-]/).test(str)) return str;

  return str.toLowerCase().replace(/([-_])([a-z])/g, (_match, _p1, p2) => p2.toUpperCase());
});


Vue.directive('pastHtml', {
    inserted(el, binding) {
      el.insertAdjacentHTML('afterbegin', binding.value);
    }
})


Vue.directive('pastHtml', {
    inserted(el, binding) {
      el.innerHTML = binding.value;
    },
    update(el, binding,) {
      el.innerHTML = binding.value;
    }
})

let config = {
  API_URI: process.env.VUE_APP_API_URI || `${window.location.protocol}//${window.location.host}/v1`,
  HOME_PAGE: 'home',
  IPFS_NODE: process.env.VUE_APP_IPFS_NODE || "https://ipfs.io",
}

let api = new BetterCallApi(config.API_URI);
let bookmarks = new Bookmarks();
let aliases = new Aliases(1000);
let searchService = new SearchService(process.env.VUE_APP_SEARCH_SERVICE_URI);
let tokenMetadata = new TokenMetadataApi(process.env.VUE_APP_TOKEN_METADATA_API);
let metadataService = new MetadataAPI(process.env.VUE_APP_METADATA_API_URI);
let stats = new StatsAPI({
  'mainnet': process.env.VUE_APP_MAINNET_STATS_API_URI,
  'ghostnet': process.env.VUE_APP_GHOSTNET_STATS_API_URI,
  'oxfordnet': process.env.VUE_APP_TESTNET_STATS_API_URI,
  'parisnet': process.env.VUE_APP_PARISNET_STATS_API_URI,
});

const darkLocalStorage = localStorage.getItem('dark');
let isDark = true;
if (darkLocalStorage) {
  isDark = JSON.parse(localStorage.getItem('dark'));
} else {
  localStorage.setItem('dark', true);
}

if (isDark) {
  document.body.classList.add('dark-theme-background');
}

export const vuetify = makeVuetify(isDark);

api.getConfig().then(response => {
  Object.assign(config, response);

  config.rpc_endpoints = Object.fromEntries(
    Object.entries(config.rpc_endpoints)
      .map(([k, v]) => [k, v.replace('sandbox', '127.0.0.1')])
  );

  window.config = config;

  let rpc = new NodeRPC(config.rpc_endpoints);
  let helpers = { shortcut, shortcutOnly, formatDatetime, formatDate, plural, checkAddress, round }

  Vue.mixin({
    data() {
      return {  config, api, rpc, helpers, bookmarks, aliases, metadataService, tokenMetadata, searchService, stats }
    },
    methods: {
      getAlias(network, address) {
        if (!this.searchService.created()) return;

        let alias = this.aliases.get(`${network}_${address}`);
        if (alias !== undefined) return alias;

        return this.searchService.alias(network, address)
          .then(result => {
            this.aliases.add(`${network}_${address}`, result);
            return result;
          })
          .catch(err => console.error(err));
      }
    }
  });

  let router = newRouter(config.networks)

  router.beforeEach((_to, _from, next) => {
    store.dispatch('hideError');
    next();
  });

  router.addRoutes([
    {
      path: '*',
      beforeEnter: async function (to, from, next) {
        if (isOldBigMapRoute(to.fullPath)) {
          const splitted = to.fullPath.split('/')
          return await api.getContractBigMap(splitted[1], splitted[3])
                                  .then(res => next(`/${res.network}/${res.address}/storage/big_map/${res.ptr}/${splitted[4] || ''}`))
                                  .catch(() => next(`/not_found`));
        }
        const text = urlExtractBase58(to.path) || to.path.split('/').join(' ');
        if (isKT1Address(text) || isTzAddress(text)) {
          return next(`/mainnet/${text}/operations`);
        }
        if (isOperationHash(text)) {
          return next(`/mainnet/opg/${text}/contents`);
        }
        return next('/not_found');
      },
    }
  ]);

  if (config.GA_ENABLED || config.ga_enabled) {
    Vue.use(VueGtag, {
      pageTrackerUseFullPath: true,
      config: {
        id: "UA-160856677-1",
      }
    }, router);
  }

  if (process.env.VUE_APP_SENTRY_URI) {
    Sentry.init({
      Vue,
      dsn: process.env.VUE_APP_SENTRY_URI,
      integrations: [new BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        tracingOrigins: ["better-call.dev"],
      })],
      ignoreErrors: [
        "Don't have an RPC endpoint"
      ],
      beforeSend(errorObj) {
        const { exception } = errorObj;
        if (exception && exception.values && exception.values[0]) {
          const { value } = exception.values[0];
          const splittedString = value.split('Request failed with status code ');
          if (splittedString[1]) {
            const codeNumber = Number(splittedString[1]);
            const isInRange = codeNumber >= 500 && codeNumber < 600;
            if (!isInRange) return null;
          }
        }
        return errorObj;
      },
      attachStacktrace: true,
    });
  }

  Vue.use(VueMeta);

  new Vue({
    router,
    store,
    vuetify,
    render: h => h(App),
  }).$mount('#app');
});

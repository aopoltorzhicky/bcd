import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '@/views/home/Home.vue'

import ExtendedSearch from '@/views/extended_search/ExtendedSearch.vue'

import Network from '@/views/network/Network.vue'
import RecentlyCalledTab from '@/views/network/RecentlyCalledTab.vue'
import ConstantsTab from '@/views/network/ConstantsTab.vue'
import StatsTab from '@/views/network/StatsTab.vue'
import Deploy from '@/views/deploy/Deploy.vue'

import Contract from '@/views/contract/Contract.vue'
import OperationsTab from '@/views/contract/OperationsTab.vue'
import CodeTab from '@/views/contract/CodeTab.vue'
import InteractTab from '@/views/contract/InteractTab.vue'
import ViewsTab from '@/views/contract/ViewsTab/ViewsTab.vue'
import StorageTab from '@/views/contract/StorageTab.vue'
import ContractTokensTab from '@/views/contract/TokensTab/TokensTab.vue'
import MetadataTab from '@/views/contract/MetadataTab/MetadataTab.vue'
import ForkTab from '@/views/contract/ForkTab.vue'
import EventsTab from '@/views/contract/EventsTab/EventsTab.vue'
import TicketTab from '@/views/contract/TicketTab/TicketTab.vue'

import OperationGroup from '@/views/opg/OperationGroup.vue'
import OpgContents from '@/views/opg/ContentsTab.vue'

import BigMap from '@/views/big_map/BigMap.vue'
import BigMapKeys from '@/views/big_map/KeysTab.vue'
import BigMapHistory from '@/views/big_map/HistoryTab.vue'

import NotFound from "../views/errors/NotFound";
import DetailsTab from "../views/contract/DetailsTab/DetailsTab";
import ConstantTab from "@/views/constant/ConstantTab";
import Constant from "@/views/constant/Constant";
import ContractStatsTab from "@/views/contract/StatsTab.vue";

import {checkAddress, isKT1Address} from '@/utils/tz.js'

Vue.use(VueRouter)

function validateNetwork(networks) {
  return function(to, _from, next) {
    if (networks.indexOf(to.params.network) == -1)
      next('/not_found');
    else
      next()
  }
}


function validateAddress(networks) {
  return function(to, _from, next) {
    if (networks.indexOf(to.params.network) == -1 || !checkAddress(to.params.address)) {
      next('/not_found');
    } else {
      next();
    }
  }
}

function validateContractAddress() {
  return function(to, _from, next) {
    if (!isKT1Address(to.params.address)) {
      next('/not_found');
    } else {
      next();
    }
  }
}

export function newRouter(networks) {
  return new VueRouter({
    linkActiveClass: '',
    linkExactActiveClass: '',
    mode: 'history',
    scrollBehavior () {
      window.scrollTo(0,0)
    },
    routes: [
      {
        path: '/',
        components: {
          default: Home
        },
        name: 'home'
      },
      {
        path: '/not_found',
        components: {
          default: NotFound,
        },
        name: 'not_found',
      },
      {
        path: '/search',
        components: {
          default: ExtendedSearch
        },
        name: 'search',
        props: { default: true },
      },
      {
        path: '/dapps*',
        props: { default: true },
        redirect() {
          window.location.href = 'https://tzkt.io/dapps'
        }
      },
      {
        path: '/deploy',
        components: {
          default: Deploy,
        },
        name: 'deploy',
        props: { default: true },
      },
      {
        path: '/constant/:network/:address',
        beforeEnter: validateNetwork(networks),
        components: {
          default: Constant,
        },
        props: { default: true },
        children: [
          {
            path: '',
            name: 'constant',
            component: ConstantTab,
            props: true,
          },
        ]
      },
      {
        path: '/:network',
        beforeEnter: validateNetwork(networks),
        components: {
          default: Network,
        },
        props: { default: false },
        children: [
          {
            path: '',
            name: 'network',
            redirect: 'recently_called',
          },{
            path: 'recently_called',
            name: 'recently_called',
            component: RecentlyCalledTab,
          },{
            path: 'constants',
            name: 'network_constants',
            component: ConstantsTab,
          },{
            path: 'stats',
            name: 'network_stats',
            component: StatsTab,
          },
        ]
      },
      {
        path: '/:network/:address',
        beforeEnter: validateAddress(networks),
        components: {
          default: Contract,
        },
        props: { default: true },
        children: [
          {
            path: '',
            name: 'contract',
            redirect: 'operations'
          },
          {
            path: 'operations',
            name: 'operations',
            component: OperationsTab,
            props: true
          },
          {
            path: 'events',
            name: 'events',
            component: EventsTab,
            props: true
          },
          {
            path: 'ticket_updates',
            name: 'ticket_updates',
            component: TicketTab,
            props: true
          },
          {
            path: 'interact/:entrypoint?',
            name: 'interact',
            component: InteractTab,
            props: true,
            beforeEnter: validateContractAddress(),
          },
          {
            path: 'views/:view?',
            name: 'views',
            component: ViewsTab,
            props: true,
            beforeEnter: validateContractAddress(),
          },
          {
            path: 'storage',
            name: 'storage',
            component: StorageTab,
            props: true,
            beforeEnter: validateContractAddress(),
            children: [
              {
                path: 'big_map/:ptr(\\d+)',
                components: {
                  default: BigMap
                },
                props: { default: true },
                children: [
                  {
                    path: '',
                    name: 'big_map',
                    redirect: 'keys'
                  },
                  {
                    path: 'keys',
                    name: 'big_map_keys',
                    component: BigMapKeys,
                    props: true
                  },
                  {
                    path: ':keyhash',
                    name: 'big_map_history',
                    component: BigMapHistory,
                    props: true
                  }
                ]
              },
            ]
          },
          {
            path: 'code',
            name: 'code',
            component: CodeTab,
            props: true,
            beforeEnter: validateContractAddress(),
          },
          {
            path: 'metadata',
            name: 'metadata',
            component: MetadataTab,
            props: true,
            beforeEnter: validateContractAddress(),
          },
          {
            path: 'fork',
            name: 'fork',
            components: {
              default: ForkTab,
            },
            props: true,
            beforeEnter: validateContractAddress(),
          },
          {
            path: 'tokens',
            name: 'tokens',
            component: ContractTokensTab,
            props: true,
            beforeEnter: validateContractAddress(),
          },
          {
            path: 'stats',
            name: 'contract_stats',
            component: ContractStatsTab,
            props: true,
            beforeEnter: validateContractAddress(),
          },
          {
            path: 'details',
            name: 'details',
            component: DetailsTab,
            props: true,
            beforeEnter: validateContractAddress(),
          },
        ]
      },
      {
        path: '/:network(mainnet|ghostnet|oxfordnet|parisnet|sandboxnet|mondaynet|dailynet|rollupnet)/opg/:hash(o[0-9A-z]{50})',
        alias: '/:network(mainnet|ghostnet|oxfordnet|parisnet|sandboxnet|mondaynet|dailynet|rollupnet)/:hash(o[0-9A-z]{50})',
        components: {
          default: OperationGroup
        },
        props: { default: true },
        children: [
          {
            path: '',
            name: 'operation_group',
            redirect: 'contents'
          },
          {
            path: 'contents',
            name: 'opg_contents',
            component: OpgContents,
            props: true
          }
        ]
      }
    ]
  });
}
import Vue from 'vue'
import Router from 'vue-router'
import VueRouter from 'vue-router'

import Home from '@/views/home/Home.vue'

import ExtendedSearch from '@/views/extended_search/ExtendedSearch.vue'

import Stats from '@/views/stats/Stats.vue'
import NetworkTab from '@/views/stats/NetworkTab.vue'
import TokensTab from '@/views/stats/TokensTab.vue'
import DomainsTab from '@/views/stats/DomainsTab.vue'
import Diff from '@/views/diff/Diff.vue'
import Docs from '@/views/docs/Docs.vue'

import Contract from '@/views/contract/Contract.vue'
import OperationsTab from '@/views/contract/OperationsTab.vue'
import CodeTab from '@/views/contract/CodeTab.vue'
import InteractTab from '@/views/contract/InteractTab.vue'
import StorageTab from '@/views/contract/StorageTab.vue'
import ContractTokensTab from '@/views/contract/TokensTab/TokensTab.vue'
import TransfersTab from '@/views/contract/TransfersTab/TransfersTab.vue'
import MetadataTab from '@/views/contract/MetadataTab/MetadataTab.vue'
import ForkTab from '@/views/contract/ForkTab.vue'

import OperationGroup from '@/views/opg/OperationGroup.vue'
import OpgContents from '@/views/opg/ContentsTab.vue'

import BigMap from '@/views/big_map/BigMap.vue'
import BigMapKeys from '@/views/big_map/KeysTab.vue'
import BigMapHistory from '@/views/big_map/HistoryTab.vue'

import DAppList from '@/views/dapps/List.vue'
import DApp from '@/views/dapps/DApp.vue'
import MainDApp from '@/views/dapps/Main.vue'
import Deploy from "../views/deploy/Deploy";

Vue.use(VueRouter)

const router = new Router({
  linkActiveClass: '',
  linkExactActiveClass: '',
  mode: 'history',
  routes: [
    {
      path: '/',
      components: {
        default: Home
      },
      name: 'home'
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
      path: '/deploy',
      components: {
        default: Deploy
      },
      name: 'deploy',
    },
    {
      path: '/dapps',
      components: {
        default: MainDApp
      },
      props: { default: true },
      children: [
        {
          path: '',
          name: 'dapps',
          redirect: 'list'
        },
        {
          path: 'list',
          components: {
            default: DAppList
          },
          name: 'dapps-list',
          props: { default: true },
        },
        {
          path: ':slug',
          components: {
            default: DApp
          },
          name: 'dapp',
          props: { default: true },
        },
      ]
    },
    {
      path: '/stats/:network',
      components: {
        default: Stats,
      },
      props: { default: true },
      children: [
        {
          path: '',
          name: 'stats',
          redirect: 'stats_general'
        },
        {
          name: 'stats_general',
          path: 'general',
          component: NetworkTab,
          props: true
        },
        {
          path: 'fa12',
          name: 'stats_fa12',
          component: TokensTab,
          props: true
        },
        {
          path: 'fa2',
          name: 'stats_fa20',
          component: TokensTab,
          props: true
        },
        {
          path: 'domains',
          name: 'domains',
          component: DomainsTab,
          props: true
        }
      ]
    },
    {
      path: '/diff',
      components: {
        default: Diff,
      },
      name: 'diff',
      props: { default: true },
    },
    {
      path: '/docs',
      components: {
        default: Docs
      },
      name: 'docs',
      props: { default: true },
    },
    { // backward compatibility
      path: '/:network(main|babylon|zero|carthage)/:address(KT[0-9A-z]{34})',
      children: [
        {
          path: '',
          redirect: to => {
            const { params } = to
            return `/${params.network}net/${params.address}`
          }
        },
        {
          path: 'operations',
          redirect: to => {
            const { params } = to
            return `/${params.network}net/${params.address}/operations`
          }
        },
        {
          path: 'script',
          redirect: to => {
            const { params } = to
            return `/${params.network}net/${params.address}/code`
          }
        },
        {
          path: 'state',
          redirect: to => {
            const { params } = to
            return `/${params.network}net/${params.address}/storage`
          }
        },
      ]
    },
    {
      path: '/:network/:address([0-9A-z]{36})',
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
          path: 'code',
          name: 'code',
          component: CodeTab,
          props: true
        },
        {
          path: 'interact',
          name: 'interact',
          component: InteractTab,
          props: true
        },
        {
          path: 'metadata',
          name: 'metadata',
          component: MetadataTab,
          props: true
        },
        {
          path: 'storage',
          name: 'storage',
          component: StorageTab,
          props: true
        },
        {
          path: 'fork',
          name: 'fork',
          components: {
            default: ForkTab,
          }
        },
        {
          path: 'tokens',
          name: 'tokens',
          component: ContractTokensTab,
          props: true
        },
        {
          path: 'transfers',
          name: 'transfers',
          component: TransfersTab,
          props: true
        },
      ]
    },
    {
      path: '/:network/big_map/:ptr(\\d+)',
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
    {
      path: '/:network/opg/:hash(o[0-9A-z]{50})',
      alias: '/:network(main|babylon|zero|carthage)/:hash(o[0-9A-z]{50})',
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

export default router;

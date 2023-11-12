# Better Call Dev
[![Made With: Vue.js](https://img.shields.io/badge/vue-2.6.10-green.svg?)](https://vuejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

BCD is:
* Google for Tezos contracts 
* The frontend for https://github.com/baking-bad/bcdhub
* The successor of https://github.com/baking-bad/better-call-dev

## Versioning
BCD uses the same `X.Y.Z` scheme as BCDHub (see https://github.com/baking-bad/bcdhub#versioning)

## Configuration

* `NODE_ENV` _production_ for production env, _development_ otherwise
* `BASE_URL` set to _https://better-call.dev/_ for production
* `VITE_API_URI` set to _https://api.better-call.dev/_ for production
* `VITE_IPFS_NODE` link to IPFS node
* `VITE_SEARCH_SERVICE_URI` link to search service
* `VITE_TOKEN_METADATA_API` link to metadata service which contains indexed token metadata
* `VITE_METADATA_API_URI` link to metadata service which contains indexed contract metadata
* `VITE_MAINNET_STATS_API_URI` link to mainnet statistics service
* `VITE_TESTNET_STATS_API_URI` link to current testnet statistics service
* `VITE_GHOSTNET_STATS_API_URI` link to ghostnet statistics service

## Run locally
```
npm i
npm run serve
```

## Build for production
```
npm i
npm run build
```

## Publications
* Evolution of the Better Call Dev explorer  
https://baking-bad.org/blog/2020/03/10/explorer-bcd2-tezos-smart-contracts-hub/
* An overview of the renewed Tezos contract explorer  
https://baking-bad.org/blog/2020/04/10/tezos-smart-contract-explorer-better-call-dev-what-is-new/
* Better Call Dev strikes again!  
https://baking-bad.org/blog/2020/06/10/better-call-dev-strikes-again/

## Contact us
* Telegram: https://t.me/baking_bad_chat
* Twitter: https://twitter.com/TezosBakingBad
* Slack: https://tezos-dev.slack.com/archives/CV5NX7F2L
* Discord: https://discord.gg/aG8XKuwsQd

## Other
node-ipc is overriden in the package.json, because it contains malicious code.
Read more: https://www.lunasec.io/docs/blog/node-ipc-protestware/

## About
Project is supported by [Tezos Foundation](https://tezos.foundation/)

const axios = require('axios').default;
const maxSize = 10;

import { getCancellable, postCancellable, cancelRequests } from '@/utils/cancellation.js';

export class RequestFailedError extends Error {
  constructor(response) {
    super(response);
    this.code = response.status;
    if (typeof response !== 'string') {
        this.message = response.statusText;
    }
  }
}

export class BetterCallApi {
  constructor(baseURL) {
    this.api = axios.create({
      baseURL: baseURL,
      timeout: 30000,
      responseType: 'json'
    });
  }

  returnResponseData(res) {
      if (res.status !== 200) {
          throw new RequestFailedError(res);
      }
      return res.data
  }

  getConfig() {
    return getCancellable(this.api, `/config`, {})
      .then((res) => {
        if (!res) { return res; }
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  search(text, indices = [], offset = 0, networks = [], time = {}, group = 0) {
    let params = {
      q: text
    }
    if (offset > 0) {
      params.o = offset
    }
    if (indices.length > 0) {
      params.i = indices.join(',')
    }
    if (networks.length > 0) {
      params.n = networks.join(',')
    }
    if (group >= 0) {  // maybe remove group parameter?
      params.g = 1
    }
    params = Object.assign(params, time)
    return this.api.get(`/search`, {
      params: params
    })
      .then((res) => {
        if (res.status !== 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getHead() {
    return getCancellable(this.api, `/head`, {})
    .then((res) => {
      if (!res) { return res; }
      if (res.status != 200) {
        throw new RequestFailedError(res);
      }
      return res.data
    })
  }

  getContract(network, address) {
    let params = {};
    return getCancellable(this.api, `/contract/${network}/${address}`, params)
      .then((res) => {
        if (!res) { return res; }
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }


  getSameContracts(network, address, offset = 0) {
    let params = {}
    if (offset > 0) params.offset = offset;
    return getCancellable(this.api, `/contract/${network}/${address}/same`, {
      params: params
    })
      .then((res) => {
        if (!res) { return res; }
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getSimilarContracts(network, address, offset = 0) {
    let params = {}
    if (offset > 0) params.offset = offset;
    return getCancellable(this.api, `/contract/${network}/${address}/similar`, {
      params: params
    })
      .then((res) => {
        if (!res) { return res; }
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getContractOperations(network, address, last_id = "", from = 0, to = 0, statuses = [], entrypoints = [], with_storage_diff = true) {
    let params = {}
    if (last_id != "") {
      params.last_id = last_id
    }
    if (from !== 0) {
      params.from = from
    }
    if (to !== 0) {
      params.to = to
    }
    if (statuses.length > 0 && statuses.length < 4) {
      params.status = statuses.join(',')
    }
    if (entrypoints.length > 0) {
      params.entrypoints = entrypoints.join(',')
    }
    params.with_storage_diff = with_storage_diff

    return getCancellable(this.api, `/contract/${network}/${address}/operations`, {
      params: params,
    })
      .then((res) => {
        if (!res) { return res; }
        if (res.status !== 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getAccountInfo(network, address) {
    return getCancellable(this.api, `/account/${network}/${address}`, {})
      .then((res) => {
        if (!res) {
          return null;
        }
        if (res.status !== 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getAccountTokenBalances(network, address, offset=0, size=maxSize) {
    return getCancellable(this.api, `/account/${network}/${address}/token_balances`, {
      params: {offset, size}
    })
      .then((res) => {
        if (!res) {
          return null;
        }
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getAccountMetadata(network, address) {
    return getCancellable(this.api, `/account/${network}/${address}/metadata`, {})
      .then((res) => {
          if (!res || res.status == 204) {
              return null;
          }
          if (res.status != 200) {
              throw new RequestFailedError(res);
          }
          return res.data
      })
  }

  getAccountTransfers(network, address, token_id = -1, contracts = [], size = maxSize, last_id = '') {
    let params = {};
    if (token_id > -1) {
      params['token_id'] = token_id
    }
    if (size > 0) {
      params['size'] = size
    }
    if (last_id > '') {
      params['last_id'] = last_id
    }
    if (contracts && contracts.length > 0) {
      params['contracts'] = contracts.join(',')
    }
    return getCancellable(this.api, `/tokens/${network}/transfers/${address}`, {
      params: params
    })
      .then((res) => {
        if (!res) { return res; }
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getContractCode(network, address, protocol = "", level = 0) {
    let params = {}
    if (protocol !== "") {
      params.protocol = protocol;
    }
    if (level > 0) {
      params.level = level;
    }
    return getCancellable(this.api, `/contract/${network}/${address}/code`, {
      params: params
    })
      .then((res) => {
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getContractMigrations(network, address) {
    return getCancellable(this.api, `/contract/${network}/${address}/migrations`, {})
      .then((res) => {
        if (!res) { return res; }
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getContractToken(network, address, token_id) {
      return getCancellable(this.api, `/contract/${network}/${address}/tokens`, {
          params: { token_id }
      })
          .then((res) => {
              if (!res) { return res; }
              if (res.status != 200) {
                  throw new RequestFailedError(res);
              }
              return res.data
          })
  }

  getContractTokens(network, address, offset=0, size=maxSize) {
    return getCancellable(this.api, `/contract/${network}/${address}/tokens`, {
      params: { offset, size }
    })
      .then((res) => {
        if (!res) { return res; }
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getContractTokensCount(network, address) {
    return getCancellable(this.api, `/contract/${network}/${address}/tokens/count`, {})
      .then((res) => {
        if (!res) { return res; }
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getContractTransfers(network, address, token_id = -1, size = maxSize, offset = 0) {
    let params = {};
    if (token_id > -1) {
      params['token_id'] = token_id
    }
    if (size > 0) {
      params['size'] = size
    }
    if (offset > 0) {
      params['offset'] = offset
    }
    return getCancellable(this.api, `/contract/${network}/${address}/transfers`, {
      params: params
    })
      .then((res) => {
        if (!res) { return res; }
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getContractEntrypoints(network, address) {
    return getCancellable(this.api, `/contract/${network}/${address}/entrypoints`, {})
      .then((res) => {
        if (!res) { return res; }
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getContractEntrypointData(network, address, name, data, format = '') {
    return postCancellable(this.api, `/contract/${network}/${address}/entrypoints/data`, {
      name: name,
      data: data,
      format: format
    })
      .then((res) => {
        if (!res) { return res; }
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.request.response;
      })
  }

  getContractEntrypointTrace(network, address, name, data, source = null, amount = null) {
    var body = {
      name: name,
      data: data
    }
    if (source) {
      body.source = source;
    }
    if (amount) {
      body.amount = parseInt(amount);
    }
    let method = source ? "run_operation" : "trace";

    return postCancellable(this.api, `/contract/${network}/${address}/entrypoints/${method}`, body)
      .then((res) => {
        if (!res) { return res; }
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getContractEntrypointSchema(network, address, entrypoint, fill_type = 'empty') {
    return this.api.get(`/contract/${network}/${address}/entrypoints/schema?fill_type=${fill_type}&entrypoint=${entrypoint}`)
      .then((res) => {
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getContractStorage(network, address, level = null) {
    let params = '?';
    if (level) {
      params += `level=${level}`
    }
    return getCancellable(this.api, `/contract/${network}/${address}/storage${params}`, {})
      .then((res) => {
        if (!res) { return res; }
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getContractStorageRaw(network, address, level = null) {
    let params = '?';
    if (level) {
      params += `level=${level}`
    }
    return this.api.get(`/contract/${network}/${address}/storage/raw${params}`)
      .then((res) => {
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getContractStorageRich(network, address, level = null) {
    let params = '?';
    if (level) {
      params += `level=${level}`
    }
    return this.api.get(`/contract/${network}/${address}/storage/rich${params}`)
      .then((res) => {
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getContractStorageSchema(network, address, fill_type = 'empty') {
    return this.api.get(`/contract/${network}/${address}/storage/schema?fill_type=${fill_type}`)
      .then((res) => {
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  prepareToFork(data) {
    return postCancellable(this.api, `/fork`, data)
      .then((res) => {
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getContractMempool(network, address) {
    return getCancellable(this.api, `/contract/${network}/${address}/mempool`, {})
      .then((res) => {
        if (!res) { return res; }
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getContractBigMap(network, ptr) {
    return getCancellable(this.api, `/bigmap/${network}/${ptr}`, {})
      .then((res) => {
        if (!res) { return res; }
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getContractBigMapDiffsCount(network, ptr) {
    return getCancellable(this.api, `/bigmap/${network}/${ptr}/count`, {})
      .then((res) => {
        if (!res) { return res; }
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getContractBigMapKeys(network, ptr, q = '', offset = 0) {
    return getCancellable(this.api, `/bigmap/${network}/${ptr}/keys?q=${q}&offset=${offset}`, {})
      .then((res) => {
        if (!res) { return res; }
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getContractBigMapActions(network, ptr) {
    return getCancellable(this.api, `/bigmap/${network}/${ptr}/history`, {})
      .then((res) => {
        if (!res) { return res; }
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getContractBigMapHistory(network, ptr, keyhash, offset = 0) {
    return getCancellable(this.api, `/bigmap/${network}/${ptr}/keys/${keyhash}?offset=${offset}`, {})
      .then((res) => {
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getRandomContract(network) {
    cancelRequests();
    const request_url = network ? `/pick_random?network=${network}` : `/pick_random`;
    return getCancellable(this.api, request_url, {})
      .then((res) => {
        if (res.status !== 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getContractsStats(network, addresses, period) {
    return getCancellable(this.api, `/stats/${network}/contracts?period=${period}&contracts=${addresses.join(',')}`, {})
      .then((res) => {
        if (!res) { return res; }
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getTokensByVersion(network, version, offset = 0, size = 0) {
    let params = {}
    if (size > 0) {
      params['size'] = size
    }
    if (offset > 0) {
      params['offset'] = offset
    }
    return getCancellable(this.api, `/tokens/${network}/version/${version}`, { params: params })
      .then((res) => {
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getDiff(query) {
    return this.api.post(`/diff`, query)
      .then((res) => {
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getProjects() {
    return getCancellable(this.api, `/projects`, {})
      .then((res) => {
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getOPG(hash) {
    return getCancellable(this.api, `/opg/${hash}?with_mempool=true`, {})
      .then((res) => {
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getStats() {
    return getCancellable(this.api, `/stats`, {})
      .then((res) => {
        if (!res) { return res; }
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getNetworkStats(network) {
    return getCancellable(this.api, `/stats/${network}`, {})
      .then((res) => {
        if (!res) { return res; }
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getNetworkStatsSeries(network, index, period, addresses = []) {
    let params = [];
    if (addresses && addresses.length) {
      params.push(`address=${addresses.join(',')}`)
    }
    if (period) {
      params.push(`period=${period}`)
    }
    if (index) {
      params.push(`name=${index}`)
    }
    return getCancellable(this.api, `/stats/${network}/series?${params.join('&')}`, {})
      .then((res) => {
        if (!res) { return res; }
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getErrorLocation(operationId) {
    return getCancellable(this.api, `/operation/${operationId}/error_location`, {})
      .then((res) => {
        if (!res) { return res; }
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getContractBySlug(slug) {
    return getCancellable(this.api, `/slug/${slug}`, {})
      .then((res) => {
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getDApps() {
    return getCancellable(this.api, `/dapps`, {})
      .then((res) => {
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getDApp(slug) {
    return getCancellable(this.api, `/dapps/${slug}`, {})
      .then((res) => {
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  listDomains(network, offset = 0, size = maxSize) {
    let params = {}
    if (size > 0) {
      params['size'] = size
    }
    if (offset > 0) {
      params['offset'] = offset
    }
    return getCancellable(this.api, `/domains/${network}`, {
      params: params
    })
      .then((res) => {
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  resolveDomain(network, address) {
    return getCancellable(this.api, `/domains/${network}/resolve?address=${address}`, {})
      .then((res) => {
        if (res.status == 204) {
          return {}
        }
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getTokenVolumeSeries(network, period, contract, token_id, slug = '') {
    let params = [];
    params.push(`contract=${contract}`)

    params.push(`period=${period}`)

    params.push(`token_id=${token_id}`)

    if (slug !== '') {
      params.push(`slug=${slug}`)
    }

    return getCancellable(this.api, `/tokens/${network}/series?${params.join('&')}`, {})
      .then((res) => {
        if (!res) { return res; }
        if (res.status != 200) {
          throw new RequestFailedError(res);
        }
        return res.data
      })
  }

  getMetadataViewsSchema(network, address) {
      return this.api.get(`/contract/${network}/${address}/views/schema`)
          .then((res) => {
             if (res.status !== 200) {
                 throw new RequestFailedError(res);
             }
             return res.data;
          });
  }

  executeMetadataView(network, address, data) {
      return this.api.post(`/contract/${network}/${address}/views/execute`, data)
          .then((res) => {
              if (res.status !== 200) {
                  throw new RequestFailedError(res);
              }
              return res.data;
          });
  }

  getTokenHoldersList(network, address, token_id) {
    return this.api.get(`/contract/${network}/${address}/tokens/holders?token_id=${token_id}`)
        .then(this.returnResponseData);
  }
}

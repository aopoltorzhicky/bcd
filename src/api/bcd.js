import axios from "axios";
import { getCancellable, postCancellable } from '@/utils/cancellation.js';

const maxSize = 10;

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
                if (!res) {
                    return res;
                }
                if (res.status != 200) {
                    throw new RequestFailedError(res);
                }
                return res.data
            })
    }

    getHead() {
        return getCancellable(this.api, `/head`, {})
            .then((res) => {
                if (!res) {
                    return res;
                }
                if (res.status != 200) {
                    throw new RequestFailedError(res);
                }
                return res.data
            })
    }

    getContract(network, address, stats = true) {
        let params = {
            stats: stats,
        };
        return getCancellable(this.api, `/contract/${network}/${address}`, {
            params: params
        })
            .then((res) => {
                if (!res) {
                    return res;
                }
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
                if (!res) {
                    return res;
                }
                if (res.status != 200) {
                    throw new RequestFailedError(res);
                }
                return res.data
            })
    }

  getAccountOperationGroups(network, address, last_id = 0, size = 10) {
    let params = {}
    if (last_id > 0) {
      params['last_id'] = last_id
    }
    if (size !== 0) {
      params['size'] = size
    }
    return getCancellable(this.api, `/contract/${network}/${address}/opg`, {
      params: params,
    })
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
                if (!res) {
                    return res;
                }
                if (res.status != 200) {
                    throw new RequestFailedError(res);
                }
                return res.data
            })
    }

    getContractTokens(network, address, offset = 0, size = maxSize) {
        return getCancellable(this.api, `/contract/${network}/${address}/tokens`, {
            params: {offset, size}
        })
            .then((res) => {
                if (!res) {
                    return res;
                }
                if (res.status != 200) {
                    throw new RequestFailedError(res);
                }
                return res.data
            })
    }

    getContractEntrypoints(network, address) {
        return getCancellable(this.api, `/contract/${network}/${address}/entrypoints`, {})
            .then((res) => {
                if (!res) {
                    return res;
                }
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
                if (!res) {
                    return res;
                }
                if (res.status != 200) {
                    throw new RequestFailedError(res);
                }
                return res.request.response;
            })
    }

    getContractEntrypointTrace(network, address, name, data, source = null, sender = null, amount = null) {
        var body = {
            name: name,
            data: data
        }
        if (source) {
            body.source = source;
        }
        if (sender) {
            body.sender = sender;
        }
        if (amount) {
            body.amount = parseInt(amount);
        }
        let method = "trace";
        if (source && sender === '') {
            method = 'run_operation';
        }

        return postCancellable(this.api, `/contract/${network}/${address}/entrypoints/${method}`, body)
            .then((res) => {
                if (!res) {
                    return res;
                }
                if (res.status != 200) {
                    throw new RequestFailedError(res);
                }
                return res.data
            })
    }

    getContractEntrypointSchema(network, address, entrypoint, fill_type = 'empty', hash = undefined, counter = undefined) {
        let params = {}
        if (fill_type) {
        params['fill_type'] = fill_type;
        }
        if (entrypoint) {
        params['entrypoint'] = entrypoint;
        }
        if (hash) {
        params['hash'] = hash;
        }
        if (counter) {
        params['counter'] = counter;
        }
        return this.api.get(`/contract/${network}/${address}/entrypoints/schema`, {
        params: params,
        })
        .then((res) => {
            if (res.status !== 200) {
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
                if (!res) {
                    return res;
                }
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
                if (!res) {
                    return res;
                }
                if (res.status != 200) {
                    throw new RequestFailedError(res);
                }
                return res.data
            })
    }

    getContractBigMap(network, ptr) {
        return getCancellable(this.api, `/bigmap/${network}/${ptr}`, {})
            .then((res) => {
                if (!res) {
                    return res;
                }
                if (res.status != 200) {
                    throw new RequestFailedError(res);
                }
                return res.data
            })
    }

    getRecentlyCalledContracts(network, size, offset) {
        return getCancellable(this.api, `/stats/${network}/recently_called_contracts?size=${size}&offset=${offset}`, {})
            .then((res) => {
                if (!res) {
                    return res;
                }
                if (res.status !== 200) {
                    throw new RequestFailedError(res);
                }
                return res.data
            });
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

    getBigMapKeyState(network, ptr, key_hash) {
        return getCancellable(this.api, `/bigmap/${network}/${ptr}/keys/${key_hash}/state`, {})
        .then((res) => {
            if (!res) { return res; }
            if (res.status != 200) {
            throw new RequestFailedError(res);
            }
            return res.data
        })
    }

    getBigMapKeys(network, ptr, limit = 10, offset = 0) {
        let params = {
            limit: 10
        }
        if (offset) {
            params['offset'] = offset;
        }
        if (limit > 0 && limit < 10) {
            params['limit'] = limit;
        }
        return getCancellable(this.api, `/bigmap/${network}/${ptr}/keys`, {params: params})
            .then((res) => {
                if (!res) {
                    return res;
                }
                if (res.status != 200) {
                    throw new RequestFailedError(res);
                }
                return res.data
            })
    }

    getContractBigMapActions(network, ptr) {
        return getCancellable(this.api, `/bigmap/${network}/${ptr}/history`, {})
            .then((res) => {
                if (!res) {
                    return res;
                }
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

    getSmartRollupInfo(network, address) {
        return getCancellable(this.api, `/smart_rollups/${network}/${address}`, {})
            .then((res) => {
                if (!res) {
                    return res;
                }
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

    getOPG(hash, with_mempool=true, with_storage_diff=false, network=undefined) {
        let params = {}
        if (with_mempool) {
        params.with_mempool = with_mempool;
        }
        if (with_storage_diff) {
        params.with_storage_diff = with_storage_diff;
        }
        return getCancellable(this.api, `/opg/${network}/${hash}`, {
        params: params,
        })
        .then((res) => {
            if (res.status != 200) {
            throw new RequestFailedError(res);
            }
            return res.data
        })
    }

    getImplicitOperation(network, counter) {
        return getCancellable(this.api, `/implicit/${network}/${counter}`, {})
        .then((res) => {
            if (res.status != 200) {
            throw new RequestFailedError(res);
            }
            return res.data
        })
    }

    getOperationDiff(network, id) {
        return getCancellable(this.api, `/operation/${network}/${id}/diff`, {})
            .then((res) => {
                if (res.status != 200) {
                    throw new RequestFailedError(res);
                }
                return res.data
            })
    }

    getOperationsByHashAndCounter(hash, counter, network=null) {
        return getCancellable(this.api, `/opg/${network}/${hash}/${counter}`, {})
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
                if (!res) {
                    return res;
                }
                if (res.status != 200) {
                    throw new RequestFailedError(res);
                }
                return res.data
            })
    }

    getNetworkStats(network) {
        return getCancellable(this.api, `/stats/${network}`, {})
            .then((res) => {
                if (!res) {
                    return res;
                }
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
        const slug = `/stats/${network}/series?${params.join('&')}`;
        return getCancellable(this.api, slug, {})
            .then((res) => {
                if (!res) {
                    return res;
                }
                if (res.status != 200) {
                    throw new RequestFailedError(res);
                }
                return res.data
            })
    }

    getErrorLocation(network, operationId) {
        return getCancellable(this.api, `/operation/${network}/${operationId}/error_location`, {})
            .then((res) => {
                if (!res) { return res; }
                if (res.status != 200) {
                    throw new RequestFailedError(res);
                }
                return res.data
            })
    }

    getMetadataViewsSchema(network, address, kind = null) {
        let params = {}
        if (kind) {
            params.kind = kind;
        }
        return this.api.get(`/contract/${network}/${address}/views/schema`, {
            params: params,
        })
            .then((res) => {
                if (res.status !== 200) {
                    throw new RequestFailedError(res);
                }
                return res.data;
            });
    }


    getOffchainViewSchema(view) {
        return this.api.post(`/off_chain_view`, view)
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

    getCodeFromMichelson(data) {
        return this.api.post(`/michelson`, data)
            .then((res) => {
                if (res.status !== 200) {
                    throw new RequestFailedError(res);
                }
                return res.data;
            });
    }

    getGlobalConstants(network, offset, size = 7) {
        let params = {}
        if (size > 0) {
            params['size'] = size
        }
        if (offset > 0) {
            params['offset'] = offset
        }
        return this.api.get(`/global_constants/${network}`, {params})
            .then(this.returnResponseData);
    }


    getConstantsByAddress(network, address, offset, size = 10) {
        let params = {
            size
        }

        if (offset > 0) {
            params['offset'] = offset
        }

        return this.api.get(`/global_constants/${network}/${address}/contracts`, {params})
            .then(this.returnResponseData);
    }

    getConstant(network, address) {
        return this.api.get(`/global_constants/${network}/${address}`)
            .then(this.returnResponseData);
    }

    getConstantsByContract(network, address, offset, size = 7) {
        let params = {
            size
        }

        if (offset > 0) {
            params['offset'] = offset
        }

        return this.api.get(`/contract/${network}/${address}/global_constants`, {params})
            .then(this.returnResponseData);
    }

    listEvents(network, address, offset, size = 10) {
        let params = {
            size
        }

        if (offset > 0) {
            params['offset'] = offset
        }

        return this.api.get(`/contract/${network}/${address}/events`, {params})
            .then(this.returnResponseData);
    }

    findContractByTag(network, tags) {
        let params = {
            tags
        }

        return this.api.get(`/helpers/contracts/${network}`, {params})
            .then(this.returnResponseData);
    }

    approveSchema() {
        return this.api.get(`/helpers/approve/schema`, {})
            .then(this.returnResponseData);
    }

    approveData(data = {}) {
        return this.api.post(`/helpers/approve/data`, data)
            .then(this.returnResponseData);
    }

    listTicketUpdates(network, address, offset, size=10) {
        let params = {
            size
        }

        if (offset > 0) {
            params['offset'] = offset
        }

        return this.api.get(`/contract/${network}/${address}/ticket_updates`, {params})
            .then(this.returnResponseData);
    }

    getTickectUpdatesByOperation(network, operationId) {
        return getCancellable(this.api, `/operation/${network}/${operationId}/ticket_updates`, {})
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
}

import axios from "axios";

export class RequestFailedError extends Error { }

export class StatsAPI {
    constructor(endpoints) {
        this.api = {};

        Object.keys(endpoints).filter(x => endpoints[x]).forEach(function (network) {
            this.api[network] = axios.create({
                baseURL: endpoints[network],
                timeout: 10000,
                responseType: 'json'
            });
        }, this);
    }

    getApi(network) {
      if (network in this.api) {
        return this.api[network];
      } else {
        throw new RequestFailedError(`Don't have an RPC endpoint for the "${network}"`);
      }
    }

    hasApi(network) {
        return network in this.api;
    }

    parseResponse(response) {
        if (response.status !== 200) {
            throw new RequestFailedError(response);
        }
        return response.data;
    }

    summary(network, table, method, args = {}) {
        return this.getApi(network).get(`/v1/summary/${table}/${method}`, {
            params: args
        }).then(this.parseResponse)
    }

    histogram(network, table, method, timeframe, args = {}) {
        return this.getApi(network).get(`/v1/histogram/${table}/${method}/${timeframe}`, {
            params: args
        }).then(this.parseResponse)
    }

    usersAndCalls(network, timeframe, params = {}) {
        return this.getApi(network).post(`/v1/users_and_calls_count/${timeframe}`, params).then(this.parseResponse)
    }
}
import Vue from 'vue';
import dayjs from "dayjs";

const ON_CHAIN_STATUSES = ["applied", "failed", "skipped", "backtracked"];

export const state = () => ({
  operations: [],
  entrypoints: [],
  availableEntrypoints: [],
  mempool: [],
  dates: [],
  downloaded: false,
  last_id: null,
  mempoolLoading: false,
  network: '',
  address: '',
});

export const getters = {
  timestamps(state) {
    let timestamps = state.dates.map((d) => dayjs(d).unix() * 1000).sort();
    if (timestamps.length === 2) {
      return [timestamps[0], timestamps[1] + 86400000];
    } else if (timestamps.length === 1) {
      return [timestamps[0], timestamps[0] + 86400000];
    } else {
      return [0, 0];
    }
  }
};

export const mutations = {
  mutate(state, { key, value }) {
    state[key] = value;
  },
  mutateReactive(state, { key, value }) {
    Vue.set(state, key, value);
  },
  pushOperations(state, data) {
    data.forEach((element) => {
      if (element.internal) {
        const lastEl = state.operations[this.operations.length - 1];
        lastEl.internal_operations.push(
          element
        );
        Vue.set(state.operations, state.operations.length - 1, lastEl);
      } else {
        element.internal_operations = [];
        state.operations.push(element);
      }
    });
  },
};

export const actions = {
  async initialize({ commit }, obj) {
    Object.entries(obj).forEach(entry => {
      commit('mutate', {
        key: entry[0],
        value: entry[1],
      })
    });
  },
  async fetchOperations({ dispatch, state }) {
    await dispatch('getOperations', { clearData: true, resetFilters: true });
    if (this.config.mempool_enabled) {
      dispatch('getMempool');
    }
    if (state.address.startsWith('KT')) {
      dispatch('getEntrypoints');
    }
  },
  async updateOperations({ dispatch, commit }, { entrypoints, status, dates }) {
    if (entrypoints) {
      commit('mutateReactive', {
        key: 'entrypoints',
        value: entrypoints,
      });
    }
    if (status) {
      commit('mutateReactive', {
        key: 'status',
        value: status,
      });
    }
    if (dates) {
      commit('mutateReactive', {
        key: 'dates',
        value: dates,
      });
    }
    await dispatch('getOperations', { clearData: true, resetFilters: false });
  },
  async getMempool({ state, commit }) {
    if (state.mempoolLoading) return;
    commit('mutate', { key: 'mempoolLoading', value: true });

    try {
      const value = await this.api.getContractMempool(state.network, state.address);
      commit('mutateReactive', {
        key: 'mempool',
        value,
      });
    } catch (err) {
      console.error(err);
    }
    finally {
      commit('mutate', {
        key: 'mempoolLoading',
        value: false,
      });
    }
  },
  async getEntrypoints({ state, commit }) {
    try {
      const availableEntrypoints = await this.api.getContractEntrypoints(state.network, state.address);
      commit('mutateReactive', {
        key: 'availableEntrypoints',
        value: availableEntrypoints.map((x) => x.name),
      })
    } catch (err) {
      console.error('err: ', err);
    }
  },
  async getOperations(
    { commit, state, dispatch, getters },
    { clearData, resetFilters } = { clearData: false, resetFilters: false }
  ) {
    if (state.operationsLoading || (state.downloaded && !clearData)) return;
    commit('mutate', { key: 'operationsLoading', value: true });
    if (clearData) {
      commit('mutateReactive', { key: 'operations', value: [] });
      commit('mutate', { key: 'downloaded', value: false });
      commit('mutate', { key: 'last_id', value: null });
    }
    if (resetFilters) {
      ['status', 'dates', 'datesBuf', 'entrypoints'].forEach(key => {
        commit('mutateReactive', { key, value: [] });
      });
      commit('mutate', { key: 'datesModal', value: false });
    }

    let status = state.status.filter((s) => ON_CHAIN_STATUSES.includes(s));
    if (status.length === 0 && state.status.length > 0) {
      commit('mutate', { key: 'operationsLoading', value: false });
      return;
    }

    const { entrypoints } = state;
    const { timestamps } = getters;
    await this.api
      .getContractOperations(
        state.network,
        state.address,
        state.last_id,
        timestamps[0],
        timestamps[1],
        status,
        entrypoints,
        true
      )
      .then((res) => {
        if (!res) {
          commit('mutate', { key: 'downloaded', value: true });
        } else {
          commit('mutate', { key: 'downloaded', value: res.operations.length === 0 });
          commit('mutateReactive', { key: 'last_id', value: res.last_id });
          commit('pushOperations', { operations: res.operations });
        }
      })
      .catch((err) => {
        dispatch('global/showError', err);
        commit('mutate', { key: 'downloaded', value: true });
      })
      .finally(() => {
        commit('mutate', { key: 'operationsLoading', value: false });
      });
  },
};
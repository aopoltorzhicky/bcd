import Vue from 'vue';
import Vuex from 'vuex';
import modules, { dispatchModulesInit } from './modules';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules,
  state: {
    warning: null,
    error: null,
    success: null,
    isAuthorized: false,
    profile: null,
    subscriptions: []
  },
  mutations: {
    setError(state, value) {
      state.error = value
    },
    setIsAuthorized(state, value) {
      state.isAuthorized = value
    },
    setProfile(state, value) {
      state.profile = value
    },
    setSuccess(state, value) {
      state.success = value;
    },
    setWarning(state, value) {
      state.warning = value;
    },
    setSubscriptions(state, value) {
      state.subscriptions = value;
    }
  },
  actions: {
    showError({ commit }, text) {
      commit('setError', {
        text: text
      })
    },
    hideError({ commit }) {
      commit('setError', null)
    },
    showClipboardWarning({ commit }) {
      commit('setWarning', 'Copied! Text might be truncated due to its size');
    },
    showClipboardOK({ commit }) {
      commit('setSuccess', 'Copied to the clipboard')
    },
    showClipboardFail({ dispatch}) {
      dispatch('showError', 'Failed to save to the clipboard')
    },
    showSuccess({ commit }, value) {
      commit('setSuccess', value)
    },
    hideSuccess({ commit }) {
      commit('setSuccess', null)
    },
    hideWarning({ commit }) {
      commit('setWarning', null)
    },
    setIsAuthorized({ commit }, value) {
      commit('setIsAuthorized', value)
    },
    setProfile({ commit }, value) {
      commit('setProfile', value)
    },
    setSubscriptions({ commit }, value) {
      commit('setSubscriptions', value)
    },
    logout({ commit }) {
      commit('setProfile', null);
      commit('setIsAuthorized', false);
    },
    init({ dispatch }) {
      dispatch('setupTheme');
    },
  },
});

export const init = () => {
  store.dispatch('init')
    .then(() => dispatchModulesInit(store, modules));
};

export default store;
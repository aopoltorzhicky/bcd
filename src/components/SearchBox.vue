<template>
  <v-combobox
    v-model="model"
    :search-input.sync="searchText"
    :items="suggests"
    :loading="isSuggestionsLoading"
    item-text="value"
    @focus="handleSearchBoxFocus"
    @keyup.enter="onEnter(searchText)"
    @mousedown="handleSearchBoxFocus"
    return-object
    placeholder="Search anything"
    autocomplete="off"
    no-filter
    append-icon
    clearable
    hide-selected
    prepend-inner-icon="mdi-magnify"
    filled
    rounded
    background-color="data"
    :autofocus="!inplace"
    :outlined="!inplace"
    :dense="inplace"
    :menu-props="menuProps"
    @blur="handleSearchBoxBlur"
    :class="searchBoxClassName"
  >
    <template v-slot:progress>
      <v-progress-circular
          class="searchbox-custom-progress-circular"
          indeterminate
          color="var(--v-primary-base)"
          size="24"
          width="2"
      ></v-progress-circular>
    </template>
    <template v-slot:item="{ item }">
      <v-list-item-avatar>
        <v-icon v-if="item.type === 'contract'">mdi-code-json</v-icon>
        <v-icon v-else-if="item.type === 'operation'"
          >mdi-swap-horizontal</v-icon
        >
        <v-icon v-else-if="item.type === 'bigmapdiff'">mdi-database-edit</v-icon>
        <v-icon v-else-if="item.type === 'token_metadata'"
          >mdi-circle-multiple-outline</v-icon
        >
        <v-icon v-else-if="item.type === 'tzip'"
          >mdi-puzzle-outline</v-icon
        >
        <v-icon v-else-if="item.type === 'recent'">mdi-history</v-icon>
        <v-icon v-else-if="item.type === 'tezos_domain'">mdi-web</v-icon>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title>
          <template v-if="item.type === 'contract'">
            <span class="text--secondary hash">Contracts</span>
            <span class="text--secondary" style="font-size: 20px">&nbsp;→&nbsp;</span>
            <span v-if="item.body.alias">{{ item.body.alias }}</span>
            <span v-else v-html="helpers.shortcut(item.value)"></span>
          </template>
          <template v-else-if="item.type === 'operation'">
            <span class="text--secondary hash">Operations</span>
            <span class="text--secondary" style="font-size: 20px">&nbsp;→&nbsp;</span>
            <template v-if="item.body.destination.startsWith('KT')">
              <span
                v-if="item.body.destination_alias"
                class="text--secondary"
                >{{ item.body.destination_alias }}</span
              >
              <span
                v-else
                v-html="helpers.shortcut(item.body.destination)"
                class="text--secondary"
              ></span>
              <span class="text--secondary" style="font-size: 20px">&nbsp;→&nbsp;</span>
            </template>
            <span v-if="item.body.entrypoint" class="hash"
              >{{ item.body.entrypoint }}()</span
            >
            <span v-else-if="item.body.kind === 'origination'"
              >origination</span
            >
            <span v-else v-html="helpers.shortcut(item.value)"></span>
          </template>
          <template v-else-if="item.type === 'bigmapdiff'">
            <span class="text--secondary hash">Big_map {{ item.body.ptr }}</span>
            <span class="text--secondary" style="font-size: 20px">&nbsp;→&nbsp;</span>
            <span>{{ item.body.key }}</span>
          </template>
          <template v-else-if="item.type === 'tzip'">
            <span class="text--secondary hash">Metadata</span>
            <span class="text--secondary" style="font-size: 20px">&nbsp;→&nbsp;</span>
            <span>{{ item.body.name }}</span>
          </template>
          <template v-else-if="item.type === 'token_metadata'">
            <span class="text--secondary hash">Tokens</span>
            <span class="text--secondary" style="font-size: 20px">&nbsp;→&nbsp;</span>
            <span v-if="item.body.name">{{ item.body.name }}</span>
            <span v-else v-html="helpers.shortcut(item.value)"></span>
          </template>
          <template v-else-if="item.type === 'tezos_domain'">
            <span class="text--secondary hash">Domains</span>
            <span class="text--secondary" style="font-size: 20px">&nbsp;→&nbsp;</span>
            <span class="hash">{{ item.body.name }}</span>
          </template>
          <template v-if="item.type === 'recent'">
            <span v-if="item.body.alias">{{ item.body.alias }}</span>
            <span
              v-else-if="item.body.shortcut"
              v-html="helpers.shortcut(item.body.shortcut)"
            ></span>
            <span v-else>{{ item.value }}</span>
          </template>
        </v-list-item-title>

        <v-list-item-subtitle class="overline" v-if="item.body">
          <span
            v-if="item.body.network"
            :class="item.body.network === 'mainnet' ? 'secondary--text' : ''"
            >{{ item.body.network }}</span
          >
          <span v-if="item.type === 'contract'">&nbsp;|&nbsp;{{
            helpers.plural(item.body.tx_count - 1, "tx")
          }}</span>
          <span v-else-if="item.type === 'operation'">&nbsp;|&nbsp;{{
            item.body.status
          }}</span>
          <span v-else-if="item.type === 'bigmapdiff' && item.group">&nbsp;|&nbsp;{{
            helpers.plural(item.group.count, "update")
          }}</span>
          <span v-else-if="item.type === 'token_metadata' && item.group">&nbsp;|&nbsp;{{
            helpers.plural(item.group.count, "token")
          }}</span>
          <span v-else-if="item.type === 'recent' && item.body.second">&nbsp;|&nbsp;{{
            item.body.second
          }}</span>
          <span class="overline text--primary" v-if="item.body.timestamp">
            &nbsp;|&nbsp;{{ helpers.formatDate(item.body.timestamp) }}
            <span v-if="item.body.last_action"
              >— {{ helpers.formatDate(item.body.last_action) }}</span
            >
          </span>
        </v-list-item-subtitle>
      </v-list-item-content>
      <v-list-item-action>
        <v-list-item-action-text v-if="item.body.found_by">
          <span
            class="body-2"
            v-if="
              ![
                'alias',
                'key_strings',
                'entrypoint',
                'recent',
                'name',
                '',
              ].includes(item.body.found_by) &&
              item.highlights[item.body.found_by]
            "
            v-html="item.highlights[item.body.found_by][0]"
          ></span>
        </v-list-item-action-text>
        <v-list-item-action-text>
          <span class="overline grey--text">{{
            item.body.found_by || ""
          }}</span>
        </v-list-item-action-text>
        <v-btn
          x-small
          text
          color="grey darken-2"
          v-if="item.type === 'recent'"
          @click.stop.prevent="onRemoveClick(item.value)"
        >
          recent
          <v-icon right>mdi-close</v-icon>
        </v-btn>
      </v-list-item-action>
    </template>
  </v-combobox>
</template>

<script>
import { mapActions } from "vuex";
import { checkAddress, checkOperation, checkKeyHash } from "@/utils/tz.js";
import {
  getHistory,
  addHistoryItem,
  removeHistoryItem,
} from "@/utils/history.js";

export default {
  props: {
    inplace: Boolean,
  },
  data: () => ({
    suggests: [],
    isSuggestionsLoading: false,
    model: null,
    searchText: null,
    _locked: false,
    _timerId: null,
    isFocused: false,
    seqno: 0,
    menuProps: {},
  }),
  created() {
    this.suggests = this.getHistoryItems("");
  },
  computed: {
    searchBoxClassName() {
      if (this.isFocused) {
        return 'focused-searchbar';
      }
      return 'unfocused-searchbar';
    }
  },
  methods: {
    ...mapActions(["showError"]),
    handleSearchBoxFocus() {
      this.isFocused = true;
    },
    handleSearchBoxBlur() {
      this.isFocused = false;
      this.menuProps = {};
      this.model = null;
    },
    pushTo(path) {
      if (this.$route.path !== `${path}/operations`) {
        this.$router.push({ path });
      }
      this.$nextTick(() => {
        this.model = null;
      });
    },
    isModelsArrayInclude(value) {
      return [this.model.type, this.model.body.recent_type].includes(value);
    },
    isShouldSentToValue(value) {
      return (
        (
            this.isModelsArrayInclude("contract") ||
            this.isModelsArrayInclude("tezos_domain")
        ) &&
        checkAddress(value)
      );
    },
    onSearch() {
      if (!this.model || !this.model.body) return;
      const value = this.model.value || this.model;
      const network = this.model.body.network;

      addHistoryItem(this.buildHistoryItem(this.model, value || this.searchText));
      if (this.isModelsArrayInclude("operation") && checkOperation(value)) {
        this.pushTo(`/${network}/opg/${value}`);
      } else if (this.isShouldSentToValue(value)) {
        this.pushTo(`/${network}/${value}`);
      } else if (this.isModelsArrayInclude("bigmapdiff") && checkKeyHash(value)) {
        const ptr = this.model.body.ptr;
        this.pushTo(`/${network}/big_map/${ptr}/${value}`);
      } else if (this.isModelsArrayInclude("token_metadata") && checkAddress(value)) {
        this.pushTo(`/${network}/${value}/tokens?token_id=${this.model.body.token_id}`);
      } else if (this.isModelsArrayInclude("tzip") && checkAddress(value)) {
        this.pushTo(`/${network}/${value}/metadata`);
      } else if (this.model.type === "recent") {
        this.$router.push({ name: "search", query: { text: value } });
      }

      this.$emit('search');
    },
    buildHistoryItem(model, value) {
      const network = model.body.network;
      if (typeof value === "object") return value;

      let historyItem = {
        value: value,
        network: network,
        recent_type: model.body.recent_type || model.type,
      };
      if (model && model.body) {
        if (model.body.alias) historyItem.alias = model.body.alias;
        else {
          historyItem.shortcut = value;
        }

        if (model.type === "operation" && model.body.entrypoint) {
          historyItem.second = `Called ${model.body.entrypoint}`;
        }
      }
      return historyItem;
    },
    onEnter(searchText) {
      this.isFocused = true;

      if (searchText !== null && searchText.length > 2) {
        addHistoryItem({
          value: searchText,
        });
        this.$router.push({ name: "search", query: { text: searchText } });
      }
    },
    getHistoryItems(searchText) {
      let result = [];
      let history = getHistory();
      if (history.length == 0) return result;

      if (searchText !== "") {
        history = history.filter((item) => {
          if (item.alias) {
            return item.alias
              .toLowerCase()
              .startsWith(searchText.toLowerCase());
          }
          return item.value.toLowerCase().startsWith(searchText.toLowerCase());
        });
      }
      history.forEach((item) => {
        result.push({
          type: "recent",
          body: item,
          value: item.value,
        });
      });
      return result;
    },
    fetchSearchDebounced(text, seqno) {
      if (!text || text.length < 3) return;

      clearTimeout(this._timerId);

      this._timerId = setTimeout(() => {
        this.isSuggestionsLoading = true;
        this.api
          .search(text)
          .then((res) => {
            if (seqno === this.seqno) {
              this.suggests = this.getHistoryItems(text);
              if (res && res.items) {
                this.suggests.push(...res.items);
              }
            }
          })
          .catch((err) => {
            console.log(err);
            this.showError(err);
          })
          .finally(() => {
            this.isSuggestionsLoading = false;
          });
      }, 100);
    },
    onRemoveClick(text) {
      removeHistoryItem(text);
      this.suggests = this.getHistoryItems("");
    },
  },
  watch: {
    searchText(val, oldVal) {
      if (val !== oldVal) {
        this.suggests = [];
      }
      if (this._locked) return;
      this.menuProps = {};
      this.onSearch();
      this._locked = true;
      this.searchText = val ? val.trim() : "";
      if (this.searchText) {
        this.fetchSearchDebounced(this.searchText, ++this.seqno);
      } else {
        this.suggests = [];
        this.model = null;
      }

      this._locked = false;
    },
    model() {
      if (this._locked) return;
      this.onSearch();
    },
    isFocused(val) {
      if (val) {
        this.$emit('focus');
      } else {
        this.$emit('blur');
      }
    },
  },
};
</script>

<style lang="scss">
.v-autocomplete.error--text {
  .v-messages {
    font-size: 13px;
  }
  input {
    color: var(--v-error-base);
  }
}
.v-autocomplete__content {
  width: 358px;
  right: 0;
  .v-list {
    padding: 4px 0;
  }
  .v-list-item__avatar {
    margin: 0;
    margin-right: 16px !important;
  }
  .v-list-item__action {
    margin: 0;
    justify-content: center;

    .v-list-item__action-text {
      max-width: 300px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .v-list-item__content {
    flex-direction: column;

    .v-list-item__title {
      margin-right: auto;
      font-family: "Roboto Mono", monospace;
    }
    .v-list-item__subtitle {
      margin-right: auto;
    }
  }
}
.unfocused-searchbar {
  min-width: auto !important;
  left: auto !important;
}
.searchbox-custom-progress-circular {
  position: absolute;
  align-self: center;
  right: 60px;
}
</style>

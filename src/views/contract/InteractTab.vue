<template>
  <v-container fluid class="pa-8 canvas fill-canvas">
    <v-row no-gutters>
      <v-col cols="3" class="pr-4">
        <h3 class="mb-3 text--secondary outline font-weight-medium">Entrypoints</h3>
        <v-skeleton-loader
          :loading="loading"
          type="list-item, divider, list-item, divider, list-item, divider, list-item, divider, list-item"
        >
          <v-list-item-group
            class="themed-border radius-1"
            active-class="token-card-selected"
            :value="selected"
            mandatory
          >
            <v-list-item @click="selected = i" class="token-card" v-for="(item, i) in entrypoints" :key="'entrypoint-' + i">
              <v-list-item-content>
                <v-list-item-title>
                  <span v-if="item.name">{{ item.name }}</span>
                  <span v-else class="text--disabled">NO NAME</span>
                </v-list-item-title>
              </v-list-item-content>
              <BookmarkButton
                :key="item.name"
                :customClass="'primary--text'"
                :network="network"
                :address="address"
                :entrypoint="item.name"
              />
            </v-list-item>
          </v-list-item-group>
        </v-skeleton-loader>
      </v-col>
      <v-col cols="6" class="px-4">
        <v-skeleton-loader :loading="loading" type="card-heading, image">
          <Schema
            header="Parameters"
            title="Entrypoint:"
            type="parameter"
            v-if="selectedItem"
            v-model="model"
            :schema="addValidatorsToSchema(selectedItem.schema)"
            :name="selectedItem.name"
            :network="network"
            :address="address"
            :alias="alias ? alias : ''"
          />
          <div v-else></div>
        </v-skeleton-loader>
      </v-col>
      <v-col cols="3" class="pl-4">
        <h3 class="mb-3 text--secondary font-weight-medium">Parameters type</h3>
        <v-skeleton-loader
          :loading="loading"
          type="list-item, divider, list-item, divider, list-item, divider, list-item, divider, list-item"
        >
          <v-card flat outlined style="max-width: 500px;">
            <v-navigation-drawer floating permanent style="max-height: 80vh; width: 100%;">
              <div class="pa-3">
                <TypeDef
                  v-if="entrypoints[selected] ? entrypoints[selected].typedef : false"
                  :typedef="entrypoints[selected].typedef"
                  first="parameter"
                />
                <p v-else class="mb-0">
                  No typedef for this entrypoint.
                </p>
              </div>
            </v-navigation-drawer>
          </v-card>
        </v-skeleton-loader>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions } from "vuex";
import { applyStyles } from '@/utils/styles.js';
import { isOperationHash } from '@/utils/tz.js';
import Schema from "@/components/schema/Schema.vue";
import TypeDef from "@/views/contract/TypeDef.vue";
import BookmarkButton from "../../components/Bookmarks/BookmarkButton.vue";

export default {
  name: "InteractTab",
  props: {
    address: String,
    network: String,
    alias: String,
    tags: Array
  },
  components: {
    Schema,
    TypeDef,
    BookmarkButton,
  },
  data: () => ({
    loading: true,
    entrypoints: [],
    selected: -1,
    model: {},
    contract: null,
    hash: undefined,
    counter: undefined
  }),
  computed: {
    isShareable() {
      return navigator.share;
    },
    selectedItem() {
      if (this.selected < 0 || this.entrypoints.length < this.selected) {
        return null;
      }
      if (typeof this.selected === "number") {
        return this.entrypoints[this.selected];
      }
      const entrypointQuery = this.$route.params.entrypoint;
      return this.entrypoints.find(item => item.name === entrypointQuery)
    },
  },
  created() {
    this.hash = this.$route.query.hash;
    this.counter = this.$route.query.counter;

    const entrypoint = this.$route.params.entrypoint || this.$route.query.entrypoint;
    this.api
      .getContract(this.network, this.address)
      .then((contract) => {
        this.contract = contract;
      });
    this.getEntrypoints(entrypoint);

    if (this.$route.query.hash && isOperationHash(this.$route.query.hash) && this.$route.query.counter) {
      this.api.
        getContractEntrypointSchema(
          this.network, 
          this.address, 
          entrypoint, 
          'operation', 
          this.$route.query.hash, 
          this.$route.query.counter)
        .then(res=> {
          let withoutName = res.default_model[entrypoint];
          if (typeof withoutName === 'object' && !Array.isArray(withoutName))
            this.model = withoutName;
          else this.model = res.default_model;
        })
        .catch(err => {
          console.log(err)
        })
    }
  },
  methods: {
    ...mapActions(["showError", "showClipboardOK"]),
    addValidatorsToSchema(schema) {
      const modifiedSchema = Object.assign({}, schema);
      const { properties } = modifiedSchema;
      if (properties) {
        Object.keys(properties).forEach(propertyKey => {
          if (properties[propertyKey].prim === "bytes") {
            properties[propertyKey].pattern = "^[0-9a-fA-F]+$"
            properties[propertyKey]["x-options"] = {
              "messages": {
                "pattern": "String must be HEX"
              }
            };
          }
        });
      }
      return modifiedSchema;
    },
    getEntrypoints(selectedName = undefined) {
      this.loading = true;
      this.api
        .getContractEntrypoints(this.network, this.address)
        .then((res) => {
          if (!res) return;
          this.entrypoints = res.sort(function (a, b) {
            return a.name.localeCompare(b.name);
          });
          this.entrypoints.forEach((e) => applyStyles(e.schema));
          const idx = this.entrypoints.findIndex(
            (element) => element.name === selectedName
          );
          this.selected = Math.max(0, idx);
        })
        .catch((err) => {
          console.log(err);
          this.showError(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
  watch: {
    address: "getEntrypoints",
    selectedItem: function (newValue) {
      if (newValue === null) return;
      if (this.$route.params.entrypoint !== newValue.name) {
        this.$router.replace({
          path: `/${this.network}/${this.address}/interact/${newValue.name}`
        });
      }
      this.model = Object.assign({}, newValue.default_model);
    },
    $route(newVal) {
      const { entrypoint } = newVal.params;
      if (!entrypoint) {
        this.$router.back();
      } else {
        this.selected = this.entrypoints.findIndex((item) => item.name === entrypoint);
      }
    },
  },
};
</script>



<style lang="scss" scoped>
.entrypoint-panel > .v-expansion-panel-header {
  background-color: var(--v-sidebar-base);
}

.v-expansion-panel.entrypoint-selected {
  background-color: var(--v-data-base);
  & > .v-expansion-panel-header {
    background-color: var(--v-data-base);
  }
}
</style>

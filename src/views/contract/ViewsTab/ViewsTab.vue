<template>
  <v-container fluid class="pa-8 canvas fill-canvas">
    <v-row no-gutters>
      <v-col cols="3">
        <h3 class="mb-3 text--secondary font-weight-medium">Views</h3>
        <v-list-item-group
          class="themed-border radius-1"
          active-class="token-card-selected"
          :value="selected"
          mandatory
        >
            <v-list-item @click="selected = i" class="token-card" v-for="(item, i) in views" :key="i">
              <v-list-item-content>
                <v-list-item-title class="d-flex justify-space-between align-center">
                  <span v-if="item.name">{{ item.name }}</span>
                  <span v-else class="text--disabled">NO NAME</span>
                </v-list-item-title>
                <v-list-item-subtitle class="caption">
                  <span v-if="item.description">{{item.description}}</span>
                  <span v-else>No description</span>
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-list-item-action-text>
                    <span class="disabled-gray">{{ item.kind }}</span>
                </v-list-item-action-text>
              </v-list-item-action>
            </v-list-item>
        </v-list-item-group>
      </v-col>
      <v-col cols="6" class="px-8">
        <template v-if="selectedItem">
          <v-card flat outlined>
            <v-card-text class="pa-0 pt-6 data">
              <SchemaHeader
                title="View"
                :is-storage="true"
                :storage-html="selectedItem.name"
                :storage-name="selectedItem.name"
              />
              <SchemaForm
                header="Parameters"
                fallback-text="This implementation doesn't have parameters"
                :schema="selectedItem.schema"
                :show="true"
                :is-deploy="true"
                :is-optional-settings="false"
                @executeClick="callView"
                @modelChange="setModel"
              />
            </v-card-text>
          </v-card>
        </template>
        <v-dialog
          v-model="showSuccess"
          max-width="525"
          persistent
          dark
          @click:outside="showSuccess = false"
          @keydown.esc="showSuccess = false"
        >
          <v-card flat outlined>
            <v-card-title class="sidebar d-flex justify-center pa-4">
              <span class="body-1 font-weight-medium text-uppercase text--secondary">View result</span>
              <v-spacer></v-spacer>
              <v-btn icon small @click="showSuccess = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text class="pa-8">
              <MiguelTreeView :network="network" :miguel="successResponse" />
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-col>
      <v-col cols="3">
        <h3 class="mb-3 text--secondary font-weight-medium">Parameters type</h3>
        <v-card flat outlined style="max-width: 500px;">
          <v-navigation-drawer floating permanent style="max-height: 80vh; width: 100%;">
            <div class="pa-3">
              <TypeDef
                v-if="selectedItem && selectedItem.typedef"
                :typedef="selectedItem.typedef"
                first="parameter"
                class="pt-3 pb-1 px-6"
                style="opacity: 0.8"
              />
              <p v-else class="mb-0">
                No parameters for this view.
              </p>
            </div>
          </v-navigation-drawer>
        </v-card>
      </v-col>
      <TreeNodeDetails
        prim="string"
        :data="fullErrorValue"
        :value="isErrorShown"
        is-error-info
      />
    </v-row>
  </v-container>
</template>

<script>
import { mapActions } from "vuex";
import SchemaHeader from "@/components/schema/schemaComponents/SchemaHeader.vue";
import SchemaForm from "@/components/schema/schemaForm/SchemaForm.vue";
import TreeNodeDetails from "@/components/Dialogs/TreeNodeDetails.vue";
import MiguelTreeView from "@/components/MiguelTreeView.vue";
import TypeDef from "../TypeDef.vue";

export default {
  name: "ViewsTab",
  props: {
    address: String,
    network: String,
    metadata: Object,
    onChainViews: Array,
  },
  components: {
    TypeDef,
    MiguelTreeView,
    TreeNodeDetails,
    SchemaForm,
    SchemaHeader,
  },
  computed: {
    selectedItem() {
      if (this.selected < 0 || this.views.length < this.selected) {
        return null;
      }
      if (typeof this.selected === "number") {
        return this.views[this.selected];
      }
      return null;
    }
  },
  methods: {
    ...mapActions({
      showError: "showError",
    }),
    initViews() {
      this.views = [];
      this.views.push(...this.onChainViews);
      if (this.metadata && this.metadata.metadata && this.metadata.metadata.views && Array.isArray(this.metadata.metadata.views)) {
        this.metadata.metadata.views.forEach(view => {
          this.getViewSchema(view);
        })
      }
    },
    getViewSchema(view) {
      if (view.kind === 'on-chain') return;
      if (view.implementation !== undefined) return;

      this.loadingViewInfo = true;
      this.api.getOffchainViewSchema(view)
        .then(response => {
          if (response) {
            if (view.implementations && view.implementations.length > 0)
              response.view = view.implementations[0];
            this.views.push(response)
          }
        })
        .catch(err => {
          this.showError(err);
        })
        .finally(() => {
          this.loadingViewInfo = false;
        })
    },
    setModel(val) {
      this.model = val;
    },
    callView() {
      this.api
        .executeMetadataView(this.network, this.address, {
          name: this.selectedItem.name,
          implementation: this.selectedItem.implementation,
          data: this.model,
          kind: this.selectedItem.kind,
          view: this.selectedItem.view
        })
        .then((res) => {
          if (!res) return;
          this.showSuccess = true;
          this.successResponse = res;
        })
        .catch((err) => {
          this.isErrorShown = false;
          this.fullErrorValue = {
            name: `${err.response.statusText} — ${err.response.status}`,
            val: err.response.data.message,
            realPrim: 'string',
            label: err.response.data.message,
          };
          this.$nextTick(() => {
            this.isErrorShown = true;
          });
        })
    }
  },
  data() {
    return {
      views: [],
      model: {},
      selected: 0,
      isErrorShown: false,
      successText: '',
      showSuccess: false,
      successResponse: null,
      fullErrorValue: null,
      loadingViewInfo: false
    }
  },
  mounted() {
    this.initViews();
  },
  watch: {
    metadata: {
      deep: true,
      handler: 'initViews'
    },
    onChainViews: {
      deep: true,
      handler: 'initViews'
    }
  }
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

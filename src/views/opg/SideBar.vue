<template>
  <div class="fill-height canvas">
    <v-list-item style="height: 74px;">
      <v-list-item-content two-line>
        <v-list-item-title class="headline">
          <span v-html="helpers.shortcut(hash)"></span>
        </v-list-item-title>
        <v-list-item-subtitle>
          <span
            class="overline"
            :class="network === 'mainnet' ? 'secondary--text' : ''"
          >{{ network }}</span>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-divider></v-divider>
    <div class="d-flex align-center px-4 sidebar" style="height: 48px;">
      <span class="caption font-weight-bold text-uppercase text--secondary">Actions</span>
      <v-spacer></v-spacer>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" icon class="mr-2" @click="showRaw = true">
            <v-icon class="text--secondary">mdi-code-json</v-icon>
          </v-btn>
        </template>
        View raw JSON
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            icon
            class="mr-2"
            @click="() => {
              $clipboard(hash);
              showClipboardOK();
            }"
          >
            <v-icon class="text--secondary">mdi-content-copy</v-icon>
          </v-btn>
        </template>
        Copy OPG hash
      </v-tooltip>
      <ShareLink
        top
        :alias="this.hash"
        :link="opgLink"
        />
    </div>
    <v-divider></v-divider>
    <v-skeleton-loader
      :loading="loading"
      type="list-item-two-line, list-item-two-line, list-item-two-line, list-item-two-line, list-item-two-line"
    >
      <v-expansion-panels flat tile mandatory multiple active-class="opened-panel">
        <v-expansion-panel class="ma-0 bb-1">
          <v-expansion-panel-header color="sidebar" class="pl-4 py-0">
            <span class="caption font-weight-bold text-uppercase text--secondary">Details</span>
          </v-expansion-panel-header>
          <v-expansion-panel-content color="canvas">
            <v-list class="sidebar-list">
              <v-list-item v-if="content" two-line>
                <v-list-item-content>
                  <v-list-item-subtitle class="overline">Date</v-list-item-subtitle>
                  <v-list-item-title class="body-2">
                    <span>{{ helpers.formatDatetime(content.timestamp) }}</span>
                  </v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-list-item-action-text class="overline">Level</v-list-item-action-text>
                  <v-list-item-action-text class="body-2">
                    <span>{{ content.level }}</span>
                  </v-list-item-action-text>
                </v-list-item-action>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-subtitle class="overline">Total cost</v-list-item-subtitle>
                  <v-list-item-title class="body-2">{{ totalCost | uxtz }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel class="ma-0 bb-1">
          <v-expansion-panel-header color="sidebar" class="pl-4 py-0">
            <span class="caption font-weight-bold text-uppercase text--secondary">Call stack</span>
          </v-expansion-panel-header>
          <v-expansion-panel-content color="canvas">
            <div
                class="d-flex flex-column px-4 call-stack-content-wrapper"
            >
              <div
                v-for="(op, idx) in operations"
                :key="idx"
                class="d-flex align-center"
                :class="op.internal ? 'mt-2' : 'mt-4'"
              >
                <span v-if="op.internal" class="mr-2" style="font-size: 18px;">↳</span>
                <div>
                  <span
                    class="text--secondary"
                    v-if="op.destination_alias"
                  >{{ op.destination_alias }}</span>
                  <span class="text--secondary" v-else v-html="helpers.shortcut(op.destination)"></span>
                  <span class="text--secondary" style="font-size: 20px;">→</span>
                  <span v-if="op.entrypoint" class="hash">{{ op.entrypoint }}()</span>
                  <span v-else>{{ op.amount | uxtz }}</span>
                </div>
              </div>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-skeleton-loader>

    <BakingBadFooter />

    <RawJsonViewer
      v-if="content"
      :show.sync="showRaw"
      type="operation"
      :network="network"
      :level="content.level"
      :hash="hash"
      :raw="content.rawMempool"
    />
  </div>
</template>

<script>
import { mapActions } from "vuex";
import RawJsonViewer from "@/components/Dialogs/RawJsonViewer.vue";
import BakingBadFooter from "@/components/BakingBadFooter.vue";
import ShareLink from "../../components/Buttons/ShareLink";

export default {
  name: "SideBar",
  props: {
    network: String,
    hash: String,
    operations: Array,
    loading: Boolean,
  },
  components: {
    ShareLink,
    RawJsonViewer,
    BakingBadFooter,
  },
  data: () => ({
    showRaw: false,
  }),
  computed: {
    content() {
      if (this.operations.length > 0) {
        return this.operations[0];
      }
      return undefined;
    },
    totalCost() {
      return this.operations.reduce(
        (acc, c) => acc + (c.fee || 0) + (c.burned || 0),
        0
      );
    },
    opgLink() {
      var routeData = this.$router.resolve({
        name: "operation_group",
        params: {
          hash: this.hash,
          network: this.network,
        },
      });
      return `${window.location.protocol}//${window.location.host}${routeData.href}`;
    },
  },
  methods: {
    ...mapActions(["showClipboardOK"]),
  },
};
</script>

<style lang="scss" scoped>
.call-stack-content-wrapper {
  max-height: calc(100vh - 344px);
  overflow-y: auto;
}
</style>

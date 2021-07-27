<template>
  <v-container fluid class="px-8 py-4 canvas fill-canvas">
    <OperationsFilters
      :address="address"
      @entrypointsChange="setEntrypoints"
      @statusChange="setStatus"
      @dateChange="setDate"
      @clearFilters="fetchOperations"
    />
    <v-row>
      <v-col>
        <v-skeleton-loader
          :loading="loading"
          type="list-item-two-line, list-item-two-line, list-item-two-line"
        >
          <EmptyState
            v-if="items.length === 0"
            icon="mdi-code-brackets"
            title="Nothing found"
            text="Empty set is also a result, otherwise try a broader query"
          />
          <v-expansion-panels
            v-show="items.length !== 0"
            multiple
            hover
            flat
            class="bb-1"
          >
            <ContentItem
              :data="item"
              :address="address"
              v-for="(item, key) in items"
              :key="item.hash + '_' + item.counter + '_' + key"
            />
          </v-expansion-panels>
          <span
            v-intersect="onDownloadPage"
            v-if="!loading && !downloaded"
          ></span>
        </v-skeleton-loader>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions } from "vuex";
import ContentItem from "@/views/contract/ContentItem.vue";
import EmptyState from "@/components/Cards/EmptyState.vue";
import dayjs from "dayjs";
import OperationsFilters from "./OperationsFilters";

export default {
  name: "OperationsTab",
  props: {
    address: String,
    network: String,
  },
  components: {
    OperationsFilters,
    ContentItem,
    EmptyState,
  },
  data: () => ({
    operations: [],
    mempool: [],
    downloaded: false,
    operationsLoading: false,
    mempoolLoading: false,
    last_id: null,
    status: [],
    dates: [],
    datesBuf: [],
    datesModal: false,
    entrypoints: [],
    operationsChannelName: null,
  }),
  async created() {
    await this.initialize({
      network: this.network,
      address: this.address,
    });
    await this.fetchOperations();
  },
  computed: {
    loading() {
      return this.items.length === 0 && (this.operationsLoading || this.mempoolLoading);
    },
    items() {
      let operations = [];
      if (this.operations.length === 0) {
        return [];
      }
      if (this.last_id !== null) operations = this.operations;
      if (this.config.mempool_enabled) {
        let mempoolOperations = this.getDisplayedMempool();
        if (mempoolOperations.length > 0) {
          operations = operations
              .concat(mempoolOperations)
              .sort(this.compareOperations);
        }
      }
      return operations;
    },
    dateRangeText() {
      let texts = this.dates.map((d) => dayjs(d).format("MMM DD"));
      if (texts.length === 2) {
        return texts.join(" — ");
      } else if (texts.length === 1) {
        return texts[0];
      } else {
        return "";
      }
    },
  },
  methods: {
    ...mapActions(['showError']),
    ...mapActions('operations', ['initialize', 'fetchOperations']),
    setEntrypoints(entrypoints) {
      this.$set(this, 'entrypoints', entrypoints);
    },
    setStatus(status) {
      this.$set(this, 'status', status);
    },
    setDate(dates) {
      this.$set(this, 'dates', dates);
    },
    compareOperations(a, b) {
      if (a.timestamp < b.timestamp) {
        return 1;
      }
      if (a.timestamp > b.timestamp) {
        return -1;
      }
      return 0;
    },
    getDisplayedMempool() {
      if (!this.mempool || this.mempool.length === 0) return [];
      let mempoolOperations = this.mempool;

      // Apply operation filters
      if (this.status.length > 0) {
        mempoolOperations = mempoolOperations.filter((o) =>
          this.status.includes(o.status)
        );
      }
      if (this.entrypoints.length > 0) {
        mempoolOperations = mempoolOperations.filter((o) =>
          this.entrypoints.includes(o.entrypoint)
        );
      }
      if (this.dates.length > 0) {
        let timestamps = this.getTimestamps();
        mempoolOperations = mempoolOperations.filter(function (op) {
          const ts = dayjs(op.timestamp).unix() * 1000;
          return ts >= timestamps[0] && ts < timestamps[1];
        });
      }

      // Ensure no duplicates (tune the number if needed) and proper cut
      if (this.operations.length > 0) {
        const lastTimestamp = this.operations[this.operations.length - 1]
          .timestamp;
        const lastHashes = this.operations.slice(0, 15).map((o) => o.hash);
        mempoolOperations = mempoolOperations.filter(
          (o) => o.timestamp >= lastTimestamp && !lastHashes.includes(o.hash)
        );
      }

      return mempoolOperations;
    },
    async onDownloadPage(entries, observer, isIntersecting) {
      if (isIntersecting) {
        await this.getOperations();
      }
    },
  },
  watch: {
    address: "fetchOperations",
    status: "updateOperations",
    entrypoints: "updateOperations",
    dates: "updateOperations",
  },
};
</script>

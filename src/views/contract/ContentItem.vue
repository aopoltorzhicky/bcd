<template>
  <v-expansion-panel
    class="bl-1 br-1 bt-1 op-panel"
    active-class="op-active-panel"
  >
    <v-expansion-panel-header
      class="py-0 px-4"
      ripple
      :class="statusHeaderClass"
      :title="value.status"
    >
      <template v-slot:default="{ open }">
        <v-row no-gutters class="py-1">
          <v-col cols="2">
            <v-list-item class="fill-height pa-0">
              <v-list-item-content>
                <v-list-item-title class="hash">{{
                  helpers.formatDatetime(value.timestamp, {
                    val: 15,
                    unit: "minute"
                  })
                }}</v-list-item-title>
                <v-list-item-subtitle
                  class="font-weight-light hash text--secondary"
                >
                  <span v-if="value.mempool">mempool</span>
                  <span v-else>level {{ value.level }}</span>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-col>
          <v-col cols="2">
            <v-list-item class="fill-height pa-0">
              <v-list-item-content>
                <v-list-item-title class="hash">
                  <span v-if="open">{{ value.kind }}</span>
                  <span
                    v-else
                    :class="
                      text === value.kind ? 'accent--text' : 'secondary--text'
                    "
                    >{{ text }}</span
                  >
                </v-list-item-title>
                <v-list-item-subtitle
                  class="font-weight-light hash text--secondary"
                  v-if="
                    value &&
                    !value.mempool &&
                    value.internal_operations &&
                    value.internal_operations.length
                  "
                  >{{
                    value.internal_operations.length
                  }}
                  internal</v-list-item-subtitle
                >
              </v-list-item-content>
            </v-list-item>
          </v-col>
          <v-col cols="2">
            <v-list-item
              class="fill-height pl-1"
              v-if="!open && totalLockedWithdrawn !== 0"
            >
              <v-list-item-content>
                <v-list-item-title class="hash">{{
                  totalLockedWithdrawn | uxtz
                }}</v-list-item-title>
                <v-list-item-subtitle
                  class="font-weight-light hash text--secondary"
                >
                  <span v-if="totalLockedWithdrawn > 0">locked</span>
                  <span v-else>withdrawn</span>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-col>
          <v-col cols="2">
            <v-list-item class="fill-height pl-2">
              <v-list-item-content>
                <v-list-item-title class="hash">{{
                  totalCost | uxtz
                }}</v-list-item-title>
                <v-list-item-subtitle
                  class="font-weight-light hash text--secondary"
                  >total cost</v-list-item-subtitle
                >
              </v-list-item-content>
            </v-list-item>
          </v-col>
          <v-col cols="2">
            <v-list-item class="fill-height pl-3">
              <v-list-item-content>
                <v-list-item-title>
                  <span v-html="helpers.shortcut(value.hash)"></span>
                </v-list-item-title>
                <v-list-item-subtitle
                  class="font-weight-light hash text--secondary"
                  >content #{{ value.content_index }}</v-list-item-subtitle
                >
              </v-list-item-content>
            </v-list-item>
          </v-col>
          <v-col cols="2">
            <v-list-item class="fill-height pa-0" v-if="!open && invoker">
              <v-list-item-content>
                <v-list-item-title>
                  <span class="font-weight-light">by</span>
                  <span class="ml-1" v-html="helpers.shortcut(invoker)"></span>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-col>
        </v-row>
      </template>
    </v-expansion-panel-header>
    <v-expansion-panel-content class="opg-content">
      <InternalOperation :data="value" :address="address" />
      <template v-for="(item, idx) in value.internal_operations">
        <v-divider :key="'divider' + idx"></v-divider>
        <InternalOperation
          :data="item"
          :mainOperation="value"
          :address="address"
          :key="idx"
        />
      </template>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
import InternalOperation from "@/components/InternalOperation.vue";
import { getContentItemHeaderClass } from '@/utils/styles';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default {
  name: "ContentItem",
  props: {
    data: Object,
    address: String,
  },
  components: {
    InternalOperation,
  },
  created() {
    this.value = Object.assign({}, this.data);
  },
  computed: {
    entryName() {
      if (
        this.value.entrypoint &&
        (this.address === undefined ||
          this.value.destination === this.address ||
          (this.value.source === this.address && this.address.startsWith("tz")))
      ) {
        return this.value.entrypoint;
      } else if (!this.value.mempool && this.value.internal_operations) {
        for (let i = 0; i < this.value.internal_operations.length; i++) {
          if (
            this.value.internal_operations[i].entrypoint &&
            this.value.internal_operations[i].destination === this.address
          ) {
            return this.value.internal_operations[i].entrypoint;
          }
        }
      }

      return null;
    },
    text() {
      if (this.value == null) return "";
      if (this.value.kind === "transaction") {
        if (this.entryName) return this.entryName;
      }
      if (this.value.source === this.address && this.address.startsWith("tz"))
        return this.value.kind;
      if (
        this.address === undefined ||
        this.value.destination === this.address
      ) {
        return this.value.kind;
      } else if (this.value.internal_operations) {
        for (let i = 0; i < this.value.internal_operations.length; i++) {
          if (this.value.internal_operations[i].destination === this.address) {
            return this.value.internal_operations[i].kind;
          }
        }
      }
      return null;
    },
    statusHeaderClass() {
      return getContentItemHeaderClass(this.value.status);
    },
    totalLockedWithdrawn() {
      return this.getTotalAmount(1) - this.getTotalAmount(-1);
    },
    totalCost() {
      if (this.value.mempool) return 0;
      let val = this.value.burned || 0;
      if (this.value.internal_operations) {
        for (let i = 0; i < this.value.internal_operations.length; i++) {
          val += this.value.internal_operations[i].burned || 0;
        }
      }
      if (!isNaN(this.value.fee)) {
        val += this.value.fee;
      }
      return val;
    },
    invoker() {
      if (this.value.destination === this.address) {
        return this.getInvoker(this.value);
      } else if (!this.value.mempool && !this.value.internal_operations) {
        for (let i = 0; i < this.value.internal_operations.length; i++) {
          if (this.value.internal_operations[i].destination === this.address) {
            return this.getInvoker(this.value.internal_operations[i]);
          }
        }
      }
      return null;
    },
  },
  data: () => ({
    value: null,
  }),
  methods: {
    getOrientedAmount(data, sign) {
      if (this.address !== undefined && !isNaN(data.amount) && (
          (data.source === this.address && sign < 0) ||
          (data.destination === this.address && sign > 0)
      )) {
        return data.amount;
      }
      return 0;
    },
    getTotalAmount(sign) {
      if (this.value.status !== "applied" || this.value.mempool) return 0;
      let val = this.getOrientedAmount(this.value, sign);
      if (this.value.internal_operations) {
        for (let i = 0; i < this.value.internal_operations.length; i++) {
          val += this.getOrientedAmount(
            this.value.internal_operations[i],
            sign
          );
        }
      }
      return val;
    },
    getInvoker(data) {
      if (data.source_alias !== undefined) {
        return data.source_alias;
      } else if (data.internal && data.source.startsWith("KT")) {
        return data.source;
      } else {
        return null;
      }
    },
  },
};
</script>

<style>
.opg-content > .v-expansion-panel-content__wrap {
  padding: 0;
}
</style>

<style lang="scss" scoped>
.op-panel {
  background-color: var(--v-data-base) !important;
}

.op-active-panel > .v-expansion-panel-header {
  opacity: 0.8;
  background-color: var(--v-border-base) !important;
}

.op-active-panel,
.op-panel.v-expansion-panel--next-active {
  border-bottom: 1px solid var(--v-border-base);
}
</style>

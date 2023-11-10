<template>
  <v-dialog v-model="show" width="1200" scrollable ref="opgDialog">
    <v-card flat outlined>
      <v-card-title class="sidebar d-flex justify-center pa-4">
        <span class="body-1 font-weight-medium text-uppercase text--secondary">Simulation result</span>
        <div
            v-if="simulatedOperation && settings.source"
            class="d-flex flex-column align-center ml-10"
        >
          <span class="overline">gas limit</span>
          <span class="hash" style="font-size: 14px; line-height: 14px;">{{ gasLimit }}</span>
        </div>
        <div
            v-if="simulatedOperation && settings.source"
            class="d-flex flex-column align-center ml-10"
        >
          <span class="overline">storage limit</span>
          <span class="hash" style="font-size: 14px; line-height: 14px;">{{ storageLimit }}</span>
        </div>
        <v-spacer></v-spacer>
        <v-btn icon small @click="show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pa-0">
        <InternalOperation :data="simulatedOperation" noheader />
        <template v-for="(intop, intid) in simulatedOperation.internal_operations">
          <v-divider :key="'divider' + intid"></v-divider>
          <InternalOperation :data="intop" :mainOperation="simulatedOperation" :key="intid" />
        </template>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import InternalOperation from "@/components/InternalOperation.vue";

export default {
name: "SchemaResultOPG",
  components: {
    InternalOperation
  },
  props: {
    value: Boolean,
    simulatedOperation: Object,
    settings: Object,
    gasLimit: Number,
    storageLimit: Number,
  },
  computed: {
    show: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      }
    }
  },
  updated() {
    if (this.value) {
      this.$refs.opgDialog.show();
    }
  }
}
</script>

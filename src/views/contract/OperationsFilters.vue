<template>
  <v-row>
    <v-col cols="3">
      <v-select
        v-model="status"
        :items="[
            'applied',
            'failed',
            'backtracked',
            'skipped',
            'pending',
            'lost',
            'refused',
            'branch_refused',
          ]"
        chips
        small-chips
        filled
        label="Status"
        placeholder="Any"
        multiple
        background-color="data"
        hide-details
      >
        <template v-slot:selection="{ item, index }">
          <v-chip x-small v-if="index < 1">
            <span>{{ item }}</span> </v-chip
          >&nbsp;
          <span v-if="index === 1" class="grey--text caption"
          >+{{ status.length - 1 }} others</span
          >
        </template>
      </v-select>
    </v-col>
    <v-col cols="3" v-if="isContract">
      <v-select
        v-model="selectedEntrypoints"
        :items="$store.state.operations.availableEntrypoints"
        chips
        small-chips
        filled
        background-color="data"
        label="Entrypoint"
        placeholder="Any"
        multiple
        hide-details
      >
        <template v-slot:selection="{ index }">
          <v-chip x-small v-if="index < 1">
            <span>{{ shortestEntrypoint }}</span> </v-chip
          >&nbsp;
          <span v-if="index === 1" class="grey--text caption"
          >+{{ $store.state.operations.entrypoints.length - 1 }} others</span
          >
        </template>
      </v-select>
    </v-col>
    <v-col cols="3">
      <v-menu
        ref="menu"
        v-model="datesModal"
        :close-on-content-click="false"
        :return-value.sync="dates"
        transition="scale-transition"
        offset-y
        min-width="290px"
      >
        <template v-slot:activator="{ on }">
          <v-text-field
            v-model="dateRangeText"
            label="Date range"
            placeholder="All time"
            readonly
            filled
            background-color="data"
            hide-details
            v-on="on"
          ></v-text-field>
        </template>
        <v-date-picker v-model="datesBuf" scrollable range show-current>
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="datesModal = false"
          >Cancel</v-btn
          >
          <v-btn text color="primary" @click="$refs.menu.save(datesBuf)"
          >OK</v-btn
          >
        </v-date-picker>
      </v-menu>
    </v-col>
    <v-col class="d-flex align-center justify-end">
      <v-btn small text @click="fetchOperations">
        <v-icon small class="mr-1 text--secondary">mdi-trash-can</v-icon>
        <span class="text--secondary">clear filters</span>
      </v-btn>
    </v-col>
  </v-row>
</template>

<script>
import {mapActions} from "vuex";

export default {
  name: "OperationsFilters",
  props: {
    address: String,
  },
  computed: {
    isContract() {
      return this.address.startsWith("KT");
    },
    shortestEntrypoint() {
      if (this.entrypoints.length === 0) return "";
      let s = this.entrypoints[0];

      for (let i = 1; i < this.entrypoints.length; i++) {
        if (this.entrypoints[i].length < s.length) s = this.entrypoints[i];
      }
      return s;
    },
  },
  methods: {
    ...mapActions('operations', ['updateOperations']),
  },
  watch: {
    selectedEntrypoints: {
      handler(newVal) {
        this.updateOperations({
          entrypoints: newVal,
        });
      },
      deep: true,
      immediate: true,
    }
  },
  data() {
    return {
      selectedEntrypoints: [],
    }
  }
}
</script>

<style scoped>

</style>
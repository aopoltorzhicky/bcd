<template>
  <v-row>
    <v-col cols="8" class="pt-0 px-10">
      <Toolbar :network="network"/>

      <VContainer class="px-0 mx-0" style="max-width: none;">
        <router-view :network="network" :state="state"></router-view>
      </VContainer>

    </v-col>
    <v-col cols="4" class="pt-0 pl-0">
      <NetworkInfo :network="network" :state="state" />
    </v-col>
  </v-row>
</template>

<script>
import NetworkInfo from "./NetworkInfo.vue";
import Toolbar from "@/views/network/Toolbar.vue";

export default {
  name: "NetworkTab",
  props: {
    network: String,
    state: Object,
  },
  components: {
    NetworkInfo,
    Toolbar,
  },
};
</script>

<style>
.v-timeline-item__dot {
  background-color: var(--v-data-base) !important;
  border: none !important;
  box-shadow: none !important;
}
</style>

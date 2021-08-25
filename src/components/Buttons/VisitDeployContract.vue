<template>
  <v-tooltip
    :right="right"
    :bottom="bottom"
  >
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" icon @click="$router.push('/deploy')" class="text--secondary">
        <v-icon color="grey">mdi-plus</v-icon>
      </v-btn>
    </template>
    <span>Deploy a contract</span>
  </v-tooltip>
</template>

<script>
export default {
  name: "VisitDeployContract",
  props: {
    right: Boolean,
    bottom: Boolean,
  }
}
</script>

<template>
  <v-tooltip
    :bottom="bottom"
    :right="right"
  >
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" icon to="/docs">
        <v-icon color="grey">mdi-api</v-icon>
      </v-btn>
    </template>
    API reference
  </v-tooltip>
</template>

<script>
export default {
  name: "VisitApiReference",
  props: {
    bottom: Boolean,
    right: Boolean,
  }
}
</script>

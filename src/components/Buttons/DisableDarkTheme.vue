<template>
  <v-tooltip
    :right="right"
    :bottom="bottom"
  >
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" icon @click="toggleTheme" class="text--secondary">
        <v-icon v-if="$vuetify.theme.dark" color="grey">mdi-white-balance-sunny</v-icon>
        <v-icon v-else color="grey">mdi-weather-night</v-icon>
      </v-btn>
    </template>
    <span v-if="$vuetify.theme.dark">Disable dark theme</span>
    <span v-else>Enable dark theme</span>
  </v-tooltip>
</template>

<script>
export default {
  name: "DisableDarkTheme",
  props: {
    right: Boolean,
    bottom: Boolean,
  },
  methods: {
    toggleTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      localStorage.setItem("dark", String(this.$vuetify.theme.dark));
    },
  },
}
</script>

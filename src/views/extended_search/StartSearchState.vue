<template>
  <v-card flat class="mt-10 pa-10 d-flex flex-column align-center justify-center transparent">
    <v-img :src="imagePath" max-height="400" contain></v-img>
    <span class="display-1 font-weight-light text--disabled">Let's search</span>
    <span class="body-1 font-weight-light text--secondary mt-1">Please enter something to start your search in Better Call Dev</span>
  </v-card>
</template>

<script>
// let images = require.context('@/assets/', false, /\.png$/)
import images from "@/assets/*.png";

export default {
  name: "StartSearchState",
  computed: {
    imagePath() {
      if (this.$vuetify.theme.isDark) {
        return images('./start_search_dark.png');
      }
      return images('./start_search.png');
    }
  }
}
</script>
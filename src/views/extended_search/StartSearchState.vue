<template>
  <v-card flat class="mt-10 pa-10 d-flex flex-column align-center justify-center transparent">
    <v-img :src="$vuetify.theme.isDark ? startSearchDarkImage : startSearchLightImage" max-height="400" contain></v-img>
    <span class="display-1 font-weight-light text--disabled">Let's search</span>
    <span class="body-1 font-weight-light text--secondary mt-1">Please enter something to start your search in Better Call Dev</span>
  </v-card>
</template>

<script>
import startSearchDarkImage from '@/assets/start_search_dark.png'
import startSearchLightImage from '@/assets/start_search.png'

export default {
  name: "StartSearchState",
  data() {
    return {
      startSearchDarkImage, 
      startSearchLightImage
    }
  },
}
</script>
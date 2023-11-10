<template>
  <v-card flat class="mt-10 d-flex flex-column align-center justify-center transparent">
    <v-img :src="imageName" max-height="300" contain></v-img>
    <span class="display-1 font-weight-light text--disabled">{{ title }}</span>
    <span v-if="!hasDescriptionSlot" class="body-1 font-weight-light text--secondary mt-1">{{ text }}</span>
    <slot v-else name="description" />
  </v-card>
</template>

<script>
// var images = require.context('@/assets/', false, /\.png$/)
import images from "@/assets/*.png";

export default {
  name: "EmptyState",
  props: {
    title: String,
    text: String,
    htmlText: String
  },
  computed: {
    hasDescriptionSlot() {
      return !!this.$slots.description;
    },
    imageName() {
      if (this.$vuetify.theme.isDark) return images('./empty_state_dark.png');
      return images('./empty_state_light.png');
    }
  }
}
</script>
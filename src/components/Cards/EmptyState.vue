<template>
  <v-card flat class="mt-10 d-flex flex-column align-center justify-center transparent">
    <v-img :src="$vuetify.theme.isDark ? emptyStateDarkImage : emptyStateLightImage" max-height="300" contain></v-img>
    <span class="display-1 font-weight-light text--disabled">{{ title }}</span>
    <span v-if="!hasDescriptionSlot" class="body-1 font-weight-light text--secondary mt-1">{{ text }}</span>
    <slot v-else name="description" />
  </v-card>
</template>

<script>
import emptyStateDarkImage from '@/assets/empty_state_dark.png'
import emptyStateLightImage from '@/assets/empty_state_light.png'

export default {
  name: "EmptyState",
  props: {
    title: String,
    text: String,
    htmlText: String
  },
  data() {
    return {
      emptyStateDarkImage, 
      emptyStateLightImage
    }
  },
  computed: {
    hasDescriptionSlot() {
      return !!this.$slots.description;
    },
  }
}
</script>
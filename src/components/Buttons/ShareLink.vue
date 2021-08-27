<template>
  <v-tooltip
    :top="top"
    :bottom="bottom"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        v-on="on"
        icon
        @click="openNativeSharing"
      >
        <v-icon class="text--secondary">mdi-share-variant</v-icon>
      </v-btn>
    </template>
    Share link
  </v-tooltip>
</template>

<script>
import {mapActions} from "vuex";

export default {
  name: "ShareLink",
  props: {
    top: Boolean,
    bottom: Boolean,
    alias: String,
    link: String,
  },
  methods: {
    ...mapActions(["showError", "showClipboardOK"]),
    openNativeSharing() {
      if (navigator.share) {
        navigator.share({
          title: this.alias,
          url: this.link
        });
      } else {
        this.$clipboard(this.link);
        this.showClipboardOK();
      }
    }
  }
}
</script>
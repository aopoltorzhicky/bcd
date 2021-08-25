<template>
  <v-app-bar app clipped-left flat class="canvas pr-4">
    <div class="ml-2">
      <DisableDarkTheme
        bottom
      />
      <VisitApiReference
        bottom
      />
      <VisitDeployContract
        bottom
      />
    </div>

    <v-spacer></v-spacer>
    <v-btn
      icon
      class="text--secondary mr-2"
      href="tg://resolve?domain=baking_bad_chat"
      target="_blank"
      rel="nofollow noopener"
    >
      <v-icon>mdi-telegram</v-icon>
    </v-btn>
    <v-btn
      icon
      class="text--secondary mr-2"
      href="https://twitter.com/TezosBakingBad"
      target="_blank"
      rel="nofollow noopener"
    >
      <v-icon>mdi-twitter</v-icon>
    </v-btn>
    <v-btn
      icon
      class="text--secondary"
      href="https://github.com/baking-bad"
      target="_blank"
      rel="nofollow noopener"
    >
      <v-icon>mdi-github</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
import DisableDarkTheme from "../../components/Buttons/DisableDarkTheme";
import VisitDeployContract from "../../components/Buttons/VisitDeployContract";
import VisitApiReference from "../../components/Buttons/VisitApiReference";
export default {
  name: "HomeToolbar",
  components: {VisitApiReference, VisitDeployContract, DisableDarkTheme},
  computed: {
    apiDocsUrl() {
      return `${window.location.origin}/docs`;
    },
  },
};
</script>

<style>
.toolbar-title {
  color: inherit;
  text-decoration: inherit;
}
</style>

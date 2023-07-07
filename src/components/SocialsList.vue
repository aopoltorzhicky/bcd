<template>
  <div>
    <v-btn
      icon
      class="text--secondary"
      href="https://discord.gg/4QgKst2hF7"
      target="_blank"
      rel="nofollow noopener"
      @click="sendSocialGtag('Discord')"
    >
      <v-icon>$si-discord</v-icon>
    </v-btn>
    <v-btn
      icon
      class="text--secondary"
      href="https://github.com/baking-bad/bcd"
      target="_blank"
      rel="nofollow noopener"
      @click="sendSocialGtag('Github')"
    >
      <v-icon>mdi-github</v-icon>
    </v-btn>
  </div>
</template>

<script>
export default {
  name: "SocialsList",
  methods: {
    sendSocialGtag(name) {
      if (this.$gtag) {
        this.$gtag.event('Social Click', {
          "event_category": name,
          "event_label": this.$router.currentRoute.fullPath
        });
      }
    }
  }
}
</script>
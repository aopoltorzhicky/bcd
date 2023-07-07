<template>
  <div class="ml-8 pl-8 flex-column d-flex align-center justify-center">
      <v-img
        :src="imageName"
        contain
        max-height="300px"
      ></v-img>
    <span class="display-1 font-weight-light text--disabled">This wasn't planned</span>
    <div class="body-1 font-weight-light text--secondary mt-1">
      <span>If this error continues to appear, please contact us:</span>
      <div class="mt-3 d-flex align-center justify-center">
        <v-btn 
          v-for="(link, i) in links" 
          :key="i"
          icon
          x-large
          color="primary"
          :href="link.href"
          target="_blank"
          rel="nofollow noopener">
          <v-icon x-large>{{ link.icon }}</v-icon>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
var images = require.context('@/assets/', false, /\.png$/)

export default {
  name: "ErrorState",
  props: {
    code: Number,
  },
  data: () => ({
    links: [
    {
        'href': 'https://discord.gg/4QgKst2hF7',
        'icon': '$si-discord'
      },
      {
        'href': 'https://github.com/baking-bad/bcd/issues',
        'icon': 'mdi-github'
      },
      {
        'href': 'https://twitter.com/TezosBakingBad',
        'icon': 'mdi-twitter'
      },
      {
        'href': 'https://tezos-dev.slack.com/archives/CV5NX7F2L',
        'icon': 'mdi-slack'
      },
      {
        'href': 'tg://resolve?domain=baking_bad_chat',
        'icon': '$si-telegram'
      },
      {
        'href': 'mailto:hello@baking-bad.org',
        'icon': 'mdi-email'
      },
    ]
  }),
  computed: {
    imageName() {
      if (this.$vuetify.theme.isDark) return images('./error_state_dark.png');
      return images('./error_state_light.png');
    }
  },
};
</script>

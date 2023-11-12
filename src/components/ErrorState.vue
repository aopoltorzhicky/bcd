<template>
  <div class="ml-8 pl-8 flex-column d-flex align-center justify-center">
      <v-img
        :src="$vuetify.theme.isDark ? errorStateDarkImage : errorStateLightImage"
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
import errorStateDarkImage from '@/assets/error_state_dark.png'
import errorStateLightImage from '@/assets/error_state_light.png'

export default {
  name: "ErrorState",
  props: {
    code: Number,
  },
  data: () => ({
    errorStateDarkImage,
    errorStateLightImage,
    links: [
      {
        'href': 'https://github.com/baking-bad/bcd/issues',
        'icon': 'mdi-github'
      },
      {
        'href': 'https://twitter.com/TezosBakingBad',
        'icon': 'mdi-twitter'
      },
      {
        'href': 'tg://resolve?domain=baking_bad_chat',
        'icon': 'mdi-telegram'
      },
      {
        'href': 'https://tezos-dev.slack.com/archives/CV5NX7F2L',
        'icon': 'mdi-slack'
      },
      {
        'href': 'mailto:hello@baking-bad.org',
        'icon': 'mdi-email'
      }
    ]
  })
};
</script>

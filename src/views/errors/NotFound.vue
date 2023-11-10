<template>
  <div>
    <EmptyState
      title="Error 404. Page not found."
    >
      <template #description>
        <span class='body-1 font-weight-light text--secondary mt-1'>
          Please, try again or write to our team in&nbsp;
          <a class='no-decoration' href='https://discord.gg/4QgKst2hF7' target='_blank' rel="noopener">Discord</a>.
        </span>
      </template>
    </EmptyState>
    <div class="d-flex justify-center">
      <v-btn
        class="text--secondary"
        large depressed
        color="border"
        to="/"
        elevation="0"
      >
        GO TO HOMEPAGE
      </v-btn>
      <v-btn
        class="ml-6 text--secondary"
        large depressed
        color="border"
        to="/search"
        elevation="0"
      >
        ADVANCED SEARCH
      </v-btn>
    </div>
  </div>
</template>

<script>
import EmptyState from "../../components/Cards/EmptyState.vue";
export default {
  name: "NotFound",
  components: {EmptyState},
  metaInfo: {
    meta: [
      {
        name: 'robots',
        content: 'noindex',
      },
    ],
  },
}
</script>

<style scoped>

</style>
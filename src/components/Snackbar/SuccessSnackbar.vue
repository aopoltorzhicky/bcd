<template>
  <v-snackbar :value="$store.state.success" color="primary" :timeout="timeout" @input="hideSuccess" top>
    <v-icon class="mr-3">mdi-check-circle-outline</v-icon>  
   {{ $store.state.success }}
    <v-btn text @click="hideSuccess">OK ({{timeLeft_Seconds}})</v-btn>
  </v-snackbar>
</template>

<script>
import { mapActions } from "vuex";
import timeLeft from "../../mixins/timeLeft";

export default {
  name: "SuccessSnackbar",
  mixins: [timeLeft],
  methods: {
    ...mapActions(["hideSuccess"])
  }
};
</script>
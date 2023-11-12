<template>
  <v-dialog v-model="show" persistent max-width="1000px">
    <v-card flat outlined>
      <v-card-title class="sidebar d-flex justify-center py-2">
          <v-icon small color="orange">mdi-alert</v-icon>
          <span class="body-1 ml-2 font-weight-medium text-uppercase text--secondary">Warning</span>
          <v-spacer></v-spacer>
          <v-btn icon small @click.stop="show = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
      </v-card-title>
      <v-card-text class="d-flex flex-column align-center justify-center">    
          <v-img :src="$vuetify.theme.isDark ? apiRelocateDarkImage : apiRelocateLightImage" max-height="300" contain></v-img>    
          <div class="information font-weight-regular mt-2">
            <span>
              The BCD API is about to become non-public. This means that the API schema may change without notice and without maintaining backward compatibility. Please use the
            <a href="https://api.tzkt.io">TzKT API</a> instead of BCD API.</span><br/><br/>
            ✌🏻 Read:
            <a
              style="text-decoration: none"
              target="_blank"
              rel="noopener"
              href="https://baking-bad.org/blog/2022/02/15/migrating-from-bcd-api-to-tzkt-api/"
            >How to migrate from BCD to TZKT API?</a>
          </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import apiRelocateDarkImage from '@/assets/api_relocate_dark.png'
import apiRelocateLightImage from '@/assets/api_relocate_light.png'

export default {
  name: "APIRelocation",
  props: {
    value: Boolean
  },
  data() {
    return {
      apiRelocateDarkImage, 
      apiRelocateLightImage
    }
  },
  computed: {
    show: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  }
}
</script>

<style scoped>
.information {
  width: 650px;
  font-style: normal;
  font-size: 20px;
  line-height: 160%;
  text-align: center;
  color: #959595;
}
</style>
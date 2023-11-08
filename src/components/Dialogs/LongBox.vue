<template>
    <v-dialog 
        v-model="show" 
        width="800" 
        @keydown.esc="show = false"
        ref="box"
    >
        <template v-slot:activator="{ on }">
            <v-list-item v-on="on" selectable class="link" >
                <v-list-item-content>
                    <v-list-item-subtitle class="overline">
                        {{ title }}
                    </v-list-item-subtitle>
                    <v-list-item-title class="body-2">
                        {{ text }}
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </template>
        <v-card>
            <v-card-title class="py-3 px-6 align-center sidebar">
                <span class="body-1 font-weight-medium text-uppercase text--secondary mr-2">
                    {{ title }}
                </span>
            </v-card-title>
            <v-card-text class="pt-7">
                <v-row no-gutters>
                    <v-col cols="12">
                        <!-- eslint-disable-next-line -->
                        <HexView v-if="hex" v-model="text"/>
                        <ValueInspector
                            v-else
                            prim="string"
                            :value="text"
                            :network="network"
                            :label="title">
                        </ValueInspector>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import ValueInspector from "@/components/ValueInspector.vue";
import HexView from "@/components/HexView.vue";

export default {
    name: "LongBox",
    props: {
        network: String,
        title: String,
        text: String,
        hex: Boolean
    },
    components: {
        ValueInspector,
        HexView
    },
    data: () => ({
        show: false
    }),
    updated() {
      if (this.show) {
          this.$refs.box.show();
      }
    }    
}
</script>

<style scoped>
.link.v-list-item--link:hover::before, .link.v-list-item--link:focus::before {
  opacity: 0;
}
</style>

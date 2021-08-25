<template>
  <v-dialog v-model="value" persistent>
    <v-card min-height="300" min-width="600">
      <v-card-title class="pa-0 pb-4">
        <v-toolbar flat>
          <v-toolbar-title>Deploy contract</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="onClose">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
      </v-card-title>
      <v-card-text>
        <v-stepper v-model="step" class="elevation-0">
          <v-stepper-header class="elevation-0">
            <v-stepper-step :complete="step > 2" step="1">Init storage</v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step step="2">Finish</v-stepper-step>
          </v-stepper-header>

          <v-stepper-items>
            <v-stepper-content step="1">
              <v-card color="transparent">
                <v-card-text>
                  <v-row no-gutters>
                    <v-col cols="8" class="pr-4">
                      <Schema
                        header="Storage"
                        type="deploy"
                        network="mainnet"
                        :isStorage="true"
                        :schema="task.schema"
                        :script="task.script"
                        v-model="model"
                        v-on:onDeploy="onDeploy"
                      />
                    </v-col>
                    <v-col cols="4" class="pl-4">
                      <v-card tile flat outlined class="pa-0">
                        <v-card-text class="data">
                          <span
                            class="hash ml-2 text--primary"
                            style="font-size: 15px; font-weight: 400;"
                          >Storage type</span>
                          <TypeDef
                            :typedef="task.typedef.typedef"
                            first="storage"
                            class="pt-4 px-2"
                          />
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                </v-card-actions>
              </v-card>
            </v-stepper-content>

            <v-stepper-content step="2">
              <v-card color="transparent">
                <v-card-text>
                  <v-row align="center" justify="center">
                    <v-col cols="8">
                      <div class="d-flex flex-column align-center justify-space-between">
                        <v-icon size="100" color="secondary" class="mb-3">mdi-license</v-icon>
                        <span
                          class="subtitle-2 mb-6"
                        >You successfully deployed new contract. You can view it in operation {{ hash }}.</span>
                        <v-btn color="primary" @click="onClose">Finish</v-btn>
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import Schema from "@/components/schema/Schema.vue";
import TypeDef from "@/views/contract/TypeDef.vue";

export default {
  name: "DeployDialog",
  props: {
    value: Boolean,
    task: Object,
  },
  components: {
    Schema,
    TypeDef,
  },
  data: () => ({
    step: 1,
    model: {},
    hash: null,
  }),
  methods: {
    onClose() {
      this.$emit("input", false);
    },
    onDeploy(data) {
      this.hash = data.opHash;
      this.api.finalizeDeployContract(
        this.hash,
        this.task.compilation_task_id,
        this.task.id
      );
      this.step = 2;
    },
  },
  watch: {
    value(newValue) {
      if (newValue) {
        this.step = 1;
        this.hash = null;
        this.model = {};
      }
    },
  },
};
</script>

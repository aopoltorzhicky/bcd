<template>
  <v-form class="pa-6 pr-4">
    <div v-if="schema" class="pl-6 pt-4 pr-4 pb-4 mr-2 mb-6 canvas">
      <div v-if="typeof header === 'string'" :class="typeof header === 'string' ? 'mb-6' : ''">
        <span class="caption font-weight-medium text-uppercase text--disabled">{{ header }}</span>
      </div>
      <div :class="!isDeploy ? 'mb-6' : ''" v-if="!isDeploy">
        <v-btn-toggle v-model="selectedFillType" color="primary" dense mandatory>
          <v-btn
              small
              :value="data.value"
              v-for="data in fillTypes"
              :key="data.value"
          >{{ data.text }}</v-btn>
        </v-btn-toggle>
      </div>
      <v-skeleton-loader :loading="!show" type="article" transition="fade-transition">
        <v-jsf
          v-model="model"
          :schema="schema"
          :options="{
            initialValidation: false,
            arrayItemCardProps: {
              'elevation': 0,
              'tile': true,
              'outlined': true
            }
          }"
        >
          <template slot="custom-codemirror" slot-scope="{value, label, on}">
            <label class="codemirror-label">{{ label }}</label>
            <div class="mb-6 ba-1" style="border-radius: 3px;">
              <Michelson v-on="on" :code="value" mutable></Michelson>
            </div>
          </template>
          <template slot="custom-bytes" slot-scope="props">
            <v-text-field
              :key="props.fullKey"
              :ref="props.fullKey"
              :label="props.label"
              v-on="props.on"
              dense
              outlined
              :value="props.value"
              :rules="rules.bytes"
              :placeholder="props.label">
            </v-text-field>
          </template>
           <template slot="custom-nat" slot-scope="props">
            <v-text-field
              :ref="props.fullKey"
              :label="props.label"
              v-on="props.on"
              dense
              outlined
              numeric
              :value="props.value"
              :rules="rules.nat"
              :placeholder="props.label">
            </v-text-field>
          </template>
          <template slot="custom-address" slot-scope="props">
            <v-text-field
                :ref="props.fullKey"
                :label="props.label"
                v-on="props.on"
                dense
                outlined
                :value="props.value"
                :placeholder="props.label"
                :rules="rules.address"
            >
            </v-text-field>
          </template>
          <template slot="custom-contract" slot-scope="props">
            <v-text-field
                :key="props.fullKey"
                :ref="props.fullKey"
                :label="props.label"
                v-on="props.on"
                dense
                outlined
                :value="props.value"
                :placeholder="props.label"
                :hint="schema.properties[props.modelKey] && schema.properties[props.modelKey].tag ? `\'Fill\' button finds the newest contract with this contract type. If contract's absent nothing is set.` : ``"
                persistent-hint
                :rules="rules.contract"
            >
              <template v-slot:append-outer v-if="schema.properties[props.modelKey] && schema.properties[props.modelKey].tag">
                <v-btn text small @click="$emit('getRandomContract', props)" class="text--secondary">
                  <v-icon small left>mdi-format-horizontal-align-left</v-icon>fill
                </v-btn>
              </template>
            </v-text-field>
          </template>
        </v-jsf>
      </v-skeleton-loader>
    </div>
    <div v-else-if="fallbackText">
      <p class="text--disabled">{{ fallbackText }}</p>
    </div>

    <div class="mb-4">
      <span class="caption font-weight-medium text-uppercase text--disabled">Optional</span>
    </div>
    <v-expansion-panels flat hover multiple tile class="mb-6 pr-2" v-model="optional">
      <v-expansion-panel>
        <v-expansion-panel-header class="canvas caption font-weight-medium text-uppercase text--disabled">Settings</v-expansion-panel-header>
        <v-expansion-panel-content class="canvas">
          <SchemaOptionalSettings
            v-if="isOptionalSettings"
            :is-storage="isStorage"
            :is-deploy="isDeploy"
            :networks="networks"
            :settings="settings"
            :importing="importing"
            :import-actions="importActions"
            :schema-selected-network="schemaSelectedNetwork"
            @selectedNetwork="(val) => this.$emit('selectedNetwork', val)"
            @settingsChange="(args) => this.$emit('settingsChange', args)"
          />
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel v-if="!isStorage && !isDeploy">
        <v-expansion-panel-header class="canvas caption font-weight-medium text-uppercase text--disabled">
          Token approvals 
          {{ tokenApprovals && tokenApprovals.length > 0 ? '(' + tokenApprovals.length + ')' : '' }}
        </v-expansion-panel-header>
        <v-expansion-panel-content class="canvas">
          <ApproveForm v-model="tokenApprovals" :network="network"/>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <SchemaFormExecutionActions
      :execution="execution"
      :execute-actions="executeActions"
      @executeAction="$emit('executeAction')"
      @executeClick="$emit('executeClick')"
    />
  </v-form>
</template>

<script>
import SchemaOptionalSettings from "./SchemaOptionalSettings.vue";
import ApproveForm from "./approve/ApproveForm.vue";
import SchemaFormExecutionActions from "./SchemaFormExecutionActions.vue";
import Michelson from "@/components/Michelson.vue";
import { validationRules } from "@/utils/tz.js";
 
export default {
name: "SchemaForm",
  components: {
    Michelson,
    SchemaFormExecutionActions,
    SchemaOptionalSettings,
    ApproveForm
  },
  props: {
    schema: Object,
    settings: Object,
    schemaModel: Object,
    isOptionalSettings: {
      type: Boolean,
      default: true,
    },
    schemaSelectedFillType: String,
    schemaSelectedNetwork: String,
    header: String,
    isDeploy: Boolean,
    isStorage: Boolean,
    importing: Boolean,
    execution: Boolean,
    show: Boolean,
    fillTypes: Array,
    networks: Array,
    importActions: Array,
    executeActions: Array,
    fallbackText: String,
    network: String
  },
  watch: {
    selectedFillType(val) {
      this.$emit('selectedFillType', val)
    },
    model(val) {
      this.$emit('modelChange', val);
    },
    tokenApprovals(val) {
      this.$emit('tokenApprovalsChanged', val);
    },
    schemaModel(val) {
      this.model = val;
    },
    schemaSelectedFillType(val) {
      this.selectedFillType = val;
    },
  },
  data() {
    return {
      selectedFillType: 'empty',
      model: {},
      tokenApprovals: [],
      optional: !this.isStorage && !this.isDeploy ? [] : [0],
      rules: validationRules
    };
  },
}
</script>

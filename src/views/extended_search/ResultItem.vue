<template>
  <v-card flat class="data mt-3">
    <v-card-text class="pa-0 pt-1">
      <v-list-item two-line>
        <v-list-item-content>
          <v-list-item-title>
            <template v-if="item.type === 'contract'">
              <span class="hash">Contracts</span>
              <span class="text--secondary" style="font-size: 20px;"> → </span>
              <router-link class="serp-link" target="_blank" :to="`/${item.body.network}/${item.value}`">
                <span v-if="item.body.alias" v-html="highlight(item.body.alias)" class="alias"></span>
                <span v-else v-html="highlight(item.value)" class="hash"></span>
              </router-link>
            </template>
            <template v-else-if="item.type === 'operation'">
              <span class="hash">Operations</span>
              <span class="text--secondary" style="font-size: 20px;"> → </span>
              <template v-if="item.body.destination.startsWith('KT')">
                <router-link class="serp-link" target="_blank" :to="`/${item.body.network}/${item.body.destination}`">
                  <span
                    v-if="item.body.destination_alias"
                    v-html="highlight(item.body.destination_alias)"
                    class="hash text--secondary"
                  ></span>
                  <span v-else v-html="helpers.shortcut(item.body.destination)" class="text--secondary"></span>
                </router-link>
                <span class="text--secondary" style="font-size: 20px;"> → </span>
              </template>
              <router-link class="serp-link" target="_blank" :to="`/${item.body.network}/opg/${item.value}`">
                <span
                  v-if="item.body.entrypoint"
                  class="hash"
                  v-html="highlight(item.body.entrypoint + '()')"
                ></span>
                <span v-else-if="item.body.kind === 'origination'">origination</span>
                <span v-else-if="item.body.destination.startsWith('KT')" v-html="helpers.shortcut(item.value)"></span>
                <span v-else v-html="highlight(item.value)" class="hash"></span>
              </router-link>
            </template>
            <template v-else-if="item.type === 'bigmapdiff'">
              <router-link class="serp-link" target="_blank"
                :to="`/${item.body.network}/big_map/${item.body.ptr}`">
                <span class="hash text--primary">Big_map {{ item.body.ptr }}</span>
              </router-link>
              <span class="text--secondary" style="font-size: 20px;"> → </span>
              <router-link class="serp-link" target="_blank"
                :to="`/${item.body.network}/big_map/${item.body.ptr}/${item.body.key_hash}`">
                <span class="hash" v-html="highlight(item.body.key)"></span>
              </router-link>
            </template>
             <template v-else-if="item.type === 'token_metadata'">
              <span class="hash">Tokens</span>
              <span class="text--secondary" style="font-size: 20px;"> → </span>
              <router-link class="serp-link" target="_blank" :to="`/${item.body.network}/${item.value}/tokens/?token_id=${item.body.token_id}`">
                <span v-if="item.body.name" v-html="highlight(item.body.name)" class="alias"></span>
              </router-link>
            </template>
            <template v-else-if="item.type === 'tzip'">
              <span class="hash">Metadata</span>
              <span class="text--secondary" style="font-size: 20px;"> → </span>
              <router-link class="serp-link" target="_blank" :to="`/${item.body.network}/${item.value}/metadata`">
                <span v-html="highlight(item.body.name)" class="hash"></span>
              </router-link>
            </template>
            <template v-else-if="item.type === 'tezos_domain'">
              <span class="hash">Domains</span>
              <span class="text--secondary" style="font-size: 20px;"> → </span>
              <router-link class="serp-link" target="_blank" :to="`/${item.body.network}/${item.value}`">
                <span v-html="highlight(item.body.name)" class="hash"></span>
              </router-link>
            </template>
          </v-list-item-title>

          <v-list-item-subtitle>
            <span class="overline" :class="item.body.network === 'mainnet' ? 'secondary--text' : ''">{{ item.body.network }}</span>
            <span v-if="item.type === 'contract' && item.group">
              <span class="overline text--primary">, {{ item.group.count - 1 }} same</span>
            </span>
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-list-item-action-text class="body-1 text--primary">
            {{ helpers.formatDate(item.body.timestamp) }}
            <span
              v-if="item.type === 'contract'
              && item.body.last_action
              && item.body.last_action > item.body.timestamp"
            >— {{ helpers.formatDate(item.body.last_action) }}</span>
          </v-list-item-action-text>

          <v-list-item-action-text class="overline">
            <span
              v-if="item.type === 'contract'"
            >{{ helpers.plural(item.body.tx_count || 1, 'operation') }}</span>
            <span v-else-if="item.type === 'operation'">
              <span :class="item.body.status === 'applied' ? '' : 'error--text'">{{ item.body.status }}</span>
              <span v-if="item.body.internal" class="overline">, internal</span>
            </span>
            <span v-else-if="item.type === 'bigmapdiff'">
              <span v-if="item.group">{{ helpers.plural(item.group.count, "update") }}</span>
              <span v-if="!item.body.value">, <span class="error--text">removed</span></span>
            </span>
          </v-list-item-action-text>
        </v-list-item-action>
      </v-list-item>

      <div class="d-flex ml-3">
        <template v-if="item.type === 'contract'">
          <v-chip v-for="tag in item.body.tags" :key="tag" class="mr-1 mb-3" small outlined pill>
            <span v-html="highlight(tag.toLowerCase())"></span>
          </v-chip>
          <v-chip v-if="item.body.entrypoints" class="mr-1 mb-3" small outlined pill>
            <span>{{ item.body.entrypoints.length }} entrypoints</span>
          </v-chip>
        </template>
      </div>

      <div class="d-flex mx-4">
        <template v-for="(values, key) in item.highlights">
          <div
            :key="key"
            class="d-flex flex-column flex-child pr-1 mr-6 mb-4"
            v-if="!['alias', 'tags', 'language', 'entrypoint', 'key_strings'].includes(key)"
          >
            <span class="caption font-weight-medium text-uppercase">{{ key }}</span>
            <span v-for="(value, i) in values" :key="key + i">
              <span v-html="highlight(value)" class="body-2 text--primary"></span>
            </span>
          </div>
        </template>
      </div>

    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "ResultItem",
  props: {
    item: Object,
    words: Array
  },
  methods: {
    highlight(s) {
      if (this.words === undefined) return s;
      for (var i = 0; i < this.words.length; i++) {
        let re = new RegExp(`(${this.words[i]})`, "gmi");
        s = s.replace(re, "<span class='highlight'>$1</span>");
      }
      return s;
    }
  }
};
</script>

<style>
.highlight {
  font-weight: 500;
  font-style: italic;
}
.flex-child {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.serp-link {
  text-decoration: none;
}
.serp-link:hover {
  color: var(--v-secondary-base);
}
.serp-link:visited {
  color: var(--v-accent-base);
}
.alias {
  font-size: 20px;
  line-height: .9rem;
}
</style>

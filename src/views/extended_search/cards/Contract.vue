<template>
    <v-card class="mx-auto sticky-card" outlined :loading="loading">
        <v-card-text>
            <v-list>
                <v-list-item two-line class="pl-3">
                    <v-list-item-avatar size="50">
                         <v-icon size="50">mdi-code-json</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                        <v-list-item-title>
                            <span class="text-h4 text--primary">{{ alias ? alias : info.address }}</span>
                        </v-list-item-title>
                        <v-list-item-subtitle>
                            <span class="secondary--text overline">{{ item.body.Network }}</span>
                        </v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action v-if="item.body.Homepage">
                        <v-tooltip left>
                            <template v-slot:activator="{ on }">
                                <v-btn v-on="on"
                                    icon 
                                    small                        
                                    class="text--secondary"
                                    :href="$sanitize(item.body.Homepage)"
                                    target="_blank"
                                    rel="nofollow noopener"
                                >
                                    <v-icon>mdi-web</v-icon>
                                </v-btn>
                            </template>
                            <span>Homepage</span>
                        </v-tooltip>
                    </v-list-item-action>
                </v-list-item>

                <Tags class="mx-3" :tags="info.tags"/>

                <v-list-item two-line v-if="item.body.Description">
                    <v-list-item-content>
                        <span class="hash sub-text v-list-item__action-text">{{ $sanitize(item.body.Description) }}</span>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item two-line v-if="alias" class="py-0">
                    <v-list-item-content>
                        <v-list-item-title>
                            <span class="overline">Address</span>
                        </v-list-item-title>
                        <v-list-item-subtitle>
                            <span class="hash">{{ item.body.Address }}</span>
                        </v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item two-line v-if="info.manager" class="py-0">
                    <v-list-item-content>
                        <v-list-item-title>
                            <span class="overline">Deployed by</span>
                        </v-list-item-title>
                        <v-list-item-subtitle>
                            <span class="hash">{{ info.manager }}</span>
                        </v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item two-line class="py-0">
                    <v-list-item-content>
                        <v-list-item-title>
                            <span class="overline">Deployed</span>
                        </v-list-item-title>
                        <v-list-item-subtitle>
                            <span class="hash">{{ info.timestamp | fromNow }}</span>
                        </v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item two-line class="py-0">
                    <v-list-item-content>
                        <v-list-item-title>
                            <span class="overline">Last action</span>
                        </v-list-item-title>
                        <v-list-item-subtitle>
                            <span class="hash">{{ info.last_action | fromNow }}</span>
                        </v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item two-line v-if="hasInterfaces" class="py-0">
                    <v-list-item-content>
                        <v-list-item-title>
                            <span class="overline">Interfaces</span>
                        </v-list-item-title>
                        <v-list-item-subtitle class="pt-1">
                            <v-chip disabled active small class="caption chip mr-1" v-for="(i, idx) in item.body.Interfaces" :key="idx">{{ $sanitize(i) }}</v-chip>
                        </v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item two-line v-if="hasAuthors" class="py-0">
                    <v-list-item-content>
                        <v-list-item-title>
                            <span class="overline">Authors</span>
                        </v-list-item-title>
                        <p class="hash sub-text v-list-item__action-text mt-1" v-for="(author, idx) in item.body.Authors" :key="idx">{{ $sanitize(author) }}</p>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-card-text>
        <v-card-actions class="pl-8 mb-4 pt-0">
            <v-btn color="primary" target="_blank" outlined small :to="`/${item.body.Network}/${info.address}`">
                Contract page
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
import Tags from "@/components/Tags.vue";
import { getAccountAlias } from '@/api/search.js';

export default {
    name: "ContractCard",
    props: {
        item: Object
    },
    components: {
        Tags
    },
    data: () => ({
        loading: false,
        info: {}
    }),
    computed: {
        hasAuthors() {
            return this.item.body.Authors && Array.isArray(this.item.body.Authors)
        },
        hasInterfaces() {
            return this.item.body.Interfaces && Array.isArray(this.item.body.Interfaces)
        },
        alias() {
            let alias = getAccountAlias(this.item.body);
            if (alias) return this.$sanitize(alias);
            return this.$sanitize(this.info.alias);
        }
    },
    created() {
        this.getContract();
    },
    methods: {
        getContract(item) {
            if (this.loading) return;
            this.loading = true;

            this.api.getContract(item.body.Network, item.body.Address)
                .then(contract => {
                    this.info = contract;
                })
                .catch(err => console.log(err))
                .finally(() => this.loading = false);
        },
    },
    watch: {
        item: {
            deep: true,
            immediate: true,
            async handler(newVal) {
                if (newVal) {
                    await this.getContract(newVal);
                }
            }
        }
    }
}
</script>
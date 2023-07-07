import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export function makeVuetify(dark) {
    
    let vuetify = new Vuetify({
        theme: {
            dark: dark,
            options: {
                customProperties: true,
            },
            themes: {
                light: {
                    primary: '#5b942a',
                    secondary: '#246100',
                    accent: "#7B1FA2",
                    sidenav: '#eaeaea',
                    sidebar: '#e9e9e9',
                    canvas: '#f3f3f3',
                    border: '#ddd',
                    data: '#f7f7f7',
                    tree: '#388E3C',
                    text: '#000',
                    postHeader: '#efefef',
                    reddit: '#ff4500',
                    github: '#24292e',
                    twitter: '#1da1f2',
                    youtube: '#ff0000',
                    linkedin: '#007bb5',
                    facebook: '#1877f2',
                    telegram: '#0088cc',
                    gitlab: '#F26D25',
                    instagram: '#e30181',
                    chart: '#B8E194',
                    chartLine: '#5b942a',
                    tag: '#dcdcdc',
                    jsonHasLine: '#999'
                },
                dark: {
                    primary: '#75A34F',
                    secondary: '#abda82',
                    accent: '#BA68C8',
                    sidenav: '#393939',
                    sidebar: '#303030',
                    canvas: '#2d2d2d',
                    border: '#414141',
                    data: '#2a2a2a',
                    tree: '#81C784',
                    text: '#fff',
                    postHeader: '#303030',
                    reddit: '#ff4500',
                    github: '#fff',
                    twitter: '#1da1f2',
                    youtube: '#ff0000',
                    linkedin: '#007bb5',
                    facebook: '#1877f2',
                    telegram: '#0088cc',
                    gitlab: '#F26D25',
                    instagram: '#e30181',
                    chart: '#20350F',
                    chartLine: '#5b942a',
                    tag: '#515151',
                    jsonHasLine: '#444'
                }
            },
        },
        icons: {
            iconfont: 'mdi',
        }
    });

    const simpleIcons = require('simple-icons');
    for (const iconSlug in simpleIcons) {
        const icon = simpleIcons[iconSlug];
        vuetify.framework.icons.values[`si-${icon.slug}`] = icon.path
    }

    return vuetify;
}

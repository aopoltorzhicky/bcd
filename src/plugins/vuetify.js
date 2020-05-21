import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export function makeVuetify(dark) {
    return new Vuetify({
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
                    sidenav: '#404040',
                    sidebar: '#e9e9e9',
                    canvas: '#f3f3f3',
                    border: '#ddd',
                    data: '#f7f7f7',
                    tree: '#388E3C',
                    text: '#000'
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
                    text: '#fff'
                }
            },
        },
    });
}

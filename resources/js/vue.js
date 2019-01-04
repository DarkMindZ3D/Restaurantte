/* jshint esversion: 6 */

/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

require("./bootstrap");

window.Vue = require("vue");

import VueRouter from 'vue-router';
import store from './stores/global-store';
import Vuetify from 'vuetify';
import Toasted from 'vue-toasted';
import Moment from 'vue-moment';
import Vuelidate from 'vuelidate';
import VueSocketIO from 'vue-socket.io';

Vue.config.productionTip = false;

const toastedOptions = {
    duration: 3000,
    position: "top-center",
    className: "toasted-css",
    theme: "bubble",
    onClick: (e, toastObject) => {
        toastObject.goAway(0);
    }
};

Vue.use(Moment);
Vue.use(VueRouter);
Vue.use(store);
Vue.use(Vuetify);
Vue.use(new VueSocketIO({
    debug: true,
    connection: 'http://127.0.0.1:8080'
}));
Vue.use(Toasted, toastedOptions, {
    router
});
Vue.use(Vuelidate);

/* Components para users */
const users = Vue.component('users-component', () =>
    import('./components/users2')
);

/* Components para menu */
const menu = Vue.component('items-component', () =>
    import('./components/menu/menu.vue')
);

const login = Vue.component('login-component', () =>
    import('./components/login.vue')
);
const loginModal = Vue.component('login-modal', () =>
    import('./components/loginModal')
);
const logout = Vue.component('logout-component', () =>
    import('./components/logout.vue')
);
const footer = Vue.component('footer-component', () =>
    import('./components/footer.vue')
);

const home = () => import('./components/home');

/* Components para conta de utilizador */
const accountPage = Vue.component('account-page', () =>
    import('./components/account/accountPage.vue')
);
const setPassword = Vue.component(
    'set-password',
    require('./components/account/setAccountPassword.vue')
);
/* User profile options */
const editUser = Vue.component('edit-user', () =>
    import('./components/account/editUser.vue')
);
const changeUserPicture = Vue.component(
    'change-profile-picture',
    require('./components/account/changeUserPicture.vue')
);
const activateAccount = Vue.component('activate-account', () =>
    import('./components/activateAccount.vue')
);
const changePassword = Vue.component('change-password', () =>
    import('./components/account/changePassword1.vue')
);

/* Worker options */
const shiftOptions = Vue.component('shift-options', () =>
    import('./components/worker/shiftOptions.vue')
);
const tables = Vue.component('manage', () =>
    import('./components/manage/tables.vue')
);

// Orders
const orders = Vue.component('orders', () =>
    import('./components/orders/orders.vue')
);

//Nav
const userNav = Vue.component('user-nav', () =>
    import('./components/nav/user.vue')
);

const mainNav = Vue.component('main-nav', () =>
    import('./components/nav/mainNav.vue')
);

//Cashier Options
const invoices = Vue.component('invoices', () =>
    import('./components/invoices/invoices')
);

//Meals
const meals = Vue.component('meals', () => import("./components/meals/meal"));

const routes = [
    { path: '/', component: home, name: 'home' },
    { path: '/users', component: users, name: 'users' },
    { path: '/menu', component: menu, name: 'menu' },
    { path: '/login', component: login, name: 'login' },
    { path: '/logout', component: logout, name: 'logout' },
    { path: '/users/me', component: accountPage },
    { path: '/orders', component: orders, name: 'orders' },
    { path: '/account/activate', component: activateAccount, name: 'activate' },
    { path: '/account/changePassword', component: changePassword },
    { path: '/management/tables', component: tables, name: 'tables' },
    { path: '/invoices', component: invoices, name: 'invoices'},
    { path: "/meals", component: meals }
];

const router = new VueRouter({
    mode: 'history',
    routes,
    linkActiveClass: 'active'
});

router.beforeEach((to, from, next) => {
    if ((to.name === 'profile') || (to.name === 'logout') || (to.name === 'orders') || (to.name === 'tables') || (to.name === 'logout') || (to.name === 'invoices')) {
        if (!store.state.user) {
            next('/login');
            return;
        }
    }
    next();
});

Vue.filter('capitalize', function (value) {
    if (!value) return '';
    value = value.toString();
    return value.charAt(0).toUpperCase() + value.slice(1);
});

const app = new Vue({
    el: '#app',
    router,
    store,
    data: {
        workingText: "",
        user: undefined,
    },
    methods: {
        getInformationFromLoggedUser() {
            //todo
            this.user = this.$store.state.user;//
            if (this.user === null) {
                axios.get("api/users");
            }
        },
    },
    created() {
        store.commit('loadTokenAndUserFromSession');
    },
    sockets: {
        connect() {
            console.log('Sockect connected with ID: ' + this.$socket.id);

            if (store.state.user) {
                this.$socket.emit('user_enter', this.$store.state.user);
            }
        },
        shift_started(dataFromServer) {
            console.log("start");
            this.$toasted.success("You started working",{icon: "info"});
        },
        shift_ended(dataFromServer) {
            console.log("end");
            this.$toasted.error("You stopped working", {icon: "info"});
        },
        problem_Managers(dataFromServer) {
            this.$toasted.error(dataFromServer, {icon: "error"});
        },
        user_blocked(message) {
            this.$toasted.error(message,
                {
                    icon: 'error'
                }
            );

            store.commit('setBlock', true);

            this.$router.push('/menu');
        },
        user_unblocked(message) {
            this.$toasted.info(message,
                {
                    icon: 'info'
                }
            );

            store.commit('setBlock', false);

            this.$router.push('/menu');
        },
        new_order(message) {
            /**
             * Show toast only to cooks
             * Show link to orders (possibly highlighting order)
             */
            this.$toasted.info(`New order`, {
                    icon: 'info'
                }
            );
        }
    },
});

axios.interceptors.response.use(
    response => response,
    (error) => {
        if (error.response.status === 401) {
            if (!store.state.user) {
                // Clear token and redirect
                store.commit('clearUserAndToken');
                router.push({ name: 'home' });
                // window.location.replace(`${window.location.origin}/login`);
            }
        }
        return Promise.reject(error);
    },
);

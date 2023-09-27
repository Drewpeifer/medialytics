// CONFIG
const serverIp = 'YOUR_SERVER_IP',
    serverToken = 'YOUR_SERVER_TOKEN',
    libraryStats = {},
    moviesPayloadUrl = serverIp + '/library/sections/1/all?X-Plex-Token=' + serverToken,
    tvPayloadUrl = serverIp + '/library/sections/2/all?X-Plex-Token=' + serverToken,
    recentLimit = 20,
    recentlyAddedUrl = serverIp + '/library/recentlyAdded/search?type=1&X-Plex-Container-Start=0&X-Plex-Container-Size=' + recentLimit + '&X-Plex-Token=' + serverToken;

// card component
Vue.component('card', {
    props: ['title', 'content'],
    template: `<div class="card">
                <div class="card-header">
                    <p>{{ title }}</p>
                </div>
                <div class="card-body">
                    {{ content }}
                </div>
            </div>`
});

// Vue instance
const app = new Vue({
    el: '#app',
    data: {
        serverIp: serverIp,
        moviesPayloadUrl: moviesPayloadUrl,
        message: 'Hello Vue!'
    }
  });
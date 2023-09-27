// CONFIG
const serverIp = 'YOUR_SERVER_IP',// ex: 'http://12.345.678.90:32400'
    serverToken = 'YOUR_PLEX_TOKEN',// ex: 'ad2T-askdjasd9WxJVBPQ'
    libraryListUrl = serverIp + '/library/sections?X-Plex-Token=' + serverToken,
    moviesPayloadUrl = serverIp + '/library/sections/1/all?X-Plex-Token=' + serverToken,
    tvPayloadUrl = serverIp + '/library/sections/2/all?X-Plex-Token=' + serverToken,
    recentLimit = 20,
    recentlyAddedUrl = serverIp + '/library/recentlyAdded/search?type=1&X-Plex-Container-Start=0&X-Plex-Container-Size=' + recentLimit + '&X-Plex-Token=' + serverToken;

let availableLibraries = [],
    selectedLibrary = ""
    libraryStatsLoading = false;

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

// gets list of available libraries
const parseLibraryList = (data) => {
    let libraries = [];
    data.MediaContainer.Directory.forEach((library) => {
        // restrict to only movie and tv show libraries
        if (library.type != 'movie' && library.type != 'show') { return; } else {
            libraries.push({
                title: library.title,
                key: library.key
            });
        }
    });
    console.log('libraries:', libraries);
    return libraries;
}

// called on click of single library, gets statistics for that library
const getLibraryStats = (libraryKey) => {
    let libraryStats = {
        total: 0
    };
    // set the app.selectedLibrary to the title of the library that has a key
    // matching the libraryKey passed in
    app.availableLibraries.forEach((library) => {
        if (library.key == libraryKey) {
            app.selectedLibrary = library.title;
            console.log('selected = ' + app.selectedLibrary);
        }
    });
    app.libraryStatsLoading = true;
    axios.get(serverIp + '/library/sections/' + libraryKey + '/all?X-Plex-Token=' + serverToken).then((response) => {
        console.log('library stats XML:', response.data);
        libraryStats.total = response.data.MediaContainer.size;
        console.log('Library stats:', libraryStats);
        app.libraryStatsLoading = false;
    });
    return libraryStats;
}

// Vue instance
const app = new Vue({
    el: '#app',
    data: {
        serverIp: serverIp,
        availableLibraries: availableLibraries,
        libraryStatsLoading: libraryStatsLoading,
        selectedLibrary: selectedLibrary
    },
    mounted: function () {
        axios.get(libraryListUrl).then((response) => {
            console.log('library list XML:', response.data);
            app.availableLibraries = parseLibraryList(response.data);
            console.log('Available libraries:', app.availableLibraries);
          })
    }
  });
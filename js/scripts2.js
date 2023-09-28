// CONFIG
const serverIp = 'SERVER_IP',// ex: 'http://12.345.678.90:32400'
serverToken = 'PLEX_TOKEN',// ex: 'ad2T-askdjasd9WxJVBPQ'
libraryListUrl = serverIp + '/library/sections?X-Plex-Token=' + serverToken,
decadePrefixes = ["193", "194", "195", "196", "197", "198", "199", "200", "201", "202"],
decades = ["1930s", "1940s", "1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"],
// moviesPayloadUrl = serverIp + '/library/sections/1/all?X-Plex-Token=' + serverToken,
// tvPayloadUrl = serverIp + '/library/sections/2/all?X-Plex-Token=' + serverToken,
recentLimit = 20,
recentlyAddedUrl = serverIp + '/library/recentlyAdded/search?type=1&X-Plex-Container-Start=0&X-Plex-Container-Size=' + recentLimit + '&X-Plex-Token=' + serverToken;

// GLOBAL VARIABLES
let availableLibraries = [],
selectedLibrary = "",
selectedLibraryStats = {},
selectedLibrarySummary = "",
libraryStatsLoading = false;

/////////////////////////////////
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

/////////////////////////////////
// sets selectedLibrary, passes all data for that library to a parsing function
const getLibraryData = async (libraryKey) => {
    app.availableLibraries.forEach((library) => {
        if (library.key == libraryKey) {
            app.selectedLibrary = library.title;
            console.log('selected = ' + app.selectedLibrary);
        }
    });
    app.libraryStatsLoading = true;
    let libraryData = await axios.get(serverIp + '/library/sections/' + libraryKey + '/all?X-Plex-Token=' + serverToken).then((response) => {
        console.log('library stats XML:', response.data);
        parseMediaPayload(response);
        app.libraryStatsLoading = false;
        return response.data.MediaContainer;
    });
    console.log('libraryData:', libraryData);
    return libraryData;
}

/////////////////////////////////
// parse through a media payload
const parseMediaPayload = (data) => {
    let itemCount = data.data.MediaContainer.size,
    type = data.data.MediaContainer.viewGroup,
    countries = {},// this stores country: count
    countryList = [],
    countryCounts = [],
    releaseDateList = [],
    releaseDateCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    studioList = [],
    genres = {},// this stores genre: count, and is then split into the two following arrays
    genreList = [],
    genreCounts = [],
    durationList = [],
    durationSum = 0,
    seasonSum = 0,
    episodeCounts = []
    episodeSum = 0;
    
    console.log('parsing media payload...');
    console.log('count = ' + itemCount);
    
    // loop through items and gather important data
    data.data.MediaContainer.Metadata.forEach((item, index) => {
        // track year
        releaseDateList.push(item.year);
        // track studio
        studioList.push(item.studio);
        // track durations
        if (isNaN(item.duration)) {
            // duration is NaN
        } else if (type === 'show') {
            // track seasons
            seasonSum = seasonSum + item.childCount;
            // multiply the avg episode length by the number of episodes to approximate total duration
            durationSum = durationSum + (item.duration/60000 * item.leafCount);
            // track number of episodes
            episodeCounts.push(parseInt(item.leafCount));
        } else {
            // it's a movie
            durationSum = durationSum + (item.duration/60000);
        }
        // track genres
        if (item.Genre) {
            item.Genre.forEach((genre) => {
                if (genres.hasOwnProperty(genre.tag)) {
                    // if genre exists in the dictionary already,
                    // find the genre and increment the count
                    genres[genre.tag]++;
                } else {
                    genres[genre.tag] = 1;
                }
            });
        } else {
            // no genres
        }
        // track countries
        if (item.Country) {
            // check if a country exists for movie
            item.Country.forEach((country) => {
                if (countries.hasOwnProperty(country.tag)) {
                    // if country exists in the dictionary already,
                    // find the country and increment the count
                    countries[country.tag]++;
                } else {
                    countries[country.tag] = 1;
                }
            });
        } else {
            // no countries
        }
        
        if (index == itemCount - 1) {
            // if it's the last entry
            // append stats to library stats panel
            if (type === 'show') {
                let seasonDurations = [];
                
                durationList.forEach((duration, i) => {
                    // multiply each season's avg ep duration by the number of eps
                    let seasonDur = duration * episodeCounts[i];
                    seasonDurations.push(seasonDur);
                });
                totalDuration = seasonDurations.reduce(function(acc, val) { return acc + val; }, 0);
                episodeSum = episodeCounts.reduce(function(acc, val) { return acc + val; }, 0);
            }
            
            var totalMins = Math.round(durationSum),
                totalHours = Math.floor(durationSum/60),
                totalDays = Math.floor(durationSum/24/60),
                displayHours = totalHours - (totalDays*24),
                displayMins = totalMins - (totalHours*60);
            
            // build the stats object for the selected library
            app.selectedLibraryStats = {
                totalItems: itemCount,
                totalMins: totalMins,
                totalHours: totalHours,
                totalDays: totalDays,
                displayHours: totalHours - (totalDays*24),
                displayMins: totalMins - (totalHours*60),
                genres: genres,
                countries: countries,
                type: type,
                increment: type === 'movie'? 'movies' : 'shows',
                totalDuration: totalDays + " Days, " + displayHours + " Hours and " + displayMins + " Mins",
                seasonSum: seasonSum,
                episodeSum: episodeSum,
            }
            
            console.log('selectedLibraryStats');
            console.dir(app.selectedLibraryStats);
        }
    });
    
    //////////////////////////
    // after basic parsing is complete, manipulate data to make
    // it logical and palatable for d3/c3 charting library

    // remove undefined entry from genres dictionary, I'm choosing not to report on movies without genre
    delete genres['undefined'];
    // same for countries
    delete countries['undefined'];
    
    //////////////////////////
    // movies by country chart
    var sortedCountries = [];
    
    for (var country in countries) {
        sortedCountries.push([country, countries[country]]);
    }
    sortedCountries.sort(function(a, b) {
        return b[1] - a[1];
    })
    
    for (var property in sortedCountries) {
        // split the countries dictionary into an array of countries and an array of counts
        countryList.push(sortedCountries[property][0]);
        countryCounts.push(sortedCountries[property][1]);
    }
    // if (countryList.length >= 20) {
    //     // trim to top 20, accounting for placeholder string in chart array
    //     countryList.length = 20;
    //     countryCounts.length = 20;
    // }
    
    countryCounts.unshift("countryCounts");
    
    ////////////////////////
    // movies by genre chart
    var sortedGenres = [];
    for (var genre in genres) {
        sortedGenres.push([genre, genres[genre]]);
    }
    sortedGenres.sort(function(a, b) {
        return b[1] - a[1];
    })
    // split the sorted genres dictionary into an array of genres and an array of counts
    for (var property in sortedGenres) {
        genreList.push(sortedGenres[property][0]);
        genreCounts.push(sortedGenres[property][1]);
    }
    
    if (genreList.length >= 20) {
        genreList.length = 20;
        genreCounts.length = 20;
    }
    genreCounts.unshift("genreCounts");
    console.log('about to build chart');
    console.dir(genreCounts);
    console.dir(genreList);
    // render genre chart
    c3.generate({
        size: {
            height: 550
        },
        bindto: '.movies-by-genre',
        x: 'x',
        data: {
            columns: [
                genreCounts
            ],
            type: 'bar'
        },
        axis: {
            rotated: true,
            x: {
                type: 'category',
                categories: genreList
            }
        },
        legend: {
            hide: true
        },
        color: {
            pattern: ['#D62828', '#F75C03', '#F77F00', '#FCBF49', '#EAE2B7']
        }
    });

    
    /////////////////////////
    // movies by decade chart
    releaseDateList.forEach(function() {
        if (typeof this === 'string' || this instanceof String) {
            var yearSub = item.substring(0, 3);
        } else {
            var yearSub = "undefined";
        }

        for (var i = 0; i < decadePrefixes.length; i++) {
            if (yearSub == decadePrefixes[i]) {
                releaseDateCounts[i]++;
            }
        }
    });
    releaseDateCounts.unshift("releaseDateCounts");

    ////////////////////////
    // movies by studio chart
    var studioInstances = {},
    studios = [];
    // count how many times each studio occurs in studioList,
    // and build a dictionary from results
    for (var i = 0, j = studioList.length; i < j; i++) {
        studioInstances[studioList[i]] = (studioInstances[studioList[i]] || 0) + 1;
    }
    // remove undefined entries from studioInstances
    delete studioInstances['undefined'];
    // split dictionary into two arrays
    for (var prop in studioInstances) {
        if (!studioInstances.hasOwnProperty(prop)) {
            continue;
        }
        studios.push([prop, studioInstances[prop]]);
    }

    // set concatenated summary string
    app.selectedLibrarySummary = type === 'movie' ?
        // movies
        `This library contains ${app.selectedLibraryStats.totalItems.toLocaleString()}
        ${app.selectedLibraryStats.increment} from ${Object.keys(countries).length.toLocaleString()}
        countries spanning ${Object.keys(genres).length.toLocaleString()} genres. The total duration is ${app.selectedLibraryStats.totalDuration}.` :
        // tv
        `This library contains ${app.selectedLibraryStats.totalItems.toLocaleString()} ${app.selectedLibraryStats.increment}
        (${app.selectedLibraryStats.seasonSum.toLocaleString()} seasons / ${app.selectedLibraryStats.episodeSum.toLocaleString()} episodes)
        from ${Object.keys(countries).length.toLocaleString()} countries spanning ${Object.keys(genres).length.toLocaleString()} genres.
        The total duration is ${app.selectedLibraryStats.totalDuration}.`
        console.log('final stats:');
        console.log(app.selectedLibraryStats);
}

////////////////
// Vue instance
const app = new Vue({
    el: '#app',
    data: {
        serverIp: serverIp,
        availableLibraries: availableLibraries,
        libraryStatsLoading: libraryStatsLoading,
        selectedLibrary: selectedLibrary,
        selectedLibraryStats: selectedLibraryStats,
        selectedLibrarySummary: selectedLibrarySummary
    },
    mounted: function () {
        axios.get(libraryListUrl).then((response) => {
            console.log('library list XML:', response.data);
            app.availableLibraries = parseLibraryList(response.data);
            console.log('Available libraries:', app.availableLibraries);
        })
    }
});
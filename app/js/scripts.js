////// WARNING
// Never share the following token with anyone! Do not host this on a public server with the token in place!
// Keep it secret, keep it safe! If compromised, generate a new one: https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/
const serverToken = 'SERVER_TOKEN',// ex: 'ad2T-askdjasd9WxJVBPQ'
serverIp = 'SERVER_IP',// ex: 'http://12.345.678.90:32400'
libraryListUrl = serverIp + '/library/sections?X-Plex-Token=' + serverToken,
// chart color theme
chartColors = ['#D62828', '#F75C03', '#F77F00', '#FCBF49', '#EAE2B7'],
// below are the limits for displaying data in the charts, e.g. "Top X Countries", and the recently added list
countryLimit = 20,
genreLimit = 20,
studioLimit = 20,
directorLimit = 20,
actorLimit = 20,
recentLimit = 10,
recentlyAddedUrl = serverIp + '/library/recentlyAdded/search?type=1&X-Plex-Container-Start=0&X-Plex-Container-Size=' + recentLimit + '&X-Plex-Token=' + serverToken,
// below are the decade arrays used for the items by decade chart, any data outside of these decades will
// be collected but not displayed by the charts. Explicitly stating these instead of computing for easier customization of charts
decadePrefixes = ["191", "192", "193", "194", "195", "196", "197", "198", "199", "200", "201", "202"],// used for comparing raw release years
decades = ["1910s", "1920s", "1930s", "1940s", "1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"],// used for UI/chart display
debugMode = false;// set to true to enable console logging

let availableLibraries = [],// the list of libraries returned by your server
selectedLibrary = "",// the library currently selected by the user
selectedLibraryKey = "",// the key of the library currently selected by the user
selectedLibraryStats = {},// a large object containing all the stats for the selected library
libraryStatsLoading = false,// used to trigger loading animations
recentlyAdded = [],// the list of recently added items returned by your server
countries = {},// this stores country: count, and is then split into the two following arrays for the bar chart
countryList = [],
countryCounts = [],
releaseDateList = [],// stores each instance of a release date
releaseDateCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],// stores count of decades within releaseDateList (matched against decadePrefixes array for comparison)
oldestTitle = "",// the oldest title in the library
oldestReleaseDate = "",// the oldest release date in the library
studioInstances = [],// arrays of type fooInstances and sortedFoo are used to generate the pie charts
sortedStudios = [],
directorInstances = [],
sortedDirectors = [],
actorInstances = [],
sortedActors = [],
genres = {},// this stores genre: count, and is then split into the two following arrays
genreList = [],
genreCounts = [],
durationSum = 0,// aggregate duration of all movies, or total duration of all shows (# of episodes * avg episode duration)
longestDuration = 0,// longest duration of a movie, or longest show (# of episodes)
longestTitle = "",// title of item with longest duration / episode count
firstAdded = "",// date the first item was added to the server
firstAddedDate = "",// date the first item was added to the server
lastAdded = "",
lastAddedDate = "",
seasonSum = 0,
episodeCounts = []
episodeSum = 0;

/////////////////////////////////
// reset library stats
const resetLibraryStats = () => {
    // keep in sync with list above, this resets data on library selection
    countries = {},
    countryList = [],
    countryCounts = [],
    releaseDateList = [],
    releaseDateCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    oldestTitle = "",
    oldestReleaseDate = "",
    studioInstances = [],
    sortedStudios = [],
    directorInstances = [],
    sortedDirectors = [],
    actorInstances = [],
    sortedActors = [],
    genres = {},
    genreList = [],
    genreCounts = [],
    durationSum = 0,
    seasonSum = 0,
    episodeCounts = []
    episodeSum = 0,
    longestDuration = 0,
    longestTitle = "",
    firstAdded = "",
    firstAddedDate = "",
    lastAdded = "",
    lastAddedDate = "";
}

/////////////////////////////////
// gets list of available libraries
const parseLibraryList = (data) => {
    let libraries = [];
    data.MediaContainer.Directory.forEach((library) => {
        // restrict to only movie and tv show libraries
        if (library.type != 'movie' && library.type != 'show') {
            return;
        } else {
            libraries.push({
                title: library.title,
                key: library.key
            });
        }
    });
    return libraries;
}

/////////////////////////////////
// generate recently added list (for the entire server)
const getRecentlyAdded = async () => {
    let recentlyAdded = await axios.get(recentlyAddedUrl).then((response) => {
        return response.data.MediaContainer.Metadata;
    });
    return recentlyAdded;
}

/////////////////////////////////
// sets selectedLibrary, passes all data for that library to a parsing function
const getLibraryData = async (libraryKey) => {
    app.availableLibraries.forEach((library) => {
        if (library.key == libraryKey) {
            app.selectedLibrary = library.title;
            app.selectedLibraryKey = library.key;
        }
    });
    app.libraryStatsLoading = true;
    let libraryData = await axios.get(serverIp + '/library/sections/' + libraryKey + '/all?X-Plex-Token=' + serverToken).then((response) => {
        parseMediaPayload(response);
        app.libraryStatsLoading = false;
        return response.data.MediaContainer;
    });
    // uncomment the following line to print the raw xml in the console
    console.log('Library Data: ', libraryData);
    resetLibraryStats();
    return libraryData;
}

/////////////////////////////////
// parse through a media payload
const parseMediaPayload = (data) => {
    let itemCount = data.data.MediaContainer.size,
    type = data.data.MediaContainer.viewGroup;

    // unmatched items
    let unmatchedItems = [];

    // loop through items and gather important data
    data.data.MediaContainer.Metadata.forEach((item, index) => {
        // track year
        releaseDateList.push(item.year);

        // track unmatched items
        if (item.guid.includes('local')) {
            console.log('unmatched item detected:');
            console.dir(item);
            unmatchedItems.push(item);
        }

        // track oldest release date
        if (oldestTitle == "" || new Date(item.originallyAvailableAt) < new Date(oldestReleaseDate)) {
            oldestTitle = item.title + ' (' + item.originallyAvailableAt + ')';
            oldestReleaseDate = item.originallyAvailableAt;
        }
        // track dateAdded (date added to server)
        if (item.addedAt) {
            // convert unix timestamp to date and parse for values to concatenate and push
            let itemDate = new Date(item.addedAt * 1000),
                itemMonth = itemDate.getMonth() + 1,// returns 0-11, other values are exact though
                itemDay = itemDate.getDate(),
                itemYear = itemDate.getFullYear(),
                itemFullDate = `${itemMonth}-${itemDay}-${itemYear}`;

            // track firstAdded
            if (firstAdded == "" || itemDate < firstAddedDate) {
                firstAdded = item.title;
                firstAddedDate = itemDate;
            }
            // track lastAdded
            if (lastAdded == "" || itemDate > lastAddedDate) {
                lastAdded = item.title;
                lastAddedDate = itemDate;
            }
        } else {
            // no dateAdded
        }

        // track studio
        studioInstances.push(item.studio);
        // track durations
        if (isNaN(item.duration)) {
            // duration is NaN
        } else if (type === 'show') {
            // track seasons
            seasonSum = seasonSum + item.childCount;
            // multiply the avg episode length by the number of episodes to approximate total duration
            durationSum = durationSum + (item.duration/60000 * item.leafCount);
            // track number of episodes
            episodeSum = episodeSum + parseInt(item.leafCount);
        } else {
            // it's a movie
            durationSum = durationSum + (item.duration/60000);
        }
        // track longest duration (runtime for movie, number of episodes for tv)
        if (item.type === 'movie') {
            if (longestDuration === 0 || item.duration > longestDuration) {
                longestDuration = item.duration;
                longestTitle = item.title;
            }
        } else {
            // it's a tv show
            if (longestDuration === 0 || item.leafCount > longestDuration) {
                longestDuration = item.leafCount;
                longestTitle = item.title;
            }
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

        // track directors
        if (item.Director) {
            item.Director.forEach((director) => {
                directorInstances.push(director.tag);
            });
        } else {
            // no directors
        }

        // track actors
        if (item.Role) {
            item.Role.forEach((actor) => {
                actorInstances.push(actor.tag);
            });
        } else {
            // no actors
        }

        //////////////////////////
        // if it's the last entry in the library, calculate stats and prepare data for charts
        // (bar charts want 2 arrays of values, while pie charts want a dictionary)
        if (index == itemCount - 1) {
            let totalMins = Math.round(durationSum),
            totalHours = Math.floor(durationSum/60),
            totalDays = Math.floor(durationSum/24/60),
            displayHours = totalHours - (totalDays*24),
            displayMins = totalMins - (totalHours*60);

            //////////////////////////
            // items by country chart
            let sortedCountries = [];
            // choosing not to report on undefined entries
            delete countries['undefined'];
            for (country in countries) {
                sortedCountries.push([country, countries[country]]);
            }
            sortedCountries.sort(function(a, b) {
                return b[1] - a[1];
            })
            for (property in sortedCountries) {
                // split the countries dictionary into an array of countries and an array of counts
                countryList.push(sortedCountries[property][0]);
                countryCounts.push(sortedCountries[property][1]);
            }
            countryCounts.unshift("countryCounts");

            ////////////////////////
            // items by genre chart
            let sortedGenres = [];
            // choosing not to report on undefined entries
            delete genres['undefined'];
            for (genre in genres) {
                sortedGenres.push([genre, genres[genre]]);
            }
            sortedGenres.sort(function(a, b) {
                return b[1] - a[1];
            })
            // split the sorted genres dictionary into an array of genres and an array of counts
            for (property in sortedGenres) {
                genreList.push(sortedGenres[property][0]);
                genreCounts.push(sortedGenres[property][1]);
            }

            genreCounts.unshift("genreCounts");

            /////////////////////////
            // items by decade chart
            // remove undefined entries from releaseDateList
            releaseDateList.forEach((year, index) => {
                if (typeof year !== 'number' || isNaN(year)) {
                    releaseDateList.splice(index, 1);
                } else {
                    // compare each year to the decadePrefixes array, and if the first 3 chars of the year match the decade prefix,
                    // increment the corresponding index in releaseDateCounts
                    let yearSub = year.toString().substring(0, 3);
                    for (let i = 0; i < decadePrefixes.length; i++) {
                        if (yearSub == decadePrefixes[i]) {
                            releaseDateCounts[i]++;
                        }
                    }
                }
            });

            let topDecade = decades[releaseDateCounts.indexOf(Math.max(...releaseDateCounts))],
                topDecadeCount = Math.max(...releaseDateCounts).toLocaleString();

            releaseDateCounts.unshift("releaseDateCounts");

            ////////////////////////
            // items by studio chart
            let studios = {};
            // build a dictionary of studios and their counts
            studioInstances.forEach((studio) => {
                if (studios.hasOwnProperty(studio)) {
                    studios[studio]++;
                } else {
                    studios[studio] = 1;
                }
            });
            // remove undefined entries from studioInstances
            delete studios['undefined'];
            // sort the studios dictionary by count
            for (studio in studios) {
                sortedStudios.push([studio, studios[studio]]);
            }
            sortedStudios.sort(function(a, b) {
                return b[1] - a[1];
            });
            // trim the sorted studios to the predefined limit
            sortedStudios = sortedStudios.slice(0, studioLimit);

            ////////////////////////
            // items by director chart
            let directors = {};
            // build a dictionary of directors and their counts
            directorInstances.forEach((director) => {
                if (directors.hasOwnProperty(director)) {
                    directors[director]++;
                } else {
                    directors[director] = 1;
                }
            });
            // remove undefined entries from directorInstances
            delete directors['undefined'];
            // sort the directors dictionary by count
            for (director in directors) {
                sortedDirectors.push([director, directors[director]]);
            }
            sortedDirectors.sort(function(a, b) {
                return b[1] - a[1];
            });
            // trim the sorted directors to the predefined limit
            sortedDirectors = sortedDirectors.slice(0, directorLimit);

            ////////////////////////
            // items by actor chart
            let actors = {};
            // build a dictionary of actors and their counts
            actorInstances.forEach((actor) => {
                if (actors.hasOwnProperty(actor)) {
                    actors[actor]++;
                } else {
                    actors[actor] = 1;
                }
            });
            // remove undefined entries from actorInstances
            delete actors['undefined'];
            // sort the actors dictionary by count
            for (actor in actors) {
                sortedActors.push([actor, actors[actor]]);
            }
            sortedActors.sort(function(a, b) {
                return b[1] - a[1];
            });
            // trim the sorted directors to the predefined limit
            sortedActors = sortedActors.slice(0, directorLimit);

            // reset all selectedLibraryStats
            app.selectedLibraryStats = {};
            // build the stats object for the selected library
            app.selectedLibraryStats = {
                totalItems: itemCount.toLocaleString(),
                totalDays: totalDays,
                displayHours: totalHours - (totalDays*24),
                displayMins: totalMins - (totalHours*60),
                topGenre: genreList[0],
                topGenreCount: genreCounts[1].toLocaleString(),
                totalGenreCount: Object.keys(genres).length.toLocaleString(),
                topCountry: countryList[0],
                topCountryCount: countryCounts[1].toLocaleString(),
                totalCountryCount: Object.keys(countries).length.toLocaleString(),
                topDecade: topDecade,
                topDecadeCount: topDecadeCount,
                oldestTitle: oldestTitle,
                studios: studios,
                topStudio: sortedStudios[0][0],
                topStudioCount: sortedStudios[0][1].toLocaleString(),
                totalStudioCount: Object.keys(studios).length.toLocaleString(),
                topDirector: sortedDirectors.length > 0 ? sortedDirectors[0][0] : "",
                topDirectorCount: sortedDirectors.length > 0 ? sortedDirectors[0][1].toLocaleString() : 0,
                topActor: sortedActors.length > 0 ? sortedActors[0][0] : "",
                topActorCount: sortedActors.length > 0 ? sortedActors[0][1].toLocaleString() : 0,
                type: type,
                increment: type === 'movie'? 'movie' : 'show',
                totalDuration: totalDays + " Days, " + displayHours + " Hours and " + displayMins + " Mins",
                seasonSum: seasonSum,
                episodeSum: episodeSum,
                studioLimit: studioLimit,
                countryLimit: countryLimit,
                genreLimit: genreLimit,
                longestDuration : longestDuration,
                longestTitle : longestTitle,
                firstAdded : firstAdded,
                firstAddedDate : firstAddedDate,
                lastAdded : lastAdded,
                lastAddedDate : lastAddedDate,
            }

            // render charts
            renderCharts();

            // if debug mode is enabled, log data into the console:
            if (debugMode) {
                console.log('Library Selected: ', app.selectedLibrary);
                console.log('Total Items: ', itemCount);
                console.log('Library XML: ' + serverIp + '/library/sections/' + app.selectedLibraryKey + '/all?X-Plex-Token=' + serverToken);
            }
        }
    });
}

const renderCharts = () => {
    // render charts
    c3.generate({
        bindto: '.items-by-country',
        x: 'x',
        data: {
            columns: [
                countryCounts.slice(0, countryLimit + 1)
            ],
            type: 'bar'
        },
        axis: {
            rotated: true,
            x: {
                type: 'category',
                categories: countryList.slice(0, countryLimit + 1)
            }
        },
        legend: {
            hide: true
        },
        color: {
            pattern: chartColors
        }
    });
    c3.generate({
        bindto: '.items-by-genre',
        x: 'x',
        data: {
            columns: [
                genreCounts.slice(0, genreLimit + 1)
            ],
            type: 'bar'
        },
        axis: {
            rotated: true,
            x: {
                type: 'category',
                categories: genreList.slice(0, genreLimit + 1)
            }
        },
        legend: {
            hide: true
        },
        color: {
            pattern: chartColors
        }
    });
    c3.generate({
        bindto: '.items-by-decade',
        x: 'x',
        data: {
            columns: [
                releaseDateCounts
            ],
            type: 'bar'
        },
        axis: {
            x: {
                type: 'category',
                categories: decades
            }
        },
        legend: {
            hide: true
        },
        color: {
            pattern: chartColors
        }
    });
    c3.generate({
        bindto: '.items-by-studio',
        data: {
            // set the columns property to a dictionary that contains the first 20 key/value pairs of the studios dictionary
            columns: sortedStudios,
            type : 'pie'
        },
        pie: {
            label: {
                format: function (value, ratio, id) {
                    return value;
                }
            }
        },
        color: {
            pattern: chartColors
        },
        tooltip: {
            format: {
                value: function (value, ratio, id) {
                    return id + ' : ' + value;
                }
            }
        }
    });
    c3.generate({
        bindto: '.items-by-director',
        data: {
            // set the columns property to a dictionary that contains the first 20 key/value pairs of the studios dictionary
            columns: sortedDirectors,
            type : 'pie'
        },
        pie: {
            label: {
                format: function (value, ratio, id) {
                    return value;
                }
            }
        },
        color: {
            pattern: chartColors
        },
        tooltip: {
            format: {
                value: function (value, ratio, id) {
                    return id + ' : ' + value;
                }
            }
        }
    });
    c3.generate({
        bindto: '.items-by-actor',
        data: {
            // set the columns property to a dictionary that contains the first 20 key/value pairs of the studios dictionary
            columns: sortedActors,
            type : 'pie'
        },
        pie: {
            label: {
                format: function (value, ratio, id) {
                    return value;
                }
            }
        },
        color: {
            pattern: chartColors
        },
        tooltip: {
            format: {
                value: function (value, ratio, id) {
                    return id + ' : ' + value;
                }
            }
        }
    });
}

////////////////
// Vue instance
const app = new Vue({
    el: '#app',
    data: {
        debugMode: debugMode,
        serverIp: serverIp,
        serverToken: serverToken,
        availableLibraries: availableLibraries,
        libraryStatsLoading: libraryStatsLoading,
        selectedLibrary: selectedLibrary,
        selectedLibraryKey: selectedLibraryKey,
        selectedLibraryStats: selectedLibraryStats,
        recentlyAdded: recentlyAdded,
    },
    mounted: function () {
        axios.get(libraryListUrl).then((response) => {
            app.availableLibraries = parseLibraryList(response.data);
            // if debug mode is enabled, log data into the console:
            if (debugMode) {
                console.log('*** DEBUG MODE ENABLED ***');
                console.log('Welcome to Medialytics!');
                console.log('Server IP: ', serverIp);
                console.log('Server Token: ', serverToken);
                console.log('Available Libraries: ', app.availableLibraries);
            }
        }).then(() => {
            getRecentlyAdded().then((data) => {
                app.recentlyAdded = data;
            });
        });
    }
});

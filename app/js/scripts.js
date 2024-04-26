////// WARNING
// Never share the following token with anyone! Do not host this on a public server with the token in place!
// Keep it secret, keep it safe! If compromised, generate a new one: https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/
const serverToken = 'SERVER_TOKEN',// ex: 'ad2T-askdjasd9WxJVBPQ'
serverIp = 'SERVER_IP',// ex: 'http://12.345.678.90:32400'
libraryListUrl = serverIp + '/library/sections?X-Plex-Token=' + serverToken,
// chart color theme
chartColors = ['#D62828', '#F75C03', '#F77F00', '#FCBF49', '#EAE2B7'],
recentLimit = 20,
recentlyAddedUrl = serverIp + '/library/recentlyAdded?X-Plex-Container-Start=0&X-Plex-Container-Size=' + recentLimit + '&X-Plex-Token=' + serverToken,
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
watchedCount = 0,// total watched items in a library
// genres
genres = {},// this stores genre: count, and is then split into the two following arrays
genreList = [],
genreCounts = [],
genresWatched = {},// functions the same as genres object, but count is incremented only if the parsed item has been watched
genresWatchedCounts = [],
genresUnwatchedCounts = [],
// countries
countries = {},// this stores country: count, and is then split into the two following arrays for the bar chart
countryList = [],
countryCounts = [],
countriesWatched = {},
countriesWatchedCounts = [],
countriesUnwatchedCounts = [],
// release dates
releaseDateList = [],// stores each instance of a release date
releaseDateCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],// stores count of decades within releaseDateList (matched against decadePrefixes array for comparison)
oldestTitle = "",// the oldest title in the library
oldestReleaseDate = "",// the oldest release date in the library
// watched status for the decades chart
decadesWatchedList = [],
decadesWatchedCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
decadesUnwatchedCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
// studios
studios = {},// this stores studio: count, and is then split into the two following arrays
studioList = [],
studioCounts = [],
studiosWatched = {},
studiosWatchedCounts = [],
studiosUnwatchedCounts = [],
// directors, and actors
directorInstances = [],
sortedDirectors = [],
actorInstances = [],
sortedActors = [],
// durations, library size, and unmatched items
durationSum = 0,// aggregate duration of all movies, or total duration of all shows (# of episodes * avg episode duration)
longestDuration = 0,// longest duration of a movie, or longest show (# of episodes)
longestTitle = "",// title of item with longest duration / episode count
firstAdded = "",// date the first item was added to the server
firstAddedDate = "",// date the first item was added to the server
lastAdded = "",
lastAddedDate = "",
seasonSum = 0,
episodeCounts = [],
episodeSum = 0,
unmatchedItems = [],
// below are the limits for displaying data in the charts, e.g. "Top X Countries", and the recently added list
countryLimit = 20,
newCountryLimit = countryLimit,// "new" variations are used for the UI to track changes to limit / Top X
genreLimit = 20,
newGenreLimit = genreLimit,
studioLimit = 20,
newStudioLimit = studioLimit,
directorLimit = 20,
newDirectorLimit = directorLimit,
actorLimit = 20,
newActorLimit = actorLimit;

/////////////////////////////////
// reset library stats
const resetLibraryStats = () => {
    // keep in sync with list above, this resets data on library selection
    countries = {},
    countryList = [],
    countryCounts = [],
    countriesWatched = {},
    countriesWatchedCounts = [],
    countriesUnwatchedCounts = [],
    countryToggle = "",
    genres = {},
    genreList = [],
    genreCounts = [],
    genresWatched = {},
    genresWatchedCounts = [],
    genresUnwatchedCounts = [],
    genreToggle = "",
    studios = {},
    studioList = [],
    studioCounts = [],
    studiosWatched = {},
    studiosWatchedCounts = [],
    studiosUnwatchedCounts = [],
    studioToggle = "",
    releaseDateList = [],
    releaseDateCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    oldestTitle = "",
    oldestReleaseDate = "",
    decadesWatchedList = [],
    decadesWatchedCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    decadesUnwatchedCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    directorInstances = [],
    sortedDirectors = [],
    actorInstances = [],
    sortedActors = [],
    durationSum = 0,
    seasonSum = 0,
    episodeCounts = [],
    episodeSum = 0,
    longestDuration = 0,
    longestTitle = "",
    firstAdded = "",
    firstAddedDate = "",
    lastAdded = "",
    lastAddedDate = "",
    unmatchedItems = [],
    watchedCount = 0;
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
    if (debugMode) {
        console.log('Library Data: ', libraryData);
    }
    resetLibraryStats();
    app.renderWatchedGauge();
    return libraryData;
}

/////////////////////////////////
// parse through a media payload
const parseMediaPayload = (data) => {
    let itemCount = data.data.MediaContainer.size,
    type = data.data.MediaContainer.viewGroup;

    // loop through items and gather important data
    data.data.MediaContainer.Metadata.forEach((item, index) => {
        // track year
        if (typeof item.year === 'number' || !isNaN(item.year)) {
            releaseDateList.push(item.year);
        }

        // track unmatched items
        if (item.guid.includes('local')) {
            if (debugMode) {
                console.log('unmatched item detected:');
                console.dir(item);
            }
            unmatchedItems.push(item.title);
        }

        // track overall / total watched count, take any actions
        // for watched items that don't require extra parsing
        if (item.lastViewedAt) {
            watchedCount++;
            if (typeof item.year === 'number' || !isNaN(item.year)) {
                decadesWatchedList.push(item.year);
            }
        }

        // track oldest release date
        if (oldestTitle == "" || new Date(item.originallyAvailableAt) < new Date(oldestReleaseDate)) {
            oldestTitle = item.title + ' (' + new Date(item.originallyAvailableAt).toLocaleDateString().replace(/\//g,'-') + ')';
            oldestReleaseDate = item.originallyAvailableAt;
        }
        // track dateAdded (date added to server)
        if (item.addedAt) {
            // convert unix timestamp to date and parse for values to concatenate and push
            let itemDate = new Date(item.addedAt * 1000);

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
        if (item.studio) {
            if (studios.hasOwnProperty(item.studio)) {
                // if studio exists in the dictionary already,
                // find the studio and increment the count
                studios[item.studio]++;
                // track the watched count for that studio
                item.lastViewedAt ? studiosWatched[item.studio]++ : studiosWatched[item.studio];
            } else {
                studios[item.studio] = 1;
                item.lastViewedAt ? studiosWatched[item.studio] = 1 : studiosWatched[item.studio] = 0;
            }
        } else {
            // no studios
        }
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
                    // track the watched count for that genre
                    item.lastViewedAt ? genresWatched[genre.tag]++ : genresWatched[genre.tag];
                } else {
                    genres[genre.tag] = 1;
                    item.lastViewedAt ? genresWatched[genre.tag] = 1 : genresWatched[genre.tag] = 0;
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
                    // track the watched count for that country
                    item.lastViewedAt ? countriesWatched[country.tag]++ : countriesWatched[country.tag];
                } else {
                    countries[country.tag] = 1;
                    item.lastViewedAt ? countriesWatched[country.tag] = 1 : countriesWatched[country.tag] = 0;
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
        // (bar charts want 2 arrays of values, while pie charts want an array or arrays, e.g. [['foo', 1], ['bar', 2]])
        // https://c3js.org/examples.html for more info
        if (index == itemCount - 1) {
            let totalMins = Math.round(durationSum),
            totalHours = Math.floor(durationSum/60),
            totalDays = Math.floor(durationSum/24/60),
            displayHours = totalHours - (totalDays*24),
            displayMins = totalMins - (totalHours*60);

            //////////////////////////
            // items by country chart
            let sortedCountries = [],
            sortedCountriesWatchedCounts = [];
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
            // for every country in countryList, find the corresponding count in countriesWatched and push it to the sortedCountriesWatchedCounts array
            countryList.forEach((country) => {
                sortedCountriesWatchedCounts.push(countriesWatched[country]);
            });
            sortedCountriesWatchedCounts.unshift("Watched");
            // copy sortedCountriesWatchedCounts to sortedCountriesUnwatchedCounts and set each value to the difference between the watched and total count for that country
            let sortedCountriesUnwatchedCounts = sortedCountriesWatchedCounts.slice();
            sortedCountriesUnwatchedCounts = sortedCountriesUnwatchedCounts.map((count, index) => {
                return countryCounts[index] - count;
            });
            sortedCountriesUnwatchedCounts[0] = "Unwatched";

            ////////////////////////
            // items by genre chart
            let sortedGenres = [],
            sortedGenresWatchedCounts = [];
            // choosing not to report on undefined entries
            delete genres['undefined'];
            for (genre in genres) {
                sortedGenres.push([genre, genres[genre]]);
            }
            sortedGenres.sort(function(a, b) {
                return b[1] - a[1];
            });
            // split the sorted genres dictionary into an array of genres and an array of counts
            for (genre in sortedGenres) {
                genreList.push(sortedGenres[genre][0]);
                genreCounts.push(sortedGenres[genre][1]);
            }

            genreCounts.unshift("genreCounts");
            // for every genre in genreList, find the corresponding count in genresWatched and push it to the sortedGenresWatchedCounts array
            genreList.forEach((genre) => {
                sortedGenresWatchedCounts.push(genresWatched[genre]);
            });
            sortedGenresWatchedCounts.unshift("Watched");
            // copy sortedGenresWatchedCounts to sortedGenresUnwatchedCounts and set each value to the difference between the watched and total count for that genre
            let sortedGenresUnwatchedCounts = sortedGenresWatchedCounts.slice();
            sortedGenresUnwatchedCounts = sortedGenresUnwatchedCounts.map((count, index) => {
                return genreCounts[index] - count;
            });
            sortedGenresUnwatchedCounts[0] = "Unwatched";
            ////////////////////////
            // items by studio chart
            let sortedStudios = [],
                sortedStudiosWatchedCounts = [];
            // choosing not to report on undefined entries
            delete studios['undefined'];
            for (studio in studios) {
                sortedStudios.push([studio, studios[studio]]);
            }
            sortedStudios.sort(function(a, b) {
                return b[1] - a[1];
            })
            // split the sorted studio dictionary into an array of studios and an array of counts
            for (property in sortedStudios) {
                studioList.push(sortedStudios[property][0]);
                studioCounts.push(sortedStudios[property][1]);
            }
            studioCounts.unshift("studioCounts");

            // for every studio in studioList, find the corresponding count in studiosWatched and push it to the sortedStudiosWatchedCounts array
            studioList.forEach((genre) => {
                sortedStudiosWatchedCounts.push(studiosWatched[genre]);
            });
            sortedStudiosWatchedCounts.unshift("Watched");
            // copy sortedStudiosWatchedCounts to sortedStudiosUnwatchedCounts and set each value to the difference between the watched and total count for that studio
            let sortedStudiosUnwatchedCounts = sortedStudiosWatchedCounts.slice();
            sortedStudiosUnwatchedCounts = sortedStudiosUnwatchedCounts.map((count, index) => {
                return studioCounts[index] - count;
            });
            sortedStudiosUnwatchedCounts[0] = "Unwatched";

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

            decadesWatchedList.forEach((year, index) => {
                if (typeof year !== 'number' || isNaN(year)) {
                    decadesWatchedList.splice(index, 1);
                } else {
                    // compare each year to the decadePrefixes array, and if the first 3 chars of the year match the decade prefix,
                    // increment the corresponding index in decadesWatchedCounts
                    let yearSub = year.toString().substring(0, 3);
                    for (let i = 0; i < decadePrefixes.length; i++) {
                        if (yearSub == decadePrefixes[i]) {
                            decadesWatchedCounts[i]++;
                        }
                    }
                }
            });

            // copy the release date counts to a new array for unwatched items,
            // then subtract the watched count from the total count for each decade
            let decadesUnwatchedCounts = releaseDateCounts;
            decadesUnwatchedCounts = decadesUnwatchedCounts.map((count, index) => {
                return Math.abs(count - decadesWatchedCounts[index]);
            });
            releaseDateCounts.unshift("releaseDateCounts");
            decadesWatchedCounts.unshift("Watched");
            decadesUnwatchedCounts.unshift("Unwatched");

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
            sortedDirectors.unshift('directorCounts');

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
            sortedActors = sortedActors.slice(0, actorLimit);
            sortedActors.unshift('actorCounts');

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
                genreList: genreList,
                genreCounts: genreCounts,
                genresWatchedCounts : sortedGenresWatchedCounts,
                genresUnwatchedCounts : sortedGenresUnwatchedCounts,
                topCountry: countryList[0],
                topCountryCount: countryCounts[1].toLocaleString(),
                totalCountryCount: Object.keys(countries).length.toLocaleString(),
                countryCounts: countryCounts,
                countryList: countryList,
                countriesWatchedCounts : sortedCountriesWatchedCounts,
                countriesUnwatchedCounts : sortedCountriesUnwatchedCounts,
                topDecade: topDecade,
                topDecadeCount: topDecadeCount,
                oldestTitle: oldestTitle,
                decadesWatchedCounts : decadesWatchedCounts,
                decadesUnwatchedCounts : decadesUnwatchedCounts,
                studios: studios,
                topStudio: studioList[0],
                topStudioCount: studioCounts[1].toLocaleString(),
                totalStudioCount: Object.keys(studios).length.toLocaleString(),
                studioList: studioList,
                studioCounts: studioCounts,
                studiosWatchedCounts: sortedStudiosWatchedCounts,
                studiosUnwatchedCounts: sortedStudiosUnwatchedCounts,
                topDirector: sortedDirectors.length > 1 ? sortedDirectors[1][0] : "",
                topDirectorCount: sortedDirectors.length > 1 ? sortedDirectors[1][1].toLocaleString() : 0,
                topActor: sortedActors.length > 0 ? sortedActors[1][0] : "",
                topActorCount: sortedActors.length > 0 ? sortedActors[1][1].toLocaleString() : 0,
                type: type,
                increment: type === 'movie'? 'movie' : 'show',
                totalDuration: totalDays + " Days, " + displayHours + " Hours and " + displayMins + " Mins",
                seasonSum: seasonSum,
                episodeSum: episodeSum,
                studioLimit: studioLimit,
                newStudioLimit: newStudioLimit,
                countryLimit: countryLimit,
                newCountryLimit: newCountryLimit,
                genreLimit: genreLimit,
                newGenreLimit: newGenreLimit,
                longestDuration : longestDuration,
                longestTitle : longestTitle,
                firstAdded : firstAdded,
                firstAddedDate : firstAddedDate,
                lastAdded : lastAdded,
                lastAddedDate : lastAddedDate,
                unmatchedItems : unmatchedItems,
                watchedCount : watchedCount
            }

            // render charts
            app.renderDefaultCharts();

            // if debug mode is enabled, log data into the console:
            if (debugMode) {
                console.log('Library Selected: ', app.selectedLibrary);
                console.log('Total Items: ', itemCount);
                console.log('Library XML: ' + serverIp + '/library/sections/' + app.selectedLibraryKey + '/all?X-Plex-Token=' + serverToken);
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
        genreToggle: "pie",
        countryToggle: "pie",
        studioToggle: "pie"
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
    },
    methods: {
        renderBarChart: function (selector, dataColumns, categories, rotated = true, stackGroup = []) {
            if (debugMode) {
                console.log('rendering chart: ', selector, dataColumns, categories, rotated, stackGroup)
            }
            c3.generate({
                bindto: selector,
                x: 'x',
                data: {
                    columns: [
                        dataColumns,
                        stackGroup
                    ],
                    type: 'bar',
                    groups: [[ dataColumns[0], stackGroup[0] ]]
                },
                axis: {
                    rotated: rotated,
                    x: {
                        type: 'category',
                        categories: categories,
                        tick: {
                            multiline: false,
                        }
                    }
                },
                legend: {
                    hide: false,
                },
                color: {
                    pattern: chartColors
                },
                tooltip: {
                    format: {
                        title: function(x, index) {
                            return `${categories[index]} (${parseInt(stackGroup[index + 1]) + parseInt(dataColumns[index + 1])})`;
                        },
                        value: function (val, ratio, id, index) {
                            return id.includes('Unwatched') ? `Unwatched : ${val}` : `Watched : ${val}`;
                        },
                    }
                }
            });
        },
        renderPieChart: function (selector, dataColumns, categories = []) {
            if (debugMode) {
                console.log('rendering chart: ', selector, dataColumns, categories)
            }
            dataColumns.shift();
            let pieColumns = [];
            if (categories.length >= 1) {
                categories.forEach((item, index) => {
                    pieColumns.push([item, parseInt(dataColumns[index])]);
                });
            } else {
                pieColumns = dataColumns;
            }
            c3.generate({
                bindto: selector,
                data: {
                    columns: pieColumns,
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
        },
        renderDefaultCharts: function () {
            // render charts
            this.renderGenreChart('bar');
            this.renderCountryChart('bar');
            this.renderDecadeChart('bar');
            this.renderStudioChart('bar');
            this.renderDirectorChart();
            this.renderActorChart();
        },
        renderGenreChart: function (type) {
            if (type == 'bar') {
                app.renderBarChart('.items-by-genre',app.selectedLibraryStats.genresUnwatchedCounts.slice(0, app.selectedLibraryStats.genreLimit + 1), app.selectedLibraryStats.genreList.slice(0, app.selectedLibraryStats.genreLimit), true, app.selectedLibraryStats.genresWatchedCounts.slice(0, app.selectedLibraryStats.genreLimit + 1))
            } else if (type == 'pie') {
                app.renderPieChart('.items-by-genre', app.selectedLibraryStats.genreCounts.slice(0, app.selectedLibraryStats.genreLimit + 1), app.selectedLibraryStats.genreList.slice(0, app.selectedLibraryStats.genreLimit));
            } else {
                console.error('Invalid chart type');
            }
        },
        renderCountryChart: function (type) {
            if (type == 'bar') {
                app.renderBarChart('.items-by-country', app.selectedLibraryStats.countriesUnwatchedCounts.slice(0, app.selectedLibraryStats.countryLimit + 1), app.selectedLibraryStats.countryList.slice(0, app.selectedLibraryStats.countryLimit), true, app.selectedLibraryStats.countriesWatchedCounts.slice(0, app.selectedLibraryStats.countryLimit + 1))
            } else if (type == 'pie') {
                app.renderPieChart('.items-by-country', app.selectedLibraryStats.countryCounts.slice(0, app.selectedLibraryStats.countryLimit + 1), app.selectedLibraryStats.countryList.slice(0, app.selectedLibraryStats.countryLimit));
            } else {
                console.error('Invalid chart type');
            }
        },
        renderDecadeChart: function (type) {
            if (type == 'bar') {
                app.renderBarChart('.items-by-decade', app.selectedLibraryStats.decadesUnwatchedCounts, decades, false, app.selectedLibraryStats.decadesWatchedCounts);
            } else if (type == 'pie') {
                app.renderPieChart('.items-by-decade', app.selectedLibraryStats.releaseDateCounts, decades);
            } else {
                console.error('Invalid chart type');
            }
        },
        renderStudioChart: function (type) {
            if (type == 'bar') {
                app.renderBarChart('.items-by-studio', app.selectedLibraryStats.studiosUnwatchedCounts.slice(0, app.selectedLibraryStats.studioLimit + 1), app.selectedLibraryStats.studioList.slice(0, app.selectedLibraryStats.studioLimit + 1), true, app.selectedLibraryStats.studiosWatchedCounts.slice(0, app.selectedLibraryStats.studioLimit + 1));
            } else if (type == 'pie') {
                app.renderPieChart('.items-by-studio', app.selectedLibraryStats.studioCounts.slice(0, app.selectedLibraryStats.studioLimit + 1), app.selectedLibraryStats.studioList.slice(0, app.selectedLibraryStats.studioLimit));
            } else {
                console.error('Invalid chart type');
            }
        },
        renderDirectorChart: function () {
            app.renderPieChart('.items-by-director', sortedDirectors);
        },
        renderActorChart: function () {
            app.renderPieChart('.items-by-actor', sortedActors);
        },
        renderWatchedGauge: function () {
            c3.generate({
                bindto: '.watched-gauge',
                data: {
                    columns: [
                        ['Watched:', Math.floor((app.selectedLibraryStats.watchedCount / parseInt(app.selectedLibraryStats.totalItems.replace(/,/g, ''))) * 100)]
                    ],
                    type: 'gauge'
                },
                gauge: {
                    label: {
                        format: function(value, ratio) {
                            return '';
                        },
                        show: false // to turn off the min/max labels.
                    },
                    width: 20 // for adjusting arc thickness
                },
                legend: {
                    show: false
                },
                color: {
                    pattern: ['#F75C03'], // the three color levels for the percentage values.
                },
                size: {
                    height: 75,
                    width: 150
                }
            });
        },
        updateLimit: function (limitType, updatedLimit) {
            // limitType is a string like "genre" and updatedLimit is a number
            // set the new limit, e.g. genreLimit = 10
            app.selectedLibraryStats[`${limitType}Limit`] = parseInt(updatedLimit);

            // render the new chart
            switch (limitType) {
                case 'genre':
                    app[`${limitType}Toggle`] == 'bar' ? app.renderGenreChart('pie') : app.renderGenreChart('bar');
                    break;
                case 'country':
                    app[`${limitType}Toggle`] == 'bar' ? app.renderCountryChart('pie') : app.renderCountryChart('bar');
                    break;
                case 'studio':
                    app[`${limitType}Toggle`] == 'bar' ? app.renderStudioChart('pie') : app.renderStudioChart('bar');
                    break;
                case 'director':
                    app.renderDirectorChart();
                    break;
                case 'actor':
                    app.renderActorChart();
                    break;
                default:
                    console.error('Invalid limit type');
            }
        }
    }
});

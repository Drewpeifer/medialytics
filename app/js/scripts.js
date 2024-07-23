////// WARNING
// Never share the following token with anyone! Do not host this on a public server with the token in place!
// Keep it secret, keep it safe! If compromised, generate a new one: https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/
const serverToken = 'SERVER_TOKEN',// ex: 'ad2T-askdjasd9WxJVBPQ'
serverIp = 'SERVER_IP',// ex: 'http://12.345.678.90:32400'
libraryListUrl = serverIp + '/library/sections?X-Plex-Token=' + serverToken,
// chart color theme
chartColors = ['#D62828', '#F75C03', '#F77F00', '#FCBF49', '#EAE2B7','#D62828', '#F75C03', '#F77F00', '#FCBF49', '#EAE2B7','#D62828', '#F75C03', '#F77F00', '#FCBF49', '#EAE2B7','#D62828', '#F75C03', '#F77F00', '#FCBF49', '#EAE2B7'],
recentLimit = 20,
recentlyAddedUrl = serverIp + '/library/recentlyAdded?X-Plex-Container-Start=0&X-Plex-Container-Size=' + recentLimit + '&X-Plex-Token=' + serverToken,
// below are the decade arrays used for the items by decade chart, any data outside of these decades will
// be collected but not displayed by the charts. Explicitly stating these instead of computing for easier customization of charts
decadePrefixes = ["191", "192", "193", "194", "195", "196", "197", "198", "199", "200", "201", "202"],// used for comparing raw release years
decades = ["2020s", "2010s", "2000s", "1990s", "1980s", "1970s", "1960s", "1950s", "1940s", "1930s", "1920s", "1910s"],// used for UI/chart display
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
// resolutions
resolutions = {},
resolutionList = [],
resolutionCounts = [],
resolutionsWatched = {},
resolutionsWatchedCounts = [],
resolutionsUnwatchedCounts = [],
// containers
containers = {},
containerList = [],
containerCounts = [],
containersWatched = {},
containersWatchedCounts = [],
containersUnwatchedCounts = [],
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
// directors
directors = {},
directorList = [],
directorCounts = [],
directorsWatched = {},
directorsWatchedCounts = [],
directorsUnwatchedCounts = [],
// actors
actors = {},
actorList = [],
actorCounts = [],
actorsWatched = {},
actorsWatchedCounts = [],
actorsUnwatchedCounts = [],
// writers
writers = {},
writerList = [],
writerCounts = [],
writersWatched = {},
writersWatchedCounts = [],
writersUnwatchedCounts = [],
// items by rating (scatter)
ratingsList = [],// list of objects that represent a movie / point on the scatter plot
ratingsContent = [],// list of unique content ratings
ratingsMovies = ['G', 'PG', 'PG-13', 'R'],
ratingsTV = ['TV-G', 'TV-Y', 'TV-Y7', 'TV-PG', 'TV-14', 'TV-MA'],
ratingsHighest = {},
ratingsLowest = {},
// items by content rating (bar)
contentRatings = {},
contentRatingList = [],
contentRatingCounts = [],
contentRatingsWatched = {},
contentRatingsWatchedCounts = [],
contentRatingsUnwatchedCounts = [],
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
resolutionLimit = 20,
newResolutionLimit = resolutionLimit,
containerLimit = 20,
newContainerLimit = containerLimit,
studioLimit = 20,
newStudioLimit = studioLimit,
directorLimit = 20,
newDirectorLimit = directorLimit,
actorLimit = 20,
newActorLimit = actorLimit,
decadeLimit = 20,
newDecadeLimit = decadeLimit,
writerLimit = 20,
newWriterLimit = writerLimit,
contentRatingLimit = 20,
newContentRatingLimit = contentRatingLimit;

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
    resolutions = {},
    resolutionList = [],
    resolutionCounts = [],
    resolutionsWatched = {},
    resolutionsWatchedCounts = [],
    resolutionsUnwatchedCounts = [],
    resolutionToggle = "",
    containers = {},
    containerList = [],
    containerCounts = [],
    containersWatched = {},
    containersWatchedCounts = [],
    containersUnwatchedCounts = [],
    containerToggle = "",
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
    decadeToggle = "",
    directors = {},
    directorList = [],
    directorCounts = [],
    directorsWatched = {},
    directorsWatchedCounts = [],
    directorsUnwatchedCounts = [],
    directorToggle = "",
    actors = {},
    actorList = [],
    actorCounts = [],
    actorsWatched = {},
    actorsWatchedCounts = [],
    actorsUnwatchedCounts = [],
    actorToggle = "",
    writers = {},
    writerList = [],
    writerCounts = [],
    writersWatched = {},
    writersWatchedCounts = [],
    writersUnwatchedCounts = [],
    writerToggle = "",
    contentRatings = {},
    contentRatingList = [],
    contentRatingCounts = [],
    contentRatingsWatched = {},
    contentRatingsWatchedCounts = [],
    contentRatingsUnwatchedCounts = [],
    contentRatingToggle = "",
    ratingsList = [],
    ratingsContent = [],
    ratingsMovies = ['G', 'PG', 'PG-13', 'R'],
    ratingsTV = ['TV-G', 'TV-Y', 'TV-Y7', 'TV-Y7-FV', 'TV-PG', 'TV-14', 'TV-MA'],
    ratingsHighest = {},
    ratingsLowest = {},
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

    data.data.MediaContainer.Metadata.forEach((item, index) => {
        /////////////////////////////////
        // start with the data that is library-type agnostic
        /////////////////////////////////

        /////////////////////////////////
        // track unmatched items
        if (item.guid.includes('local')) {
            if (debugMode) {
                console.log('unmatched item detected:');
                console.dir(item);
            }
            unmatchedItems.push(item.title);
        }
        /////////////////////////////////
        // track overall / total watched count, take any actions
        // for watched items that don't require extra parsing
        if (item.lastViewedAt) {
            watchedCount++;
            if (typeof item.year === 'number' || !isNaN(item.year)) {
                decadesWatchedList.push(item.year);
            }
        }
        /////////////////////////////////
        // track year
        if (typeof item.year === 'number' || !isNaN(item.year)) {
            releaseDateList.push(item.year);
        }
        /////////////////////////////////
        // track oldest release date
        if (oldestTitle == "" || new Date(item.originallyAvailableAt) < new Date(oldestReleaseDate)) {
            oldestTitle = item.title + ' (' + new Date(item.originallyAvailableAt).toLocaleDateString().replace(/\//g,'-') + ')';
            oldestReleaseDate = item.originallyAvailableAt;
        }
        /////////////////////////////////
        // track dateAdded (date added to file system)
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
        }
        /////////////////////////////////
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
        }
        /////////////////////////////////
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
        }
        /////////////////////////////////
        // track countries
        if (item.Country) {
            // check if a country exists for item
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
        }
        /////////////////////////////////
        // track actors
        if (item.Role) {
            // loop through each role
            item.Role.forEach((role, i) => {
                if (actors.hasOwnProperty(role.tag)) {
                    // if actor exists in the dictionary already,
                    // find the actor and increment the count
                    actors[role.tag]++;
                    // track the watched count for that actor
                    item.lastViewedAt ? actorsWatched[role.tag]++ : actorsWatched[role.tag];
                } else {
                    actors[role.tag] = 1;
                    item.lastViewedAt ? actorsWatched[role.tag] = 1 : actorsWatched[role.tag] = 0;
                }
            });
        }

        /////////////////////////////////
        // track audienceRating
        if (item.audienceRating) {
            // already ignoring items with no audienceRating, but if the item has no contentRating, or if
            // the contentRating is Not Rated or Unrated, set to "NR"
            if (!item.contentRating || item.contentRating == 'Not Rated' || item.contentRating == 'Unrated') {
                item.contentRating = 'NR';
            }
            // create ratings object and push it to ratingsList
            ratingsObj = {
                x: [item.contentRating],
                y: [item.audienceRating],
                mode: 'markers',
                type: 'scatter',
                name: ``,
                text: [`${item.title} (${item.year})`],
                marker: {
                    size: 5,
                    color: item.lastViewedAt ? chartColors[0] : chartColors[1],
                }
            }
            ratingsList.push(ratingsObj);
            // if content rating list doesn't contain contentRating, push it to list
            if (item.contentRating && !ratingsContent.includes(item.contentRating)) {
                ratingsContent.push(item.contentRating);
            }
            // track highest and lowest rated items
            if (ratingsHighest.y === undefined || item.audienceRating > ratingsHighest.y) {
                ratingsHighest = ratingsObj;
            }
            if (ratingsLowest.y === undefined || item.audienceRating < ratingsLowest.y) {
                ratingsLowest = ratingsObj;
            }
        }
        /////////////////////////////////
        // track content rating
        if (item.contentRating) {
            // if contentRating exists in the dictionary already,
            // find the contentRating and increment the count
            if (contentRatings.hasOwnProperty(item.contentRating)) {
                contentRatings[item.contentRating]++;
                // track the watched count for that contentRating
                item.lastViewedAt ? contentRatingsWatched[item.contentRating]++ : contentRatingsWatched[item.contentRating];
            } else {
                contentRatings[item.contentRating] = 1;
                item.lastViewedAt ? contentRatingsWatched[item.contentRating] = 1 : contentRatingsWatched[item.contentRating] = 0;
            }
        } else {
            // increment the "NR" count for items with no contentRating
            if (contentRatings.hasOwnProperty('NR')) {
                contentRatings['NR']++;
                // track the watched count for that contentRating
                item.lastViewedAt ? contentRatingsWatched['NR']++ : contentRatingsWatched['NR'];
            } else {
                contentRatings['NR'] = 1;
                item.lastViewedAt ? contentRatingsWatched['NR'] = 1 : contentRatingsWatched['NR'] = 0;
            }
        }

        /////////////////////////////////
        // begin aggregating library-type-specific data
        /////////////////////////////////

        if (type === 'movie') {
            /////////////////////////////////
            // track duration of this item
            if (!isNaN(item.duration)) {
                durationSum = durationSum + (item.duration/60000);
                // track longest duration for a movie in the library (runtime for movie, number of episodes for tv)
                if (longestDuration === 0 || item.duration > longestDuration) {
                    longestDuration = item.duration;
                    longestTitle = item.title;
                }
            }
            /////////////////////////////////
            // track resolutions and containers
            if (item.Media) {
                item.Media.forEach((media) => {
                    if (media.videoResolution) {
                        if (resolutions.hasOwnProperty(media.videoResolution)) {
                            // if resolution exists in the dictionary already,
                            // find the resolution and increment the count
                            resolutions[media.videoResolution]++;
                            // track the watched count for that resolution
                            item.lastViewedAt ? resolutionsWatched[media.videoResolution]++ : resolutionsWatched[media.videoResolution];
                        } else {
                            resolutions[media.videoResolution] = 1;
                            item.lastViewedAt ? resolutionsWatched[media.videoResolution] = 1 : resolutionsWatched[media.videoResolution] = 0;
                        }
                    }
                    if (media.container) {
                        if (containers.hasOwnProperty(media.container.toUpperCase())) {
                            // if container exists in the dictionary already,
                            // find the container and increment the count
                            containers[media.container.toUpperCase()]++;
                            // track the watched count for that container
                            item.lastViewedAt ? containersWatched[media.container.toUpperCase()]++ : containersWatched[media.container.toUpperCase()];
                        } else {
                            containers[media.container.toUpperCase()] = 1;
                            item.lastViewedAt ? containersWatched[media.container.toUpperCase()] = 1 : containersWatched[media.container.toUpperCase()] = 0;
                        }
                    }
                });
            }
            /////////////////////////////////
            // track directors
            if (item.Director) {
                // loop through each director
                item.Director.forEach((director, i) => {
                    if (directors.hasOwnProperty(director.tag)) {
                        // if director exists in the dictionary already,
                        // find the director and increment the count
                        directors[director.tag]++;
                        // track the watched count for that director
                        item.lastViewedAt ? directorsWatched[director.tag]++ : directorsWatched[director.tag];
                    } else {
                        directors[director.tag] = 1;
                        item.lastViewedAt ? directorsWatched[director.tag] = 1 : directorsWatched[director.tag] = 0;
                    }
                });
            }
            /////////////////////////////////
            // track writers
            if (item.Writer) {
                // loop through each writer
                item.Writer.forEach((writer, i) => {
                    if (writers.hasOwnProperty(writer.tag)) {
                        // if writer exists in the dictionary already,
                        // find the writer and increment the count
                        writers[writer.tag]++;
                        // track the watched count for that writer
                        item.lastViewedAt ? writersWatched[writer.tag]++ : writersWatched[writer.tag];
                    } else {
                        writers[writer.tag] = 1;
                        item.lastViewedAt ? writersWatched[writer.tag] = 1 : writersWatched[writer.tag] = 0;
                    }
                });
            }
        } else if (type === 'show') {
            /////////////////////////////////
            // track overall library season and episode counts
            seasonSum = seasonSum + item.childCount;
            episodeSum = episodeSum + parseInt(item.leafCount);
            /////////////////////////////////
            // approximate duration for this particular item
            if (!isNaN(item.duration)) {
                // multiply the avg episode length by the number of episodes to approximate total duration
                durationSum = durationSum + (item.duration/60000 * item.leafCount);
                // track longest duration for a show in the library (runtime for movie, number of episodes for tv)
                if (longestDuration === 0 || item.leafCount > longestDuration) {
                    longestDuration = item.leafCount;
                    longestTitle = item.title;
                }
            }
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
            // for every country in countryList, find the corresponding count in countriesWatched and push it to the sortedCountriesWatchedCounts array
            countryList.forEach((country) => {
                sortedCountriesWatchedCounts.push(countriesWatched[country]);
            });
            // copy sortedCountriesWatchedCounts to sortedCountriesUnwatchedCounts and set each value to the difference between the watched and total count for that country
            let sortedCountriesUnwatchedCounts = sortedCountriesWatchedCounts.slice();
            sortedCountriesUnwatchedCounts = sortedCountriesUnwatchedCounts.map((count, index) => {
                return countryCounts[index] - count;
            });

            //////////////////////////
            // items by resolution chart
            let sortedResolutions = [],
            sortedResolutionsWatchedCounts = [];
            // choosing not to report on undefined entries
            delete resolutions['undefined'];
            for (resolution in resolutions) {
                sortedResolutions.push([resolution, resolutions[resolution]]);
            }
            sortedResolutions.sort(function(a, b) {
                return b[1] - a[1];
            });
            // split the sorted resolutions dictionary into an array of resolutions and an array of counts
            for (property in sortedResolutions) {
                resolutionList.push(sortedResolutions[property][0]);
                resolutionCounts.push(sortedResolutions[property][1]);
            }
            // for every resolution in resolutionList, find the corresponding count in resolutionsWatched and push it to the sortedResolutionsWatchedCounts array
            resolutionList.forEach((resolution) => {
                sortedResolutionsWatchedCounts.push(resolutionsWatched[resolution]);
            });
            // copy sortedResolutionsWatchedCounts to sortedResolutionsUnwatchedCounts and set each value to the difference between the watched and total count for that resolution
            let sortedResolutionsUnwatchedCounts = sortedResolutionsWatchedCounts.slice();
            sortedResolutionsUnwatchedCounts = sortedResolutionsUnwatchedCounts.map((count, index) => {
                return resolutionCounts[index] - count;
            });

            //////////////////////////
            // items by container chart
            let sortedContainers = [],
            sortedContainersWatchedCounts = [];
            // choosing not to report on undefined entries
            delete containers['undefined'];
            for (container in containers) {
                sortedContainers.push([container, containers[container]]);
            }
            sortedContainers.sort(function(a, b) {
                return b[1] - a[1];
            });
            // split the sorted containers dictionary into an array of containers and an array of counts
            for (property in sortedContainers) {
                containerList.push(sortedContainers[property][0]);
                containerCounts.push(sortedContainers[property][1]);
            }
            // for every container in containerList, find the corresponding count in containersWatched and push it to the sortedContainersWatchedCounts array
            containerList.forEach((container) => {
                // make containers all caps
                sortedContainersWatchedCounts.push(containersWatched[container]);
            });
            // copy sortedContainersWatchedCounts to sortedContainersUnwatchedCounts and set each value to the difference between the watched and total count for that container
            let sortedContainersUnwatchedCounts = sortedContainersWatchedCounts.slice();
            sortedContainersUnwatchedCounts = sortedContainersUnwatchedCounts.map((count, index) => {
                return containerCounts[index] - count;
            });

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
            // for every genre in genreList, find the corresponding count in genresWatched and push it to the sortedGenresWatchedCounts array
            genreList.forEach((genre) => {
                sortedGenresWatchedCounts.push(genresWatched[genre]);
            });
            // copy sortedGenresWatchedCounts to sortedGenresUnwatchedCounts and set each value to the difference between the watched and total count for that genre
            let sortedGenresUnwatchedCounts = sortedGenresWatchedCounts.slice();
            sortedGenresUnwatchedCounts = sortedGenresUnwatchedCounts.map((count, index) => {
                return genreCounts[index] - count;
            });

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

            // for every studio in studioList, find the corresponding count in studiosWatched and push it to the sortedStudiosWatchedCounts array
            studioList.forEach((genre) => {
                sortedStudiosWatchedCounts.push(studiosWatched[genre]);
            });
            // copy sortedStudiosWatchedCounts to sortedStudiosUnwatchedCounts and set each value to the difference between the watched and total count for that studio
            let sortedStudiosUnwatchedCounts = sortedStudiosWatchedCounts.slice();
            sortedStudiosUnwatchedCounts = sortedStudiosUnwatchedCounts.map((count, index) => {
                return studioCounts[index] - count;
            });

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
            // reversing everything here makes the most recent decade appear first (left) in the chart,
            // which makes changing the chart limit a lot easier to manage
            // (sorting by highest count seems more confusing than chronologically in this case)
            releaseDateCounts.reverse();
            decadesWatchedCounts.reverse();
            decadesUnwatchedCounts.reverse();

            ////////////////////////
            // items by director chart
            // remove undefined entries from directors object
            directors = Object.keys(directors).reduce((object, key) => {
                if (key !== 'undefined') {
                    object[key] = directors[key];
                }
                return object;
            }
            , {});
            // sort the directors object by value
            directors = Object.entries(directors).sort((a, b) => b[1] - a[1]);

            // split the sorted director dictionary into an array of directors and an array of counts
            for (property in directors) {
                directorList.push(directors[property][0]);
                directorCounts.push(directors[property][1]);
            }
            let sortedDirectorsWatchedCounts = [];
            // for every director in directorList, find the corresponding count in directorsWatched and push it to the sortedDirectorsWatchedCounts array
            directorList.forEach((director) => {
                sortedDirectorsWatchedCounts.push(directorsWatched[director]);
            });
            // copy sortedDirectorsWatchedCounts to sortedDirectorsUnwatchedCounts and set each value to the difference between the watched and total count for that director
            let sortedDirectorsUnwatchedCounts = sortedDirectorsWatchedCounts.slice();
            sortedDirectorsUnwatchedCounts = sortedDirectorsUnwatchedCounts.map((count, index) => {
                return directorCounts[index] - count;
            });

            ////////////////////////
            // items by actor chart
            // remove undefined entries from actors object
            actors = Object.keys(actors).reduce((object, key) => {
                if (key !== 'undefined') {
                    object[key] = actors[key];
                }
                return object;
            }, {});
            // sort the actors object by value
            actors = Object.entries(actors).sort((a, b) => b[1] - a[1]);
            // split the sorted actors dictionary into an array of actors and an array of counts
            for (property in actors) {
                actorList.push(actors[property][0]);
                actorCounts.push(actors[property][1]);
            }
            // for every actor in actorList, find the corresponding count in actorsWatched and push it to the sortedActorsWatchedCounts array
            actorList.forEach((actor) => {
                actorsWatchedCounts.push(actorsWatched[actor]);
            });
            // copy sortedActorsWatchedCounts to sortedActorsUnwatchedCounts and set each value to the difference between the watched and total count for that actor
            let sortedActorsUnwatchedCounts = actorsWatchedCounts.slice();
            sortedActorsUnwatchedCounts = sortedActorsUnwatchedCounts.map((count, index) => {
                return actorCounts[index] - count;
            });

            ////////////////////////
            // items by writer chart
            let sortedWritersWatchedCounts = [];

            // choosing not to report on undefined entries
            delete writers['undefined'];
            // sort the writers object by value
            writers = Object.entries(writers).sort((a, b) => b[1] - a[1]);

            // split the sorted writer dictionary into an array of writers and an array of counts
            for (writer in writers) {
                writerList.push(writers[writer][0]);
                writerCounts.push(writers[writer][1]);
            }

            // for every writer in writerList, find the corresponding count in writersWatched and push it to the sortedWritersWatchedCounts array
            writerList.forEach((writer) => {
                sortedWritersWatchedCounts.push(writersWatched[writer]);
            });

            // copy sortedWritersWatchedCounts to sortedWritersUnwatchedCounts and set each value to the difference between the watched and total count for that writer
            let sortedWritersUnwatchedCounts = sortedWritersWatchedCounts.slice();
            sortedWritersUnwatchedCounts = sortedWritersUnwatchedCounts.map((count, index) => {
                return writerCounts[index] - count;
            });

            ////////////////////////
            // items by audienceRating VS contentRating chart (scatter)
            // ratingsContent is an array of all unique content ratings for this library in random order, but we
            // want them to be in a specific order, so we merge them with the curated lists of ratings for movies and tv
            // with the unqiue values appended to the end
            if (type === 'movie') {
                // for each item in ratingsContent, push it to ratingsMovies if it does not already exist
                ratingsContent.forEach((rating) => {
                    if (!ratingsMovies.includes(rating)) {
                        ratingsMovies.push(rating);
                    }
                });
            } else if (type === 'show') {
                ratingsContent.forEach((rating) => {
                    if (!ratingsTV.includes(rating)) {
                        ratingsTV.push(rating);
                    }
                });
            }

            ////////////////////////
            // items by contentRating chart (bar)
            let sortedContentRatings = [],
            sortedContentRatingsWatchedCounts = [];
            // choosing not to report on undefined entries
            delete contentRatings['undefined'];
            for (contentRating in contentRatings) {
                sortedContentRatings.push([contentRating, contentRatings[contentRating]]);
            }
            sortedContentRatings.sort(function(a, b) {
                return b[1] - a[1];
            });
            // split the sorted content ratings dictionary into an array of content ratings and an array of counts
            for (property in sortedContentRatings) {
                contentRatingList.push(sortedContentRatings[property][0]);
                contentRatingCounts.push(sortedContentRatings[property][1]);
            }
            console.log('contentRatingList: ', contentRatingList);
            console.log('contentRatingCounts: ', contentRatingCounts);
            // for every content rating in contentRatingList, find the corresponding count in contentRatingsWatched and push it to the sortedContentRatingsWatchedCounts array
            contentRatingList.forEach((contentRating) => {
                sortedContentRatingsWatchedCounts.push(contentRatingsWatched[contentRating]);
            });
            // copy sortedContentRatingsWatchedCounts to sortedContentRatingsUnwatchedCounts and set each value to the difference between the watched and total count for that content rating
            let sortedContentRatingsUnwatchedCounts = sortedContentRatingsWatchedCounts.slice();
            sortedContentRatingsUnwatchedCounts = sortedContentRatingsUnwatchedCounts.map((count, index) => {
                return contentRatingCounts[index] - count;
            });

            // reset all selectedLibraryStats
            app.selectedLibraryStats = {};
            // build the stats object for the selected library
            app.selectedLibraryStats = {
                totalItems: itemCount.toLocaleString(),
                totalDays: totalDays,
                displayHours: totalHours - (totalDays*24),
                displayMins: totalMins - (totalHours*60),
                topGenre: genreList[0],
                topGenreCount: genreCounts[0].toLocaleString(),
                totalGenreCount: Object.keys(genres).length.toLocaleString(),
                genreList: genreList,
                genreCounts: genreCounts,
                genresWatchedCounts : sortedGenresWatchedCounts,
                genresUnwatchedCounts : sortedGenresUnwatchedCounts,
                topCountry: countryList[0],
                topCountryCount: countryCounts[0].toLocaleString(),
                totalCountryCount: Object.keys(countries).length.toLocaleString(),
                countryCounts: countryCounts,
                countryList: countryList,
                countriesWatchedCounts : sortedCountriesWatchedCounts,
                countriesUnwatchedCounts : sortedCountriesUnwatchedCounts,
                resolutionCounts: resolutionCounts,
                resolutionList: resolutionList,
                resolutionsWatchedCounts : sortedResolutionsWatchedCounts,
                resolutionsUnwatchedCounts : sortedResolutionsUnwatchedCounts,
                topResolution: sortedResolutions.length > 1 ? resolutionList[0].toUpperCase() : "",
                topResolutionCount: sortedResolutions.length > 1 ? resolutionCounts[0].toLocaleString() : "",
                totalResolutionCount: Object.keys(resolutions).length.toLocaleString(),
                containerCounts: containerCounts,
                containerList: containerList,
                containersWatchedCounts : sortedContainersWatchedCounts,
                containersUnwatchedCounts : sortedContainersUnwatchedCounts,
                totalContainerCount: Object.keys(containers).length.toLocaleString(),
                topContainer: sortedContainers.length > 1 ? containerList[0].toUpperCase() : "",
                topContainerCount: sortedContainers.length > 1 ? containerCounts[0].toLocaleString() : "",
                topDecade: topDecade,
                topDecadeCount: topDecadeCount,
                totalDecadeCount: decades.length,
                releaseDateCounts: releaseDateCounts,
                oldestTitle: oldestTitle,
                decadesWatchedCounts : decadesWatchedCounts,
                decadesUnwatchedCounts : decadesUnwatchedCounts,
                studios: studios,
                topStudio: studioList[0],
                topStudioCount: studioCounts[0].toLocaleString(),
                totalStudioCount: Object.keys(studios).length.toLocaleString(),
                studioList: studioList,
                studioCounts: studioCounts,
                studiosWatchedCounts: sortedStudiosWatchedCounts,
                studiosUnwatchedCounts: sortedStudiosUnwatchedCounts,
                topDirector: Object.keys(directors).length > 0 ? directors[0][0] : "",
                topDirectorCount: Object.keys(directors).length > 0 ? directors[0][1].toLocaleString() : 0,
                totalDirectorCount: Object.keys(directors).length > 0 ? Object.keys(directors).length.toLocaleString() : 0,
                directorList: directorList,
                directorCounts: directorCounts,
                directorsWatchedCounts: sortedDirectorsWatchedCounts,
                directorsUnwatchedCounts: sortedDirectorsUnwatchedCounts,
                topActor: actors[0][0],
                topActorCount: actors[0][1].toLocaleString(),
                totalActorCount: Object.keys(actors).length.toLocaleString(),
                actorList: actorList,
                actorCounts: actorCounts,
                actorsWatchedCounts: actorsWatchedCounts,
                actorsUnwatchedCounts: sortedActorsUnwatchedCounts,
                topWriter: Object.keys(writers).length > 0 ? writers[0][0] : "",
                topWriterCount: Object.keys(writers).length > 0 ? writers[0][1].toLocaleString() : 0,
                totalWriterCount: Object.keys(writers).length > 0 ? Object.keys(writers).length.toLocaleString() : 0,
                writerList: writerList,
                writerCounts: writerCounts,
                writersWatchedCounts: sortedWritersWatchedCounts,
                writersUnwatchedCounts: sortedWritersUnwatchedCounts,
                ratingsList: ratingsList,
                ratingsHighest: `${ratingsHighest.text} - ${ratingsHighest.y} / ${ratingsHighest.x}`,
                ratingsLowest: `${ratingsLowest.text} - ${ratingsLowest.y} / ${ratingsLowest.x}`,
                topContentRating: contentRatingList[0],
                topContentRatingCount: contentRatingCounts[0].toLocaleString(),
                totalContentRatingCount: Object.keys(contentRatings).length.toLocaleString(),
                contentRatingList: contentRatingList,
                contentRatingCounts: contentRatingCounts,
                contentRatingsWatchedCounts: sortedContentRatingsWatchedCounts,
                contentRatingsUnwatchedCounts: sortedContentRatingsUnwatchedCounts,
                type: type,
                totalDuration: totalDays + " Days, " + displayHours + " Hours and " + displayMins + " Mins",
                seasonSum: seasonSum,
                episodeSum: episodeSum,
                studioLimit: studioLimit,
                newStudioLimit: newStudioLimit,
                countryLimit: countryLimit,
                newCountryLimit: newCountryLimit,
                genreLimit: genreLimit,
                newGenreLimit: newGenreLimit,
                resolutionLimit: resolutionLimit,
                newResolutionLimit: newResolutionLimit,
                containerLimit: containerLimit,
                newContainerLimit: newContainerLimit,
                decadeLimit: decadeLimit,
                newDecadeLimit: newDecadeLimit,
                directorLimit: directorLimit,
                newDirectorLimit: newDirectorLimit,
                actorLimit: actorLimit,
                newActorLimit: newActorLimit,
                writerLimit: writerLimit,
                newWriterLimit: newWriterLimit,
                contentRatingLimit: contentRatingLimit,
                newContentRatingLimit: newContentRatingLimit,
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
                console.log('Library Stats: ', app.selectedLibraryStats);
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
        resolutionToggle: "pie",
        containerToggle: "pie",
        genreToggle: "pie",
        countryToggle: "pie",
        studioToggle: "pie",
        directorToggle: "pie",
        actorToggle: "pie",
        decadeToggle: "pie",
        writerToggle: "pie",
        contentRatingToggle: "pie"
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
        renderScatterChart: function (type, ratingsList, selector) {
            if (debugMode) {
                console.log('rendering ratings chart: ', ratingsList);
            }
            let ratingsSuperset = type === 'movie' ? ratingsMovies : ratingsTV,
                layout = {
                showlegend: false,
                margin: {
                    pad: 10,
                },
                xaxis: {
                    title: 'Content Rating',
                    range: ratingsSuperset,
                    gridcolor: "#888",
                    showgrid: true,
                    categoryarray: ratingsSuperset,
                    categoryorder: 'array',
                },
                yaxis: {
                    title: 'Audience Rating (TMDB)',
                    range: [0, 11],
                    gridcolor: "#888",
                    showgrid: true,
                    zeroline: false,
                },
                font: {
                    color: '#fff',
                },
                plot_bgcolor: '#222',
                paper_bgcolor: '#222',
                hoverlabel: {
                    bordercolor: '#fff',
                    font: {
                        color: '#fff',
                        weight: 'bold',
                    },
                },
                hoverdistance: 1,
                scattermode: 'group',
                scattergap: .5,
                modebar: {
                    color: '#f2f2f2',
                    activecolor: chartColors[2],
                }
            };
            let config = {
                displaylogo: false,
                displayModeBar: true,
                modeBarButtonsToRemove: ['lasso2d', 'toImage'],
                responsive: true
            };

            Plotly.newPlot(selector, ratingsList, layout, config);
        },
        renderBarChart: function (selector, dataColumns, categories, rotated = true, stackGroup = []) {
            if (debugMode) {
                console.log('rendering chart: ', selector, dataColumns, categories, rotated, stackGroup)
            }
            if (rotated) {
                dataColumns = dataColumns.reverse();
                stackGroup = stackGroup.reverse();
                categories = categories.reverse();
            }
            // store the total for each column so we can show the ratio in tooltip
            let totalColumns = [];
            dataColumns.forEach((column, index) => {
                totalColumns.push(column + stackGroup[index]);
            });
            let trace1 = {
                x: rotated ? dataColumns : categories,
                y: rotated ? categories : dataColumns,
                name: 'Watched',
                type: 'bar',
                orientation: rotated ? 'h' : 'v',
                marker: {
                    color: chartColors[0]
                },
                hoverinfo: 'text',
                textposition: 'none',// this prevents the text from being shown on the bars
                text: totalColumns.map((total, index) => {
                    return `${categories[index]}<br />${dataColumns[index]} / ${total} Watched`
                })
            };

            let trace2 = {
                x: rotated ? stackGroup : categories,
                y: rotated ? categories : stackGroup,
                name: 'Unwatched',
                type: 'bar',
                orientation: rotated ? 'h' : 'v',
                marker: {
                    color: chartColors[1]
                },
                hoverinfo: 'text',
                textposition: 'none',// this prevents the text from being shown on the bars
                text: totalColumns.map((total, index) => {
                    return `${categories[index]}<br />${stackGroup[index]} / ${total} Unwatched`
                })
            };

            let data = [trace1, trace2];

            let layout = {
                barmode: 'stack',
                showlegend: false,
                margin: {
                    pad: 10,
                },
                modebar: {
                    color: '#f2f2f2',
                    activecolor: chartColors[2],
                },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                font: {
                    color: '#fff',
                },
                xaxis: {
                    type: 'category',
                }
            };

            let config = {
                responsive: true,
                displaylogo: false,
                displayModeBar: true,
                modeBarButtonsToRemove: ['lasso2d', 'toImage'],
            };

            Plotly.newPlot(selector, data, layout, config);
        },
        renderPieChart: function (selector, dataColumns, categories = []) {
            if (debugMode) {
                console.log('rendering chart: ', selector, dataColumns, categories)
            }
            let pieColumns = [];
            if (categories.length >= 1) {
                categories.forEach((item, index) => {
                    pieColumns.push([item, parseInt(dataColumns[index])]);
                });
            } else {
                pieColumns = dataColumns;
            }
            let data = [{
                values: dataColumns,
                labels: categories,
                hoverinfo: 'label+value+percent',
                textinfo: 'label',
                type: 'pie',
                marker: {
                    colors: chartColors
                }
              }];

              let layout = {
                margin: {
                    pad: 10,
                },
                modebar: {
                    color: '#f2f2f2',
                    activecolor: chartColors[2],
                },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                font: {
                    color: '#fff',
                }
              };

              let config = {
                responsive: true,
                displayModeBar: false,
              }

              Plotly.react(selector, data, layout, config);
        },
        renderDefaultCharts: function (type) {
            // render charts
            this.renderGenreChart('bar');
            this.renderCountryChart('bar');
            this.renderResolutionChart('bar');
            this.renderContainerChart('bar');
            this.renderDecadeChart('bar');
            this.renderStudioChart('bar');
            this.renderDirectorChart('bar');
            this.renderActorChart('bar');
            this.renderWriterChart('bar');
            this.renderContentRatingChart('bar');
            this.renderScatterChart(type, ratingsList, 'items-by-rating');
        },
        renderGenreChart: function (type) {
            if (type == 'bar') {
                app.renderBarChart('items-by-genre',app.selectedLibraryStats.genresWatchedCounts.slice(0, app.selectedLibraryStats.genreLimit), app.selectedLibraryStats.genreList.slice(0, app.selectedLibraryStats.genreLimit), false, app.selectedLibraryStats.genresUnwatchedCounts.slice(0, app.selectedLibraryStats.genreLimit))
            } else if (type == 'pie') {
                app.renderPieChart('items-by-genre', app.selectedLibraryStats.genreCounts.slice(0, app.selectedLibraryStats.genreLimit), app.selectedLibraryStats.genreList.slice(0, app.selectedLibraryStats.genreLimit));
            } else {
                console.error('Invalid chart type');
            }
        },
        renderCountryChart: function (type) {
            if (type == 'bar') {
                app.renderBarChart('items-by-country', app.selectedLibraryStats.countriesWatchedCounts.slice(0, app.selectedLibraryStats.countryLimit), app.selectedLibraryStats.countryList.slice(0, app.selectedLibraryStats.countryLimit), false, app.selectedLibraryStats.countriesUnwatchedCounts.slice(0, app.selectedLibraryStats.countryLimit))
            } else if (type == 'pie') {
                app.renderPieChart('items-by-country', app.selectedLibraryStats.countryCounts.slice(0, app.selectedLibraryStats.countryLimit), app.selectedLibraryStats.countryList.slice(0, app.selectedLibraryStats.countryLimit));
            } else {
                console.error('Invalid chart type');
            }
        },
        renderResolutionChart: function (type) {
            if (type == 'bar') {
                app.renderBarChart('items-by-resolution', app.selectedLibraryStats.resolutionsWatchedCounts.slice(0, app.selectedLibraryStats.resolutionLimit), app.selectedLibraryStats.resolutionList.slice(0, app.selectedLibraryStats.resolutionLimit), false, app.selectedLibraryStats.resolutionsUnwatchedCounts.slice(0, app.selectedLibraryStats.resolutionLimit))
            } else if (type == 'pie') {
                app.renderPieChart('items-by-resolution', app.selectedLibraryStats.resolutionCounts.slice(0, app.selectedLibraryStats.resolutionLimit), app.selectedLibraryStats.resolutionList.slice(0, app.selectedLibraryStats.resolutionLimit));
            } else {
                console.error('Invalid chart type');
            }
        },
        renderContainerChart: function (type) {
            if (type == 'bar') {
                app.renderBarChart('items-by-container', app.selectedLibraryStats.containersWatchedCounts.slice(0, app.selectedLibraryStats.containerLimit), app.selectedLibraryStats.containerList.slice(0, app.selectedLibraryStats.containerLimit), false, app.selectedLibraryStats.containersUnwatchedCounts.slice(0, app.selectedLibraryStats.containerLimit))
            } else if (type == 'pie') {
                app.renderPieChart('items-by-container', app.selectedLibraryStats.containerCounts.slice(0, app.selectedLibraryStats.containerLimit), app.selectedLibraryStats.containerList.slice(0, app.selectedLibraryStats.containerLimit));
            } else {
                console.error('Invalid chart type');
            }
        },
        renderDecadeChart: function (type) {
            if (type == 'bar') {
                app.renderBarChart('items-by-decade', app.selectedLibraryStats.decadesWatchedCounts.slice((app), app.selectedLibraryStats.decadeLimit), decades.slice(0, app.selectedLibraryStats.decadeLimit), false, app.selectedLibraryStats.decadesUnwatchedCounts.slice(0, app.selectedLibraryStats.decadeLimit));
            } else if (type == 'pie') {
                app.renderPieChart('items-by-decade', app.selectedLibraryStats.releaseDateCounts.slice(0, app.selectedLibraryStats.decadeLimit), decades.slice(0, app.selectedLibraryStats.decadeLimit));
            } else {
                console.error('Invalid chart type');
            }
        },
        renderStudioChart: function (type) {
            if (type == 'bar') {
                app.renderBarChart('items-by-studio', app.selectedLibraryStats.studiosWatchedCounts.slice(0, app.selectedLibraryStats.studioLimit), app.selectedLibraryStats.studioList.slice(0, app.selectedLibraryStats.studioLimit), false, app.selectedLibraryStats.studiosUnwatchedCounts.slice(0, app.selectedLibraryStats.studioLimit));
            } else if (type == 'pie') {
                app.renderPieChart('items-by-studio', app.selectedLibraryStats.studioCounts.slice(0, app.selectedLibraryStats.studioLimit), app.selectedLibraryStats.studioList.slice(0, app.selectedLibraryStats.studioLimit));
            } else {
                console.error('Invalid chart type');
            }
        },
        renderDirectorChart: function (type) {
            if (type == 'bar') {
                app.renderBarChart('items-by-director', app.selectedLibraryStats.directorsWatchedCounts.slice(0, app.selectedLibraryStats.directorLimit), app.selectedLibraryStats.directorList.slice(0, app.selectedLibraryStats.directorLimit), false, app.selectedLibraryStats.directorsUnwatchedCounts.slice(0, app.selectedLibraryStats.directorLimit));
            } else if (type == 'pie') {
                app.renderPieChart('items-by-director', app.selectedLibraryStats.directorCounts.slice(0, app.selectedLibraryStats.directorLimit), app.selectedLibraryStats.directorList.slice(0, app.selectedLibraryStats.directorLimit));
            } else {
                console.error('Invalid chart type');
            }
        },
        renderActorChart: function (type) {
            if (type == 'bar') {
                app.renderBarChart('items-by-actor', app.selectedLibraryStats.actorsWatchedCounts.slice(0, app.selectedLibraryStats.actorLimit), app.selectedLibraryStats.actorList.slice(0, app.selectedLibraryStats.actorLimit), false, app.selectedLibraryStats.actorsUnwatchedCounts.slice(0, app.selectedLibraryStats.actorLimit));
            } else if (type == 'pie') {
                app.renderPieChart('items-by-actor', app.selectedLibraryStats.actorCounts.slice(0, app.selectedLibraryStats.actorLimit), app.selectedLibraryStats.actorList.slice(0, app.selectedLibraryStats.actorLimit));
            } else {
                console.error('Invalid chart type');
            }
        },
        renderWriterChart: function (type) {
            if (type == 'bar') {
                app.renderBarChart('items-by-writer', app.selectedLibraryStats.writersWatchedCounts.slice(0, app.selectedLibraryStats.writerLimit), app.selectedLibraryStats.writerList.slice(0, app.selectedLibraryStats.writerLimit), false, app.selectedLibraryStats.writersUnwatchedCounts.slice(0, app.selectedLibraryStats.writerLimit));
            } else if (type == 'pie') {
                app.renderPieChart('items-by-writer', app.selectedLibraryStats.writerCounts.slice(0, app.selectedLibraryStats.writerLimit), app.selectedLibraryStats.writerList.slice(0, app.selectedLibraryStats.writerLimit));
            } else {
                console.error('Invalid chart type');
            }
        },
        renderContentRatingChart: function (type) {
            if (type == 'bar') {
                app.renderBarChart('items-by-content-rating', app.selectedLibraryStats.contentRatingsWatchedCounts.slice(0, app.selectedLibraryStats.contentRatingLimit), app.selectedLibraryStats.contentRatingList.slice(0, app.selectedLibraryStats.contentRatingLimit), false, app.selectedLibraryStats.contentRatingsUnwatchedCounts.slice(0, app.selectedLibraryStats.contentRatingLimit));
            } else if (type == 'pie') {
                app.renderPieChart('items-by-content-rating', app.selectedLibraryStats.contentRatingCounts.slice(0, app.selectedLibraryStats.contentRatingLimit), app.selectedLibraryStats.contentRatingList.slice(0, app.selectedLibraryStats.contentRatingLimit));
            } else {
                console.error('Invalid chart type');
            }
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
                    pattern: [chartColors[0]], // the three color levels for the percentage values.
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
                case 'resolution':
                app[`${limitType}Toggle`] == 'bar' ? app.renderResolutionChart('pie') : app.renderResolutionChart('bar');
                break;
                case 'container':
                app[`${limitType}Toggle`] == 'bar' ? app.renderContainerChart('pie') : app.renderContainerChart('bar');
                break;
                case 'decade':
                app[`${limitType}Toggle`] == 'bar' ? app.renderDecadeChart('pie') : app.renderDecadeChart('bar');
                break;
                case 'director':
                app[`${limitType}Toggle`] == 'bar' ? app.renderDirectorChart('pie') : app.renderDirectorChart('bar');
                break;
                case 'actor':
                app[`${limitType}Toggle`] == 'bar' ? app.renderActorChart('pie') : app.renderActorChart('bar');
                break;
                case 'writer':
                app[`${limitType}Toggle`] == 'bar' ? app.renderWriterChart('pie') : app.renderWriterChart('bar');
                break;
                case 'contentRating':
                app[`${limitType}Toggle`] == 'bar' ? app.renderContentRatingChart('pie') : app.renderContentRatingChart('bar');
                break;
                default:
                console.error('Invalid limit type');
            }
        }
    }
});
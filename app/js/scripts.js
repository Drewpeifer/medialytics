////// WARNING
// Never share the following token with anyone! Do not host this on a public server with the token in place!
// Keep it secret, keep it safe! If compromised, generate a new one: https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/
const serverToken = 'SERVER_TOKEN',// ex: 'ad2T-askdjasd9WxJVBPQ'
serverIp = 'SERVER_IP',// ex: 'http://12.345.678.90:32400'
libraryListUrl = serverIp + '/library/sections?X-Plex-Token=' + serverToken,
// chart color theme
chartColors = ['#D62828', '#FC9803', '#F77F00', '#FCBF49', '#EAE2B7','#D62828', '#F75C03', '#F77F00', '#FCBF49', '#EAE2B7','#D62828', '#F75C03', '#F77F00', '#FCBF49', '#EAE2B7','#D62828', '#F75C03', '#F77F00', '#FCBF49', '#EAE2B7'],
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
watchedCount = 0,// total watched items in a library
// genres
genreData = {
    data: {},// this stores genre: count, and is then split into the two following arrays
    list: [],
    counts: [],
    watched: {},// functions the same as genres object, but count is incremented only if the parsed item has been watched
    watchedCounts: [],
    unwatchedCounts: []
},
// countries
countryData = {
    data: {},// this stores country: count, and is then split into the two following arrays for the bar chart
    list: [],
    counts: [],
    watched: {},
    watchedCounts: [],
    unwatchedCounts: []
},
// resolutions
resolutionData = {
    data: {},
    list: [],
    counts: [],
    watched: {},
    watchedCounts: [],
    unwatchedCounts: []
},
// containers
containerData = {
    data: {},
    list: [],
    counts: [],
    watched: {},
    watchedCounts: [],
    unwatchedCounts: []
},
// release dates
releaseDateData = {
    list: [],// stores each instance of a release date
    counts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],// stores count of decades within releaseDateList (matched against decadePrefixes array for comparison)
    oldestTitle: "",// the oldest title in the library
    oldestReleaseDate: "",// the oldest release date in the library
    // watched status for the decades chart
    watchedList: [],
    watchedCounts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    unwatchedCounts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
},
// studios
studioData = {
    data: {},// this stores studio: count, and is then split into the two following arrays
    list: [],
    counts: [],
    watched: {},
    watchedCounts: [],
    unwatchedCounts: []
},
// directors
directorData = {
    data: {},
    list: [],
    counts: [],
    watched: {},
    watchedCounts: [],
    unwatchedCounts: []
},
// actors
actorData = {
    data: {},
    list: [],
    counts: [],
    watched: {},
    watchedCounts: [],
    unwatchedCounts: []
},
// writers
writerData = {
    data: {},
    list: [],
    counts: [],
    watched: {},
    watchedCounts: [],
    unwatchedCounts: []
},
// items by rating (scatter)
ratingsList = [],// list of objects that represent a movie / point on the scatter plot
ratingsContent = [],// list of unique content ratings
ratingsMovies = ['G', 'PG', 'PG-13', 'R'],
ratingsTV = ['TV-G', 'TV-Y', 'TV-Y7', 'TV-PG', 'TV-14', 'TV-MA'],
ratingsHighest = {},
ratingsLowest = {},
// items by content rating (bar)
contentRatingData = {
    data: {},
    list: [],
    counts: [],
    watched: {},
    watchedCounts: [],
    unwatchedCounts: []
},
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
// below are the limits for displaying data in the charts, e.g. "Top X Countries"
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
    countryData.data = {};
    countryData.list = [];
    countryData.counts = [];
    countryData.watched = {};
    countryData.watchedCounts = [];
    countryData.unwatchedCounts = [];
    countryToggle = "";
    genreData.data = {};
    genreData.list = [];
    genreData.counts = [];
    genreData.watched = {};
    genreData.watchedCounts = [];
    genreData.unwatchedCounts = [];
    genreToggle = "";
    resolutionData.data = {};
    resolutionData.list = [];
    resolutionData.counts = [];
    resolutionData.watched = {};
    resolutionData.watchedCounts = [];
    resolutionData.unwatchedCounts = [];
    resolutionToggle = "";
    containerData.data = {};
    containerData.list = [];
    containerData.counts = [];
    containerData.watched = {};
    containerData.watchedCounts = [];
    containerData.unwatchedCounts = [];
    containerToggle = "";
    studioData.data = {};
    studioData.list = [];
    studioData.counts = [];
    studioData.watched = {};
    studioData.watchedCounts = [];
    studioData.unwatchedCounts = [];
    studioToggle = "";
    releaseDateData.list = [];
    releaseDateData.counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    releaseDateData.oldestTitle = "";
    releaseDateData.oldestReleaseDate = "";
    releaseDateData.watchedList = [];
    releaseDateData.watchedCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    releaseDateData.unwatchedCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    decadeToggle = "";
    directorData.data = {};
    directorData.list = [];
    directorData.counts = [];
    directorData.watched = {};
    directorData.watchedCounts = [];
    directorData.unwatchedCounts = [];
    directorToggle = "";
    actorData.data = {};
    actorData.list = [];
    actorData.counts = [];
    actorData.watched = {};
    actorData.watchedCounts = [];
    actorData.unwatchedCounts = [];
    actorToggle = "";
    writerData.data = {};
    writerData.list = [];
    writerData.counts = [];
    writerData.watched = {};
    writerData.watchedCounts = [];
    writerData.unwatchedCounts = [];
    writerToggle = "";
    contentRatingData.data = {};
    contentRatingData.list = [];
    contentRatingData.counts = [];
    contentRatingData.watched = {};
    contentRatingData.watchedCounts = [];
    contentRatingData.unwatchedCounts = [];
    contentRatingToggle = "";
    ratingsList = [];
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
    watchedCount = 0,
    type = "";
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

const prepareCategoryChartData = (categoryData) => {
    const internalData = categoryData.data;
    delete internalData['undefined']; // Remove undefined keys

    // Sort by count descending
    const sortedEntries = Object.entries(internalData).sort((a, b) => b[1] - a[1]);

    const list = [];
    const counts = [];
    const watchedCounts = [];
    const unwatchedCounts = [];

    sortedEntries.forEach(entry => {
        const key = entry[0];
        const totalCount = entry[1];
        list.push(key);
        counts.push(totalCount);
        const watchedCount = categoryData.watched[key] || 0;
        watchedCounts.push(watchedCount);
        unwatchedCounts.push(totalCount - watchedCount);
    });

    return {
        list: list,
        counts: counts,
        watched: watchedCounts,
        unwatched: unwatchedCounts,
        sortedEntries: sortedEntries // Retaining for direct topX access if needed before selectedLibraryStats is built
    };
};

const prepareDecadeChartData = (currentReleaseDateData, decadesArray, decadePrefixesArray) => {
    // Ensure counts are based on the original list, not the reversed one from previous runs.
    // Resetting here or ensuring resetLibraryStats does a full clear is important.
    // For this function, we assume currentReleaseDateData.list and .watchedList are fresh.
    let liveCounts = Array(decadePrefixesArray.length).fill(0);
    let liveWatchedCounts = Array(decadePrefixesArray.length).fill(0);

    currentReleaseDateData.list.forEach((year) => {
        if (typeof year === 'number' && !isNaN(year)) {
            let yearStr = year.toString();
            let yearPrefix = yearStr.substring(0, 3);
            for (let i = 0; i < decadePrefixesArray.length; i++) {
                if (yearPrefix === decadePrefixesArray[i]) {
                    liveCounts[i]++;
                    break;
                }
            }
        }
    });

    currentReleaseDateData.watchedList.forEach((year) => {
        if (typeof year === 'number' && !isNaN(year)) {
            let yearStr = year.toString();
            let yearPrefix = yearStr.substring(0, 3);
            for (let i = 0; i < decadePrefixesArray.length; i++) {
                if (yearPrefix === decadePrefixesArray[i]) {
                    liveWatchedCounts[i]++;
                    break;
                }
            }
        }
    });

    let liveUnwatchedCounts = liveCounts.map((count, index) => {
        return Math.abs(count - liveWatchedCounts[index]);
    });

    // Data is processed based on decadePrefixes (oldest to newest like 191*, 192* etc.)
    // Charts typically display newest first, so reverse all processed arrays.
    // The global 'decades' array is already newest to oldest ("2020s", "2010s", ...).
    liveCounts.reverse();
    liveWatchedCounts.reverse();
    liveUnwatchedCounts.reverse();

    // The list for the chart should correspond to the reversed counts.
    // The global 'decades' array is already in the "Newest to Oldest" order desired for display.
    return {
        list: decadesArray, // This is the global 'decades' array, already in 'Newest to Oldest'
        counts: liveCounts,
        watched: liveWatchedCounts,
        unwatched: liveUnwatchedCounts
    };
};


const processItemCounts = (item, categoryData, itemPropertyKey, singleValue = false) => {
    let values = [];
    const property = item[itemPropertyKey]; // Get the property once

    if (property) {
        if (singleValue) {
            // Ensure property is treated as a direct value, e.g. item.studio or media.videoResolution
            values.push(property.tag ? property.tag : property.toString().toUpperCase());
        } else {
            // Ensure property is an array and has .forEach, e.g. item.Genre
            if (Array.isArray(property)) {
                property.forEach(prop => values.push(prop.tag));
            } else if (property.tag) { // Handle cases where a non-single value might be a single object with a tag
                values.push(property.tag);
            }
        }
    }

    values.forEach(value => {
        if (value) { // Ensure value is not undefined or null
            if (categoryData.data.hasOwnProperty(value)) {
                categoryData.data[value]++;
            } else {
                categoryData.data[value] = 1;
            }
            // Initialize watched count if not present
            if (!categoryData.watched.hasOwnProperty(value)) {
                categoryData.watched[value] = 0;
            }
            if (item.lastViewedAt) {
                categoryData.watched[value]++;
            }
        }
    });
};

const updateOldestAndLatestItems = (item, currentReleaseDateData, currentFirstAdded, currentFirstAddedDate, currentLastAdded, currentLastAddedDate) => {
    let updatedReleaseData = { ...currentReleaseDateData };
    let updatedFirstAdded = currentFirstAdded;
    let updatedFirstAddedDate = currentFirstAddedDate;
    let updatedLastAdded = currentLastAdded;
    let updatedLastAddedDate = currentLastAddedDate;

    // Track oldest release date
    if (item.originallyAvailableAt && (updatedReleaseData.oldestTitle === "" || new Date(item.originallyAvailableAt) < new Date(updatedReleaseData.oldestReleaseDate))) {
        updatedReleaseData.oldestTitle = item.title + ' (' + new Date(item.originallyAvailableAt).toLocaleDateString().replace(/\//g, '-') + ')';
        updatedReleaseData.oldestReleaseDate = item.originallyAvailableAt;
    }

    // Track dateAdded (date added to file system)
    if (item.addedAt) {
        let itemDate = new Date(item.addedAt * 1000);
        if (updatedFirstAdded === "" || itemDate < updatedFirstAddedDate) {
            updatedFirstAdded = item.title;
            updatedFirstAddedDate = itemDate;
        }
        if (updatedLastAdded === "" || itemDate > updatedLastAddedDate) {
            updatedLastAdded = item.title;
            updatedLastAddedDate = itemDate;
        }
    }
    return {
        releaseDateData: updatedReleaseData,
        firstAdded: updatedFirstAdded,
        firstAddedDate: updatedFirstAddedDate,
        lastAdded: updatedLastAdded,
        lastAddedDate: updatedLastAddedDate
    };
};

const processMediaSpecificData = (item, type, currentDurationSum, currentLongestDuration, currentLongestTitle, currentSeasonSum, currentEpisodeSum) => {
    let newDurationSum = currentDurationSum;
    let newLongestDuration = currentLongestDuration;
    let newLongestTitle = currentLongestTitle;
    let newSeasonSum = currentSeasonSum;
    let newEpisodeSum = currentEpisodeSum;

    if (type === 'movie') {
        if (item.duration && !isNaN(item.duration)) {
            newDurationSum += (item.duration / 60000);
            if (newLongestDuration === 0 || item.duration > newLongestDuration) {
                newLongestDuration = item.duration;
                newLongestTitle = item.title;
            }
        }
        if (item.Media) {
            item.Media.forEach((mediaItem) => {
                if (mediaItem.videoResolution) {
                    const syntheticResolutionItem = { videoResolution: mediaItem.videoResolution, lastViewedAt: item.lastViewedAt };
                    processItemCounts(syntheticResolutionItem, resolutionData, 'videoResolution', true);
                }
                if (mediaItem.container) {
                    const syntheticContainerItem = { container: mediaItem.container, lastViewedAt: item.lastViewedAt };
                    processItemCounts(syntheticContainerItem, containerData, 'container', true);
                }
            });
        }
        processItemCounts(item, directorData, 'Director');
        processItemCounts(item, writerData, 'Writer');

    } else if (type === 'show') {
        if (item.childCount) newSeasonSum += item.childCount;
        if (item.leafCount) newEpisodeSum += parseInt(item.leafCount);
        if (item.duration && !isNaN(item.duration) && item.leafCount) {
            newDurationSum += (item.duration / 60000 * item.leafCount);
            if (newLongestDuration === 0 || item.leafCount > newLongestDuration) {
                newLongestDuration = item.leafCount;
                newLongestTitle = item.title;
            }
        }
    }
    return {
        durationSum: newDurationSum,
        longestDuration: newLongestDuration,
        longestTitle: newLongestTitle,
        seasonSum: newSeasonSum,
        episodeSum: newEpisodeSum
    };
};


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
                releaseDateData.watchedList.push(item.year);
            }
        }
        /////////////////////////////////
        // track year
        if (typeof item.year === 'number' || !isNaN(item.year)) {
            releaseDateData.list.push(item.year);
        }
        /////////////////////////////////
        // track oldest release date and added dates
        const oldestAndLatestData = updateOldestAndLatestItems(item, releaseDateData, firstAdded, firstAddedDate, lastAdded, lastAddedDate);
        releaseDateData = oldestAndLatestData.releaseDateData;
        firstAdded = oldestAndLatestData.firstAdded;
        firstAddedDate = oldestAndLatestData.firstAddedDate;
        lastAdded = oldestAndLatestData.lastAdded;
        lastAddedDate = oldestAndLatestData.lastAddedDate;

        /////////////////////////////////
        // track studio, genres, countries, actors, content ratings
        processItemCounts(item, studioData, 'studio', true);
        processItemCounts(item, genreData, 'Genre');
        processItemCounts(item, countryData, 'Country');
        processItemCounts(item, actorData, 'Role');
        processItemCounts(item, contentRatingData, 'contentRating', true);
        // Special handling for contentRating 'NR' if item.contentRating is missing
        if (!item.contentRating) {
            if (contentRatingData.data.hasOwnProperty('NR')) {
                contentRatingData.data['NR']++;
            } else {
                contentRatingData.data['NR'] = 1;
            }
            if (!contentRatingData.watched.hasOwnProperty('NR')) {
                contentRatingData.watched['NR'] = 0;
            }
            if (item.lastViewedAt) {
                contentRatingData.watched['NR']++;
            }
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
        /////////////////////////////////
        // begin aggregating library-type-specific data
        const mediaSpecificResult = processMediaSpecificData(item, type, durationSum, longestDuration, longestTitle, seasonSum, episodeSum);
        durationSum = mediaSpecificResult.durationSum;
        longestDuration = mediaSpecificResult.longestDuration;
        longestTitle = mediaSpecificResult.longestTitle;
        seasonSum = mediaSpecificResult.seasonSum;
        episodeSum = mediaSpecificResult.episodeSum;

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
            // Prepare data for charts
            const preparedCountryData = prepareCategoryChartData(countryData);
            countryData.chartList = preparedCountryData.list;
            countryData.chartCounts = preparedCountryData.counts;
            countryData.chartWatchedCounts = preparedCountryData.watched;
            countryData.chartUnwatchedCounts = preparedCountryData.unwatched;
            // Keep sortedEntries for topX if needed directly, e.g. for topResolution
            const sortedResolutions = prepareCategoryChartData(resolutionData).sortedEntries;
            const preparedResolutionData = prepareCategoryChartData(resolutionData);
            resolutionData.chartList = preparedResolutionData.list;
            resolutionData.chartCounts = preparedResolutionData.counts;
            resolutionData.chartWatchedCounts = preparedResolutionData.watched;
            resolutionData.chartUnwatchedCounts = preparedResolutionData.unwatched;

            const sortedContainers = prepareCategoryChartData(containerData).sortedEntries;
            const preparedContainerData = prepareCategoryChartData(containerData);
            containerData.chartList = preparedContainerData.list;
            containerData.chartCounts = preparedContainerData.counts;
            containerData.chartWatchedCounts = preparedContainerData.watched;
            containerData.chartUnwatchedCounts = preparedContainerData.unwatched;

            const preparedGenreData = prepareCategoryChartData(genreData);
            genreData.chartList = preparedGenreData.list;
            genreData.chartCounts = preparedGenreData.counts;
            genreData.chartWatchedCounts = preparedGenreData.watched;
            genreData.chartUnwatchedCounts = preparedGenreData.unwatched;

            const preparedStudioData = prepareCategoryChartData(studioData);
            studioData.chartList = preparedStudioData.list;
            studioData.chartCounts = preparedStudioData.counts;
            studioData.chartWatchedCounts = preparedStudioData.watched;
            studioData.chartUnwatchedCounts = preparedStudioData.unwatched;

            const preparedDirectorData = prepareCategoryChartData(directorData);
            directorData.chartList = preparedDirectorData.list;
            directorData.chartCounts = preparedDirectorData.counts;
            directorData.chartWatchedCounts = preparedDirectorData.watched;
            directorData.chartUnwatchedCounts = preparedDirectorData.unwatched;

            const preparedActorData = prepareCategoryChartData(actorData);
            actorData.chartList = preparedActorData.list;
            actorData.chartCounts = preparedActorData.counts;
            actorData.chartWatchedCounts = preparedActorData.watched;
            actorData.chartUnwatchedCounts = preparedActorData.unwatched;

            const preparedWriterData = prepareCategoryChartData(writerData);
            writerData.chartList = preparedWriterData.list;
            writerData.chartCounts = preparedWriterData.counts;
            writerData.chartWatchedCounts = preparedWriterData.watched;
            writerData.chartUnwatchedCounts = preparedWriterData.unwatched;

            const preparedContentRatingData = prepareCategoryChartData(contentRatingData);
            contentRatingData.chartList = preparedContentRatingData.list;
            contentRatingData.chartCounts = preparedContentRatingData.counts;
            contentRatingData.chartWatchedCounts = preparedContentRatingData.watched;
            contentRatingData.chartUnwatchedCounts = preparedContentRatingData.unwatched;

            // Decade data processing
            const preparedDecadeData = prepareDecadeChartData(releaseDateData, decades, decadePrefixes);
            // Note: releaseDateData itself is updated globally by prepareDecadeChartData for its .list, .counts etc.
            // but we'll use the returned object for clarity in selectedLibraryStats
            let topDecade = "";
            let topDecadeCount = 0;
            if (preparedDecadeData.counts.length > 0) {
                // Find the original (un-reversed) index of max count to get correct decade name
                const originalCountsForTopDecade = [...preparedDecadeData.counts].reverse(); // un-reverse for correct index
                const maxCount = Math.max(...originalCountsForTopDecade);
                const originalIndexOfMax = originalCountsForTopDecade.indexOf(maxCount);
                // The `decades` global is newest to oldest. `decadePrefixes` is oldest to newest.
                // `preparedDecadeData.list` is newest to oldest.
                // `preparedDecadeData.counts` is newest to oldest.
                // So, the index from reversed preparedDecadeData.counts matches the `decades` (global) array.
                 topDecade = decades[preparedDecadeData.counts.indexOf(Math.max(...preparedDecadeData.counts))];
                 topDecadeCount = Math.max(...preparedDecadeData.counts).toLocaleString();
            }


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
            // This was already handled by prepareCategoryChartData(contentRatingData)
            console.log('contentRatingData.chartList: ', contentRatingData.chartList);
            console.log('contentRatingData.chartCounts: ', contentRatingData.chartCounts);

            // reset all selectedLibraryStats
            app.selectedLibraryStats = {};
            // build the stats object for the selected library
            app.selectedLibraryStats = {
                totalItems: itemCount.toLocaleString(),
                totalDays: totalDays,
                displayHours: totalHours - (totalDays*24),
                displayMins: totalMins - (totalHours*60),
                topGenre: preparedGenreData.list.length > 0 ? preparedGenreData.list[0] : "",
                topGenreCount: preparedGenreData.counts.length > 0 ? preparedGenreData.counts[0].toLocaleString() : "",
                totalGenreCount: preparedGenreData.list.length.toLocaleString(),
                genreList: preparedGenreData.list,
                genreCounts: preparedGenreData.counts,
                genresWatchedCounts : preparedGenreData.watched,
                genresUnwatchedCounts : preparedGenreData.unwatched,
                topCountry: preparedCountryData.list.length > 0 ? preparedCountryData.list[0] : "",
                topCountryCount: preparedCountryData.counts.length > 0 ? preparedCountryData.counts[0].toLocaleString() : "",
                totalCountryCount: preparedCountryData.list.length.toLocaleString(),
                countryCounts: preparedCountryData.counts,
                countryList: preparedCountryData.list,
                countriesWatchedCounts : preparedCountryData.watched,
                countriesUnwatchedCounts : preparedCountryData.unwatched,
                resolutionCounts: preparedResolutionData.counts,
                resolutionList: preparedResolutionData.list,
                resolutionsWatchedCounts : preparedResolutionData.watched,
                resolutionsUnwatchedCounts : preparedResolutionData.unwatched,
                topResolution: preparedResolutionData.list.length > 0 ? preparedResolutionData.list[0].toUpperCase() : "",
                topResolutionCount: preparedResolutionData.counts.length > 0 ? preparedResolutionData.counts[0].toLocaleString() : "",
                totalResolutionCount: preparedResolutionData.list.length.toLocaleString(),
                containerCounts: preparedContainerData.counts,
                containerList: preparedContainerData.list,
                containersWatchedCounts : preparedContainerData.watched,
                containersUnwatchedCounts : preparedContainerData.unwatched,
                totalContainerCount: preparedContainerData.list.length.toLocaleString(),
                topContainer: preparedContainerData.list.length > 0 ? preparedContainerData.list[0].toUpperCase() : "",
                topContainerCount: preparedContainerData.counts.length > 0 ? preparedContainerData.counts[0].toLocaleString() : "",
                topDecade: topDecade, // Calculated above from preparedDecadeData
                topDecadeCount: topDecadeCount, // Calculated above from preparedDecadeData
                totalDecadeCount: preparedDecadeData.list.length, // Should be decades.length
                releaseDateCounts: preparedDecadeData.counts, // from helper
                oldestTitle: releaseDateData.oldestTitle, // from direct update
                decadesWatchedCounts : preparedDecadeData.watched, // from helper
                decadesUnwatchedCounts : preparedDecadeData.unwatched, // from helper
                studios: studioData.data, // Keep raw data if needed elsewhere, though charts use prepared
                topStudio: preparedStudioData.list.length > 0 ? preparedStudioData.list[0] : "",
                topStudioCount: preparedStudioData.counts.length > 0 ? preparedStudioData.counts[0].toLocaleString() : "",
                totalStudioCount: preparedStudioData.list.length.toLocaleString(),
                studioList: preparedStudioData.list,
                studioCounts: preparedStudioData.counts,
                studiosWatchedCounts: preparedStudioData.watched,
                studiosUnwatchedCounts: preparedStudioData.unwatched,
                topDirector: preparedDirectorData.list.length > 0 ? preparedDirectorData.list[0] : "",
                topDirectorCount: preparedDirectorData.counts.length > 0 ? preparedDirectorData.counts[0].toLocaleString() : "",
                totalDirectorCount: preparedDirectorData.list.length.toLocaleString(),
                directorList: preparedDirectorData.list,
                directorCounts: preparedDirectorData.counts,
                directorsWatchedCounts: preparedDirectorData.watched,
                directorsUnwatchedCounts: preparedDirectorData.unwatched,
                topActor: preparedActorData.list.length > 0 ? preparedActorData.list[0] : "",
                topActorCount: preparedActorData.counts.length > 0 ? preparedActorData.counts[0].toLocaleString() : "",
                totalActorCount: preparedActorData.list.length.toLocaleString(),
                actorList: preparedActorData.list,
                actorCounts: preparedActorData.counts,
                actorsWatchedCounts: preparedActorData.watched,
                actorsUnwatchedCounts: preparedActorData.unwatched,
                topWriter: preparedWriterData.list.length > 0 ? preparedWriterData.list[0] : "",
                topWriterCount: preparedWriterData.counts.length > 0 ? preparedWriterData.counts[0].toLocaleString() : "",
                totalWriterCount: preparedWriterData.list.length.toLocaleString(),
                writerList: preparedWriterData.list,
                writerCounts: preparedWriterData.counts,
                writersWatchedCounts: preparedWriterData.watched,
                writersUnwatchedCounts: preparedWriterData.unwatched,
                ratingsList: ratingsList, // Direct from earlier processing
                ratingsHighest: ratingsHighest.text ? `${ratingsHighest.text} - ${ratingsHighest.y} / ${ratingsHighest.x}` : "",
                ratingsLowest: ratingsLowest.text ? `${ratingsLowest.text} - ${ratingsLowest.y} / ${ratingsLowest.x}` : "",
                topContentRating: preparedContentRatingData.list.length > 0 ? preparedContentRatingData.list[0] : "",
                topContentRatingCount: preparedContentRatingData.counts.length > 0 ? preparedContentRatingData.counts[0].toLocaleString() : "",
                totalContentRatingCount: preparedContentRatingData.list.length.toLocaleString(),
                contentRatingList: preparedContentRatingData.list,
                contentRatingCounts: preparedContentRatingData.counts,
                contentRatingsWatchedCounts: preparedContentRatingData.watched,
                contentRatingsUnwatchedCounts: preparedContentRatingData.unwatched,
                type: type.length > 0 ? type : "",
                totalDuration: totalDays + " Days, " + displayHours + " Hours, " + displayMins + " Mins",
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
            this.availableLibraries = parseLibraryList(response.data); // Use this.
            // if debug mode is enabled, log data into the console:
            if (this.debugMode) { // Use this.
                console.log('*** DEBUG MODE ENABLED ***');
                console.log('Welcome to Medialytics!');
                console.log('Server IP: ', this.serverIp); // Use this.
                console.log('Server Token: ', this.serverToken); // Use this.
                console.log('Available Libraries: ', this.availableLibraries); // Use this.
            }
        });
    },
    methods: {
        // High-level methods
        renderDefaultCharts: function () {
            this.renderGenreChart(this.genreToggle);
            this.renderCountryChart(this.countryToggle);
            this.renderResolutionChart(this.resolutionToggle);
            this.renderContainerChart(this.containerToggle);
            this.renderDecadeChart(this.decadeToggle);
            this.renderStudioChart(this.studioToggle);
            this.renderDirectorChart(this.directorToggle);
            this.renderActorChart(this.actorToggle);
            this.renderWriterChart(this.writerToggle);
            this.renderContentRatingChart(this.contentRatingToggle);
            if (this.selectedLibraryStats && this.selectedLibraryStats.type && this.selectedLibraryStats.ratingsList) {
                this.renderScatterChart(this.selectedLibraryStats.type, this.selectedLibraryStats.ratingsList, 'items-by-rating');
            }
        },
        updateLimit: function (limitType, updatedLimit) {
            this.selectedLibraryStats[`${limitType}Limit`] = parseInt(updatedLimit);
            const toggleProperty = `${limitType}Toggle`;
            const currentChartType = this[toggleProperty]; // e.g., this.genreToggle
            const newChartType = currentChartType === 'bar' ? 'pie' : 'bar'; // Determine the *other* type to render

            // Call the specific render<Topic>Chart method with the *new* chart type
            // This preserves the behavior of switching chart type upon limit update.
            // The specific render<Topic>Chart method will then call renderCategoricalChart.
            switch (limitType) {
                case 'genre': this.renderGenreChart(newChartType); break;
                case 'country': this.renderCountryChart(newChartType); break;
                case 'studio': this.renderStudioChart(newChartType); break;
                case 'resolution': this.renderResolutionChart(newChartType); break;
                case 'container': this.renderContainerChart(newChartType); break;
                case 'decade': this.renderDecadeChart(newChartType); break;
                case 'director': this.renderDirectorChart(newChartType); break;
                case 'actor': this.renderActorChart(newChartType); break;
                case 'writer': this.renderWriterChart(newChartType); break;
                case 'contentRating': this.renderContentRatingChart(newChartType); break;
                default: console.error('Invalid limit type');
            }
        },
        // Generic rendering helper
        renderCategoricalChart: function(categoryName, chartType) {
            const selector = 'items-by-' + categoryName;
            let list, counts, watchedCounts, unwatchedCounts, limit;
            let shortLabels = false;
            const rotated = false;

            if (categoryName === 'decade') {
                list = decades;
                counts = this.selectedLibraryStats.releaseDateCounts;
                watchedCounts = this.selectedLibraryStats.decadesWatchedCounts;
                unwatchedCounts = this.selectedLibraryStats.decadesUnwatchedCounts;
                limit = this.selectedLibraryStats.decadeLimit;
                shortLabels = true;
            } else {
                const listProp = categoryName + 'List';
                const countsProp = categoryName + 'Counts';
                const watchedProp = categoryName + 'sWatchedCounts';
                const unwatchedProp = categoryName + 'sUnwatchedCounts';
                const limitProp = categoryName + 'Limit';

                list = this.selectedLibraryStats[listProp];
                counts = this.selectedLibraryStats[countsProp];
                watchedCounts = this.selectedLibraryStats[watchedProp];
                unwatchedCounts = this.selectedLibraryStats[unwatchedProp];
                limit = this.selectedLibraryStats[limitProp];

                if (categoryName === 'resolution' || categoryName === 'container') {
                    shortLabels = true;
                }
            }

            if (!list || !counts || !watchedCounts || !unwatchedCounts || typeof limit === 'undefined') {
                console.error('Chart data or limit is missing for category:', categoryName, this.selectedLibraryStats);
                return;
            }

            const currentList = list.slice(0, limit);
            const currentCounts = counts.slice(0, limit);
            const currentWatched = watchedCounts.slice(0, limit);
            const currentUnwatched = unwatchedCounts.slice(0, limit);

            if (chartType === 'bar') {
                this.renderBarChart(selector, currentWatched, currentList, rotated, currentUnwatched, shortLabels);
            } else if (chartType === 'pie') {
                this.renderPieChart(selector, currentCounts, currentList);
            } else {
                console.error('Invalid chart type for renderCategoricalChart:', chartType);
            }
        },
        // Specific rendering wrappers
        renderGenreChart: function (type) { this.renderCategoricalChart('genre', type); },
        renderCountryChart: function (type) { this.renderCategoricalChart('country', type); },
        renderResolutionChart: function (type) { this.renderCategoricalChart('resolution', type); },
        renderContainerChart: function (type) { this.renderCategoricalChart('container', type); },
        renderDecadeChart: function (type) { this.renderCategoricalChart('decade', type); },
        renderStudioChart: function (type) { this.renderCategoricalChart('studio', type); },
        renderDirectorChart: function (type) { this.renderCategoricalChart('director', type); },
        renderActorChart: function (type) { this.renderCategoricalChart('actor', type); },
        renderWriterChart: function (type) { this.renderCategoricalChart('writer', type); },
        renderContentRatingChart: function (type) { this.renderCategoricalChart('contentRating', type); },
        // Core Plotly interaction methods
        renderScatterChart: function (type, ratingsList, selector) {
            if (this.debugMode) { // Use this.
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
                plot_bgcolor: 'transparent',
                paper_bgcolor: 'transparent',
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
        renderBarChart: function (selector, dataColumns, categories, rotated = true, stackGroup = [], shortLabels = false) {
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
                    tickangle: shortLabels ? 0 : 30,
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
        renderCategoricalChart: function(categoryName, chartType) {
            const selector = 'items-by-' + categoryName;
            let list, counts, watchedCounts, unwatchedCounts, limit;
            let shortLabels = false;
            const rotated = false; // All existing bar charts for these categories are not rotated (orientation: 'v')

            if (categoryName === 'decade') {
                list = decades; // Global decades array for labels
                counts = this.selectedLibraryStats.releaseDateCounts;
                watchedCounts = this.selectedLibraryStats.decadesWatchedCounts;
                unwatchedCounts = this.selectedLibraryStats.decadesUnwatchedCounts;
                limit = this.selectedLibraryStats.decadeLimit;
                shortLabels = true;
            } else {
                // Construct property names, e.g., genreList, genreCounts
                const listProp = categoryName + 'List';
                const countsProp = categoryName + 'Counts';
                const watchedProp = categoryName + 'sWatchedCounts'; // e.g. genresWatchedCounts
                const unwatchedProp = categoryName + 'sUnwatchedCounts'; // e.g. genresUnwatchedCounts
                const limitProp = categoryName + 'Limit';

                list = this.selectedLibraryStats[listProp];
                counts = this.selectedLibraryStats[countsProp];
                watchedCounts = this.selectedLibraryStats[watchedProp];
                unwatchedCounts = this.selectedLibraryStats[unwatchedProp];
                limit = this.selectedLibraryStats[limitProp];

                if (categoryName === 'resolution' || categoryName === 'container') {
                    shortLabels = true;
                }
            }

            if (!list || !counts || !watchedCounts || !unwatchedCounts || typeof limit === 'undefined') {
                console.error('Chart data or limit is missing for category:', categoryName, this.selectedLibraryStats);
                return;
            }

            const currentList = list.slice(0, limit);
            const currentCounts = counts.slice(0, limit);
            const currentWatched = watchedCounts.slice(0, limit);
            const currentUnwatched = unwatchedCounts.slice(0, limit);

            if (chartType === 'bar') {
                this.renderBarChart(selector, currentWatched, currentList, rotated, currentUnwatched, shortLabels);
            } else if (chartType === 'pie') {
                this.renderPieChart(selector, currentCounts, currentList);
            } else {
                console.error('Invalid chart type for renderCategoricalChart:', chartType);
            }
        },
        renderDefaultCharts: function () { // Removed 'type' parameter
            // render charts
            this.renderGenreChart(this.genreToggle);
            this.renderCountryChart(this.countryToggle);
            this.renderResolutionChart(this.resolutionToggle);
            this.renderContainerChart(this.containerToggle);
            this.renderDecadeChart(this.decadeToggle);
            this.renderStudioChart(this.studioToggle);
            this.renderDirectorChart(this.directorToggle);
            this.renderActorChart(this.actorToggle);
            this.renderWriterChart(this.writerToggle);
            this.renderContentRatingChart(this.contentRatingToggle);
            // Use selectedLibraryStats for scatter chart data
            if (this.selectedLibraryStats && this.selectedLibraryStats.type && this.selectedLibraryStats.ratingsList) {
                this.renderScatterChart(this.selectedLibraryStats.type, this.selectedLibraryStats.ratingsList, 'items-by-rating');
            } else {
                // console.warn('Scatter chart data not ready in selectedLibraryStats');
            }
        },
        renderGenreChart: function (type) {
            this.renderCategoricalChart('genre', type);
        },
        renderCountryChart: function (type) {
            this.renderCategoricalChart('country', type);
        },
        renderResolutionChart: function (type) {
            this.renderCategoricalChart('resolution', type);
        },
        renderContainerChart: function (type) {
            this.renderCategoricalChart('container', type);
        },
        renderDecadeChart: function (type) {
            this.renderCategoricalChart('decade', type);
        },
        renderStudioChart: function (type) {
            this.renderCategoricalChart('studio', type);
        },
        renderDirectorChart: function (type) {
            this.renderCategoricalChart('director', type);
        },
        renderActorChart: function (type) {
            this.renderCategoricalChart('actor', type);
        },
        renderWriterChart: function (type) {
            this.renderCategoricalChart('writer', type);
        },
        renderContentRatingChart: function (type) {
            this.renderCategoricalChart('contentRating', type);
            } else {
                console.error('Invalid chart type');
            }
        },
        updateLimit: function (limitType, updatedLimit) {
            // limitType is a string like "genre" and updatedLimit is a number
            // set the new limit, e.g. genreLimit = 10
            app.selectedLibraryStats[`${limitType}Limit`] = parseInt(updatedLimit);

            // render the new chart
            switch (limitType) {
                case 'genre':
                app.genreToggle == 'bar' ? app.renderGenreChart('bar') : app.renderGenreChart('pie');
                break;
                case 'country':
                app.countryToggle == 'bar' ? app.renderCountryChart('bar') : app.renderCountryChart('pie');
                break;
                case 'studio':
                app.studioToggle == 'bar' ? app.renderStudioChart('bar') : app.renderStudioChart('pie');
                break;
                case 'resolution':
                app.resolutionToggle == 'bar' ? app.renderResolutionChart('bar') : app.renderResolutionChart('pie');
                break;
                case 'container':
                app.containerToggle == 'bar' ? app.renderContainerChart('bar') : app.renderContainerChart('pie');
                break;
                case 'decade':
                app.decadeToggle == 'bar' ? app.renderDecadeChart('bar') : app.renderDecadeChart('pie');
                break;
                case 'director':
                app.directorToggle == 'bar' ? app.renderDirectorChart('bar') : app.renderDirectorChart('pie');
                break;
                case 'actor':
                app.actorToggle == 'bar' ? app.renderActorChart('bar') : app.renderActorChart('pie');
                break;
                case 'writer':
                app.writerToggle == 'bar' ? app.renderWriterChart('bar') : app.renderWriterChart('pie');
                break;
                case 'contentRating':
                app.contentRatingToggle == 'bar' ? app.renderContentRatingChart('bar') : app.renderContentRatingChart('pie');
                break;
                default:
                console.error('Invalid limit type');
            }
        }
    }
});
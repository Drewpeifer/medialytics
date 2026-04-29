////// WARNING
// Never share the following token with anyone! Do not host this on a public server with the token in place!
// Keep it secret, keep it safe! If compromised, generate a new one: https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/
const serverToken = 'SERVER_TOKEN';// ex: 'ad2T-askdjasd9WxJVBPQ'
const serverIp = 'SERVER_IP';// ex: 'http://12.345.678.90:32400'
const libraryListUrl = serverIp + '/library/sections?X-Plex-Token=' + serverToken;
// Color System Configuration
const colorSystem = {
    // Base color palette (5 unique colors)
    base: ['#D62828', '#FC9803', '#F77F00', '#FCBF49', '#EAE2B7'],

    // Generate extended color array by repeating base colors
    get chartColors() {
        const extended = [];
        for (let i = 0; i < 20; i++) {
            extended.push(this.base[i % this.base.length]);
        }
        return extended;
    },

    // Sequential colors for gradients (16 colors from light to dark)
    chartColorsSequential: [
        '#EAE2B7', '#F0D693', '#F6CB6D', '#FCBF49',
        '#FCB232', '#FCA51A', '#FC9803', '#FA9002',
        '#F98701', '#F77F00', '#F77301', '#F76802',
        '#F75C03', '#EC4B0F', '#E1391C', '#D62828'
    ],

    // High contrast colors for categorical data (first 36 unique colors)
    chartColorsCategorical: [
        "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF",
        "#FF8C00", "#8B008B", "#006400", "#000080", "#FFD700", "#4B0082",
        "#FF1493", "#32CD32", "#FF6347", "#4682B4", "#9370DB", "#20B2AA",
        "#FF4500", "#DA70D6", "#00CED1", "#ADFF2F", "#DC143C", "#00BFFF",
        "#FF69B4", "#228B22", "#B22222", "#5F9EA0", "#FF7F50", "#6495ED",
        "#DDA0DD", "#90EE90", "#F08080", "#40E0D0", "#FA8072", "#7B68EE"
    ]
};

// Use the color system (maintain backward compatibility)
const chartColors = colorSystem.chartColors;
const chartColorsSequential = colorSystem.chartColorsSequential;
const chartColorsCategorical = colorSystem.chartColorsCategorical;

debugMode = false;// set to true to enable console logging

// Data structure templates for consistent initialization and reset
const createCategoryData = () => ({
    data: {},
    list: [],
    counts: [],
    watched: {},
    watchedCounts: [],
    unwatchedCounts: []
});

const createTimeSeriesData = () => ({
    dates: {},
    datesList: [],
    counts: [],
    cumulativeCounts: []
});

// Initialize all data structures using templates
let decadePrefixes = [], decades = [];
let availableLibraries = [];
let selectedLibrary = "", selectedLibraryKey = "";
let selectedLibraryStats = {};
let libraryStatsLoading = false;
let watchedCount = 0;

// Category data structures
let genreData = createCategoryData();
let countryData = createCategoryData();
let resolutionData = createCategoryData();
let containerData = createCategoryData();
let studioData = createCategoryData();
let directorData = createCategoryData();
let actorData = createCategoryData();
let writerData = createCategoryData();
let contentRatingData = createCategoryData();

// Special data structures
let releaseDateData = {
    list: [],
    counts: [],
    oldestTitle: "",
    oldestReleaseDate: "",
    watchedList: [],
    watchedCounts: [],
    unwatchedCounts: []
};

let fileSizeData = {
    items: [],
    resolutionColors: {},
    totalFileSize: 0,
    largestFile: '',
    largestFileSize: 0,
    largestFileResolution: '',
    smallestFile: '',
    smallestFileSize: Number.MAX_SAFE_INTEGER,
    smallestFileResolution: '',
    highestBitrateFile: '',
    highestBitrate: 0,
    lowestBitrateFile: '',
    lowestBitrate: Number.MAX_SAFE_INTEGER
};

let showsData = {
    shows: [],
    seasonsByShow: {},
    mostSeasonsShow: '',
    mostSeasonsCount: 0,
    mostEpisodesShow: '',
    mostEpisodesCount: 0
};

// Time series data
let addedOverTimeData = createTimeSeriesData();
let watchedOverTimeData = createTimeSeriesData();

// Ratings data
let ratingsList = [];
let ratingsContent = [];
let ratingsMovies = ['G', 'PG', 'PG-13', 'R'];
let ratingsTV = ['TV-G', 'TV-Y', 'TV-Y7', 'TV-PG', 'TV-14', 'TV-MA'];
let ratingsHighest = {};
let ratingsLowest = {};

// Simple counters and strings
let durationSum = 0, longestDuration = 0, longestTitle = "";
let firstAdded = "", firstAddedDate = "";
let lastAdded = "", lastAddedDate = "";
let seasonSum = 0, episodeCounts = [], episodeSum = 0;
let unmatchedItems = [];

// Collections data
let collectionsData = {
    collections: [],
    totalCollections: 0,
    totalItemsInCollections: 0,
    largestCollection: '',
    largestCollectionCount: 0,
    collectionNames: [],
    collectionCounts: [],
    collectionWatchedCounts: [],
    collectionUnwatchedCounts: []
};
let collectionsLoading = false;

// Per-collection watched/unwatched counts aggregated from library items
let collectionWatchStats = {};

// Chart limits
let countryLimit = 20, newCountryLimit = 20;
let genreLimit = 20, newGenreLimit = 20;
let resolutionLimit = 20, newResolutionLimit = 20;
let containerLimit = 20, newContainerLimit = 20;
let studioLimit = 20, newStudioLimit = 20;
let directorLimit = 20, newDirectorLimit = 20;
let actorLimit = 20, newActorLimit = 20;
let decadeLimit = 20, newDecadeLimit = 20;
let writerLimit = 20, newWriterLimit = 20;
let contentRatingLimit = 20, newContentRatingLimit = 20;

// Reset library stats using templates
const resetLibraryStats = () => {
    // Reset category data using template
    genreData = createCategoryData();
    countryData = createCategoryData();
    resolutionData = createCategoryData();
    containerData = createCategoryData();
    studioData = createCategoryData();
    directorData = createCategoryData();
    actorData = createCategoryData();
    writerData = createCategoryData();
    contentRatingData = createCategoryData();

    // Reset special structures
    releaseDateData = {
        list: [],
        counts: [],
        oldestTitle: "",
        oldestReleaseDate: "",
        watchedList: [],
        watchedCounts: [],
        unwatchedCounts: []
    };

    fileSizeData = {
        items: [],
        resolutionColors: {},
        totalFileSize: 0,
        largestFile: '',
        largestFileSize: 0,
        largestFileResolution: '',
        smallestFile: '',
        smallestFileSize: Number.MAX_SAFE_INTEGER,
        smallestFileResolution: '',
        highestBitrateFile: '',
        highestBitrate: 0,
        lowestBitrateFile: '',
        lowestBitrate: Number.MAX_SAFE_INTEGER
    };

    showsData = {
        shows: [],
        seasonsByShow: {},
        mostSeasonsShow: '',
        mostSeasonsCount: 0,
        mostEpisodesShow: '',
        mostEpisodesCount: 0
    };

    // Reset time series data
    addedOverTimeData = createTimeSeriesData();
    watchedOverTimeData = createTimeSeriesData();

    // Reset simple variables
    decadePrefixes = [];
    decades = [];
    ratingsList = [];
    ratingsContent = [];
    ratingsMovies = ['G', 'PG', 'PG-13', 'R'];
    ratingsTV = ['TV-G', 'TV-Y', 'TV-Y7', 'TV-Y7-FV', 'TV-PG', 'TV-14', 'TV-MA'];
    ratingsHighest = {};
    ratingsLowest = {};

    // Reset counters
    durationSum = 0;
    seasonSum = 0;
    episodeCounts = [];
    episodeSum = 0;
    longestDuration = 0;
    longestTitle = "";
    firstAdded = "";
    firstAddedDate = "";
    lastAdded = "";
    lastAddedDate = "";
    unmatchedItems = [];
    watchedCount = 0;
    collectionWatchStats = {};
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

const prepareAddedOverTimeData = (addedData) => {
    // Sort dates and prepare arrays
    const sortedDates = Object.keys(addedData.dates).sort();
    const datesList = [];
    const counts = [];
    const cumulativeCounts = [];
    let runningTotal = 0;

    // If we have dates, fill in gaps from first to last date
    if (sortedDates.length > 0) {
        const startDate = new Date(sortedDates[0]);
        const endDate = new Date(); // Current date

        // Iterate through each day from start to end
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateKey = d.toISOString().split('T')[0];
            datesList.push(dateKey);

            const dayCount = addedData.dates[dateKey] || 0;
            counts.push(dayCount);
            runningTotal += dayCount;
            cumulativeCounts.push(runningTotal);
        }
    }

    return {
        datesList: datesList,
        counts: counts,
        cumulativeCounts: cumulativeCounts
    };
};

/////////////////////////////////
// Generate dynamic decades based on actual release years in the data
const generateDynamicDecades = (releaseDateList) => {
    if (!releaseDateList || releaseDateList.length === 0) {
        return { decadePrefixes: [], decades: [] };
    }

    // Get all unique decade prefixes from the actual data
    const foundDecadePrefixes = new Set();

    releaseDateList.forEach((year) => {
        if (typeof year === 'number' && !isNaN(year)) {
            const yearStr = year.toString();
            if (yearStr.length >= 3) {
                const prefix = yearStr.substring(0, 3);
                foundDecadePrefixes.add(prefix);
            }
        }
    });

    // Convert to sorted array (oldest to newest)
    const sortedPrefixes = Array.from(foundDecadePrefixes).sort();

    // Generate corresponding decade display names (oldest to newest)
    const decadeDisplayNames = sortedPrefixes.map(prefix => {
        const startYear = parseInt(prefix + '0');
        return `${startYear}s`;
    });

    return {
        decadePrefixes: sortedPrefixes,
        decades: decadeDisplayNames
    };
};

const prepareDecadeChartData = (currentReleaseDateData) => {
    // Generate dynamic decades based on actual data
    const dynamicDecades = generateDynamicDecades(currentReleaseDateData.list);

    // Update global arrays with dynamic data
    decadePrefixes = dynamicDecades.decadePrefixes;
    decades = dynamicDecades.decades;

    if (decadePrefixes.length === 0) {
        return {
            list: [],
            counts: [],
            watched: [],
            unwatched: []
        };
    }

    let liveCounts = Array(decadePrefixes.length).fill(0);
    let liveWatchedCounts = Array(decadePrefixes.length).fill(0);

    currentReleaseDateData.list.forEach((year) => {
        if (typeof year === 'number' && !isNaN(year)) {
            let yearStr = year.toString();
            if (yearStr.length >= 3) {
                let yearPrefix = yearStr.substring(0, 3);
                const prefixIndex = decadePrefixes.indexOf(yearPrefix);
                if (prefixIndex !== -1) {
                    liveCounts[prefixIndex]++;
                }
            }
        }
    });

    currentReleaseDateData.watchedList.forEach((year) => {
        if (typeof year === 'number' && !isNaN(year)) {
            let yearStr = year.toString();
            if (yearStr.length >= 3) {
                let yearPrefix = yearStr.substring(0, 3);
                const prefixIndex = decadePrefixes.indexOf(yearPrefix);
                if (prefixIndex !== -1) {
                    liveWatchedCounts[prefixIndex]++;
                }
            }
        }
    });

    let liveUnwatchedCounts = liveCounts.map((count, index) => {
        return Math.abs(count - liveWatchedCounts[index]);
    });

    // Arrays are already in oldest to newest order, no reversal needed
    return {
        list: decades, // Dynamic decades array, oldest to newest for display
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
            // but also ensure that only container and resolution are converted to uppercase (not studio, genre, etc.)
            if (itemPropertyKey === 'container' || itemPropertyKey === 'videoResolution') {
                values.push(property.toString().toUpperCase());
            } else {
                values.push(property.toString());
            }
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

                    // Collect file size data for treemap (movies only)
                    if (mediaItem.Part && mediaItem.Part[0] && mediaItem.Part[0].size) {
                        const fileSize = parseInt(mediaItem.Part[0].size);
                        const resolution = mediaItem.videoResolution ? mediaItem.videoResolution.toUpperCase() : 'UNKNOWN';
                        const container = mediaItem.container ? mediaItem.container.toUpperCase() : 'UNKNOWN';
                        const bitrate = mediaItem.bitrate || null;
                        const videoCodec = mediaItem.videoCodec ? mediaItem.videoCodec.toUpperCase() : 'UNKNOWN';
                        const watched = item.lastViewedAt ? true : false;

                        // Add to fileSizeData items array
                        fileSizeData.items.push({
                            title: item.title,
                            year: item.year || '',
                            fileSize: fileSize,
                            resolution: resolution,
                            container: container,
                            bitrate: bitrate,
                            videoCodec: videoCodec,
                            watched: watched
                        });

                    // Track total file size
                    fileSizeData.totalFileSize += fileSize;

                    // Track largest file
                    if (fileSize > fileSizeData.largestFileSize) {
                        fileSizeData.largestFileSize = fileSize;
                        fileSizeData.largestFile = `${item.title} (${item.year || 'Unknown'})`;
                        fileSizeData.largestFileResolution = resolution;
                    }

                    // Track smallest file
                    if (fileSize < fileSizeData.smallestFileSize) {
                        fileSizeData.smallestFileSize = fileSize;
                        fileSizeData.smallestFile = `${item.title} (${item.year || 'Unknown'})`;
                        fileSizeData.smallestFileResolution = resolution;
                    }

                    // Track highest bitrate
                    if (bitrate && bitrate > fileSizeData.highestBitrate) {
                        fileSizeData.highestBitrate = bitrate;
                        fileSizeData.highestBitrateFile = `${item.title} (${item.year || 'Unknown'})`;
                    }

                    // Track lowest bitrate
                    if (bitrate && bitrate < fileSizeData.lowestBitrate) {
                        fileSizeData.lowestBitrate = bitrate;
                        fileSizeData.lowestBitrateFile = `${item.title} (${item.year || 'Unknown'})`;
                    }

                    // Assign colors to resolutions
                    if (!fileSizeData.resolutionColors[resolution]) {
                        const colorIndex = Object.keys(fileSizeData.resolutionColors).length % chartColors.length;
                        fileSizeData.resolutionColors[resolution] = chartColors[colorIndex];
                    }
                }
            });
        }
        processItemCounts(item, directorData, 'Director');
        processItemCounts(item, writerData, 'Writer');

    } else if (type === 'show') {
        // Ensure we're accessing childCount and leafCount correctly
        // These properties represent the number of seasons and episodes respectively
        const seasonCount = parseInt(item.childCount || 0);
        const episodeCount = parseInt(item.leafCount || 0);

        // Track shows with most seasons and episodes
        if (seasonCount > 0) {
            if (seasonCount > showsData.mostSeasonsCount) {
                showsData.mostSeasonsCount = seasonCount;
                showsData.mostSeasonsShow = `${item.title} (${item.year || 'Unknown'})`;
            }

            if (episodeCount > showsData.mostEpisodesCount) {
                showsData.mostEpisodesCount = episodeCount;
                showsData.mostEpisodesShow = `${item.title} (${item.year || 'Unknown'})`;
            }

            // Add to showsData
            const showKey = `${item.title}_${item.year || '0000'}`;
            showsData.shows.push({
                key: showKey,
                title: item.title,
                year: item.year || '',
                seasonCount: seasonCount,
                totalEpisodeCount: episodeCount,
                watched: item.lastViewedAt ? true : false,
                audienceRating: item.audienceRating || null
            });

            // Create entry for seasons if not already created
            if (!showsData.seasonsByShow[showKey]) {
                showsData.seasonsByShow[showKey] = [];
            }
        }

        // Update totals with proper parsing
        if (item.childCount) newSeasonSum += parseInt(item.childCount);
        if (item.leafCount) newEpisodeSum += parseInt(item.leafCount);
        if (item.duration && !isNaN(item.duration) && item.leafCount) {
            newDurationSum += (item.duration / 60000 * parseInt(item.leafCount));
            if (newLongestDuration === 0 || parseInt(item.leafCount) > newLongestDuration) {
                newLongestDuration = parseInt(item.leafCount);
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

let isLoadingLibraryData = false;

/////////////////////////////////
// Show loading animation (for both first load and library switches)
const showLoadingAnimation = () => {
    const overlay = document.getElementById('firstLoadOverlay');
    if (overlay) {
        // Remove any existing fade-out class
        overlay.classList.remove('fade-out');
        overlay.style.display = 'flex';
        document.body.classList.add('first-loading');
    }
}

/////////////////////////////////
// Hide loading animation
const hideLoadingAnimation = () => {
    const overlay = document.getElementById('firstLoadOverlay');
    if (overlay) {
        overlay.classList.add('fade-out');
        document.body.classList.remove('first-loading');

        // Remove the overlay completely after fade out
        setTimeout(() => {
            overlay.style.display = 'none';
            overlay.classList.remove('fade-out');
        }, 800); // Match the CSS transition duration
    }
}

/////////////////////////////////
// sets selectedLibrary, passes all data for that library to a parsing function
const getLibraryData = async (libraryKey) => {
    isLoadingLibraryData = true;

    // Show loading animation for any library load
    showLoadingAnimation();

    // Clean up any existing treemap color legend when switching libraries
    const existingLegend = document.getElementById('treemap-color-legend');
    if (existingLegend) {
        existingLegend.remove();
    }

    app.availableLibraries.forEach((library) => {
        if (library.key == libraryKey) {
            app.selectedLibrary = library.title;
            app.selectedLibraryKey = library.key;
        }
    });
    app.libraryStatsLoading = true;
    app.collectionsLoading = true;

    // Fetch library data and collections data in parallel
    const [libraryResponse, collectionsResponse] = await Promise.all([
        axios.get(serverIp + '/library/sections/' + libraryKey + '/all?X-Plex-Token=' + serverToken),
        axios.get(serverIp + '/library/sections/' + libraryKey + '/collections?X-Plex-Token=' + serverToken)
    ]);

    // Reset data before processing
    resetLibraryStats();

    // Reset movie comparison data when switching libraries
    app.resetComparisonData();

    // Store the raw library items for export
    app.libraryItems = libraryResponse.data.MediaContainer.Metadata || [];

    // Process library data
    parseMediaPayload(libraryResponse);
    app.libraryStatsLoading = false;

    // Process collections data
    parseCollectionsPayload(collectionsResponse);
    app.collectionsLoading = false;

    if (debugMode) {
        console.log('Library Data: ', libraryResponse.data.MediaContainer);
        console.log('Collections Data: ', collectionsResponse.data.MediaContainer);
    }
    return libraryResponse.data.MediaContainer;
}

/////////////////////////////////
// parse through collections payload
const parseCollectionsPayload = (response) => {
    if (!response.data.MediaContainer || !response.data.MediaContainer.Metadata) {
        app.collectionsData = {
            collections: [],
            totalCollections: 0,
            totalItemsInCollections: 0,
            largestCollection: '',
            largestCollectionCount: 0,
            mostWatchedCollection: '',
            mostWatchedPercentage: 0,
            collectionNames: [],
            collectionCounts: [],
            collectionWatchedCounts: [],
            collectionUnwatchedCounts: []
        };
        return;
    }

    const collections = response.data.MediaContainer.Metadata;
    const collectionDetails = [];

    // Process each collection
    collections.forEach((collection) => {
        // Use item-level aggregation from collectionWatchStats for accurate watched/unwatched counts,
        // since the collections endpoint's viewedLeafCount is unreliable.
        const totalCount = collection.childCount || 0;
        const watchStats = collectionWatchStats[collection.title] || { total: 0, watched: 0 };
        const watchedCount = watchStats.watched;
        const unwatchedCount = totalCount - watchedCount;
        const watchedPercentage = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;

        collectionDetails.push({
            name: collection.title,
            totalCount: totalCount,
            watchedCount: watchedCount,
            unwatchedCount: unwatchedCount,
            watchedPercentage: watchedPercentage
        });
    });

    // Sort collections by total count (descending)
    collectionDetails.sort((a, b) => b.totalCount - a.totalCount);

    // Calculate statistics
    const totalCollections = collectionDetails.length;
    const totalItemsInCollections = collectionDetails.reduce((sum, col) => sum + col.totalCount, 0);
    const largestCollection = collectionDetails.length > 0 ? collectionDetails[0] : null;
    const mostWatchedCollection = collectionDetails.length > 0 ?
        collectionDetails.reduce((max, col) => col.watchedPercentage > max.watchedPercentage ? col : max) : null;

    // Prepare chart data
    const collectionNames = collectionDetails.map(col => col.name);
    const collectionCounts = collectionDetails.map(col => col.totalCount);
    const collectionWatchedCounts = collectionDetails.map(col => col.watchedCount);
    const collectionUnwatchedCounts = collectionDetails.map(col => col.unwatchedCount);

    app.collectionsData = {
        collections: collectionDetails,
        totalCollections: totalCollections,
        totalItemsInCollections: totalItemsInCollections,
        largestCollection: largestCollection ? largestCollection.name : '',
        largestCollectionCount: largestCollection ? largestCollection.totalCount : 0,
        mostWatchedCollection: mostWatchedCollection ? mostWatchedCollection.name : '',
        mostWatchedPercentage: mostWatchedCollection ? mostWatchedCollection.watchedPercentage : 0,
        collectionNames: collectionNames,
        collectionCounts: collectionCounts,
        collectionWatchedCounts: collectionWatchedCounts,
        collectionUnwatchedCounts: collectionUnwatchedCounts
    };

    // Render the collections chart immediately
    app.$nextTick(() => {
        app.renderCollectionsChart();
    });
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
        // track items added over time
        if (item.addedAt) {
            const addedDate = new Date(item.addedAt * 1000);
            const dateKey = addedDate.toISOString().split('T')[0]; // YYYY-MM-DD format

            if (addedOverTimeData.dates.hasOwnProperty(dateKey)) {
                addedOverTimeData.dates[dateKey]++;
            } else {
                addedOverTimeData.dates[dateKey] = 1;
            }
        }

        /////////////////////////////////
        // track items watched over time
        if (item.lastViewedAt) {
            const watchedDate = new Date(item.lastViewedAt * 1000);
            const dateKey = watchedDate.toISOString().split('T')[0]; // YYYY-MM-DD format

            if (watchedOverTimeData.dates.hasOwnProperty(dateKey)) {
                watchedOverTimeData.dates[dateKey]++;
            } else {
                watchedOverTimeData.dates[dateKey] = 1;
            }
        }

        /////////////////////////////////
        // track which collections this item belongs to, and whether it's watched
        if (item.Collection) {
            const itemCollections = Array.isArray(item.Collection) ? item.Collection : [item.Collection];
            itemCollections.forEach(col => {
                if (col.tag) {
                    if (!collectionWatchStats[col.tag]) {
                        collectionWatchStats[col.tag] = { total: 0, watched: 0 };
                    }
                    collectionWatchStats[col.tag].total++;
                    if (item.lastViewedAt) {
                        collectionWatchStats[col.tag].watched++;
                    }
                }
            });
        }
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

            // Prepare added over time data
            const preparedAddedOverTimeData = prepareAddedOverTimeData(addedOverTimeData);
            addedOverTimeData.datesList = preparedAddedOverTimeData.datesList;
            addedOverTimeData.counts = preparedAddedOverTimeData.counts;
            addedOverTimeData.cumulativeCounts = preparedAddedOverTimeData.cumulativeCounts;

            // Prepare watched over time data
            const preparedWatchedOverTimeData = prepareAddedOverTimeData(watchedOverTimeData);
            watchedOverTimeData.datesList = preparedWatchedOverTimeData.datesList;
            watchedOverTimeData.counts = preparedWatchedOverTimeData.counts;
            watchedOverTimeData.cumulativeCounts = preparedWatchedOverTimeData.cumulativeCounts;

            // Decade data processing
            const preparedDecadeData = prepareDecadeChartData(releaseDateData);

            let topDecade = "";
            let topDecadeCount = 0;
            if (preparedDecadeData.counts.length > 0) {
                // Find the index of the maximum count to get the correct decade name
                const maxCount = Math.max(...preparedDecadeData.counts);
                const maxIndex = preparedDecadeData.counts.indexOf(maxCount);
                // Both decades array and counts are in oldest to newest order
                topDecade = decades[maxIndex];
                topDecadeCount = maxCount.toLocaleString('en-us');
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
                totalItems: itemCount.toLocaleString('en-us'),
                totalDays: totalDays,
                displayHours: totalHours - (totalDays*24),
                displayMins: totalMins - (totalHours*60),
                topGenre: preparedGenreData.list.length > 0 ? preparedGenreData.list[0] : "",
                topGenreCount: preparedGenreData.counts.length > 0 ? preparedGenreData.counts[0].toLocaleString('en-us') : "",
                totalGenreCount: preparedGenreData.list.length.toLocaleString('en-us'),
                genreList: preparedGenreData.list,
                genreCounts: preparedGenreData.counts,
                genresWatchedCounts : preparedGenreData.watched,
                genresUnwatchedCounts : preparedGenreData.unwatched,
                topCountry: preparedCountryData.list.length > 0 ? preparedCountryData.list[0] : "",
                topCountryCount: preparedCountryData.counts.length > 0 ? preparedCountryData.counts[0].toLocaleString('en-us') : "",
                totalCountryCount: preparedCountryData.list.length.toLocaleString('en-us'),
                countryCounts: preparedCountryData.counts,
                countryList: preparedCountryData.list,
                countriesWatchedCounts : preparedCountryData.watched,
                countriesUnwatchedCounts : preparedCountryData.unwatched,
                resolutionCounts: preparedResolutionData.counts,
                resolutionList: preparedResolutionData.list,
                resolutionsWatchedCounts : preparedResolutionData.watched,
                resolutionsUnwatchedCounts : preparedResolutionData.unwatched,
                topResolution: preparedResolutionData.list.length > 0 ? preparedResolutionData.list[0].toUpperCase() : "",
                topResolutionCount: preparedResolutionData.counts.length > 0 ? preparedResolutionData.counts[0].toLocaleString('en-us') : "",
                totalResolutionCount: preparedResolutionData.list.length.toLocaleString('en-us'),
                containerCounts: preparedContainerData.counts,
                containerList: preparedContainerData.list,
                containersWatchedCounts : preparedContainerData.watched,
                containersUnwatchedCounts : preparedContainerData.unwatched,
                totalContainerCount: preparedContainerData.list.length.toLocaleString('en-us'),
                topContainer: preparedContainerData.list.length > 0 ? preparedContainerData.list[0].toUpperCase() : "",
                topContainerCount: preparedContainerData.counts.length > 0 ? preparedContainerData.counts[0].toLocaleString('en-us') : "",
                topDecade: topDecade, // Calculated above from preparedDecadeData
                topDecadeCount: topDecadeCount, // Calculated above from preparedDecadeData
                totalDecadeCount: preparedDecadeData.list.length, // Should be decades.length
                releaseDateCounts: preparedDecadeData.counts, // from helper
                oldestTitle: releaseDateData.oldestTitle, // from direct update
                decadesWatchedCounts : preparedDecadeData.watched, // from helper
                decadesUnwatchedCounts : preparedDecadeData.unwatched, // from helper
                // TV show-specific stats
                mostSeasonsShow: showsData.mostSeasonsShow,
                mostSeasonsCount: showsData.mostSeasonsCount,
                mostEpisodesShow: showsData.mostEpisodesShow,
                mostEpisodesCount: showsData.mostEpisodesCount,
                studios: studioData.data, // Keep raw data if needed elsewhere, though charts use prepared
                topStudio: preparedStudioData.list.length > 0 ? preparedStudioData.list[0] : "",
                topStudioCount: preparedStudioData.counts.length > 0 ? preparedStudioData.counts[0].toLocaleString('en-us') : "",
                totalStudioCount: preparedStudioData.list.length.toLocaleString('en-us'),
                studioList: preparedStudioData.list,
                studioCounts: preparedStudioData.counts,
                studiosWatchedCounts: preparedStudioData.watched,
                studiosUnwatchedCounts: preparedStudioData.unwatched,
                topDirector: preparedDirectorData.list.length > 0 ? preparedDirectorData.list[0] : "",
                topDirectorCount: preparedDirectorData.counts.length > 0 ? preparedDirectorData.counts[0].toLocaleString('en-us') : "",
                totalDirectorCount: preparedDirectorData.list.length.toLocaleString('en-us'),
                directorList: preparedDirectorData.list,
                directorCounts: preparedDirectorData.counts,
                directorsWatchedCounts: preparedDirectorData.watched,
                directorsUnwatchedCounts: preparedDirectorData.unwatched,
                topActor: preparedActorData.list.length > 0 ? preparedActorData.list[0] : "",
                topActorCount: preparedActorData.counts.length > 0 ? preparedActorData.counts[0].toLocaleString('en-us') : "",
                totalActorCount: preparedActorData.list.length.toLocaleString('en-us'),
                actorList: preparedActorData.list,
                actorCounts: preparedActorData.counts,
                actorsWatchedCounts: preparedActorData.watched,
                actorsUnwatchedCounts: preparedActorData.unwatched,
                topWriter: preparedWriterData.list.length > 0 ? preparedWriterData.list[0] : "",
                topWriterCount: preparedWriterData.counts.length > 0 ? preparedWriterData.counts[0].toLocaleString('en-us') : "",
                totalWriterCount: preparedWriterData.list.length.toLocaleString('en-us'),
                writerList: preparedWriterData.list,
                writerCounts: preparedWriterData.counts,
                writersWatchedCounts: preparedWriterData.watched,
                writersUnwatchedCounts: preparedWriterData.unwatched,
                ratingsList: ratingsList, // Direct from earlier processing
                ratingsHighest: ratingsHighest.text ? `${ratingsHighest.text} - ${ratingsHighest.y} / ${ratingsHighest.x}` : "",
                ratingsLowest: ratingsLowest.text ? `${ratingsLowest.text} - ${ratingsLowest.y} / ${ratingsLowest.x}` : "",
                topContentRating: preparedContentRatingData.list.length > 0 ? preparedContentRatingData.list[0] : "",
                topContentRatingCount: preparedContentRatingData.counts.length > 0 ? preparedContentRatingData.counts[0].toLocaleString('en-us') : "",
                totalContentRatingCount: preparedContentRatingData.list.length.toLocaleString('en-us'),
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
                watchedCount : watchedCount,
                addedOverTimeDates: addedOverTimeData.datesList,
                addedOverTimeCounts: addedOverTimeData.counts,
                addedOverTimeCumulative: addedOverTimeData.cumulativeCounts,
                watchedOverTimeDates: watchedOverTimeData.datesList,
                watchedOverTimeCounts: watchedOverTimeData.counts,
                watchedOverTimeCumulative: watchedOverTimeData.cumulativeCounts,
                // File size data (movies only)
                largestFile: type === 'movie' && fileSizeData.largestFile ? fileSizeData.largestFile : '',
                largestFileSize: type === 'movie' ? fileSizeData.largestFileSize : 0,
                largestFileResolution: type === 'movie' ? fileSizeData.largestFileResolution : '',
                smallestFile: type === 'movie' && fileSizeData.smallestFile !== 'Unknown (Unknown)' ? fileSizeData.smallestFile : '',
                smallestFileSize: type === 'movie' ? fileSizeData.smallestFileSize : 0,
                smallestFileResolution: type === 'movie' ? fileSizeData.smallestFileResolution : '',
                highestBitrateFile: type === 'movie' && fileSizeData.highestBitrateFile ? fileSizeData.highestBitrateFile : '',
                highestBitrate: type === 'movie' ? fileSizeData.highestBitrate : 0,
                lowestBitrateFile: type === 'movie' && fileSizeData.lowestBitrateFile ? fileSizeData.lowestBitrateFile : '',
                lowestBitrate: type === 'movie' ? fileSizeData.lowestBitrate : 0,
                totalFileSize: type === 'movie' ? fileSizeData.totalFileSize : 0,
                resolutionColors: type === 'movie' ? fileSizeData.resolutionColors : {}
            }

            // render charts
            isLoadingLibraryData = false;

            // Hide loading animation with a small delay for smooth transition
            setTimeout(() => {
                hideLoadingAnimation();
            }, 500);

            app.renderDefaultCharts();

            // Populate movie comparison dropdowns for movie libraries
            if (type === 'movie') {
                app.populateComparisonDropdowns();
            }

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
        collectionsData: collectionsData,
        collectionsLoading: collectionsLoading,
        treemapGrouping: 'resolution', // Default grouping is by resolution
        treemapColorBy: 'none', // Default coloring is uniform (no color coding)
        treemapLoading: false,
        bitrateThresholds: {
            low: 3000,  // Default low threshold (3000 kbps)
            high: 10000  // Default high threshold (10000 kbps)
        },
        resolutionToggle: "bar",
        containerToggle: "bar",
        genreToggle: "bar",
        countryToggle: "bar",
        studioToggle: "bar",
        directorToggle: "bar",
        actorToggle: "bar",
        decadeToggle: "bar",
        writerToggle: "bar",
        contentRatingToggle: "bar",
        exportingData: false,
        libraryItems: [], // Store the raw library items for export
        showExportModal: false,
        selectedAttributes: [],
        commonAttributes: [
            { key: 'title', label: 'Title' },
            { key: 'titleSort', label: 'Sort Title' },
            { key: 'year', label: 'Year' },
            { key: 'contentRating', label: 'Content Rating' },
            { key: 'contentRatingAge', label: 'Content Rating Age' },
            { key: 'summary', label: 'Summary' },
            { key: 'audienceRating', label: 'Audience Rating' },
            { key: 'tagline', label: 'Tagline' },
            { key: 'duration', label: 'Duration' },
            { key: 'originallyAvailableAt', label: 'Originally Available At' },
            { key: 'addedAt', label: 'Added At' },
            { key: 'updatedAt', label: 'Updated At' },
            { key: 'lastViewedAt', label: 'Last Viewed At' }
        ],
        movieAttributes: [
            { key: 'bitrate', label: 'Bitrate' },
            { key: 'height', label: 'Height' },
            { key: 'width', label: 'Width' },
            { key: 'aspectRatio', label: 'Aspect Ratio' },
            { key: 'audioCodec', label: 'Audio Codec' },
            { key: 'videoCodec', label: 'Video Codec' },
            { key: 'videoResolution', label: 'Video Resolution' },
            { key: 'container', label: 'Container' },
            { key: 'videoFrameRate', label: 'Video Frame Rate' }
        ],
        tvAttributes: [
            { key: 'childCount', label: 'Child Count (seasons)' },
            { key: 'leafCount', label: 'Leaf Count (episodes)' },
            { key: 'viewedLeafCount', label: 'Viewed Leaf Count' },
            { key: 'viewCount', label: 'View Count' },
            { key: 'skipCount', label: 'Skip Count' }
        ],
        // Movie Comparison Card Data
        comparisonFilters: {
            container: '',
            codec: '',
            resolution: '',
            bitrateComparison: 'equal',
            bitrate: '',
            fileSizeComparison: 'more',
            fileSize: '',
            height: '',
            width: '',
            dimensions: '',
            audioCodec: '',
            frameRate: ''
        },
        availableContainers: [],
        availableCodecs: [],
        availableResolutions: [],
        availableBitrates: [],
        availableHeights: [],
        availableWidths: [],
        availableDimensions: [],
        availableAudioCodecs: [],
        availableFrameRates: [],
        filteredMoviesTotal: 0,
        allFilteredMovies: [],
        // Table functionality
        tableSearch: '',
        sortField: '',
        sortDirection: 'asc',
        currentPage: 1,
        itemsPerPage: 25
    },
    computed: {
        watchedPercentage: function() {
            if (!this.selectedLibraryStats || !this.selectedLibraryStats.totalItems || !this.selectedLibraryStats.watchedCount) {
                return 0;
            }
            const totalItems = parseInt(this.selectedLibraryStats.totalItems.replace(/,/g, ''));
            return Math.floor((this.selectedLibraryStats.watchedCount / totalItems) * 100);
        },
        // Enable analyze button if at least one filter is selected
        isAnalyzeEnabled: function() {
            return this.comparisonFilters.container !== '' ||
                   this.comparisonFilters.codec !== '' ||
                   this.comparisonFilters.resolution !== '' ||
                   this.comparisonFilters.bitrate !== '' ||
                   this.comparisonFilters.fileSize !== '' ||
                   this.comparisonFilters.height !== '' ||
                   this.comparisonFilters.width !== '' ||
                   this.comparisonFilters.dimensions !== '' ||
                   this.comparisonFilters.audioCodec !== '' ||
                   this.comparisonFilters.frameRate !== '';
        },
        // Filtered movies based on table search
        searchFilteredMovies: function() {
            if (!this.tableSearch) {
                return this.allFilteredMovies;
            }
            const searchTerm = this.tableSearch.toLowerCase();
            return this.allFilteredMovies.filter(movie =>
                movie.title.toLowerCase().includes(searchTerm) ||
                movie.year.toString().includes(searchTerm) ||
                movie.container.toLowerCase().includes(searchTerm) ||
                movie.codec.toLowerCase().includes(searchTerm) ||
                movie.resolution.toLowerCase().includes(searchTerm) ||
                (movie.bitrate && movie.bitrate.toString().includes(searchTerm)) ||
                (movie.fileSize && this.formatMovieFileSize(movie.fileSize).toLowerCase().includes(searchTerm))
            );
        },
        // Sorted movies
        sortedMovies: function() {
            if (!this.sortField) {
                return this.searchFilteredMovies;
            }

            return [...this.searchFilteredMovies].sort((a, b) => {
                let aVal = a[this.sortField];
                let bVal = b[this.sortField];

                // Handle special cases for numeric sorting
                if (this.sortField === 'year' || this.sortField === 'bitrate') {
                    aVal = parseInt(aVal) || 0;
                    bVal = parseInt(bVal) || 0;
                } else {
                    aVal = String(aVal || '').toLowerCase();
                    bVal = String(bVal || '').toLowerCase();
                }

                if (this.sortDirection === 'asc') {
                    return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                } else {
                    return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
                }
            });
        },
        // Paginated movies
        paginatedMovies: function() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.sortedMovies.slice(start, end);
        },
        // Total pages
        totalPages: function() {
            return Math.ceil(this.sortedMovies.length / this.itemsPerPage);
        }
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
        // Generic rendering helper
        renderCategoricalChart: function(categoryName, chartType) {
            // Handle special case for contentRating to match HTML id
            const selectorName = categoryName === 'contentRating' ? 'content-rating' : categoryName;
            const selector = 'items-by-' + selectorName;
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
                // Handle plural forms for watched/unwatched counts
                const pluralCategory = categoryName === 'country' ? 'countries' :
                                      categoryName === 'studio' ? 'studios' :
                                      categoryName + 's';
                const watchedProp = pluralCategory + 'WatchedCounts';
                const unwatchedProp = pluralCategory + 'UnwatchedCounts';
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

            // Ensure data exists and is valid
            if (!list || list.length === 0) {
                console.warn(`No data available for ${categoryName} chart`);
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
        renderGenreChart: function (type) {
            const chartType = type || this.genreToggle;
            this.renderCategoricalChart('genre', chartType);
        },
        renderCountryChart: function (type) {
            const chartType = type || this.countryToggle;
            this.renderCategoricalChart('country', chartType);
        },
        renderResolutionChart: function (type) {
            const chartType = type || this.resolutionToggle;
            this.renderCategoricalChart('resolution', chartType);
        },
        renderContainerChart: function (type) {
            const chartType = type || this.containerToggle;
            this.renderCategoricalChart('container', chartType);
        },
        renderDecadeChart: function (type) {
            const chartType = type || this.decadeToggle;
            this.renderCategoricalChart('decade', chartType);
        },
        renderStudioChart: function (type) {
            const chartType = type || this.studioToggle;
            this.renderCategoricalChart('studio', chartType);
        },
        renderDirectorChart: function (type) {
            const chartType = type || this.directorToggle;
            this.renderCategoricalChart('director', chartType);
        },
        renderActorChart: function (type) {
            const chartType = type || this.actorToggle;
            this.renderCategoricalChart('actor', chartType);
        },
        renderWriterChart: function (type) {
            const chartType = type || this.writerToggle;
            this.renderCategoricalChart('writer', chartType);
        },
        renderContentRatingChart: function (type) {
            const chartType = type || this.contentRatingToggle;
            this.renderCategoricalChart('contentRating', chartType);
        },
        renderAddedOverTimeChart: function () {
            if (this.debugMode) {
                console.log('rendering added over time chart: ', this.selectedLibraryStats.addedOverTimeDates, this.selectedLibraryStats.addedOverTimeCounts);
            }

            if (!this.selectedLibraryStats.addedOverTimeDates || this.selectedLibraryStats.addedOverTimeDates.length === 0) {
                console.warn('No data available for added over time chart');
                return;
            }

            let trace1 = {
                x: this.selectedLibraryStats.addedOverTimeDates,
                y: this.selectedLibraryStats.addedOverTimeCumulative,
                type: 'scatter',
                mode: 'lines',
                name: 'Cumulative Total',
                line: {
                    color: chartColors[0],
                    width: 2
                },
                hovertemplate: '%{x}<br>Total: %{y}<extra></extra>',
                yaxis: 'y'
            };

            let trace2 = {
                x: this.selectedLibraryStats.addedOverTimeDates,
                y: this.selectedLibraryStats.addedOverTimeCounts,
                type: 'scatter',
                mode: 'lines',
                name: 'Daily Additions',
                line: {
                    color: chartColors[3],
                    width: 2
                },
                hovertemplate: '%{x}<br>Added: %{y}<extra></extra>',
                yaxis: 'y2'
            };

            let data = [trace1, trace2];

            let layout = {
                showlegend: true,
                legend: {
                    x: 0,
                    y: 1.2,
                    bgcolor: 'transparent',
                    bordercolor: '#888',
                    borderwidth: 1
                },
                margin: {
                    pad: 10,
                    r: 80
                },
                xaxis: {
                    title: 'Date',
                    gridcolor: "#888",
                    showgrid: false,
                    type: 'date'
                },
                yaxis: {
                    title: 'Cumulative Total',
                    gridcolor: "#888",
                    showgrid: true,
                    zeroline: true,
                    side: 'left'
                },
                yaxis2: {
                    title: 'Daily Additions',
                    gridcolor: "#888",
                    showgrid: false,
                    zeroline: true,
                    overlaying: 'y',
                    side: 'right',
                },
                font: {
                    color: '#fff',
                },
                plot_bgcolor: 'transparent',
                paper_bgcolor: 'transparent',
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

            Plotly.newPlot('items-added-over-time', data, layout, config);
        },
        renderWatchedOverTimeChart: function () {
            if (this.debugMode) {
                console.log('rendering watched over time chart: ', this.selectedLibraryStats.watchedOverTimeDates, this.selectedLibraryStats.watchedOverTimeCounts);
            }

            if (!this.selectedLibraryStats.watchedOverTimeDates || this.selectedLibraryStats.watchedOverTimeDates.length === 0) {
                console.warn('No data available for watched over time chart');
                return;
            }

            let watchedTrace1 = {
                x: this.selectedLibraryStats.watchedOverTimeDates,
                y: this.selectedLibraryStats.watchedOverTimeCumulative,
                type: 'scatter',
                mode: 'lines',
                name: 'Cumulative Watched',
                line: {
                    color: chartColors[2],
                    width: 2
                },
                hovertemplate: '%{x}<br>Total Watched: %{y}<extra></extra>',
                yaxis: 'y'
            };

            let watchedTrace2 = {
                x: this.selectedLibraryStats.watchedOverTimeDates,
                y: this.selectedLibraryStats.watchedOverTimeCounts,
                type: 'scatter',
                mode: 'lines',
                name: 'Daily Watches',
                line: {
                    color: chartColors[4],
                    width: 2
                },
                hovertemplate: '%{x}<br>Watched: %{y}<extra></extra>',
                yaxis: 'y2'
            };

            let watchedData = [watchedTrace1, watchedTrace2];

            let watchedLayout = {
                showlegend: true,
                legend: {
                    x: 0,
                    y: 1.2,
                    bgcolor: 'transparent',
                    bordercolor: '#888',
                    borderwidth: 1
                },
                margin: {
                    pad: 10,
                    r: 80
                },
                xaxis: {
                    title: 'Date',
                    gridcolor: "#888",
                    showgrid: false,
                    type: 'date'
                },
                yaxis: {
                    title: 'Cumulative Watched',
                    gridcolor: "#888",
                    showgrid: true,
                    zeroline: true,
                    side: 'left'
                },
                yaxis2: {
                    title: 'Daily Watches',
                    gridcolor: "#888",
                    showgrid: false,
                    zeroline: true,
                    overlaying: 'y',
                    side: 'right',
                    rangemode: 'tozero'
                },
                font: {
                    color: '#fff',
                },
                plot_bgcolor: 'transparent',
                paper_bgcolor: 'transparent',
                modebar: {
                    color: '#f2f2f2',
                    activecolor: chartColors[2],
                }
            };

            let watchedConfig = {
                displaylogo: false,
                displayModeBar: true,
                modeBarButtonsToRemove: ['lasso2d', 'toImage'],
                responsive: true
            };

            Plotly.newPlot('items-watched-over-time', watchedData, watchedLayout, watchedConfig);
        },
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
        renderBarChart: function (selector, dataColumns, categories, rotated = true, stackGroup = [], shortLabels = false, showLegend = false) {
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
                    if (selector === 'collections-chart') {
                        return `${categories[index]}<br />${dataColumns[index]} Watched (${total} Total)`;
                    } else {
                        return `${categories[index]}<br />${dataColumns[index]} / ${total} Watched`
                    }
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
                    if (selector === 'collections-chart') {
                        return `${categories[index]}<br />${stackGroup[index]} Unwatched (${total} Total)`;
                    } else {
                        return `${categories[index]}<br />${stackGroup[index]} / ${total} Unwatched`
                    }
                })
            };

            let data = [trace1, trace2];

            let layout = {
                barmode: 'stack',
                showlegend: showLegend,
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
                textinfo: 'none',
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
        renderCollectionsChart: function() {
            if (!this.collectionsData.collectionNames || this.collectionsData.collectionNames.length === 0) {
                console.warn('No collections data available for chart');
                return;
            }

            // Use vertical bar chart for collections, with legend to distinguish watched vs unwatched
            this.renderBarChart(
                'collections-chart',
                this.collectionsData.collectionWatchedCounts,
                this.collectionsData.collectionNames,
                false, // vertical
                this.collectionsData.collectionUnwatchedCounts,
                false, // shortLabels
                true   // showLegend
            );
        },
        updateTreemapChart: function() {
            // Show spinner immediately
            const chartElement = document.getElementById('items-by-size');
            if (chartElement && chartElement.parentElement) {
                // Create and show a loading spinner
                const spinner = document.createElement('div');
                spinner.className = 'loader treemap-loading-spinner';
                spinner.style.position = 'absolute';
                spinner.style.top = '50%';
                spinner.style.left = '50%';
                spinner.style.transform = 'translate(-50%, -50%)';
                spinner.style.zIndex = '100';
                chartElement.parentElement.style.position = 'relative';
                chartElement.parentElement.appendChild(spinner);
            }

            // Also show the header spinner for visual consistency
            this.treemapLoading = true;

            // Add small delay to ensure spinner is visible before heavy rendering
            setTimeout(() => {
                // Make sure treemapColorBy matches what we're coloring by
                if (this.treemapGrouping === this.treemapColorBy) {
                    // Cannot color by the same attribute we're grouping by
                    this.treemapColorBy = 'none';
                }

                this.renderTreemapChart();

                // Hide spinner after rendering is complete
                setTimeout(() => {
                    this.treemapLoading = false;
                    // Remove the overlay spinner
                    const spinner = document.querySelector('.treemap-loading-spinner');
                    if (spinner) {
                        spinner.remove();
                    }
                }, 300);
            }, 50);
        },

        // Generate color legend items based on current coloring
        getColorLegendItems: function() {
            if (this.treemapColorBy === 'none') {
                return [];
            }

            // For bitrate, create a special gradient legend with threshold values
            if (this.treemapColorBy === 'bitrate') {
                return [
                    { label: `Low (< ${this.bitrateThresholds.low} kbps)`, color: 'rgb(255, 0, 0)' },
                    { label: `Medium (${this.bitrateThresholds.low}-${this.bitrateThresholds.high} kbps)`, color: 'rgb(255, 255, 0)' },
                    { label: `High (> ${this.bitrateThresholds.high} kbps)`, color: 'rgb(0, 255, 0)' }
                ];
            }

            // For categorical attributes, use the same color mapping logic as the chart
            const uniqueValues = new Set();

            // Collect all unique values and normalize them
            if (fileSizeData.items && fileSizeData.items.length > 0) {
                fileSizeData.items.forEach(item => {
                    let value;

                    switch(this.treemapColorBy) {
                        case 'resolution':
                            value = item.resolution;
                            break;
                        case 'container':
                            value = item.container;
                            break;
                        case 'codec':
                            value = item.videoCodec;
                            break;
                    }

                    if (value) {
                        uniqueValues.add(value.toUpperCase());
                    }
                });
            }

            // Sort values for consistent display
            const sortedValues = Array.from(uniqueValues).sort();

            // Create legend items (limited to 12 entries to avoid overwhelming)
            // Use high contrast colors for legend items to match treemap
            const legendItems = sortedValues.slice(0, 12).map((value, index) => {
                return {
                    label: value,
                    color: chartColorsCategorical[index % chartColorsCategorical.length]
                };
            });

            return legendItems;
        },

        updateTreemapGrouping: function() {
            // Show spinner immediately
            const chartElement = document.getElementById('items-by-size');
            if (chartElement && chartElement.parentElement) {
                // Create and show a loading spinner
                const spinner = document.createElement('div');
                spinner.className = 'loader treemap-loading-spinner';
                spinner.style.position = 'absolute';
                spinner.style.top = '50%';
                spinner.style.left = '50%';
                spinner.style.transform = 'translate(-50%, -50%)';
                spinner.style.zIndex = '100';
                chartElement.parentElement.style.position = 'relative';
                chartElement.parentElement.appendChild(spinner);
            }

            // Also show the header spinner for visual consistency
            this.treemapLoading = true;

            // When grouping changes, reset color-by if it conflicts with the grouping
            if (this.treemapColorBy === this.treemapGrouping) {
                this.treemapColorBy = 'none';
            }

            // Add small delay to ensure spinner is visible before heavy rendering
            setTimeout(() => {
                this.renderTreemapChart();
                // Hide spinner after rendering is complete
                setTimeout(() => {
                    this.treemapLoading = false;
                    // Remove the overlay spinner
                    const spinner = document.querySelector('.treemap-loading-spinner');
                    if (spinner) {
                        spinner.remove();
                    }
                }, 300);
            }, 50);
        },

        renderTreemapChart: function() {
            if (this.debugMode) {
                console.log('=== TREEMAP CHART DEBUG ===');
                console.log('Library type:', this.selectedLibraryStats.type);
                console.log('fileSizeData:', fileSizeData);
                console.log('fileSizeData.items length:', fileSizeData.items ? fileSizeData.items.length : 'undefined');
                console.log('Current grouping:', this.treemapGrouping);
                console.log('Current coloring by:', this.treemapColorBy);
            }

            // Only render for movie libraries
            if (this.selectedLibraryStats.type !== 'movie') {
                console.warn('Treemap chart only available for movie libraries');
                return;
            }

            // Check if we have file size data
            if (!fileSizeData.items || fileSizeData.items.length === 0) {
                console.warn('No file size data available for treemap chart');
                // Create a simple test chart to verify Plotly is working
                const testData = [{
                    type: 'treemap',
                    labels: ['HD', 'Full HD Movie 1', 'Full HD Movie 2', 'SD', 'SD Movie 1'],
                    values: ['3000', '1500', '1500', '1000', '1000'],
                    parents: ['', 'HD', 'HD', '', 'SD'],
                    textinfo: 'label+value'
                }];

                const testLayout = {
                    margin: { t: 10, l: 10, r: 10, b: 10 },
                    font: { color: '#fff', size: 12 },
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: 'transparent'
                };

                Plotly.newPlot('items-by-size', testData, testLayout, { displaylogo: false, responsive: true });
                return;
            }

            // Helper function to format file sizes
            const formatFileSize = (bytes) => {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            };

            // Prepare data for treemap - following Plotly docs pattern
            const labels = [];
            const values = [];
            const parents = [];

            // Determine the grouping property based on selected option
            let groupingProperty = 'resolution'; // Default
            let groupingDisplayName = 'Resolution';

            switch(this.treemapGrouping) {
                case 'bitrate':
                    groupingProperty = 'bitrate';
                    groupingDisplayName = 'Bitrate';
                    break;
                case 'container':
                    groupingProperty = 'container';
                    groupingDisplayName = 'Container';
                    break;
                case 'codec':
                    groupingProperty = 'videoCodec';
                    groupingDisplayName = 'Codec';
                    break;
                default:
                    groupingProperty = 'resolution';
                    groupingDisplayName = 'Resolution';
            }

            // Get unique groups and calculate total size per group
            const groupTotals = {};
            const groupColors = {};

            fileSizeData.items.forEach(item => {
                // Ensure the grouping property has a valid value
                let groupValue = item[groupingProperty];

                // For bitrate, create ranges to make the treemap more useful
                if (groupingProperty === 'bitrate' && groupValue) {
                    // Create bitrate ranges (0-5000, 5001-10000, etc.)
                    const rangeSize = 5000;
                    const range = Math.floor(groupValue / rangeSize);
                    const lowerBound = range * rangeSize;
                    const upperBound = (range + 1) * rangeSize;
                    groupValue = `${lowerBound}-${upperBound} kbps`;
                }

                // If there's no valid value, use 'Unknown'
                groupValue = groupValue || 'UNKNOWN';

                // For consistency and display purposes
                if (typeof groupValue === 'string') {
                    groupValue = groupValue.toUpperCase();
                }

                // Add to group totals
                if (!groupTotals[groupValue]) {
                    groupTotals[groupValue] = 0;
                    // Assign a color when we first encounter this group
                    const colorIndex = Object.keys(groupColors).length % chartColorsSequential.length;
                    groupColors[groupValue] = chartColorsSequential[colorIndex];
                }
                groupTotals[groupValue] += item.fileSize;
            });

            // Add group parent nodes with their total sizes
            Object.keys(groupTotals).forEach(group => {
                labels.push(group);
                values.push(groupTotals[group].toString());
                parents.push('');
            });

            // Keep track of movie data for later color mapping
            const movieDataList = [];

            // Add individual movies under their groups
            fileSizeData.items.forEach(item => {
                const displayTitle = `${item.title}${item.year ? ` (${item.year})` : ''}`;

                // Determine which group this item belongs to
                let groupValue = item[groupingProperty];

                // For bitrate, use the same range logic as above
                if (groupingProperty === 'bitrate' && groupValue) {
                    const rangeSize = 5000;
                    const range = Math.floor(groupValue / rangeSize);
                    const lowerBound = range * rangeSize;
                    const upperBound = (range + 1) * rangeSize;
                    groupValue = `${lowerBound}-${upperBound} kbps`;
                }

                groupValue = groupValue || 'UNKNOWN';
                if (typeof groupValue === 'string') {
                    groupValue = groupValue.toUpperCase();
                }

                labels.push(displayTitle);
                values.push(item.fileSize.toString());
                parents.push(groupValue);

                // Store movie data for this index
                movieDataList.push(item);
            });

            // Create an array to track which items are group parents vs children
            const isParentNode = labels.map((_, index) => parents[index] === '');

            // Build color maps for consistent coloring
            // Extract all unique values for each attribute type
            const allResolutions = new Set();
            const allContainers = new Set();
            const allCodecs = new Set();
            let minBitrate = Number.MAX_SAFE_INTEGER;
            let maxBitrate = 0;

            // Collect all unique values
            fileSizeData.items.forEach(item => {
                // Normalize and collect all values (with uppercase for consistency)
                if (item.resolution) allResolutions.add(item.resolution.toUpperCase());
                if (item.container) allContainers.add(item.container.toUpperCase());
                if (item.videoCodec) allCodecs.add(item.videoCodec.toUpperCase());

                // Track min/max bitrate
                if (item.bitrate) {
                    minBitrate = Math.min(minBitrate, item.bitrate);
                    maxBitrate = Math.max(maxBitrate, item.bitrate);
                }
            });

            if (this.debugMode) {
                console.log("Unique values found:");
                console.log("Resolutions:", Array.from(allResolutions));
                console.log("Containers:", Array.from(allContainers));
                console.log("Codecs:", Array.from(allCodecs));
                console.log("Bitrate range:", minBitrate, "to", maxBitrate);
            }

            // Build consistent color maps for each attribute type
            const colorMaps = {
                resolution: {},
                container: {},
                codec: {}
            };

            // Assign colors consistently using high contrast colors for treemaps
            Array.from(allResolutions).sort().forEach((value, i) => {
                colorMaps.resolution[value] = chartColorsCategorical[i % chartColorsCategorical.length];
            });

            Array.from(allContainers).sort().forEach((value, i) => {
                colorMaps.container[value] = chartColorsCategorical[i % chartColorsCategorical.length];
            });

            Array.from(allCodecs).sort().forEach((value, i) => {
                colorMaps.codec[value] = chartColorsCategorical[i % chartColorsCategorical.length];
            });

            // Map movie indices to their attributes
            // The index structure is: [group nodes..., movie nodes...]
            const movieToAttributeMap = {};
            const groupCount = Object.keys(groupTotals).length;

            movieDataList.forEach((item, idx) => {
                // The movie's actual index in the labels array is groupCount + idx
                const movieIndex = groupCount + idx;
                movieToAttributeMap[movieIndex] = {
                    resolution: item.resolution ? item.resolution.toUpperCase() : 'UNKNOWN',
                    container: item.container ? item.container.toUpperCase() : 'UNKNOWN',
                    codec: item.videoCodec ? item.videoCodec.toUpperCase() : 'UNKNOWN',
                    bitrate: item.bitrate || 0
                };
            });

            if (this.debugMode) {
                console.log("Movie to attribute map:", movieToAttributeMap);
                console.log("Labels array:", labels);
                console.log("Parents array:", parents);
            }

            // Create custom hover text with formatted file sizes and additional info
            const customHoverText = labels.map((label, index) => {
                const rawSize = parseInt(values[index]);
                const formattedSize = formatFileSize(rawSize);
                const parent = parents[index];

                if (parent === '') {
                    // This is a group parent node
                    return `<b>${label} ${groupingDisplayName}</b><br>Total Size: ${formattedSize}`;
                } else {
                    // This is an individual movie - find the corresponding movie data
                    const movieIndex = index - Object.keys(groupTotals).length;
                    const movieData = fileSizeData.items[movieIndex];

                    let tooltipText = `<b>${label}</b><br>${groupingDisplayName}: ${parent}<br>File Size: ${formattedSize}`;

                    // Add all relevant properties to tooltip regardless of current grouping
                    if (movieData) {
                        // Always show codec information
                        if (movieData.videoCodec) {
                            tooltipText += `<br>Codec: ${movieData.videoCodec}`;
                        }

                        // Add other relevant properties
                        if (groupingProperty !== 'resolution' && movieData.resolution) {
                            tooltipText += `<br>Resolution: ${movieData.resolution}`;
                        }
                        if (groupingProperty !== 'container' && movieData.container) {
                            tooltipText += `<br>Container: ${movieData.container}`;
                        }
                        if (groupingProperty !== 'bitrate' && movieData.bitrate) {
                            tooltipText += `<br>Bitrate: ${movieData.bitrate} kbps`;
                        }
                    }

                    return tooltipText;
                }
            });

            // Function to get color for a node based on coloring option
            const getNodeColor = (index) => {
                // For parent nodes, always use sequential colors based on group
                if (isParentNode[index]) {
                    const groupIndex = Object.keys(groupTotals).indexOf(labels[index]);
                    return chartColorsSequential[groupIndex % chartColorsSequential.length];
                }

                // For child nodes, apply coloring based on treemapColorBy setting
                if (this.treemapColorBy === 'none') {
                    return '#FCBF49'; // Default amber/gold color
                }

                // Get the movie's attributes
                const movieProps = movieToAttributeMap[index];
                if (!movieProps) {
                    if (this.debugMode) {
                        console.warn(`No movie properties found for node at index ${index} with label "${labels[index]}"`);
                    }
                    return '#FCBF49'; // Fallback
                }

                if (this.debugMode && index % 10 === 0) { // Log only some items to avoid flooding console
                    console.log(`Color info for item ${labels[index]}:`, {
                        colorBy: this.treemapColorBy,
                        properties: movieProps
                    });
                }

                // Special case for bitrate - use enhanced red-to-green gradient with custom thresholds
                if (this.treemapColorBy === 'bitrate' && movieProps.bitrate) {
                    const bitrate = movieProps.bitrate;
                    const lowThreshold = this.bitrateThresholds.low;
                    const highThreshold = this.bitrateThresholds.high;

                    let r, g, b = 0;

                    // Determine color based on thresholds
                    if (bitrate < lowThreshold) {
                        // Low bitrate - red
                        r = 255;
                        g = 0;
                        b = 0;
                    } else if (bitrate > highThreshold) {
                        // High bitrate - green
                        r = 0;
                        g = 255;
                        b = 0;
                    } else {
                        // Medium bitrate - yellow
                        r = 255;
                        g = 255;
                        b = 0;
                    }

                    return `rgb(${r}, ${g}, ${b})`;
                }

                // For categorical coloring (resolution, container, codec)
                if (this.treemapColorBy === 'resolution' ||
                    this.treemapColorBy === 'container' ||
                    this.treemapColorBy === 'codec') {

                    // Get appropriate property value based on coloring type
                    const attrValue = movieProps[this.treemapColorBy];

                    if (attrValue) {
                        const color = colorMaps[this.treemapColorBy][attrValue];

                        if (this.debugMode && index % 10 === 0) { // Log sample of coloring for debugging
                            console.log(`Coloring ${labels[index]} with ${attrValue} using color ${color}`);
                        }

                        if (color) return color;
                    }
                }

                return '#FCBF49'; // Default fallback
            };

            const data = [{
                type: 'treemap',
                labels: labels,
                values: values,
                parents: parents,
                textinfo: 'label',
                hovertemplate: '%{customdata}<extra></extra>',
                customdata: customHoverText,
                marker: {
                    colors: labels.map((_, index) => getNodeColor(index)),
                    line: {
                        width: 2,
                        color: '#000'
                    }
                },
                branchvalues: 'total'
            }];

            const layout = {
                margin: {
                    t: 10,
                    l: 10,
                    r: 10,
                    b: 10
                },
                font: {
                    color: '#fff',
                    size: 12
                },
                showlegend: false,
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                modebar: {
                    color: '#f2f2f2',
                    activecolor: chartColors[2],
                }
            };

            const config = {
                displaylogo: false,
                displayModeBar: true,
                modeBarButtonsToRemove: ['lasso2d', 'toImage'],
                responsive: true
            };

            if (this.debugMode) {
                console.log('Treemap data:', { labels, values, parents, groupingProperty });
            }

            Plotly.newPlot('items-by-size', data, layout, config);

            // After rendering chart, update the color legend
            this.updateColorLegend();
        },

        // Update or create color legend based on current treemapColorBy setting
        updateColorLegend: function() {
            // Find the legend container - first try to find an existing one
            let legendContainer = document.getElementById('treemap-color-legend');

            // If none exists, create it
            if (!legendContainer) {
                legendContainer = document.createElement('div');
                legendContainer.id = 'treemap-color-legend';
                legendContainer.className = 'color-legend';

                // Find the color-control div to insert after it
                const colorControl = document.querySelector('.color-control');
                if (colorControl && colorControl.parentNode) {
                    colorControl.parentNode.insertBefore(legendContainer, colorControl.nextSibling);
                }
            }

            // Clear any existing legend content
            legendContainer.innerHTML = '';

            // If coloring by 'none', hide the legend
            if (this.treemapColorBy === 'none') {
                legendContainer.style.display = 'none';
                return;
            }

            // Show the legend
            legendContainer.style.display = 'flex';

            // Get legend items based on current coloring
            const legendItems = this.getColorLegendItems();

            // Add title
            const titleElement = document.createElement('div');
            titleElement.className = 'legend-title';
            titleElement.innerHTML = `<strong>Color Legend (${this.treemapColorBy}):</strong>`;
            legendContainer.appendChild(titleElement);

            // Create legend items
            legendItems.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'legend-item';

                const colorSwatch = document.createElement('span');
                colorSwatch.className = 'legend-color';
                colorSwatch.style.backgroundColor = item.color;

                const labelElement = document.createElement('span');
                labelElement.textContent = item.label;

                itemElement.appendChild(colorSwatch);
                itemElement.appendChild(labelElement);
                legendContainer.appendChild(itemElement);
            });
        },
        renderShowsTreemap: function() {
            if (this.debugMode) {
                console.log('=== SHOWS BY EPISODE COUNT CHART DEBUG ===');
                console.log('Library type:', this.selectedLibraryStats.type);
                console.log('showsData:', showsData);
                console.log('showsData.shows length:', showsData.shows ? showsData.shows.length : 'undefined');
            }

            // Only render for TV show libraries
            if (this.selectedLibraryStats.type !== 'show') {
                console.warn('Shows by episode count chart only available for TV show libraries');
                return;
            }

            // Check if we have show data
            if (!showsData.shows || showsData.shows.length === 0) {
                console.warn('No show data available for treemap chart');
                return;
            }

            // Prepare data for treemap chart
            const labels = [];
            const values = [];
            const parents = [];

            // Sort shows by episode count (descending)
            const sortedShows = [...showsData.shows].sort((a, b) => b.totalEpisodeCount - a.totalEpisodeCount);

            // Add only the shows (no seasons) to the treemap
            sortedShows.forEach(show => {
                const displayTitle = `${show.title}${show.year ? ` (${show.year})` : ''}`;
                const totalEpisodes = parseInt(show.totalEpisodeCount);

                // Add the show as a top-level node only (no child nodes)
                labels.push(displayTitle);
                values.push(totalEpisodes.toString());
                parents.push('');
            });

            // Create custom hover text for each show
            const customHoverText = labels.map((label, index) => {
                const show = sortedShows.find(s => {
                    const showTitle = `${s.title}${s.year ? ` (${s.year})` : ''}`;
                    return showTitle === label;
                });

                if (show) {
                    let hoverText = `<b>${label}</b><br>Seasons: ${show.seasonCount}<br>Total Episodes: ${show.totalEpisodeCount}`;

                    // Add audience rating if available
                    if (show.audienceRating !== null && show.audienceRating !== undefined) {
                        hoverText += `<br>Audience Rating: ${show.audienceRating.toFixed(1)}`;
                    } else {
                        hoverText += `<br>Audience Rating: Not Rated`;
                    }

                    return hoverText;
                }
                return `<b>${label}</b>`;
            });

            // Find min and max audienceRating values for normalization
            let minRating = 10;
            let maxRating = 0;

            sortedShows.forEach(show => {
                if (show.audienceRating !== null && show.audienceRating !== undefined) {
                    minRating = Math.min(minRating, show.audienceRating);
                    maxRating = Math.max(maxRating, show.audienceRating);
                }
            });

            // Create the treemap data
            const data = [{
                type: 'treemap',
                labels: labels,
                values: values,
                parents: parents,
                textinfo: 'label',
                hovertemplate: '%{customdata}<extra></extra>',
                customdata: customHoverText,
                marker: {
                    colors: labels.map((label, index) => {
                        // Find the corresponding show
                        const show = sortedShows[index];

                        // If show has no rating, use a neutral gray color
                        if (show.audienceRating === null || show.audienceRating === undefined) {
                            return '#808080'; // Gray for unrated shows
                        }

                        // Normalize the rating between 0 and 1
                        // Handle edge case where all shows have same rating
                        const range = maxRating - minRating;
                        let normalizedRating;
                        if (range === 0) {
                            normalizedRating = 0.5; // Middle value if all same
                        } else {
                            normalizedRating = (show.audienceRating - minRating) / range;
                        }

                        // Enhanced gradient with more pronounced colors
                        // Higher ratings are better (green), lower ratings are worse (red)
                        let r, g, b = 0;

                        if (normalizedRating < 0.25) {
                            // Deep red to orange-red (0-25%)
                            const t = normalizedRating * 4; // Scale to 0-1
                            r = 255;
                            g = Math.floor(127 * t); // 0 to 127
                        } else if (normalizedRating < 0.5) {
                            // Orange-red to orange-yellow (25-50%)
                            const t = (normalizedRating - 0.25) * 4; // Scale to 0-1
                            r = 255;
                            g = Math.floor(127 + 128 * t); // 127 to 255
                        } else if (normalizedRating < 0.75) {
                            // Orange-yellow to yellow-green (50-75%)
                            const t = (normalizedRating - 0.5) * 4; // Scale to 0-1
                            r = Math.floor(255 * (1 - t)); // 255 to 0
                            g = 255;
                        } else {
                            // Yellow-green to pure green (75-100%)
                            const t = (normalizedRating - 0.75) * 4; // Scale to 0-1
                            r = 0;
                            g = Math.floor(255 - 127 * t); // 255 to 128 (darker green at top)
                            b = Math.floor(80 * t); // Add slight blue for richer green
                        }

                        return `rgb(${r}, ${g}, ${b})`;
                    }),
                    line: {
                        width: 2,
                        color: '#000'
                    }
                },
                branchvalues: 'total'
            }];

            const layout = {
                margin: {
                    t: 10,
                    l: 10,
                    r: 10,
                    b: 10
                },
                font: {
                    color: '#fff',
                    size: 12
                },
                showlegend: false,
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                modebar: {
                    color: '#f2f2f2',
                    activecolor: chartColors[2],
                }
            };

            const config = {
                displaylogo: false,
                displayModeBar: true,
                modeBarButtonsToRemove: ['lasso2d', 'toImage'],
                responsive: true
            };

            Plotly.newPlot('shows-by-episode-count', data, layout, config);
        },

        renderDefaultCharts: function () {
            // Ensure DOM is ready before rendering charts
            this.$nextTick(() => {
                // Check if the genre chart element exists before rendering
                if (document.getElementById('items-by-genre')) {
                    this.renderGenreChart(this.genreToggle);
                    console.log('rendering genre chart with toggle: ', this.genreToggle);
                }
                if (document.getElementById('items-by-country')) {
                    this.renderCountryChart(this.countryToggle);
                }
                if (document.getElementById('items-by-resolution')) {
                    this.renderResolutionChart(this.resolutionToggle);
                }
                if (document.getElementById('items-by-container')) {
                    this.renderContainerChart(this.containerToggle);
                }
                if (document.getElementById('items-by-decade')) {
                    this.renderDecadeChart(this.decadeToggle);
                }
                if (document.getElementById('items-by-studio')) {
                    this.renderStudioChart(this.studioToggle);
                }
                if (document.getElementById('items-by-director')) {
                    this.renderDirectorChart(this.directorToggle);
                }
                if (document.getElementById('items-by-actor')) {
                    this.renderActorChart(this.actorToggle);
                }
                if (document.getElementById('items-by-writer')) {
                    this.renderWriterChart(this.writerToggle);
                }
                if (document.getElementById('items-by-content-rating')) {
                    this.renderContentRatingChart(this.contentRatingToggle);
                }
                // Use selectedLibraryStats for scatter chart data
                if (this.selectedLibraryStats && this.selectedLibraryStats.type && this.selectedLibraryStats.ratingsList && document.getElementById('items-by-rating')) {
                    this.renderScatterChart(this.selectedLibraryStats.type, this.selectedLibraryStats.ratingsList, 'items-by-rating');
                }
                // Render added over time chart
                if (this.selectedLibraryStats && this.selectedLibraryStats.addedOverTimeDates && document.getElementById('items-added-over-time')) {
                    this.renderAddedOverTimeChart();
                }
                // Render watched over time chart
                if (this.selectedLibraryStats && this.selectedLibraryStats.watchedOverTimeDates && document.getElementById('items-watched-over-time')) {
                    this.renderWatchedOverTimeChart();
                }
                // Render treemap chart for movie libraries
                if (this.selectedLibraryStats && this.selectedLibraryStats.type === 'movie' && document.getElementById('items-by-size')) {
                    this.renderTreemapChart();
                }
                // Render shows by episode count chart for TV show libraries
                if (this.selectedLibraryStats && this.selectedLibraryStats.type === 'show' && document.getElementById('shows-by-episode-count')) {
                    this.renderShowsTreemap();
                }
            });
        },
        updateLimit: function (limitType, updatedLimit) {
            // Show spinner immediately when limit changes
            const chartElement = document.getElementById(`items-by-${limitType === 'contentRating' ? 'content-rating' : limitType}`);
            if (chartElement && chartElement.parentElement) {
                // Create and show a loading spinner
                const spinner = document.createElement('div');
                spinner.className = 'loader chart-loading-spinner';
                spinner.style.position = 'absolute';
                spinner.style.top = '50%';
                spinner.style.left = '50%';
                spinner.style.transform = 'translate(-50%, -50%)';
                spinner.style.zIndex = '100';
                chartElement.parentElement.style.position = 'relative';
                chartElement.parentElement.appendChild(spinner);
            }

            // limitType is a string like "genre" and updatedLimit is a number
            // set the new limit, e.g. genreLimit = 10
            app.selectedLibraryStats[`${limitType}Limit`] = parseInt(updatedLimit);

            // Add a small delay to ensure spinner is visible
            setTimeout(() => {
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

                // Remove spinner after chart renders
                setTimeout(() => {
                    const spinner = document.querySelector('.chart-loading-spinner');
                    if (spinner) {
                        spinner.remove();
                    }
                }, 300);
            }, 50);
        },
        exportLibraryData: function() {
            // Set exporting flag
            this.exportingData = true;

            // Helper function to escape CSV values
            const escapeCSV = (value) => {
                // Convert to string and check if it needs escaping
                const str = String(value);
                // Escape if contains comma, quote, or newline
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    // Escape quotes by doubling them
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };

            // Create CSV content
            let csvContent = `Library Data for ${this.selectedLibrary}\n`;

            // Sort items by title
            const sortedItems = [...this.libraryItems].sort((a, b) => {
                const titleA = a.title.toLowerCase();
                const titleB = b.title.toLowerCase();
                if (titleA < titleB) return -1;
                if (titleA > titleB) return 1;
                return 0;
            });

            // Add each item with year
            sortedItems.forEach(item => {
                const title = item.title;
                const year = item.year || 'Unknown';
                const fullEntry = `${title} (${year})`;
                csvContent += escapeCSV(fullEntry) + '\n';
            });

            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `Medialytics Export - ${this.selectedLibrary}.csv`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Reset exporting flag after a short delay
            setTimeout(() => {
                this.exportingData = false;
            }, 1000);
        },
        openExportModal: function() {
            // Reset selections and open modal
            this.selectedAttributes = [];
            this.showExportModal = true;
        },
        closeExportModal: function() {
            this.showExportModal = false;
            this.selectedAttributes = [];
        },
        exportSelectedData: function() {
            if (this.selectedAttributes.length === 0) {
                return;
            }

            this.exportingData = true;

            // Helper function to escape CSV values
            const escapeCSV = (value) => {
                if (value === null || value === undefined) {
                    return '';
                }
                const str = String(value);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };

            // Helper function to format dates
            const formatDate = (timestamp) => {
                if (!timestamp) return '';
                const date = new Date(timestamp * 1000);
                return date.toISOString().split('T')[0]; // YYYY-MM-DD format
            };

            // Helper function to get media attribute values
            const getMediaAttribute = (item, attribute) => {
                if (!item.Media || !item.Media[0]) return '';

                const media = item.Media[0];
                switch (attribute) {
                    case 'bitrate':
                        return media.bitrate || '';
                    case 'height':
                        return media.height || '';
                    case 'width':
                        return media.width || '';
                    case 'aspectRatio':
                        return media.aspectRatio || '';
                    case 'audioCodec':
                        return media.audioCodec || '';
                    case 'videoCodec':
                        return media.videoCodec || '';
                    case 'videoResolution':
                        return media.videoResolution || '';
                    case 'container':
                        return media.container || '';
                    case 'videoFrameRate':
                        return media.videoFrameRate || '';
                    default:
                        return '';
                }
            };

            // Helper function to get attribute value from item
            const getAttributeValue = (item, attribute) => {
                switch (attribute) {
                    case 'title':
                        return item.title || '';
                    case 'titleSort':
                        return item.titleSort || '';
                    case 'year':
                        return item.year || '';
                    case 'contentRating':
                        return item.contentRating || '';
                    case 'contentRatingAge':
                        return item.contentRatingAge || '';
                    case 'summary':
                        return item.summary || '';
                    case 'audienceRating':
                        return item.audienceRating || '';
                    case 'tagline':
                        return item.tagline || '';
                    case 'duration':
                        return item.duration ? Math.round(item.duration / 60000) : ''; // Convert to minutes
                    case 'originallyAvailableAt':
                        return item.originallyAvailableAt || '';
                    case 'addedAt':
                        return item.addedAt ? formatDate(item.addedAt) : '';
                    case 'updatedAt':
                        return item.updatedAt ? formatDate(item.updatedAt) : '';
                    case 'lastViewedAt':
                        return item.lastViewedAt ? formatDate(item.lastViewedAt) : '';
                    case 'childCount':
                        return item.childCount || '';
                    case 'leafCount':
                        return item.leafCount || '';
                    case 'viewedLeafCount':
                        return item.viewedLeafCount || '';
                    case 'viewCount':
                        return item.viewCount || '';
                    case 'skipCount':
                        return item.skipCount || '';
                    // Movie-specific attributes from Media array
                    case 'bitrate':
                    case 'height':
                    case 'width':
                    case 'aspectRatio':
                    case 'audioCodec':
                    case 'videoCodec':
                    case 'videoResolution':
                    case 'container':
                    case 'videoFrameRate':
                        return getMediaAttribute(item, attribute);
                    default:
                        return '';
                }
            };

            // Create CSV header
            const headers = this.selectedAttributes.map(attr => {
                const attrObj = [...this.commonAttributes, ...this.movieAttributes, ...this.tvAttributes]
                    .find(a => a.key === attr);
                return attrObj ? attrObj.label : attr;
            });

            let csvContent = headers.map(escapeCSV).join(',') + '\n';

            // Sort items by title
            const sortedItems = [...this.libraryItems].sort((a, b) => {
                const titleA = (a.title || '').toLowerCase();
                const titleB = (b.title || '').toLowerCase();
                return titleA.localeCompare(titleB);
            });

            // Add data rows
            sortedItems.forEach(item => {
                const row = this.selectedAttributes.map(attr => {
                    return escapeCSV(getAttributeValue(item, attr));
                });
                csvContent += row.join(',') + '\n';
            });

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `Medialytics Export - ${this.selectedLibrary}.csv`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Close modal and reset state
            setTimeout(() => {
                this.exportingData = false;
                this.closeExportModal();
            }, 1000);
        },
        formatFileSize: function(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },
        formatMovieFileSize: function(bytes) {
            if (!bytes || bytes === 0) return 'Unknown';

            const gb = bytes / (1024 * 1024 * 1024);

            if (gb >= 1) {
                return gb.toFixed(1) + ' GB';
            } else {
                const mb = bytes / (1024 * 1024);
                return Math.round(mb) + ' MB';
            }
        },
        // Movie Comparison Methods
        populateComparisonDropdowns: function() {
            if (this.selectedLibraryStats.type !== 'movie' || !this.libraryItems) {
                return;
            }

            const containers = new Set();
            const codecs = new Set();
            const resolutions = new Set();
            const bitrates = new Set();
            const heights = new Set();
            const widths = new Set();
            const dimensions = new Set();
            const audioCodecs = new Set();
            const frameRates = new Set();

            this.libraryItems.forEach(item => {
                if (item.Media && item.Media.length > 0) {
                    const media = item.Media[0];
                    if (media.container) {
                        containers.add(media.container.toUpperCase());
                    }
                    if (media.videoCodec) {
                        codecs.add(media.videoCodec.toUpperCase());
                    }
                    if (media.videoResolution) {
                        resolutions.add(media.videoResolution.toUpperCase());
                    }
                    if (media.bitrate) {
                        bitrates.add(media.bitrate + ' kbps');
                    }
                    if (media.height) {
                        heights.add(media.height);
                    }
                    if (media.width) {
                        widths.add(media.width);
                    }
                    if (media.width && media.height) {
                        dimensions.add(`${media.width}x${media.height}`);
                    }
                    if (media.audioCodec) {
                        audioCodecs.add(media.audioCodec.toUpperCase());
                    }
                    if (media.videoFrameRate) {
                        frameRates.add(media.videoFrameRate.toUpperCase());
                    }
                }
            });

            this.availableContainers = Array.from(containers).sort();
            this.availableCodecs = Array.from(codecs).sort();
            this.availableResolutions = Array.from(resolutions).sort();
            this.availableBitrates = Array.from(bitrates).sort((a, b) => {
                const aNum = parseInt(a);
                const bNum = parseInt(b);
                return aNum - bNum;
            });
            this.availableHeights = Array.from(heights).sort((a, b) => parseInt(a) - parseInt(b));
            this.availableWidths = Array.from(widths).sort((a, b) => parseInt(a) - parseInt(b));
            this.availableDimensions = Array.from(dimensions).sort();
            this.availableAudioCodecs = Array.from(audioCodecs).sort();
            this.availableFrameRates = Array.from(frameRates).sort();
        },
        onFilterChange: function() {
            // Reset results when filters change
            this.filteredMoviesTotal = 0;
            this.filteredMoviesDisplayed = [];
            this.currentDisplayOffset = 0;
            this.allFilteredMovies = [];
        },
        analyzeMovies: function() {
            if (this.selectedLibraryStats.type !== 'movie' || !this.libraryItems) {
                return;
            }

            const filteredMovies = this.libraryItems.filter(item => {
                if (!item.Media || item.Media.length === 0) {
                    return false;
                }

                const media = item.Media[0];

                // Apply filters
                if (this.comparisonFilters.container &&
                    media.container &&
                    media.container.toUpperCase() !== this.comparisonFilters.container) {
                    return false;
                }

                if (this.comparisonFilters.codec &&
                    media.videoCodec &&
                    media.videoCodec.toUpperCase() !== this.comparisonFilters.codec) {
                    return false;
                }

                if (this.comparisonFilters.resolution &&
                    media.videoResolution &&
                    media.videoResolution.toUpperCase() !== this.comparisonFilters.resolution) {
                    return false;
                }

                // Apply bitrate filter with comparison logic
                if (this.comparisonFilters.bitrate && media.bitrate) {
                    const filterBitrate = parseInt(this.comparisonFilters.bitrate);
                    const itemBitrate = media.bitrate;

                    switch (this.comparisonFilters.bitrateComparison) {
                        case 'equal':
                            if (itemBitrate !== filterBitrate) {
                                return false;
                            }
                            break;
                        case 'more':
                            if (itemBitrate <= filterBitrate) {
                                return false;
                            }
                            break;
                        case 'less':
                            if (itemBitrate >= filterBitrate) {
                                return false;
                            }
                            break;
                    }
                }

                // Apply file size filter with comparison logic
                if (this.comparisonFilters.fileSize && media.Part && media.Part[0] && media.Part[0].size) {
                    const filterFileSize = parseInt(this.comparisonFilters.fileSize) * 1024 * 1024 * 1024; // Convert GB to bytes
                    const itemFileSize = parseInt(media.Part[0].size);

                    switch (this.comparisonFilters.fileSizeComparison) {
                        case 'more':
                            if (itemFileSize <= filterFileSize) {
                                return false;
                            }
                            break;
                        case 'less':
                            if (itemFileSize >= filterFileSize) {
                                return false;
                            }
                            break;
                    }
                }

                // Apply height filter
                if (this.comparisonFilters.height && media.height) {
                    if (parseInt(media.height) !== parseInt(this.comparisonFilters.height)) {
                        return false;
                    }
                }

                // Apply width filter
                if (this.comparisonFilters.width && media.width) {
                    if (parseInt(media.width) !== parseInt(this.comparisonFilters.width)) {
                        return false;
                    }
                }

                // Apply dimensions filter
                if (this.comparisonFilters.dimensions && media.width && media.height) {
                    const itemDimensions = `${media.width}x${media.height}`;
                    if (itemDimensions !== this.comparisonFilters.dimensions) {
                        return false;
                    }
                }

                // Apply audio codec filter
                if (this.comparisonFilters.audioCodec && media.audioCodec) {
                    if (media.audioCodec.toUpperCase() !== this.comparisonFilters.audioCodec) {
                        return false;
                    }
                }

                // Apply frame rate filter
                if (this.comparisonFilters.frameRate && media.videoFrameRate) {
                    if (media.videoFrameRate.toUpperCase() !== this.comparisonFilters.frameRate) {
                        return false;
                    }
                }

                return true;
            });

            // Sort alphabetically by title
            filteredMovies.sort((a, b) => {
                const titleA = (a.title || '').toLowerCase();
                const titleB = (b.title || '').toLowerCase();
                return titleA.localeCompare(titleB);
            });

            // Process the filtered movies for display
            this.allFilteredMovies = filteredMovies.map(item => {
                const media = item.Media[0];
                return {
                    title: item.title,
                    year: item.year,
                    height: media.height || null,
                    width: media.width || null,
                    dimensions: media.width && media.height ? `${media.width}x${media.height}` : null,
                    container: media.container ? media.container.toUpperCase() : 'Unknown',
                    codec: media.videoCodec ? media.videoCodec.toUpperCase() : 'Unknown',
                    audioCodec: media.audioCodec ? media.audioCodec.toUpperCase() : 'Unknown',
                    frameRate: media.videoFrameRate ? media.videoFrameRate.toUpperCase() : 'Unknown',
                    resolution: media.videoResolution ? media.videoResolution.toUpperCase() : 'Unknown',
                    bitrate: media.bitrate || null,
                    fileSize: media.Part && media.Part[0] && media.Part[0].size ? parseInt(media.Part[0].size) : null
                };
            });

            this.filteredMoviesTotal = this.allFilteredMovies.length;
            this.currentDisplayOffset = 0;
            this.filteredMoviesDisplayed = this.allFilteredMovies.slice(0, 25);
        },
        showMoreMovies: function() {
            const nextOffset = this.currentDisplayOffset + 25;
            const nextBatch = this.allFilteredMovies.slice(nextOffset, nextOffset + 25);

            this.filteredMoviesDisplayed = [...this.filteredMoviesDisplayed, ...nextBatch];
            this.currentDisplayOffset = nextOffset;
        },
        resetComparisonData: function() {
            this.comparisonFilters = {
                container: '',
                codec: '',
                resolution: '',
                bitrateComparison: 'equal',
                bitrate: '',
                fileSizeComparison: 'more',
                fileSize: '',
                height: '',
                width: '',
                dimensions: '',
                audioCodec: '',
                frameRate: ''
            };
            this.availableContainers = [];
            this.availableCodecs = [];
            this.availableResolutions = [];
            this.availableBitrates = [];
            this.availableHeights = [];
            this.availableWidths = [];
            this.availableDimensions = [];
            this.availableAudioCodecs = [];
            this.availableFrameRates = [];
            this.filteredMoviesTotal = 0;
            this.allFilteredMovies = [];
            // Reset table state
            this.tableSearch = '';
            this.sortField = '';
            this.sortDirection = 'asc';
            this.currentPage = 1;
        },
        // Table sorting methods
        sortTable: function(field) {
            if (this.sortField === field) {
                this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortField = field;
                this.sortDirection = 'asc';
            }
            this.currentPage = 1; // Reset to first page when sorting
        },
        getSortClass: function(field) {
            if (this.sortField === field) {
                return `sort-${this.sortDirection}`;
            }
            return '';
        },
        // Pagination methods
        goToPage: function(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
            }
        },
        // Export table CSV
        updateBitrateThresholds: function() {
            // Trigger a re-render of the treemap with new thresholds
            this.updateTreemapChart();
        },
        exportTableCSV: function() {
            if (!this.sortedMovies || this.sortedMovies.length === 0) {
                return;
            }

            // Helper function to escape CSV values
            const escapeCSV = (value) => {
                if (value === null || value === undefined) {
                    return '';
                }
                const str = String(value);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };

            // Create CSV header
            const headers = [
                'Title',
                'Year',
                'Height',
                'Width',
                'Dimensions',
                'Container',
                'Video Codec',
                'Audio Codec',
                'Frame Rate',
                'Resolution',
                'Bitrate',
                'File Size'
            ];
            let csvContent = headers.map(escapeCSV).join(',') + '\n';

            // Add data rows
            this.sortedMovies.forEach(movie => {
                const row = [
                    movie.title,
                    movie.year || 'Unknown',
                    movie.height ? (movie.height + 'px') : 'Unknown',
                    movie.width ? (movie.width + 'px') : 'Unknown',
                    movie.dimensions || 'Unknown',
                    movie.container,
                    movie.codec,
                    movie.audioCodec || 'Unknown',
                    movie.frameRate || 'Unknown',
                    movie.resolution,
                    movie.bitrate ? (movie.bitrate + ' kbps') : 'Unknown',
                    this.formatMovieFileSize(movie.fileSize)
                ];
                csvContent += row.map(escapeCSV).join(',') + '\n';
            });

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            // Create filename with filter info
            let filename = `Movie Comparison - ${this.selectedLibrary}`;
            const activeFilters = [];
            if (this.comparisonFilters.container) activeFilters.push(this.comparisonFilters.container);
            if (this.comparisonFilters.codec) activeFilters.push(this.comparisonFilters.codec);
            if (this.comparisonFilters.resolution) activeFilters.push(this.comparisonFilters.resolution);
            if (this.comparisonFilters.bitrate) activeFilters.push(this.comparisonFilters.bitrate);

            if (activeFilters.length > 0) {
                filename += ` - ${activeFilters.join(', ')}`;
            }
            filename += '.csv';

            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    }
});

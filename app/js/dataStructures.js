/**
 * Data Structure Templates and Factory Functions Module
 *
 * Provides factory functions for creating consistent data structures
 * throughout the application. Using factory functions ensures:
 * - Consistent structure across all data types
 * - Easy reset/reinitialization
 * - Reduced code duplication
 * - Type safety (when used with JSDoc)
 *
 * @module dataStructures
 * @author Bob (AI Assistant)
 * @version 2.6.1
 */

/**
 * Create a standard category data structure
 *
 * Used for tracking categorical data like genres, countries, studios,
 * actors, directors, writers, and content ratings. Includes both raw
 * data and prepared chart data.
 *
 * @function createCategoryData
 * @returns {Object} Category data structure
 * @returns {Object} return.data - Raw category counts {categoryName: count}
 * @returns {string[]} return.list - Sorted list of category names
 * @returns {number[]} return.counts - Counts corresponding to list
 * @returns {Object} return.watched - Watched counts {categoryName: watchedCount}
 * @returns {number[]} return.watchedCounts - Watched counts for charts
 * @returns {number[]} return.unwatchedCounts - Unwatched counts for charts
 * @returns {string[]} return.chartList - Prepared list for chart display
 * @returns {number[]} return.chartCounts - Prepared counts for chart display
 * @returns {number[]} return.chartWatchedCounts - Prepared watched counts for charts
 * @returns {number[]} return.chartUnwatchedCounts - Prepared unwatched counts for charts
 *
 * @example
 * const genreData = createCategoryData();
 * genreData.data['Action'] = 50;
 * genreData.watched['Action'] = 30;
 */
const createCategoryData = () => ({
    data: {},
    list: [],
    counts: [],
    watched: {},
    watchedCounts: [],
    unwatchedCounts: [],
    chartList: [],
    chartCounts: [],
    chartWatchedCounts: [],
    chartUnwatchedCounts: []
});

/**
 * Create a time series data structure
 *
 * Used for tracking additions and views over time. Stores both
 * raw date data and prepared arrays for time-based charts.
 *
 * @function createTimeSeriesData
 * @returns {Object} Time series data structure
 * @returns {Object} return.dates - Date-keyed counts {date: count}
 * @returns {string[]} return.datesList - Sorted list of dates
 * @returns {number[]} return.counts - Counts per date
 * @returns {number[]} return.cumulativeCounts - Running total counts
 *
 * @example
 * const addedOverTime = createTimeSeriesData();
 * addedOverTime.dates['2024-01-15'] = 5;
 */
const createTimeSeriesData = () => ({
    dates: {},
    datesList: [],
    counts: [],
    cumulativeCounts: []
});

/**
 * Create release date data structure
 *
 * Tracks release years and identifies oldest content in library.
 *
 * @function createReleaseDateData
 * @returns {Object} Release date data structure
 * @returns {number[]} return.list - List of release years
 * @returns {number[]} return.counts - Count per year
 * @returns {string} return.oldestTitle - Title of oldest item
 * @returns {string} return.oldestReleaseDate - Release date of oldest item
 * @returns {number[]} return.watchedList - Release years of watched items
 * @returns {number[]} return.watchedCounts - Watched counts per year
 * @returns {number[]} return.unwatchedCounts - Unwatched counts per year
 */
const createReleaseDateData = () => ({
    list: [],
    counts: [],
    oldestTitle: "",
    oldestReleaseDate: "",
    watchedList: [],
    watchedCounts: [],
    unwatchedCounts: []
});

/**
 * Create file size data structure
 *
 * Tracks file sizes, bitrates, and identifies largest/smallest files.
 * Used for movie libraries to analyze media file characteristics.
 *
 * @function createFileSizeData
 * @returns {Object} File size data structure
 * @returns {Array} return.items - Array of file items with size/bitrate data
 * @returns {Object} return.resolutionColors - Color mapping for resolutions
 * @returns {number} return.totalFileSize - Total size of all files in bytes
 * @returns {string} return.largestFile - Title of largest file
 * @returns {number} return.largestFileSize - Size of largest file in bytes
 * @returns {string} return.largestFileResolution - Resolution of largest file
 * @returns {string} return.smallestFile - Title of smallest file
 * @returns {number} return.smallestFileSize - Size of smallest file in bytes
 * @returns {string} return.smallestFileResolution - Resolution of smallest file
 * @returns {string} return.highestBitrateFile - Title of highest bitrate file
 * @returns {number} return.highestBitrate - Highest bitrate value
 * @returns {string} return.lowestBitrateFile - Title of lowest bitrate file
 * @returns {number} return.lowestBitrate - Lowest bitrate value
 */
const createFileSizeData = () => ({
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
});

/**
 * Create shows data structure (for TV libraries)
 *
 * Tracks TV show statistics including seasons and episodes.
 * Only used for TV show libraries.
 *
 * @function createShowsData
 * @returns {Object} Shows data structure
 * @returns {Array} return.shows - Array of show objects
 * @returns {Object} return.seasonsByShow - Season counts by show {showName: seasonCount}
 * @returns {string} return.mostSeasonsShow - Show with most seasons
 * @returns {number} return.mostSeasonsCount - Number of seasons in mostSeasonsShow
 * @returns {string} return.mostEpisodesShow - Show with most episodes
 * @returns {number} return.mostEpisodesCount - Number of episodes in mostEpisodesShow
 */
const createShowsData = () => ({
    shows: [],
    seasonsByShow: {},
    mostSeasonsShow: '',
    mostSeasonsCount: 0,
    mostEpisodesShow: '',
    mostEpisodesCount: 0
});

/**
 * Create collections data structure
 *
 * Tracks Plex collections and their contents. Collections are
 * user-defined groupings of media items.
 *
 * @function createCollectionsData
 * @returns {Object} Collections data structure
 * @returns {Array} return.collections - Array of collection objects
 * @returns {number} return.totalCollections - Total number of collections
 * @returns {number} return.totalItemsInCollections - Total items across all collections
 * @returns {string} return.largestCollection - Name of largest collection
 * @returns {number} return.largestCollectionCount - Item count in largest collection
 * @returns {string[]} return.collectionNames - Array of collection names
 * @returns {number[]} return.collectionCounts - Item counts per collection
 * @returns {number[]} return.collectionWatchedCounts - Watched counts per collection
 * @returns {number[]} return.collectionUnwatchedCounts - Unwatched counts per collection
 */
const createCollectionsData = () => ({
    collections: [],
    totalCollections: 0,
    totalItemsInCollections: 0,
    largestCollection: '',
    largestCollectionCount: 0,
    collectionNames: [],
    collectionCounts: [],
    collectionWatchedCounts: [],
    collectionUnwatchedCounts: []
});

/**
 * Create ratings data structure
 *
 * Tracks audience ratings and content ratings for scatter plot
 * visualization and rating analysis.
 *
 * @function createRatingsData
 * @returns {Object} Ratings data structure
 * @returns {Array} return.list - Array of rating objects for scatter plot
 * @returns {string[]} return.content - Unique content ratings found
 * @returns {string[]} return.movies - Standard movie content ratings
 * @returns {string[]} return.tv - Standard TV content ratings
 * @returns {Object} return.highest - Highest rated item data
 * @returns {Object} return.lowest - Lowest rated item data
 */
const createRatingsData = () => ({
    list: [],
    content: [],
    movies: (typeof CONSTANTS !== 'undefined') ? CONSTANTS.MOVIE_RATINGS : ['G', 'PG', 'PG-13', 'R'],
    tv: (typeof CONSTANTS !== 'undefined') ? CONSTANTS.TV_RATINGS : ['TV-G', 'TV-Y', 'TV-Y7', 'TV-Y7-FV', 'TV-PG', 'TV-14', 'TV-MA'],
    highest: {},
    lowest: {}
});

// Export for use in other modules (Node.js/Jest)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createCategoryData,
        createTimeSeriesData,
        createReleaseDateData,
        createFileSizeData,
        createShowsData,
        createCollectionsData,
        createRatingsData
    };
}

// Make functions available globally for browser use
if (typeof window !== 'undefined') {
    window.createCategoryData = createCategoryData;
    window.createTimeSeriesData = createTimeSeriesData;
    window.createReleaseDateData = createReleaseDateData;
    window.createFileSizeData = createFileSizeData;
    window.createShowsData = createShowsData;
    window.createCollectionsData = createCollectionsData;
    window.createRatingsData = createRatingsData;
}

// Made with Bob

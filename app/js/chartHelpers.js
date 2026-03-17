/**
 * Chart Helper Functions Module
 *
 * Utilities for preparing and formatting chart data. This module provides
 * reusable functions for transforming raw data into chart-ready formats,
 * eliminating code duplication and ensuring consistent chart preparation.
 *
 * @module chartHelpers
 * @author Bob (AI Assistant)
 * @version 2.6.1
 */

/**
 * Apply prepared chart data to a category data structure
 *
 * This helper function eliminates repetitive code by applying the
 * prepareCategoryChartData transformation and updating the category
 * data structure in one step.
 *
 * @function applyChartData
 * @param {Object} categoryData - Category data structure to update
 * @param {Object} categoryData.data - Raw category counts
 * @param {Object} categoryData.watched - Watched counts per category
 * @returns {Object} Updated category data structure with chart properties
 * @returns {string[]} return.chartList - Sorted category names
 * @returns {number[]} return.chartCounts - Counts for each category
 * @returns {number[]} return.chartWatchedCounts - Watched counts
 * @returns {number[]} return.chartUnwatchedCounts - Unwatched counts
 *
 * @example
 * const genreData = createCategoryData();
 * genreData.data['Action'] = 50;
 * genreData.watched['Action'] = 30;
 * applyChartData(genreData);
 * // genreData now has chartList, chartCounts, etc.
 */
function applyChartData(categoryData) {
    const prepared = prepareCategoryChartData(categoryData);
    categoryData.chartList = prepared.list;
    categoryData.chartCounts = prepared.counts;
    categoryData.chartWatchedCounts = prepared.watched;
    categoryData.chartUnwatchedCounts = prepared.unwatched;
    return categoryData;
}

/**
 * Prepare category data for chart display
 *
 * Transforms raw category data into sorted, chart-ready arrays.
 * Removes undefined entries, sorts by count descending, and
 * separates watched/unwatched data for stacked charts.
 *
 * @function prepareCategoryChartData
 * @param {Object} categoryData - Raw category data structure
 * @param {Object} categoryData.data - Category counts {name: count}
 * @param {Object} categoryData.watched - Watched counts {name: watchedCount}
 * @returns {Object} Formatted chart data
 * @returns {string[]} return.list - Sorted category names (descending by count)
 * @returns {number[]} return.counts - Total counts per category
 * @returns {number[]} return.watched - Watched counts per category
 * @returns {number[]} return.unwatched - Unwatched counts per category
 * @returns {Array<[string, number]>} return.sortedEntries - Sorted [name, count] pairs
 *
 * @example
 * const genreData = { data: {Action: 50, Drama: 30}, watched: {Action: 20, Drama: 15} };
 * const prepared = prepareCategoryChartData(genreData);
 * // prepared.list = ['Action', 'Drama']
 * // prepared.counts = [50, 30]
 * // prepared.watched = [20, 15]
 * // prepared.unwatched = [30, 15]
 */
function prepareCategoryChartData(categoryData) {
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
        list,
        counts,
        watched: watchedCounts,
        unwatched: unwatchedCounts,
        sortedEntries
    };
}

/**
 * Prepare time series data for chart display
 *
 * Transforms date-keyed data into sorted arrays suitable for
 * time-based line charts. Calculates cumulative totals for
 * cumulative line charts.
 *
 * @function prepareAddedOverTimeData
 * @param {Object} timeData - Raw time series data structure
 * @param {Object} timeData.dates - Date-keyed counts {date: count}
 * @returns {Object} Formatted time series data
 * @returns {string[]} return.datesList - Sorted array of dates (ISO format)
 * @returns {number[]} return.counts - Counts per date
 * @returns {number[]} return.cumulativeCounts - Running total counts
 *
 * @example
 * const timeData = { dates: {'2024-01-01': 5, '2024-01-02': 3} };
 * const prepared = prepareAddedOverTimeData(timeData);
 * // prepared.datesList = ['2024-01-01', '2024-01-02']
 * // prepared.counts = [5, 3]
 * // prepared.cumulativeCounts = [5, 8]
 */
function prepareAddedOverTimeData(timeData) {
    const dates = timeData.dates;
    const datesList = Object.keys(dates).sort();
    const counts = [];
    const cumulativeCounts = [];
    let cumulativeSum = 0;

    datesList.forEach(date => {
        const count = dates[date];
        counts.push(count);
        cumulativeSum += count;
        cumulativeCounts.push(cumulativeSum);
    });

    return {
        datesList,
        counts,
        cumulativeCounts
    };
}

/**
 * Get decade prefix from year
 *
 * Converts a year to its decade prefix by rounding down to nearest 10.
 *
 * @function getDecadePrefix
 * @param {number} year - Four digit year (e.g., 1995)
 * @returns {number} Decade prefix (e.g., 1990)
 *
 * @example
 * getDecadePrefix(1995); // returns 1990
 * getDecadePrefix(2003); // returns 2000
 */
function getDecadePrefix(year) {
    return Math.floor(year / 10) * 10;
}

/**
 * Generate dynamic decades list from release dates
 *
 * Analyzes release years and generates a list of decades that
 * actually exist in the data, rather than using a fixed range.
 *
 * @function generateDynamicDecades
 * @param {number[]} releaseDateList - List of release years
 * @returns {Object} Decades information
 * @returns {number[]} return.decadePrefixes - Sorted decade prefixes (e.g., [1990, 2000, 2010])
 * @returns {string[]} return.decades - Decade display names (e.g., ['1990s', '2000s', '2010s'])
 *
 * @example
 * const years = [1995, 1998, 2001, 2015];
 * const result = generateDynamicDecades(years);
 * // result.decadePrefixes = [1990, 2000, 2010]
 * // result.decades = ['1990s', '2000s', '2010s']
 */
function generateDynamicDecades(releaseDateList) {
    if (!releaseDateList || releaseDateList.length === 0) {
        return { decades: [], decadePrefixes: [] };
    }

    const uniqueDecadePrefixes = new Set();
    releaseDateList.forEach(year => {
        const prefix = getDecadePrefix(year);
        uniqueDecadePrefixes.add(prefix);
    });

    const sortedPrefixes = Array.from(uniqueDecadePrefixes).sort((a, b) => a - b);
    const decades = sortedPrefixes.map(prefix => `${prefix}s`);

    return {
        decades,
        decadePrefixes: sortedPrefixes
    };
}

/**
 * Count years by decade
 *
 * Aggregates a list of years into decade buckets, counting
 * how many years fall into each decade.
 *
 * @function countYearsByDecade
 * @param {number[]} yearList - List of years to count
 * @param {number[]} decadePrefixMap - Array of decade prefixes to use as buckets
 * @returns {number[]} Counts per decade (same order as decadePrefixMap)
 *
 * @example
 * const years = [1995, 1998, 2001, 2015, 2018];
 * const decades = [1990, 2000, 2010];
 * const counts = countYearsByDecade(years, decades);
 * // counts = [2, 1, 2]  (2 in 1990s, 1 in 2000s, 2 in 2010s)
 */
function countYearsByDecade(yearList, decadePrefixMap) {
    const decadeCounts = new Array(decadePrefixMap.length).fill(0);
    
    yearList.forEach(year => {
        const prefix = getDecadePrefix(year);
        const index = decadePrefixMap.indexOf(prefix);
        if (index !== -1) {
            decadeCounts[index]++;
        }
    });
    
    return decadeCounts;
}

/**
 * Prepare decade chart data
 *
 * Complete pipeline for preparing decade-based chart data.
 * Generates dynamic decades from actual data, counts items per decade,
 * and separates watched/unwatched counts.
 *
 * @function prepareDecadeChartData
 * @param {Object} currentReleaseDateData - Release date data structure
 * @param {number[]} currentReleaseDateData.list - List of all release years
 * @param {number[]} currentReleaseDateData.watchedList - List of watched item years
 * @returns {Object} Formatted decade data
 * @returns {number[]} return.counts - Total counts per decade
 * @returns {number[]} return.watchedCounts - Watched counts per decade
 * @returns {number[]} return.unwatchedCounts - Unwatched counts per decade
 *
 * @example
 * const releaseData = {
 *   list: [1995, 1998, 2001, 2015],
 *   watchedList: [1995, 2015]
 * };
 * const prepared = prepareDecadeChartData(releaseData);
 * // Updates global decades and decadePrefixes variables
 * // prepared.counts = [2, 1, 1]
 * // prepared.watchedCounts = [1, 0, 1]
 * // prepared.unwatchedCounts = [1, 1, 0]
 */
function prepareDecadeChartData(currentReleaseDateData) {
    if (!currentReleaseDateData.list || currentReleaseDateData.list.length === 0) {
        return {
            counts: [],
            watchedCounts: [],
            unwatchedCounts: []
        };
    }

    const { decades: generatedDecades, decadePrefixes: generatedPrefixes } = 
        generateDynamicDecades(currentReleaseDateData.list);

    if (generatedDecades.length === 0) {
        return {
            counts: [],
            watchedCounts: [],
            unwatchedCounts: []
        };
    }

    // Update global decades and decadePrefixes
    window.decades = generatedDecades;
    window.decadePrefixes = generatedPrefixes;

    const counts = countYearsByDecade(currentReleaseDateData.list, generatedPrefixes);
    const watchedCounts = countYearsByDecade(currentReleaseDateData.watchedList, generatedPrefixes);
    const unwatchedCounts = counts.map((total, i) => total - watchedCounts[i]);

    return {
        counts,
        watchedCounts,
        unwatchedCounts
    };
}

// Export for use in other modules (Node.js/Jest)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        applyChartData,
        prepareCategoryChartData,
        prepareAddedOverTimeData,
        getDecadePrefix,
        generateDynamicDecades,
        countYearsByDecade,
        prepareDecadeChartData
    };
}

// Make functions available globally for browser use
if (typeof window !== 'undefined') {
    window.applyChartData = applyChartData;
    window.prepareCategoryChartData = prepareCategoryChartData;
    window.prepareAddedOverTimeData = prepareAddedOverTimeData;
    window.getDecadePrefix = getDecadePrefix;
    window.generateDynamicDecades = generateDynamicDecades;
    window.countYearsByDecade = countYearsByDecade;
    window.prepareDecadeChartData = prepareDecadeChartData;
}

// Made with Bob

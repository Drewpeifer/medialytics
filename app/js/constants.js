/**
 * Constants and Configuration Module
 *
 * Centralized configuration values for Medialytics application.
 * This module provides a single source of truth for all magic numbers,
 * thresholds, and configuration values used throughout the application.
 *
 * @module constants
 * @author Bob (AI Assistant)
 * @version 2.6.1
 */

/**
 * Application-wide constants
 * @constant {Object} CONSTANTS
 * @property {number} DEFAULT_CHART_LIMIT - Default number of items to display in charts
 * @property {number} MAX_GENRES_FROM_API - Maximum genres returned by Plex API per item
 * @property {number} MAX_DIRECTORS_FROM_API - Maximum directors returned by Plex API per item
 * @property {number} MAX_ACTORS_FROM_API - Maximum actors returned by Plex API per item
 * @property {number} SCATTER_MARKER_SIZE - Size of markers in scatter plots
 * @property {number} TREEMAP_COLORS_COUNT - Number of colors in treemap visualizations
 * @property {number} BYTES_PER_GB - Bytes in one gigabyte (1024^3)
 * @property {number} BYTES_PER_MB - Bytes in one megabyte (1024^2)
 * @property {number} MINUTES_PER_HOUR - Minutes in one hour
 * @property {number} HOURS_PER_DAY - Hours in one day
 * @property {number} MINUTES_PER_DAY - Minutes in one day (24 * 60)
 * @property {string[]} MOVIE_RATINGS - Standard movie content ratings
 * @property {string[]} TV_RATINGS - Standard TV content ratings
 * @property {string} NOT_RATED - Label for unrated content
 * @property {string} UNMATCHED_LABEL - Label for unmatched library items
 */
const CONSTANTS = {
    // Chart display limits
    DEFAULT_CHART_LIMIT: 20,
    
    // Plex API limitations (how many items are returned in XML)
    MAX_GENRES_FROM_API: 2,
    MAX_DIRECTORS_FROM_API: 2,
    MAX_ACTORS_FROM_API: 3,
    
    // Chart visualization settings
    SCATTER_MARKER_SIZE: 5,
    TREEMAP_COLORS_COUNT: 20,
    
    // File size thresholds
    BYTES_PER_GB: 1073741824,
    BYTES_PER_MB: 1048576,
    
    // Time conversions
    MINUTES_PER_HOUR: 60,
    HOURS_PER_DAY: 24,
    MINUTES_PER_DAY: 1440,
    
    // Content ratings
    MOVIE_RATINGS: ['G', 'PG', 'PG-13', 'R'],
    TV_RATINGS: ['TV-G', 'TV-Y', 'TV-Y7', 'TV-Y7-FV', 'TV-PG', 'TV-14', 'TV-MA'],
    
    // Default values
    NOT_RATED: 'NR',
    UNMATCHED_LABEL: 'Unmatched'
};

/**
 * Chart display limits configuration
 * Controls how many items are shown in each chart type by default
 *
 * @constant {Object} chartLimits
 * @property {number} country - Maximum countries to display
 * @property {number} genre - Maximum genres to display
 * @property {number} resolution - Maximum resolutions to display
 * @property {number} container - Maximum container types to display
 * @property {number} studio - Maximum studios to display
 * @property {number} director - Maximum directors to display
 * @property {number} actor - Maximum actors to display
 * @property {number} decade - Maximum decades to display
 * @property {number} writer - Maximum writers to display
 * @property {number} contentRating - Maximum content ratings to display
 */
const chartLimits = {
    country: 20,
    genre: 20,
    resolution: 20,
    container: 20,
    studio: 20,
    director: 20,
    actor: 20,
    decade: 20,
    writer: 20,
    contentRating: 20
};

// Export for use in other modules (Node.js/Jest)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONSTANTS, chartLimits };
}

// Make constants available globally for browser use
if (typeof window !== 'undefined') {
    window.CONSTANTS = CONSTANTS;
    window.chartLimits = chartLimits;
}

// Made with Bob

/**
 * Utility Functions Module
 * 
 * Shared helper functions used across the Medialytics application.
 * This module provides reusable utilities for data formatting, CSV export,
 * and common operations to eliminate code duplication.
 * 
 * @module utils
 * @author Bob (AI Assistant)
 * @version 1.0.0
 */

const Utils = (function() {
    'use strict';

    /**
     * Escape CSV values for safe export
     * Handles commas, quotes, and newlines by wrapping in quotes
     * and escaping internal quotes by doubling them.
     * 
     * @param {*} value - Value to escape
     * @returns {string} Escaped CSV value
     */
    function escapeCSV(value) {
        if (value === null || value === undefined) {
            return '';
        }
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }

    /**
     * Format Unix timestamp to ISO date string (YYYY-MM-DD)
     * 
     * @param {number} timestamp - Unix timestamp in seconds
     * @returns {string} Formatted date string or empty string if invalid
     */
    function formatDate(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp * 1000);
        return date.toISOString().split('T')[0];
    }

    /**
     * Get media attribute from Plex item
     * Safely extracts attributes from the Media array
     * 
     * @param {Object} item - Plex media item
     * @param {string} attribute - Attribute name to extract
     * @returns {*} Attribute value or empty string if not found
     */
    function getMediaAttribute(item, attribute) {
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
                return media[attribute] || '';
        }
    }

    /**
     * Format file size in human-readable format
     * Converts bytes to appropriate unit (Bytes, KB, MB, GB, TB)
     * 
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted file size string
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Title comparator for sorting
     * Case-insensitive alphabetical comparison
     * 
     * @param {Object} a - First item with title property
     * @param {Object} b - Second item with title property
     * @returns {number} Comparison result (-1, 0, 1)
     */
    function titleComparator(a, b) {
        const titleA = (a.title || '').toLowerCase();
        const titleB = (b.title || '').toLowerCase();
        return titleA.localeCompare(titleB);
    }

    /**
     * Get attribute value from Plex item
     * Handles various attribute types including nested media attributes
     * 
     * @param {Object} item - Plex media item
     * @param {string} attribute - Attribute name
     * @returns {*} Attribute value
     */
    function getAttributeValue(item, attribute) {
        switch (attribute) {
            case 'title':
                return item.title || '';
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
                return item.duration ? Math.round(item.duration / 60000) : '';
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
            case 'director':
                // Handle Director array - join multiple directors with semicolon
                if (item.Director && Array.isArray(item.Director)) {
                    return item.Director.map(d => d.tag).join('; ');
                }
                return '';
            // Media attributes
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
                return item[attribute] || '';
        }
    }

    // Public API
    return {
        escapeCSV,
        formatDate,
        getMediaAttribute,
        formatFileSize,
        titleComparator,
        getAttributeValue
    };
})();

// Export for use in other modules (Node.js/Jest)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}

// Make functions available globally for browser use
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}

// Made with Bob
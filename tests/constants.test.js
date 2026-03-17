/**
 * Unit Tests for constants.js
 * Tests configuration values and chart limits
 */

const { CONSTANTS, chartLimits } = require('../app/js/constants.js');

describe('Constants Module', () => {
    describe('CONSTANTS object', () => {
        test('should have correct chart limit', () => {
            expect(CONSTANTS.DEFAULT_CHART_LIMIT).toBe(20);
        });

        test('should have correct Plex API limitations', () => {
            expect(CONSTANTS.MAX_GENRES_FROM_API).toBe(2);
            expect(CONSTANTS.MAX_DIRECTORS_FROM_API).toBe(2);
            expect(CONSTANTS.MAX_ACTORS_FROM_API).toBe(3);
        });

        test('should have correct file size thresholds', () => {
            expect(CONSTANTS.BYTES_PER_GB).toBe(1073741824);
            expect(CONSTANTS.BYTES_PER_MB).toBe(1048576);
        });

        test('should have correct time conversions', () => {
            expect(CONSTANTS.MINUTES_PER_HOUR).toBe(60);
            expect(CONSTANTS.HOURS_PER_DAY).toBe(24);
            expect(CONSTANTS.MINUTES_PER_DAY).toBe(1440);
        });

        test('should have movie ratings array', () => {
            expect(CONSTANTS.MOVIE_RATINGS).toEqual(['G', 'PG', 'PG-13', 'R']);
            expect(CONSTANTS.MOVIE_RATINGS).toHaveLength(4);
        });

        test('should have TV ratings array', () => {
            expect(CONSTANTS.TV_RATINGS).toContain('TV-G');
            expect(CONSTANTS.TV_RATINGS).toContain('TV-MA');
            expect(CONSTANTS.TV_RATINGS).toHaveLength(7);
        });

        test('should have default values', () => {
            expect(CONSTANTS.NOT_RATED).toBe('NR');
            expect(CONSTANTS.UNMATCHED_LABEL).toBe('Unmatched');
        });
    });

    describe('chartLimits object', () => {
        test('should have all required chart limits', () => {
            const requiredLimits = [
                'country', 'genre', 'resolution', 'container',
                'studio', 'director', 'actor', 'decade',
                'writer', 'contentRating'
            ];

            requiredLimits.forEach(limit => {
                expect(chartLimits).toHaveProperty(limit);
                expect(chartLimits[limit]).toBe(20);
            });
        });

        test('should have exactly 10 chart limits', () => {
            expect(Object.keys(chartLimits)).toHaveLength(10);
        });

        test('all limits should be positive numbers', () => {
            Object.values(chartLimits).forEach(limit => {
                expect(typeof limit).toBe('number');
                expect(limit).toBeGreaterThan(0);
            });
        });
    });
});

// Made with Bob

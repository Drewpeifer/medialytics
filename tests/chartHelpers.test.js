/**
 * Unit Tests for chartHelpers.js
 * Tests chart data preparation and formatting functions
 */

const {
    applyChartData,
    prepareCategoryChartData,
    prepareAddedOverTimeData,
    getDecadePrefix,
    generateDynamicDecades,
    countYearsByDecade,
    prepareDecadeChartData
} = require('../app/js/chartHelpers.js');

describe('Chart Helpers Module', () => {
    describe('getDecadePrefix', () => {
        test('should return correct decade prefix for 1990s', () => {
            expect(getDecadePrefix(1995)).toBe(1990);
            expect(getDecadePrefix(1999)).toBe(1990);
            expect(getDecadePrefix(1990)).toBe(1990);
        });

        test('should return correct decade prefix for 2000s', () => {
            expect(getDecadePrefix(2000)).toBe(2000);
            expect(getDecadePrefix(2005)).toBe(2000);
            expect(getDecadePrefix(2009)).toBe(2000);
        });

        test('should return correct decade prefix for 2010s', () => {
            expect(getDecadePrefix(2010)).toBe(2010);
            expect(getDecadePrefix(2015)).toBe(2010);
            expect(getDecadePrefix(2019)).toBe(2010);
        });

        test('should handle edge cases', () => {
            expect(getDecadePrefix(2020)).toBe(2020);
            expect(getDecadePrefix(1980)).toBe(1980);
            expect(getDecadePrefix(1)).toBe(0);
        });
    });

    describe('generateDynamicDecades', () => {
        test('should generate decades from year list', () => {
            const years = [1995, 1998, 2001, 2015];
            const result = generateDynamicDecades(years);
            
            expect(result.decadePrefixes).toEqual([1990, 2000, 2010]);
            expect(result.decades).toEqual(['1990s', '2000s', '2010s']);
        });

        test('should handle single decade', () => {
            const years = [2015, 2016, 2017];
            const result = generateDynamicDecades(years);
            
            expect(result.decadePrefixes).toEqual([2010]);
            expect(result.decades).toEqual(['2010s']);
        });

        test('should handle empty array', () => {
            const result = generateDynamicDecades([]);
            
            expect(result.decadePrefixes).toEqual([]);
            expect(result.decades).toEqual([]);
        });

        test('should remove duplicates', () => {
            const years = [1995, 1996, 1997, 1998, 1999];
            const result = generateDynamicDecades(years);
            
            expect(result.decadePrefixes).toEqual([1990]);
            expect(result.decades).toEqual(['1990s']);
        });

        test('should sort decades chronologically', () => {
            const years = [2015, 1995, 2005, 1985];
            const result = generateDynamicDecades(years);
            
            expect(result.decadePrefixes).toEqual([1980, 1990, 2000, 2010]);
            expect(result.decades).toEqual(['1980s', '1990s', '2000s', '2010s']);
        });
    });

    describe('countYearsByDecade', () => {
        test('should count years correctly', () => {
            const years = [1995, 1998, 2001, 2015, 2018];
            const decades = [1990, 2000, 2010];
            const counts = countYearsByDecade(years, decades);
            
            expect(counts).toEqual([2, 1, 2]);
        });

        test('should handle empty year list', () => {
            const decades = [1990, 2000, 2010];
            const counts = countYearsByDecade([], decades);
            
            expect(counts).toEqual([0, 0, 0]);
        });

        test('should handle years not in decade list', () => {
            const years = [1985, 1995, 2025];
            const decades = [1990, 2000, 2010];
            const counts = countYearsByDecade(years, decades);
            
            expect(counts).toEqual([1, 0, 0]);
        });

        test('should handle all years in one decade', () => {
            const years = [2010, 2011, 2012, 2013];
            const decades = [2000, 2010, 2020];
            const counts = countYearsByDecade(years, decades);
            
            expect(counts).toEqual([0, 4, 0]);
        });
    });

    describe('prepareCategoryChartData', () => {
        test('should prepare basic category data', () => {
            const categoryData = {
                data: { Action: 50, Drama: 30, Comedy: 20 },
                watched: { Action: 20, Drama: 15, Comedy: 10 }
            };
            
            const result = prepareCategoryChartData(categoryData);
            
            expect(result.list).toEqual(['Action', 'Drama', 'Comedy']);
            expect(result.counts).toEqual([50, 30, 20]);
            expect(result.watched).toEqual([20, 15, 10]);
            expect(result.unwatched).toEqual([30, 15, 10]);
        });

        test('should sort by count descending', () => {
            const categoryData = {
                data: { A: 10, B: 50, C: 30 },
                watched: { A: 5, B: 25, C: 15 }
            };
            
            const result = prepareCategoryChartData(categoryData);
            
            expect(result.list).toEqual(['B', 'C', 'A']);
            expect(result.counts).toEqual([50, 30, 10]);
        });

        test('should handle missing watched data', () => {
            const categoryData = {
                data: { Action: 50, Drama: 30 },
                watched: { Action: 20 }
            };
            
            const result = prepareCategoryChartData(categoryData);
            
            expect(result.watched).toEqual([20, 0]);
            expect(result.unwatched).toEqual([30, 30]);
        });

        test('should remove undefined entries', () => {
            const categoryData = {
                data: { Action: 50, undefined: 10, Drama: 30 },
                watched: { Action: 20, Drama: 15 }
            };
            
            const result = prepareCategoryChartData(categoryData);
            
            expect(result.list).not.toContain('undefined');
            expect(result.list).toHaveLength(2);
        });

        test('should return sortedEntries', () => {
            const categoryData = {
                data: { Action: 50, Drama: 30 },
                watched: {}
            };
            
            const result = prepareCategoryChartData(categoryData);
            
            expect(result.sortedEntries).toBeDefined();
            expect(result.sortedEntries).toHaveLength(2);
            expect(result.sortedEntries[0]).toEqual(['Action', 50]);
        });
    });

    describe('prepareAddedOverTimeData', () => {
        test('should prepare time series data', () => {
            const timeData = {
                dates: {
                    '2024-01-01': 5,
                    '2024-01-02': 3,
                    '2024-01-03': 7
                }
            };
            
            const result = prepareAddedOverTimeData(timeData);
            
            expect(result.datesList).toEqual(['2024-01-01', '2024-01-02', '2024-01-03']);
            expect(result.counts).toEqual([5, 3, 7]);
            expect(result.cumulativeCounts).toEqual([5, 8, 15]);
        });

        test('should sort dates chronologically', () => {
            const timeData = {
                dates: {
                    '2024-01-03': 7,
                    '2024-01-01': 5,
                    '2024-01-02': 3
                }
            };
            
            const result = prepareAddedOverTimeData(timeData);
            
            expect(result.datesList).toEqual(['2024-01-01', '2024-01-02', '2024-01-03']);
        });

        test('should calculate cumulative counts correctly', () => {
            const timeData = {
                dates: {
                    '2024-01-01': 10,
                    '2024-01-02': 20,
                    '2024-01-03': 30
                }
            };
            
            const result = prepareAddedOverTimeData(timeData);
            
            expect(result.cumulativeCounts).toEqual([10, 30, 60]);
        });

        test('should handle empty dates', () => {
            const timeData = { dates: {} };
            
            const result = prepareAddedOverTimeData(timeData);
            
            expect(result.datesList).toEqual([]);
            expect(result.counts).toEqual([]);
            expect(result.cumulativeCounts).toEqual([]);
        });
    });

    describe('applyChartData', () => {
        test('should apply chart data to category structure', () => {
            const categoryData = {
                data: { Action: 50, Drama: 30 },
                watched: { Action: 20, Drama: 15 },
                chartList: [],
                chartCounts: [],
                chartWatchedCounts: [],
                chartUnwatchedCounts: []
            };
            
            const result = applyChartData(categoryData);
            
            expect(categoryData.chartList).toEqual(['Action', 'Drama']);
            expect(categoryData.chartCounts).toEqual([50, 30]);
            expect(categoryData.chartWatchedCounts).toEqual([20, 15]);
            expect(categoryData.chartUnwatchedCounts).toEqual([30, 15]);
            expect(result).toBe(categoryData);
        });

        test('should return the modified category data', () => {
            const categoryData = {
                data: { Test: 10 },
                watched: {},
                chartList: [],
                chartCounts: [],
                chartWatchedCounts: [],
                chartUnwatchedCounts: []
            };
            
            const result = applyChartData(categoryData);
            
            expect(result).toBe(categoryData);
            expect(result.chartList).toHaveLength(1);
        });
    });

    describe('prepareDecadeChartData', () => {
        test('should prepare complete decade data', () => {
            const releaseData = {
                list: [1995, 1998, 2001, 2015],
                watchedList: [1995, 2015]
            };
            
            const result = prepareDecadeChartData(releaseData);
            
            expect(result.counts).toHaveLength(3);
            expect(result.watchedCounts).toHaveLength(3);
            expect(result.unwatchedCounts).toHaveLength(3);
        });

        test('should handle empty release data', () => {
            const releaseData = {
                list: [],
                watchedList: []
            };
            
            const result = prepareDecadeChartData(releaseData);
            
            expect(result.counts).toEqual([]);
            expect(result.watchedCounts).toEqual([]);
            expect(result.unwatchedCounts).toEqual([]);
        });

        test('should calculate unwatched counts correctly', () => {
            const releaseData = {
                list: [2010, 2011, 2012],
                watchedList: [2010]
            };
            
            const result = prepareDecadeChartData(releaseData);
            
            expect(result.counts[0]).toBe(3);
            expect(result.watchedCounts[0]).toBe(1);
            expect(result.unwatchedCounts[0]).toBe(2);
        });
    });
});

// Made with Bob

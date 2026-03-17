/**
 * Unit Tests for dataStructures.js
 * Tests factory functions for data structure creation
 */

const {
    createCategoryData,
    createTimeSeriesData,
    createReleaseDateData,
    createFileSizeData,
    createShowsData,
    createCollectionsData,
    createRatingsData
} = require('../app/js/dataStructures.js');

describe('Data Structures Module', () => {
    describe('createCategoryData', () => {
        test('should create empty category data structure', () => {
            const categoryData = createCategoryData();
            
            expect(categoryData).toHaveProperty('data');
            expect(categoryData).toHaveProperty('list');
            expect(categoryData).toHaveProperty('counts');
            expect(categoryData).toHaveProperty('watched');
            expect(categoryData).toHaveProperty('watchedCounts');
            expect(categoryData).toHaveProperty('unwatchedCounts');
        });

        test('should initialize with empty objects and arrays', () => {
            const categoryData = createCategoryData();
            
            expect(categoryData.data).toEqual({});
            expect(categoryData.list).toEqual([]);
            expect(categoryData.counts).toEqual([]);
            expect(categoryData.watched).toEqual({});
            expect(categoryData.watchedCounts).toEqual([]);
            expect(categoryData.unwatchedCounts).toEqual([]);
        });

        test('should create independent instances', () => {
            const data1 = createCategoryData();
            const data2 = createCategoryData();
            
            data1.data['test'] = 1;
            expect(data2.data).not.toHaveProperty('test');
        });

        test('should have chart properties', () => {
            const categoryData = createCategoryData();
            
            expect(categoryData).toHaveProperty('chartList');
            expect(categoryData).toHaveProperty('chartCounts');
            expect(categoryData).toHaveProperty('chartWatchedCounts');
            expect(categoryData).toHaveProperty('chartUnwatchedCounts');
        });
    });

    describe('createTimeSeriesData', () => {
        test('should create empty time series structure', () => {
            const timeData = createTimeSeriesData();
            
            expect(timeData).toHaveProperty('dates');
            expect(timeData).toHaveProperty('datesList');
            expect(timeData).toHaveProperty('counts');
            expect(timeData).toHaveProperty('cumulativeCounts');
        });

        test('should initialize with empty objects and arrays', () => {
            const timeData = createTimeSeriesData();
            
            expect(timeData.dates).toEqual({});
            expect(timeData.datesList).toEqual([]);
            expect(timeData.counts).toEqual([]);
            expect(timeData.cumulativeCounts).toEqual([]);
        });
    });

    describe('createReleaseDateData', () => {
        test('should create release date structure', () => {
            const releaseData = createReleaseDateData();
            
            expect(releaseData).toHaveProperty('list');
            expect(releaseData).toHaveProperty('counts');
            expect(releaseData).toHaveProperty('oldestTitle');
            expect(releaseData).toHaveProperty('oldestReleaseDate');
            expect(releaseData).toHaveProperty('watchedList');
            expect(releaseData).toHaveProperty('watchedCounts');
            expect(releaseData).toHaveProperty('unwatchedCounts');
        });

        test('should initialize oldest values as empty strings', () => {
            const releaseData = createReleaseDateData();
            
            expect(releaseData.oldestTitle).toBe('');
            expect(releaseData.oldestReleaseDate).toBe('');
        });
    });

    describe('createFileSizeData', () => {
        test('should create file size structure', () => {
            const fileSizeData = createFileSizeData();
            
            expect(fileSizeData).toHaveProperty('items');
            expect(fileSizeData).toHaveProperty('resolutionColors');
            expect(fileSizeData).toHaveProperty('totalFileSize');
            expect(fileSizeData).toHaveProperty('largestFile');
            expect(fileSizeData).toHaveProperty('smallestFile');
        });

        test('should initialize with correct default values', () => {
            const fileSizeData = createFileSizeData();
            
            expect(fileSizeData.totalFileSize).toBe(0);
            expect(fileSizeData.largestFileSize).toBe(0);
            expect(fileSizeData.smallestFileSize).toBe(Number.MAX_SAFE_INTEGER);
            expect(fileSizeData.highestBitrate).toBe(0);
            expect(fileSizeData.lowestBitrate).toBe(Number.MAX_SAFE_INTEGER);
        });

        test('should have bitrate tracking properties', () => {
            const fileSizeData = createFileSizeData();
            
            expect(fileSizeData).toHaveProperty('highestBitrateFile');
            expect(fileSizeData).toHaveProperty('highestBitrate');
            expect(fileSizeData).toHaveProperty('lowestBitrateFile');
            expect(fileSizeData).toHaveProperty('lowestBitrate');
        });
    });

    describe('createShowsData', () => {
        test('should create shows structure', () => {
            const showsData = createShowsData();
            
            expect(showsData).toHaveProperty('shows');
            expect(showsData).toHaveProperty('seasonsByShow');
            expect(showsData).toHaveProperty('mostSeasonsShow');
            expect(showsData).toHaveProperty('mostSeasonsCount');
            expect(showsData).toHaveProperty('mostEpisodesShow');
            expect(showsData).toHaveProperty('mostEpisodesCount');
        });

        test('should initialize counts to zero', () => {
            const showsData = createShowsData();
            
            expect(showsData.mostSeasonsCount).toBe(0);
            expect(showsData.mostEpisodesCount).toBe(0);
        });
    });

    describe('createCollectionsData', () => {
        test('should create collections structure', () => {
            const collectionsData = createCollectionsData();
            
            expect(collectionsData).toHaveProperty('collections');
            expect(collectionsData).toHaveProperty('totalCollections');
            expect(collectionsData).toHaveProperty('totalItemsInCollections');
            expect(collectionsData).toHaveProperty('largestCollection');
            expect(collectionsData).toHaveProperty('largestCollectionCount');
        });

        test('should have chart arrays', () => {
            const collectionsData = createCollectionsData();
            
            expect(collectionsData).toHaveProperty('collectionNames');
            expect(collectionsData).toHaveProperty('collectionCounts');
            expect(collectionsData).toHaveProperty('collectionWatchedCounts');
            expect(collectionsData).toHaveProperty('collectionUnwatchedCounts');
        });
    });

    describe('createRatingsData', () => {
        test('should create ratings structure', () => {
            const ratingsData = createRatingsData();
            
            expect(ratingsData).toHaveProperty('list');
            expect(ratingsData).toHaveProperty('content');
            expect(ratingsData).toHaveProperty('movies');
            expect(ratingsData).toHaveProperty('tv');
            expect(ratingsData).toHaveProperty('highest');
            expect(ratingsData).toHaveProperty('lowest');
        });

        test('should have predefined movie ratings', () => {
            const ratingsData = createRatingsData();
            
            expect(ratingsData.movies).toEqual(['G', 'PG', 'PG-13', 'R']);
        });

        test('should have predefined TV ratings', () => {
            const ratingsData = createRatingsData();
            
            expect(ratingsData.tv).toContain('TV-G');
            expect(ratingsData.tv).toContain('TV-MA');
            expect(ratingsData.tv).toHaveLength(7);
        });
    });
});

// Made with Bob

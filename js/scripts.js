// Instructions:
// Replace IP address with your public server address, e.g. http://123.456.78.910:12345
// Replace token with your server token ** KEEP PRIVATE **
// Modify any library information to match your server's XML payload (e.g. libary ID's)
/////////////

var serverIp = 'YOUR_IP',
    serverToken = 'YOUR_TOKEN',
    libraryStats = {},
    moviesPayloadUrl = serverIp + '/library/sections/1/all?X-Plex-Token=' + serverToken,
    tvPayloadUrl = serverIp + '/library/sections/2/all?X-Plex-Token=' + serverToken,
    recentlyAddedUrl = serverIp + '/library/recentlyAdded/search?type=1&X-Plex-Container-Start=0&X-Plex-Container-Size=20&X-Plex-Token=' + serverToken,
    catalogQueryButton = $('.query'),
    catalogGrid = $('.content .grid'),
    catalogFilterButton = $('button.filter'),
    catalogSortButton = $('button.sort');

// this function is fed a url and retrieves an XML payload
jQuery.extend({
    getPayload: function(name, url) {
        var payload = null;
        $.ajax({
            url: url,
            type: "GET",
            dataType: "xml",
            async: false,
            timeout: 5000,
            beforeSend: function() {
                // call starts
            },
            complete: function() {
                // call ends (before success/error)
            },
            success: function(data) {
                console.log('ajax success');
                payload = data;
            },
            error: function(jqXHR, textStatus, errorThrown){
              $('.alert').html('<p>Sorry!</p><p>The server must be down right now, or you\'re behind a firewall, or your browser doesn\'t like unsecured requests.</p>');
              console.log('Error = ' + textStatus + '! The media server must be down right now, sorry.');
            }
        });
       return payload;
    }
});

///////////////////////////////////////////////////////////////////
// render recently added list (most recent 20 entries) on page load
function renderRecentlyAdded(xmlData) {

    var recentEntries = xmlData.children[0].children,
        grid = $('.recently-added .scroll-grid .grid');

    $.each(recentEntries, function() {

        var entry = $(this),
            nodeName = this.nodeName;// Video = movie, Directory = show

        if (nodeName == "Directory") {
            // entry is a show
            var name = entry.attr('parentTitle') + " / " + entry.attr('title'),
                img = entry.attr('parentThumb'),
                dateAdded = entry.attr('addedAt'),
                type = "show",
                imgUrl = serverIp + img + '?X-Plex-Token=' + serverToken;

            // build UI for each entry
            entryInterface = $('<div ' +
                                'data-name="' + name + '" ' +
                                'data-dateadded="' + dateAdded + '" ' +
                                'data-src="' + imgUrl + '" ' +
                                'style="background-image:url(' + imgUrl + ')" ' +
                                'class="entry ' + type + '">' +
                                '<img class="entry-icon" src="img/' + type + '.jpg">' +
                                '<p class="name">' + name + '</p>' +
                                '</div>');
        } else {
            // entry is a movie
            var name = entry.attr('title'),
                year = entry.attr('year'),
                img = entry.attr('thumb'),
                type = entry.attr('type'),
                duration = entry.attr('duration'),
                dateAdded = entry.attr('addedAt'),
                ratingMPAA = entry.attr('contentRating'),
                ratingAudience = entry.attr('audienceRating'),
                imgUrl = serverIp + img + '?X-Plex-Token=' + serverToken;

            // build UI for each entry
            entryInterface = $('<div data-datereleased="' + year + '" ' +
                                'data-name="' + name + '" ' +
                                'data-dateadded="' + dateAdded + '" ' +
                                'data-duration="' + duration + '" ' +
                                'data-src="' + imgUrl + '" ' +
                                'style="background-image:url(' + imgUrl + ')" ' +
                                'class="entry ' + type + '">' +
                                '<img class="entry-icon" src="img/' + type + '.jpg">' +
                                '<p class="name">' + name + ' (' + year + ')</p>' +
                                '<p class="rating-MPAA">Rated: ' + ratingMPAA + '</p>' +
                                '<p class="rating-audience">Rotten Tomatoes: ' + ratingAudience + '</p>' +
                                '</div>');
        }

        // append it to the target list
        entryInterface.appendTo(grid);
    });

}

///////////////////////////////////
// render movie charts on page load
function renderMovieData(jsonData) {
    var movieCount = jsonData.MediaContainer.Video.length,
        countries = {},// this stores country: count
        countryList = [],
        countryCounts = [],
        releaseDateList = [],
        releaseDateCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        decadePrefixes = ["193", "194", "195", "196", "197", "198", "199", "200", "201", "202"],
        decades = ["1930s", "1940s", "1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"],
        studioList = [],
        genres = {},// this stores genre: count, and is then split into the two following arrays
        genreList = [],
        genreCounts = [],
        durationSum = 0,
        increment = "Movies";

    // loop through movies and gather important data
    $.each(jsonData.MediaContainer.Video, function(i) {
        // track year
        releaseDateList.push(this['@attributes'].year);
        // track studio
        studioList.push(this['@attributes'].studio);
        // track durations
        durationSum = durationSum + (this['@attributes'].duration/60000);
        if (i == jsonData.MediaContainer.Video.length - 1) {
            // if it's the last entry
            // append stats to library stats panel
            var totalMins = Math.round(durationSum),
                totalHours = Math.floor(durationSum/60),
                totalDays = Math.floor(durationSum/24/60),
                displayHours = totalHours - (totalDays*24),
                displayMins = totalMins - (totalHours*60);

            $('.statistics .data-grid .grid').append('<div class="data-entry" title="Movies-stats"><h4 class="title">Movies</h4>' +
                '<p class="stat count"><strong>' + movieCount + '</strong> ' + increment + '</p>' +
                '<p class="stat duration"><strong>' + totalDays + '</strong> Days / <strong>' +
                displayHours + '</strong> Hours / <strong>' +
                displayMins + '</strong> Mins</p></div>');
        }
        // track genres
        if (this.Genre) {
            // check if a genre exists for movie
            if (this.Genre.length > 1) {
                // handle multiple genres, which is an array of objects
                $.each(this.Genre, function() {
                    if (genres.hasOwnProperty(this['@attributes'].tag)) {
                        // if genre exists in the dictionary already,
                        // find the genre and increment the count
                        genres[this['@attributes'].tag]++;
                    } else {
                        genres[this['@attributes'].tag] = 1;
                    }
                });
            } else {
                // handle single genre which is an object / dictionary
                if (genres.hasOwnProperty(this['@attributes'].tag)) {
                    // if genre exists in the dictionary already,
                    // find the genre and increment the count
                    genres[this['@attributes'].tag]++;
                } else {
                    genres[this['@attributes'].tag] = 1;
                }
            }
        } else {
            // no genres
        }
        // track countries
        if (this.Country) {
            // check if a country exists for movie
            if (this.Country.length > 1) {
                // handle multiple countries, which is an array of objects
                $.each(this.Country, function() {
                    if (countries.hasOwnProperty(this['@attributes'].tag)) {
                        // if country exists in the dictionary already,
                        // find the country and increment the count
                        countries[this['@attributes'].tag]++;
                    } else {
                        countries[this['@attributes'].tag] = 1;
                    }
                });
            } else {
                // handle single country which is an object / dictionary
                if (countries.hasOwnProperty(this['@attributes'].tag)) {
                    // if country exists in the dictionary already,
                    // find the country and increment the count
                    countries[this['@attributes'].tag]++;
                } else {
                    countries[this['@attributes'].tag] = 1;
                }
            }
        } else {
            // no countries
        }
    });

    // remove undefined entry from genres dictionary, I'm choosing not to report on movies without genre
    delete genres['undefined'];
    // same for countries
    delete countries['undefined'];

    //////////////////////////
    // movies by country chart


    var sortedCountries = [];

    for (var country in countries) {
        sortedCountries.push([country, countries[country]]);
    }
    sortedCountries.sort(function(a, b) {
        return a[1] - b[1];
    })
    sortedCountries = sortedCountries.reverse();

    for (var property in sortedCountries) {
        // split the countries dictionary into an array of countries and an array of counts
        countryList.push(sortedCountries[property][0]);
        countryCounts.push(sortedCountries[property][1]);
    }
    if (countryList.length >= 20) {
        // trim to top 20, accounting for placeholder string in chart array
        countryList.length = 20;
        countryCounts.length = 20;
    }

    countryCounts.unshift("countryCounts");
    c3.generate({
        size: {
            height: 550
        },
        bindto: '.movies-by-country',
        x: 'x',
        data: {
            columns: [
                countryCounts
            ],
            type: 'bar'
        },
        axis: {
            rotated: true,
            x: {
                type: 'category',
                categories: countryList
            }
        },
        legend: {
            hide: true
        },
        color: {
            pattern: ['#D62828', '#F75C03', '#F77F00', '#FCBF49', '#EAE2B7']
        }
    });

    ////////////////////////
    // movies by genre chart
    var sortedGenres = [];
    for (var genre in genres) {
        sortedGenres.push([genre, genres[genre]]);
    }
    sortedGenres.sort(function(a, b) {
        return a[1] - b[1];
    })
    sortedGenres = sortedGenres.reverse();
    // split the sorted genres dictionary into an array of genres and an array of counts
    for (var property in sortedGenres) {
        genreList.push(sortedGenres[property][0]);
        genreCounts.push(sortedGenres[property][1]);
    }

    if (genreList.length >= 20) {
        genreList.length = 20;
        genreCounts.length = 20;
    }
    genreCounts.unshift("genreCounts");
    c3.generate({
        size: {
            height: 550
        },
        bindto: '.movies-by-genre',
        x: 'x',
        data: {
            columns: [
                genreCounts
            ],
            type: 'bar'
        },
        axis: {
            rotated: true,
            x: {
                type: 'category',
                categories: genreList
            }
        },
        legend: {
            hide: true
        },
        color: {
            pattern: ['#D62828', '#F75C03', '#F77F00', '#FCBF49', '#EAE2B7']
        }
    });

    /////////////////////////
    // movies by decade chart
    $.each(releaseDateList, function() {
        // TODO: find a better way to do the following...
        // sort through the releaseDateList,
        // and depending on which decade prefix matches the year value,
        // increment the corresponding releaseDateCount

        if (typeof this === 'string' || this instanceof String) {
            var yearSub = this.substring(0, 3);
        } else {
            var yearSub = "undefined";
        }

        for (var i = 0; i < decadePrefixes.length; i++) {
            if (yearSub == decadePrefixes[i]) {
                releaseDateCounts[i]++;
            }
        }

        // if (yearSub == decadePrefixes[0]) {
        //     releaseDateCounts[0]++;
        // } else if (yearSub == decadePrefixes[1]) {
        //     releaseDateCounts[1]++;
        // } else if (yearSub == decadePrefixes[2]) {
        //     releaseDateCounts[2]++;
        // } else if (yearSub == decadePrefixes[3]) {
        //     releaseDateCounts[3]++;
        // } else if (yearSub == decadePrefixes[4]) {
        //     releaseDateCounts[4]++;
        // } else if (yearSub == decadePrefixes[5]) {
        //     releaseDateCounts[5]++;
        // } else if (yearSub == decadePrefixes[6]) {
        //     releaseDateCounts[6]++;
        // } else if (yearSub == decadePrefixes[7]) {
        //     releaseDateCounts[7]++;
        // } else if (yearSub == decadePrefixes[8]) {
        //     releaseDateCounts[8]++;
        // } else {
        //     // date falls outside range
        //     console.log('date out of range');
        // }
    });
    releaseDateCounts.unshift("releaseDateCounts");
    c3.generate({
        bindto: '.movies-by-decade',
        x: 'x',
        data: {
            columns: [
                releaseDateCounts
            ],
            type: 'bar'
        },
        axis: {
            x: {
                type: 'category',
                categories: decades
            }
        },
        legend: {
            hide: true
        },
        color: {
            pattern: ['#D62828', '#F75C03', '#F77F00', '#FCBF49', '#EAE2B7']
        }
    });

    ////////////////////////
    // movies by studio chart
    var studioInstances = {},
        studios = [];
    // count how many times each studio occurs in studioList,
    // and build a dictionary from results
    for (var i = 0, j = studioList.length; i < j; i++) {
       studioInstances[studioList[i]] = (studioInstances[studioList[i]] || 0) + 1;
    }
    // split dictionary into two arrays
    for (var prop in studioInstances) {
       if (!studioInstances.hasOwnProperty(prop)) {
          continue;
       }
       studios.push([prop, studioInstances[prop]]);
    }

    c3.generate({
        bindto: '.movies-by-studio',
        data: {
            columns: studios.slice(0, 50),
            type : 'pie'
        },
        pie: {
            label: {
                format: function (value, ratio, id) {
                    return value;
                }
            }
        },
        color: {
            pattern: ['#D62828', '#F75C03', '#F77F00', '#FCBF49', '#EAE2B7']
        },
        legend: {
            hide: true
        },
        tooltip: {
            format: {
                value: function (value, ratio, id) {
                    return id + ' : ' + value;
                }
            }
        }
    });
}

////////////////////////////////
// render TV charts on page load
function renderTVData(jsonData) {
    var showCount = jsonData.MediaContainer.Directory.length,
        releaseDateList = [],
        releaseDateCounts = [0, 0, 0, 0, 0, 0, 0],
        decadePrefixes = ["196", "197", "198", "199", "200", "201", "202"],
        decades = ["1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"],
        studioList = [],
        seasonCount = 0,
        episodeCounts = [],
        durationList = [],
        increment = "Shows";////////////////////////

    // loop through TV and gather important data
    $.each(jsonData.MediaContainer.Directory, function(i) {
        if (!this['@attributes']) {
            // only occurs when there's a node in the tree that's just a string (still typeof === Object)
        } else {
            // track year
            releaseDateList.push(this['@attributes'].year);
            // track studio
            studioList.push(this['@attributes'].studio);
            // track number of seasons
            seasonCount = seasonCount + parseInt(this['@attributes'].childCount);
            // track durations for each series
            if (isNaN(this['@attributes'].duration)) {
                // duration is NaN
            } else {
                durationList.push(parseInt(Math.round(this['@attributes'].duration/60000)));
                // track number of episodes
                episodeCounts.push(parseInt(this['@attributes'].leafCount));
                if (i == jsonData.MediaContainer.Directory.length - 1) {
                    // if it's the last entry, perform some calcs and
                    // append count/duration stats to library stat panel
                    seasonDurations = [];

                    $.each(durationList, function(i) {
                        // multiply each season's avg ep duration by the number of eps
                        seasonDur = this * episodeCounts[i];
                        seasonDurations.push(seasonDur);

                    });

                    totalDuration = seasonDurations.reduce(function(acc, val) { return acc + val; }, 0);
                    totalEpisodes = episodeCounts.reduce(function(acc, val) { return acc + val; }, 0);

                    var totalMins = Math.round(totalDuration),
                        totalHours = Math.floor(totalDuration/60),
                        totalDays = Math.floor(totalDuration/24/60),
                        displayHours = totalHours - (totalDays*24),
                        displayMins = totalMins - (totalHours*60);

                    $('.statistics .data-grid .grid').append('<div class="data-entry" title="TV-stats"><h4 class="title">TV</h4>' +
                        '<p class="stat count"><strong>' + showCount +
                        '</strong> ' + increment + ' / <strong>' + seasonCount + '</strong> Seasons / <strong>' +
                        totalEpisodes + '</strong> Eps</p>' +
                        '<p class="stat duration"><strong>' + totalDays + '</strong> Days / <strong>' +
                        displayHours + '</strong> Hours / <strong>' +
                        displayMins + '</strong> Mins</p></div>');
                }
            }
        }
    });

    ///////////////////////////
    // TV Shows by decade chart
    $.each(releaseDateList, function() {
        // TODO: find a better way to do the following...
        // sort through the releaseDateList,
        // and depending on which decade prefix matches the year value,
        // increment the corresponding releaseDateCount
        if (typeof this === 'string' || this instanceof String) {
            var yearSub = this.substring(0, 3);
        } else {
            var yearSub = "undefined";
        }

        for (var i = 0; i < decadePrefixes.length; i++) {
            if (yearSub == decadePrefixes[i]) {
                releaseDateCounts[i]++;
            }
        }
    });
    releaseDateCounts.unshift("releaseDateCounts");
    c3.generate({
        bindto: '.shows-by-decade',
        x: 'x',
        data: {
            columns: [
                releaseDateCounts
            ],
            type: 'bar'
        },
        axis: {
            x: {
                type: 'category',
                categories: decades
            }
        },
        legend: {
            hide: true
        },
        color: {
            pattern: ['#D62828', '#F75C03', '#F77F00', '#FCBF49', '#EAE2B7']
        }
    });

    ///////////////////////////
    // TV shows by studio chart
    var studioInstances = {},
        studios = [];
    // count how many times each studio occurs in studioList,
    // and build a dictionary from results
    for (var i = 0, j = studioList.length; i < j; i++) {
       studioInstances[studioList[i]] = (studioInstances[studioList[i]] || 0) + 1;
    }
    // split dictionary into two arrays
    for (var prop in studioInstances) {
       if (!studioInstances.hasOwnProperty(prop)) {
          continue;
       }
       studios.push([prop, studioInstances[prop]]);
    }
    c3.generate({
        bindto: '.shows-by-studio',
        data: {
            columns: studios.slice(0, 50),
            type : 'pie'
        },
        pie: {
            label: {
                format: function (value, ratio, id) {
                    return value;
                }
            }
        },
        color: {
            pattern: ['#D62828', '#F75C03', '#F77F00', '#FCBF49', '#EAE2B7']
        },
        legend: {
            hide: true
        },
        tooltip: {
            format: {
                value: function (value, ratio, id) {
                    return id + ' : ' + value;
                }
            }
        }
    });
}

////////////////////////////////////////////////////////////////////////////////////
// Render catalog - this function accepts payloads from one or more urls and creates
// a grid, displaying cover art and basic metadata in a sortable, filterable UI
function renderGrid(payloadUrls) {
    var wrapper = $('.content'),
    // set count to 0
    count = 0,
    // build URLs
    token = 'X-Plex-Token=' + serverToken,
    baseUrl = serverIp + '/library/sections/all?' + token,
    moviesUrl = serverIp + '/library/sections/1/all?' + token,
    showsUrl = serverIp + '/library/sections/2/all?' + token,
    recentlyAddedUrl = serverIp + '/library/recentlyAdded/search?type=1&X-Plex-Container-Start=0&X-Plex-Container-Size=20&' + token,
    urls = payloadUrls;// passed from the query, must be an array (even if a single payload)

    // disable query button
    catalogQueryButton.attr('disabled', 'disabled');

    // for each entry in urls, grab XML and build the grid
    // that displays the **total media in your catalog** (e.g. Movies + TV)
    $.each(urls, function(i, url) {
        wrapper = $('.content');
        payload = $.getPayload(name, url);
        // target the entries within the payload
        target = payload.children[0].children;
        // count items
        i = target.length;
        // target first entry for sample data
        firstItem = $(payload.children[0].children[0]);
        // store the name of the library being queried;
        // recently added needs some massaging
        if ($(payload.children[0]).attr('mixedParents') == 1) {
            targetLibrary = 'Recently Added';
            targetType = 'recent';
        } else {
            targetLibrary = 'All ' + $(payload.children[0]).attr('librarySectionTitle');
            targetType = firstItem.attr('type');
        }
        // parse payload items and build each entry into the DOM
        $(payload).find(target).each(function() {
            // store data for each entry
            entry = $(this),
            name = entry.attr('title'),
            sortTitle = entry.attr('titleSort'),
            year = entry.attr('year'),
            img = entry.attr('thumb'),
            type = entry.attr('type'),
            duration = entry.attr('duration'),
            dateAdded = entry.attr('addedAt'),
            ratingMPAA = entry.attr('contentRating'),
            ratingAudience = entry.attr('audienceRating'),
            imgUrl = serverIp + img + '?' + token;

            // build UI for each entry
            entryInterface = $('<div data-datereleased="' + year + '" ' +
                                'data-name="' + name + '" ' +
                                'data-dateadded="' + dateAdded + '" ' +
                                'data-sorttitle="' + sortTitle + '" ' +
                                'data-duration="' + duration + '" ' +
                                'data-src="' + imgUrl + '" ' +
                                'class="entry ' + type + ' lazy">' +
                                '<img class="entry-icon" src="img/' + type + '.jpg">' +
                                '<p class="name">' + name + ' (' + year + ')</p>' +
                                '<p class="rating-MPAA">Rated: ' + ratingMPAA + '</p>' +
                                '<p class="rating-audience">Rotten Tomatoes: ' + ratingAudience + '</p>' +
                                '</div>');
            // append it to the target list, set background
            entryInterface.appendTo(catalogGrid);
        });
    count = count + i;
    });
    // append header
    $('.content h3').text('Total Entries: ' + count);
    // there's a bug with lazy load and dynamic elements that
    // means lazy load needs applied before the element renders,
    // or else the background starts loading immediately. So,
    // everything needs to be hidden (.content is set to display:none)
    // while we lazy load images
    $('.content .lazy').Lazy({
        scrollDirection: 'vertical',
        effect: 'fadeIn',
        visibleOnly: true,
        beforeLoad: function(element) {
            // called before an elements gets handled
        },
        afterLoad: function(element) {
            // called after an element was successfully handled
        },
        onError: function(element) {
            // called whenever an element could not be handled
        },
        onFinishedAll: function() {
            // called after all elements are handled
        }
    });
    // reveal controls
    $('.controls').css('display', 'inline-block');
    // now that all entries are appended and have lazy load applied,
    // reveal the entire grid of entries
    $('.content').show();
    // since the .content area was hidden (0 width) when the entries were appended,
    // they all stack on top of each other, and now we need to
    // initialize isotope on grid for a fresh sort, which re-aligns them
    catalogGrid.isotope({
        itemSelector: 'div.entry',
        layoutMode: 'fitRows',
        getSortData: {
            name: '.name',
            ratingMPAA: '.rating-MPAA',
            ratingAudience: '.rating-audience',
            dateReleased: '[data-datereleased]',
            dateAdded: '[data-dateadded]'
        },
        sortBy: 'name'
    });
    // another bug with lazy load, even though the .content div
    // is visible, and so are the entries within it, and they've been
    // shuffled into horizontal rows by isotope, lazy load still doesn't
    // consider them "visible" until a scroll event is triggered,
    // so we have to do this hacky thing:
    $(window).scroll();
}

// now that we have declared all the ways to manipulate and retrieve payloads,
// finally declare what those payloads are and what to do with them
var catalogPayloads = [moviesPayloadUrl, tvPayloadUrl],// these get rendered in the catalog grid
    moviesData = $.getPayload("Movies", moviesPayloadUrl),
    moviesJson = xmlToJson(moviesData),// used for movie chart + statistic data
    tvData = $.getPayload("TV", tvPayloadUrl),
    tvJson = xmlToJson(tvData),// used for tv chart + statistic data
    recentlyAddedData = $.getPayload("Recent", recentlyAddedUrl),
    recentlyAddedJson = xmlToJson(recentlyAddedData),// used for recently added list
    statsData = [moviesData, tvData];// these get rendered in the statistics panel

$.each(statsData, function(index, value) {
    // push an entry to the libraryStats object containing the name of the library
    // (which is passed as part of the request) and the count of child nodes
    libraryStats[name] = this.childNodes[0].children.length;
});

// bind the query buttons
catalogQueryButton.on('click', function() {
    renderGrid(catalogPayloads);
});
// filtering
catalogFilterButton.each(function() {
    $(this).on('click', function() {
        if ($(this).hasClass('active')) {
            // do nothing
        } else {
            catalogFilterButton.removeClass('active');
            $(this).addClass('active');
            catalogGrid.isotope({ filter: '.' + $(this).attr('data-filter') });
            console.log('now filtering by ' + $(this).attr('data-filter'));
        }
    });
});
// sorting
catalogSortButton.each(function() {
    $(this).on('click', function() {
        if ($(this).hasClass('active')) {
            if ($(this).hasClass('reverse-sort')) {
                catalogGrid.isotope({ sortAscending: true });
                $(this).removeClass('reverse-sort');
            } else {
                catalogGrid.isotope({ sortAscending: false });
                $(this).addClass('reverse-sort');
            }
        } else {
            catalogSortButton.removeClass('active reverse-sort');
            $(this).addClass('active');
            catalogGrid.isotope({ sortBy: $(this).attr('data-sort'), sortAscending: true });
        }
        console.log('now sorting by ' + $(this).attr('data-sort'));
    });
});

function downloadJson() {
    console.dir(this);
    if ($(this).attr('data-title') === 'movies') {
        var jsonObj = moviesJson;
    } else if ($(this).attr('data-title') === 'tv') {
        var jsonObj = tvJson;
    }
    var hiddenElement = document.createElement('a');

    hiddenElement.href = 'data:attachment/text,' + encodeURI(JSON.stringify(jsonObj));
    hiddenElement.target = '_blank';
    hiddenElement.download = $(this).attr('data-title') + '-json.json';
    hiddenElement.click();
}

// on load
$(function() {

    console.log(serverIp + '/library/sections/1/all?X-Plex-Token=' + serverToken);
    console.log(serverIp + '/library/sections/2/all?X-Plex-Token=' + serverToken);

    renderRecentlyAdded(recentlyAddedData);
    renderMovieData(moviesJson);
    renderTVData(tvJson);
    // late addition: prepend library counts to charts
    $('.movies .c3').prepend('<p class="count">Total: ' + moviesJson.MediaContainer.Video.length + '</p>');
    $('.tv .c3').prepend('<p class="count">Total: ' + tvJson.MediaContainer.Directory.length + '</p>');
    $('.download').on('click', downloadJson);
});
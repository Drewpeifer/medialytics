// Instructions:
// Replace IP address with your public server address, e.g. http://123.456.78.910:12345
// Replace token with your server token ** KEEP PRIVATE **
// Modify any library information to match your server's XML payload (e.g. libary ID's)
/////////////

var serverIp = 'YOUR_IP',
    serverToken = 'YOUR_TOKEN';

// this function is fed a url and retrieves an XML payload
jQuery.extend({
    getPayload: function(url) {
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

// render movie charts on page load
function renderMovieCharts(jsonData) {
    var movieCount = jsonData.MediaContainer.Video.length,
        releaseDateList = [],
        releaseDateCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0],
        decadePrefixes = ["193", "194", "195", "196", "197", "198", "199", "200", "201"],
        decades = ["1930s", "1940s", "1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s"],
        studioList = [];

    // loop through movies and gather important data
    $.each(jsonData.MediaContainer.Video, function() {
        // track year
        releaseDateList.push(this['@attributes'].year);
        // track studio
        studioList.push(this['@attributes'].studio);
        console.dir(this);
        if (this.Genre) {
            if (this.Genre.length > 1) {
                console.log(this.Genre.length);
                console.log('positive');
                $.each(this.Genre, function() {
                    console.log(this['@attributes'].tag);
                });
            } else {
                console.log(this.Genre['@attributes'].tag);
            }
        } else {
            console.log('no genres');
        }
    });

    // movies by decade chart
    $.each(releaseDateList, function() {
        // TODO: find a better way to do the following...
        // sort through the releaseDateList,
        // and depending on which decade prefix matches the year value,
        // increment the corresponding releaseDateCount
        var yearSub = this.substring(0, 3);

        if (yearSub == decadePrefixes[0]) {
            releaseDateCounts[0]++;
        } else if (yearSub == decadePrefixes[1]) {
            releaseDateCounts[1]++;
        } else if (yearSub == decadePrefixes[2]) {
            releaseDateCounts[2]++;
        } else if (yearSub == decadePrefixes[3]) {
            releaseDateCounts[3]++;
        } else if (yearSub == decadePrefixes[4]) {
            releaseDateCounts[4]++;
        } else if (yearSub == decadePrefixes[5]) {
            releaseDateCounts[5]++;
        } else if (yearSub == decadePrefixes[6]) {
            releaseDateCounts[6]++;
        } else if (yearSub == decadePrefixes[7]) {
            releaseDateCounts[7]++;
        } else if (yearSub == decadePrefixes[8]) {
            releaseDateCounts[8]++;
        } else {
            // date falls outside range
            console.log('date out of range');
        }
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

// render TV charts on page load
function renderTVCharts(jsonData) {
    var showCount = jsonData.MediaContainer.Directory.length,
        releaseDateList = [],
        releaseDateCounts = [0, 0, 0, 0, 0, 0],
        decadePrefixes = ["196", "197", "198", "199", "200", "201"],
        decades = ["1960s", "1970s", "1980s", "1990s", "2000s", "2010s"],
        studioList = [];

    // loop through TV and gather important data
    $.each(jsonData.MediaContainer.Directory, function() {
        // track year
        releaseDateList.push(this['@attributes'].year);
        // track studio
        studioList.push(this['@attributes'].studio);
    });

    // TV Shows by decade chart
    $.each(releaseDateList, function() {
        // TODO: find a better way to do the following...
        // sort through the releaseDateList,
        // and depending on which decade prefix matches the year value,
        // increment the corresponding releaseDateCount
        if (typeof this === 'string' || this instanceof String) {
            var yearSub = this.substring(0, 3);
        } else {
            yearSub = "undefined";
        }

        if (yearSub == decadePrefixes[0]) {
            releaseDateCounts[0]++;
        } else if (yearSub == decadePrefixes[1]) {
            releaseDateCounts[1]++;
        } else if (yearSub == decadePrefixes[2]) {
            releaseDateCounts[2]++;
        } else if (yearSub == decadePrefixes[3]) {
            releaseDateCounts[3]++;
        } else if (yearSub == decadePrefixes[4]) {
            releaseDateCounts[4]++;
        } else if (yearSub == decadePrefixes[5]) {
            releaseDateCounts[5]++;
        } else if (yearSub == decadePrefixes[6]) {
            releaseDateCounts[6]++;
        } else {
            // date falls outside range
            console.log('date undefined or out of range');
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

// this grabs the appropriate payload depending on which input requests it
// and then populates the UI with entries
function renderGrid() {
    var wrapper = $('.content'),
    // set count to 0
    count = 0,
    // build URLs
    serverUrl = serverIp,
    token = 'X-Plex-Token=' + serverToken,
    baseUrl = serverUrl + '/library/sections/all?' + token,
    moviesUrl = serverUrl + '/library/sections/1/all?' + token,
    showsUrl = serverUrl + '/library/sections/2/all?' + token,
    recentlyAddedUrl = serverUrl + '/library/recentlyAdded/search?type=1&X-Plex-Container-Start=0&X-Plex-Container-Size=20&' + token,
    urls = [showsUrl,moviesUrl];// hiding recentlyAddedUrl for now

    // disable query button
    $('.query').attr('disabled', 'disabled');

    // for each entry in urls, grab XML
    $.each(urls, function(i, url) {
        wrapper = $('.content');
        payload = $.getPayload(url);
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
            imgUrl = serverUrl + img + '?' + token,
            grid = $('.content .grid');

            // again, massage data for recently added entries
            if (targetType == 'recent') {
                type = 'recent';
            } else {
            };

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
            entryInterface.appendTo(grid);
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
    $('.lazy').Lazy({
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
    $('.grid').isotope({
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

// bind the query buttons
$('.query').click(renderGrid);
// filtering
$('button.filter').each(function() {
    $(this).click(function() {
        if ($(this).hasClass('active')) {
            // do nothing
        } else {
            $('button.filter').removeClass('active');
            $(this).addClass('active');
            $('.grid').isotope({ filter: '.' + $(this).attr('data-filter') });
            console.log('now filtering by ' + $(this).attr('data-filter'));
        }
    });
});
// sorting
$('button.sort').each(function() {
    $(this).click(function() {
        if ($(this).hasClass('active')) {
            if ($(this).hasClass('reverse-sort')) {
                $('.grid').isotope({ sortAscending: true });
                $(this).removeClass('reverse-sort');
            } else {
                $('.grid').isotope({ sortAscending: false });
                $(this).addClass('reverse-sort');
            }
        } else {
            $('button.sort').removeClass('active reverse-sort');
            $(this).addClass('active');
            $('.grid').isotope({ sortBy: $(this).attr('data-sort'), sortAscending: true });
        }
        console.log('now sorting by ' + $(this).attr('data-sort'));
    });
});
// on load
$(function() {
    var movieData = $.getPayload(serverIp + '/library/sections/1/all?X-Plex-Token=' + serverToken),
        movieJson = xmlToJson(movieData),
        tvData = $.getPayload(serverIp + '/library/sections/2/all?X-Plex-Token=' + serverToken),
        tvJson = xmlToJson(tvData);
        console.log(serverIp + '/library/sections/1/all?X-Plex-Token=' + serverToken);
        console.log(serverIp + '/library/sections/2/all?X-Plex-Token=' + serverToken);

    renderMovieCharts(movieJson);
    renderTVCharts(tvJson);
    // late addition: prepend library counts to charts
    $('.movies .c3').prepend('<p class="count">Total: ' + movieJson.MediaContainer.Video.length + '</p>');
    $('.tv .c3').prepend('<p class="count">Total: ' + tvJson.MediaContainer.Directory.length + '</p>');
});
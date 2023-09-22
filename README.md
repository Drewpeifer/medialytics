# Medialytics
### An SPA that displays the XML output of a Plex server in a nice format

![header](https://i.imgur.com/9cXCIbT.png)

![visualizations](https://i.imgur.com/9T3tiNQ.png)

![libraries](https://i.imgur.com/I73CQBb.jpg)

# How does it work?
[Plex](http://www.plex.tv) servers typically contain a sizable library of awesome movies and TV shows. You can
access the metadata for all that media via an XML feed that the server generates.
This application calls that XML feed, parses it, and displays it in a format that's
easy to filter and sort. I also convert that feed to JSON for use with the visualizations (charts).

# How recent is this data?
Data is retrieved from Plex in real time. When you load the page, you are making a fresh request to the targeted server.

# What is it built with?
jQuery does most of the work making the AJAX call and parsing the results. The sorting
and filtering logic, as well as the accompanying animations, are all controlled by
an awesome library called [Isotope](https://isotope.metafizzy.co).
Charts are built using [D3](https://d3js.org/)/[C3](https://c3js.org/).

# Why is some data missing?
Plex pulls all its metadata from external agents like [theTVDB.com](http://thetvdb.com) which are
crowd-sourced information. Some of the more obscure titles have incomplete data,
especially when it comes to ratings, and I have not bothered to handle all the edge
cases yet so you'll still see a few 'undefined' values floating around.

# Warning:
This is a WIP / pet project. Anyone is welcome to fork / contribute / use for non-commercial purposes.
This application also relies upon using the private Plex token of your server, which you do **not** want to share
with anyone (a malicious user can leverage it to access your server as an administrator).

# How do I use it?

### Getting Started
* Replace the ip address in `scripts.js` with your server's public ip address (found in Plex web Settings > Remote Access page)
* Replace the instances of `YOUR_TOKEN` with your own plex token ([instructions on locating token](https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/)) **Do not share this value with anyone!**
* Drag `index.html` into a browser
* Edit the HTML, CSS, and JS to your liking

### Troubleshooting / Customization
Medialytics is not designed for libraries with non-video content (e.g. music, photos, or audiobook functionality is untested). Also, API calls may take a long time depending on your bandwidth, server, and amount of data being returned.

If your libraries do not automatically load after following the instructions above, you may need to refer to the documentation for the Plex [XML interactions](https://support.plex.tv/articles/201638786-plex-media-server-url-commands/). The following steps should help clear up any basic issues:

1. Confirm that your public IP (found in Plex web Settings > Remote Access) resolves in a local browser
1. Confirm that you are using the correct plex token ([related documentation](https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/))
1. Confirm that your library keys are correct in the `scripts.js` file
    * Hit this URL in a browser (with your info added) to see your list of libraries: `http://[PMS_IP_Address]:32400/library/sections?X-Plex-Token=YourTokenGoesHere`
    * This should return an XML `<MediaContainer>` object that contains one or more `<Directory>` objects. Each of these Directories has a `key` value.
    * The example code includes two payload urls, `moviesPayloadUrl` and `tvPayloadUrl`. If you have a Movies library and a TV library, simply edit these url's to include your library key values from the previous step like so: `serverIp + '/library/sections/YOUR_LIBRARY_KEY/all?X-Plex-Token=' + serverToken`. If your libraries do not match up with Movies and TV, please see the instructions below.

### WIP -- Adding, Deleting, or Modifying Displayed Libraries
_Disclaimer: This application was designed as a proof of concept for parsing and displaying data from the server. The test server (my server) is exceedingly simple. Medialytics may not support some of the more intermediate or advanced server setups, or servers with high volumes of data._

This example is built with two libraries in mind, Movies and TV. The URLs for these payloads are declared at the top of `scripts.js`, and those payloads are manipulated at the bottom of the file using all the functions in the middle of the file.

If you'd like to **add more libraries**:
1. Declare the payload urls at the top of the file with new names, e.g. `newMoviesPayloadUrl`
1. Add those payload urls to the array of `catalogPayloads` at the bottom of the file (ln ~675)
1. Create variables at the bottom of the file (ln ~675) to store the raw payload data and converted JSON, e.g. `newMoviesData` and `newMoviesJson`
1. Depending on the media type, add a call to the appropriate render function in the `// on load` function at the very bottom of the file (ln ~750), e.g. `renderMovieData(newMoviesJson)`
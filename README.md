# Medialytics
### An SPA that displays the XML output of a Plex server in a nice format

![header](https://i.imgur.com/9cXCIbT.png)

![visualizations](https://i.imgur.com/9T3tiNQ.png)

![libraries](https://i.imgur.com/I73CQBb.jpg)

### 09/27/21 - Version 1.1 Updates
Several small UI fixes and general improvements have been added, also addressed
a few edge case errors encountered when the Plex API returns strange results:

- Now ignoring durations for shows that are NaN for library totals
- Now ignoring 'undefined' TV studios in Shows by Studio chart
- Now ignoring MediaContainer nodes containing child nodes that are just line breaks (with no other data)
- Resized movie charts
- Now sorting movie genre and country charts by count (desc)

# How does it work?
[Plex](http://www.plex.tv) servers typically contain a sizable library of awesome movies and TV shows. You can
access the metadata for all that media via an XML feed that the server generates.
This application calls that XML feed, parses it, and displays it in a format that's
easy to filter and sort. I also convert that feed to JSON for use with the visualizations (charts).

# How do I use it?

* Replace the ip address in `scripts.js` with your server's public ip address
* Replace the instances of `YOUR_TOKEN` with your own plex token ([instructions on locating token](https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/)) **Do not share this value with anyone!**
* Drag `index.html` into a browser
* Edit the HTML, CSS, and JS to your liking

**Please note:**

* You may need to modify the structure of the XML path to match your server, e.g. library ID (Notes on [XML interactions](https://support.plex.tv/articles/201638786-plex-media-server-url-commands/))
* This is built to display info for 2 libraries, Movies and TV. Modifying for more libraries should be a matter of copy/paste/edit
* Implementing more charts may be quick or incredibly tedious depending on the data / chart you are working with

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
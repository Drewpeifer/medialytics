# Medialytics
### An SPA that displays the XML output of a Plex server in a nice format

# How do I use it?

* Replace the ip address in `scripts.js` with your server's public ip address
* Replace the instances of `YOUR_TOKEN` with your own plex token ([instructions on locating token](https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/))
  * **Do not share this value with anyone!**
* Drag `index.html` into a browser
* Edit the HTML and CSS to your liking (e.g. change colors, delete the `<div class="explanation">`)

**Please note:**
* You may need to modify the structure of the XML path to match your server, e.g. library ID
  * Notes on [XML interactions](https://support.plex.tv/articles/201638786-plex-media-server-url-commands/)
* This is built to display info for 2 libraries, Movies and TV. Modifying for more libraries should be a matter of copy/paste/edit.

# How does it work?
[Plex](http://www.plex.tv) servers typically contain a sizable library of awesome movies and TV shows. You can
access the metadata for all that media via an XML feed that the server generates.
This application calls that XML feed, parses it, and displays it in a format that's
easy to filter and sort. I also convert that feed to JSON for use with the visualizations (charts).

![visualizations](https://i.imgur.com/9T3tiNQ.png)

![libraries](https://i.imgur.com/I73CQBb.jpg)

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
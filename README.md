# Medialytics 2.6.1
### A free analytics tool for Plex server content

--------
# What is Medialytics?
Plex itself, as well as other tools, generate statistics regarding your server activity (most watched, most active, etc.)
but they don't report much on the nature of your media content itself. Medialytics is a small client-side app that
runs in the browser and generates statistics specifically about the content of your server, e.g. top production studio across a library. You can also use it to inspect and diagnose issues with your content, such as large file sizes and bitrate / container / codec mismatches.

![header](https://i.imgur.com/VVI6mci.png)

![visualizations](https://i.imgur.com/zdtq7LF.png)

![visualizations-2](https://i.imgur.com/by1nUvT.png)

![visualizations-3](https://i.imgur.com/aYg9UTW.png)

![visualizations-4](https://i.imgur.com/idnDNWJ.png)

## Main features
* Tree map chart to TV showing largest shows by episode count and audience rating **(new!)**
* Tree Map chart for movies that cross references resolution, container, codec, and bitrate **(new!)**
* Movie Analysis tool to compare media attributes like container, codec, resolution, bitmap, file size, and more **(new!)**
* Multiple methods of CSV export
* Bar + pie charts for collections, genre, country, decade, studio, content rating, resolution*, container* (file type), actor, writer*, and director* analysis
* Scatter chart of audience rating (TMDB) vs content rating
* Line chart for additions over time
* Statistics for size and duration of entire library, as well as items: longest (duration), oldest (release date), and earliest / latest additions (to library)
* Watched/unwatched comparison across entire library and within most charts
* Detects unmatched library items

_Items marked with "*" are only available for Movie libraries_

## How does it work?
[Plex](http://www.plex.tv) servers generate an XML feed that returns a list of libraries associated with a server, as well
as the content within each library. Medialytics parses that XML feed and performs calculations on the content to
aggregate and display statistics.

When the page loads, a single API call is made to your server to return a list of available libraries.
After selecting an available library, a call will be made to the corresponding endpoint that returns that library's data. **The larger the library, the
longer this call may take**. The response is then parsed, stats are aggregated, and (depending on the library type) the UI displays relevant data and charts.

**Please note, currently Medialytics only supports Movie and TV libraries (audio, image, etc. have been excluded) but you may customize the code to your liking.**

## What is it built with?
Version 2.0 was rebuilt with [Vue 2](https://v2.vuejs.org/), [Axios](https://axios-http.com/docs/api_intro) for API calls,
and charts are built with [D3](https://d3js.org/) and [plotly.js](https://plotly.com/javascript/).

# SECURITY NOTE:
Medialytics now uses **Plex OAuth authentication**, which means you authenticate directly with your Plex account without needing to manually find or share your authentication token. This is more secure and user-friendly than the previous token-based method.

When you authenticate, Medialytics will:
- Request access to your Plex account via the official Plex authentication flow
- Store your authentication token securely in your browser's local storage
- Automatically discover your available Plex servers
- Use your token only for API requests to your own Plex servers

**Important**: Your authentication token is stored locally in your browser and is never transmitted to any third-party servers. However, you should still be cautious about where you host Medialytics if you choose to deploy it publicly.

# Getting Started

## Quick Start (Recommended)
1. Clone the repository or download as a zip file and extract the contents
1. Open `index.html` in your web browser (or use Docker - see below)
1. Click the "Sign in with Plex" button
1. Authenticate with your Plex account in the popup window
1. Select your Plex server from the available servers
1. Start exploring your library statistics!

No manual configuration required - the app will automatically discover your servers after authentication.

## With Docker

### Simple Installation with Docker Compose

1. Clone the repository
1. Run the Docker container:
    ```bash
    docker compose up -d
    ```
1. Open your browser and go to http://localhost:8088/
1. Click "Sign in with Plex" and authenticate with your Plex account
1. Select your server and start analyzing your libraries!

No environment variables or manual configuration needed - authentication is handled through the Plex OAuth flow.

### Run and Build Locally with Docker

1. Clone the repository
1. Build and run the container:
    ```bash
    docker compose up -d
    ```
1. Go to http://localhost:8088/
1. Authenticate with your Plex account when prompted
1. Select your server and enjoy!

If you know HTML/CSS/JS you can edit the code to your liking. All the application logic and parsing is done in `scripts.js`, styling is in `styles.css`, and the page elements are
in `index.html`.

**Anyone is welcome to fork / contribute / utilize for non-commercial purposes.** Credit for use elsewhere is appreciated but not required.

## Troubleshooting / FAQ
*Medialytics is not designed for libraries with non-video content (e.g. music, photos, or audiobook functionality is untested). Only Movie and TV libraries will be parsed by default.*

### Authentication Issues

If you're having trouble authenticating or accessing your servers:

1. **Clear your browser's local storage**: Open Developer Tools (F12), go to Application/Storage tab, and clear local storage for the Medialytics site
1. **Try authenticating again**: Click "Sign in with Plex" and complete the authentication flow
1. **Check browser console**: Press F12 to open Developer Tools and check the Console tab for any error messages
1. **Verify Plex account**: Make sure you can log in to [plex.tv](https://plex.tv) with your account
1. **Check server status**: Ensure your Plex server is online and accessible

### Server Not Appearing

If your server doesn't appear in the server list after authentication:

1. Verify your Plex server is running and online
1. Check that your server is accessible from your network
1. Try refreshing the page and authenticating again
1. Check the browser console for any error messages

### Debug Mode

For detailed troubleshooting information:

1. Near the top of `scripts.js`, set the `debugMode` variable equal to `true`
1. Refresh the page in your browser
1. Open Developer Tools (F12) and check the Console tab
1. You should see detailed information about authentication status, server discovery, and library loading

### How recent is this data?
Data is retrieved from Plex in real time. When you load the page or select a library, you are making a fresh request to the targeted server each time.

### How accurate is this data?
The short answer is that the data is as accurate as the XML feed can provide. The feed returns every title in a library, and so the counts for the library
as a whole and any "basic" attribute that the feed reports for that item should be accurate when cross referenced with your Plex server, such as release date, length, etc. If the value
for any tracked data point is left blank or otherwise returns `undefined`, I have chosen to omit that single value from all counts and calculations.

**However**, the XML feed does abbreviate some information that could otherwise generate many results, and instead of returning the full list that is available in Plex
it only returns the first few items. For example, a movie can have an infinite number of genres added manually by a user, so the XML feed just returns the first two genres in the list
(not alphabetically, just the first two in the list). This means that a film with Action, Mystery, and Crime genres will only get reported in the XML as being in Action and Mystery.

In terms of what Medialytics reports on, the only statistics affected by this process are as follows:
* Directors (first 2)
* Actors (first 3)
* Genres (first 2)

The only other nuance I've encountered is that different "editions" of a movie will be counted as separate instances, so `Aliens (1986) {edition-SD}.avi` and
`Aliens (1986) {edition-4K}.mkv` each count as separate films, with separate (duplicate) metadata. While this may inflate certain statistics if you have many editions
of the same film, it also allows for accurate tracking of resolution and container (file type) across editions. Ignoring separate editions would create inconsistencies with counts
in Medialytics vs the Plex UI, so I have chosen to track them this way for now. When comparing numbers between Medialytics and the Plex UI, also consider that Medialytics does not
count Collections as library items (and the Plex UI does, if they are visible).

### Why are some charts only available for certain types of libraries?
The XML feed does not return the same information for all library types. For example, the feed for a TV library only returns data about shows, so it does not include Director,
Resolution, or Container information since that could be specific to each episode.

### Related documentation
For anyone who wishes to fork and modify this repo, here are some links you may find useful:

1. [Plex OAuth Authentication](https://forums.plex.tv/t/authenticating-with-plex/609370) (for authentication flow)
1. [Plex XML docs](https://support.plex.tv/articles/201638786-plex-media-server-url-commands/) (for retrieving and parsing data)
1. [Vue 2 docs](https://v2.vuejs.org/) (for general app logic and architecture)
1. [Axios docs](https://axios-http.com/docs/api_intro) (for API calls)
1. [D3.js](https://d3js.org/) / [plotly.js](https://plotly.com/javascript/) for editing charts
1. [Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) (for UI editing)

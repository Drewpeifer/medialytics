# Medialytics 2.3.5
### A free analytics tool for Plex server content

--------
# What is Medialytics?
Plex itself, as well as other tools, generate statistics regarding your server activity (most watched, most active, etc.)
but they don't report much on the nature of your media content itself. Medialytics is a small client-side app that
runs in the browser and generates statistics specifically about the content of your server, e.g. top production studio across a library.

![header](https://i.imgur.com/t7IFigr.png)

![visualizations](https://i.imgur.com/pfvdA8b.png)

![visualizations-2](https://i.imgur.com/CCmDkSo.png)

## Main features
* Bar charts for genre, country, decade, studio, resolution*, container* (file type), actor, writer*, and director* analysis
* Scatter chart of audience rating (TMDB) vs content rating
* Statistics for size and duration of entire library
* Statistics for longest (duration), oldest (release date), and earliest / latest additions (to library)
* Watched/unwatched comparison across entire library and within each chart
* Detects unmatched library items

_Items marked with "*" are only available for Movie libraries_

## How does it work?
[Plex](http://www.plex.tv) servers generate an XML feed that returns a list of libraries associated with a server, as well
as the content within each library. Medialytics parses that XML feed and performs calculations on the content to
aggregate and display statistics.

When the page loads, two API calls are made to your server: one returns available libraries, the other returns a list of recently added media.
After selecting an available library, a call will be made to the corresponding endpoint that returns that library's data. **The larger the library, the
longer this call may take**. The response is then parsed, stats are aggregated, and (depending on the library type) the UI displays relevant data and charts.

**Please note, currently Medialytics only supports Movie and TV libraries (audio, image, etc. have been excluded) but you may customize the code to your liking.**

## What is it built with?
Version 2.0 was rebuilt with [Vue 2](https://v2.vuejs.org/), [Axios](https://axios-http.com/docs/api_intro) for API calls,
and charts are built with [D3](https://d3js.org/)/[C3](https://c3js.org/) and [plotly.js](https://plotly.com/javascript/).

# SECURITY WARNING:
This application relies upon using the private Plex token of your server, which you do **not** want to share
with anyone (a malicious user can leverage it to access your server as an administrator). This is a limitation due to the way Plex leverages the token itself,
there is no "read-only" option.

I am not liable for any damages or inconvenience caused by the improper sharing of your token, **it is your responsibility to ensure it is never shared with anyone**.
Additionally, **you should not host your copy of Medialytics anywhere that is publicly accessible**, as the token itself is sent as part of the API request. Medialytics
is only recommended for local usage at this time (just drag the html file into your browser, no server needed), but you are welcome to host it securely if you have the knowledge base
to do so safely (at your own risk).

# Getting Started
Clone the repository to a local directory on your computer, or download the repository as a zip file and extract the contents. Open the contents in a text editor and do the following option:

## Within the Application
1. At the top of `scripts.js`, set the `serverIp` variable equal to your Plex server's public IP (found in Plex Settings > Remote Access)
1. At the top of `scripts.js`, set the `serverToken` variable equal to your **PRIVATE** plex token. **Do not share this value with anyone!** If compromised, generate a new one ([instructions on locating and generating a token](https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/))
1. Drag `index.html` into a browser
1. You should now see your server IP in the "Targeted Server" section of the page, and links to any available libraries on that server (Movie and TV only).

## With Docker

There are 2 ways, you likely want the first set of instructions.

### Simple Installation with Docker Compose

Set up:

1. Copy .env.sample from the repository as .env
1. Set the `SERVER_IP` variable equal to your Plex server's public IP (found in Plex Settings > Remote Access)
1. Set the `SERVER_TOKEN` variable equal to your **PRIVATE** plex token. **Do not share this value with anyone!** If compromised, generate a new one ([instructions on locating and generating a token](https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/))

This assumes you followed the instructions and have a `.env` file in the same repo as a `docker-compose.yml` file with the following:

```
version: "3.9"
services:
  medialytics:
    image: ghcr.io/drewpeifer/medialytics:latest
    container_name: medialytics
    environment:
      - SERVER_IP=${SERVER_IP}
      - SERVER_TOKEN=${SERVER_TOKEN}
    ports:
      - "8088:80"
```

Finally run with:

1. Run the image
    ```bash
    docker compose up -d
    ```
1. Go to http://localhost:8088/ You should now see your server IP in the "Targeted Server" section of the page, and links to any available libraries on that server (Movie and TV only).

### Run and Build Locally with Docker

1. Copy .env.sample from the repository as .env
1. Set the `SERVER_IP` variable equal to your Plex server's public IP (found in Plex Settings > Remote Access)
1. Set the `SERVER_TOKEN` variable equal to your **PRIVATE** plex token. **Do not share this value with anyone!** If compromised, generate a new one ([instructions on locating and generating a token](https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/))
1. Run the image
    ```bash
    docker compose up -d
    ```
1. Go to http://localhost:8088/ You should now see your server IP in the "Targeted Server" section of the page, and links to any available libraries on that server (Movie and TV only).

If you know HTML/CSS/JS you can edit the code to your liking. All the application logic and parsing is done in `scripts.js`, styling is in `styles.css`, and the page elements are
in `index.html`.

**Anyone is welcome to fork / contribute / utilize for non-commercial purposes.** Credit for use elsewhere is appreciated but not required.

## Troubleshooting / FAQ
*Medialytics is not designed for libraries with non-video content (e.g. music, photos, or audiobook functionality is untested). Only Movie and TV libraries will be parsed by default.*

If your libraries do not automatically load after following the instructions above, you may need to refer to the documentation for [Plex XML interactions](https://support.plex.tv/articles/201638786-plex-media-server-url-commands/). The following steps should help clear up any basic issues:

1. Confirm that you have entered the correct values for your (public) `serverIp` and (very **private**) `serverToken` at the top of the `medialytics/js/scripts.js` file.
1. Confirm that your public IP (found in Plex web Settings > Remote Access) is correct and resolves in a local browser
1. Confirm that you are using the correct / most current plex token ([related documentation](https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/))
1. Near the top of `scripts.js`, set the `debugMode` variable equal to `true`. Now return to the browser, refresh the page, and there should be a message saying that debug mode is enabled. Press F12 or ctrl+click to open the developer tools for your browser, and navigate to the console. You should see information printed about your server's available libraries, and if you select a library in the UI more info will be displayed in the console.

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

1. [Plex XML docs](https://support.plex.tv/articles/201638786-plex-media-server-url-commands/) (for retrieving and parsing data)
1. [Plex token docs](https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/) (for token management)
1. [Vue 2 docs](https://v2.vuejs.org/) (for general app logic and architecture)
1. [Axios docs](https://axios-http.com/docs/api_intro) (for API calls)
1. [D3.js](https://d3js.org/) / [C3.js](https://c3js.org/) / [plotly.js](https://plotly.com/javascript/) for editing charts
1. [Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) (for UI editing)

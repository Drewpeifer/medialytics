# Medialytics [2.0]
### A free analytics tool for Plex server content

--------
### 2.0 update
* rebuilt with Vue
* several optimizations to parsing and aggregation logic
* removed library view (wasn't particularly useful)
* streamlined setup process, added library detection instead of manual entry
* displaying some new statistics

--------
# What is Medialytics?
Plex itself, as well as other tools, generate statistics regarding your server activity (most watched, most active, etc.)
but they don't report much on the nature of your media content itself. Medialytics is a small client-side app that
runs in the browser and generates statistics specifically about the content of your server, e.g. top production studio across a libary.

![header](https://i.imgur.com/qSRyhUG.png)

![visualizations](https://i.imgur.com/i7D0g0s.png)

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
and I am still using the robust [D3](https://d3js.org/)/[C3](https://c3js.org/) libraries for charts.

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

### Why is some of the metadata for my library missing?
Plex pulls all its metadata from external agents like [theTVDB.com](http://thetvdb.com) which are
crowd-sourced information. Some of the more obscure titles have incomplete data,
especially when it comes to ratings, so if you see an empty or "undefined" value it is most likely appearing
as empty or "undefined" in the Plex web interface as well. I have chosen not to report on undefined values, but
there may be edge cases I haven't considered.

### Related documentation
For anyone who wishes to fork and modify this repo, here are some links you may find useful:

1. [Plex XML docs](https://support.plex.tv/articles/201638786-plex-media-server-url-commands/) (for retrieving and parsing data)
1. [Plex token docs](https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/) (for token management)
1. [Vue 2 docs](https://v2.vuejs.org/) (for general app logic and architecture)
1. [Axios docs](https://axios-http.com/docs/api_intro) (for API calls)
1. [D3.js](https://d3js.org/) and [C3.js](https://c3js.org/) docs (for customizing and adding new charts)
1. [Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) (for UI editing)

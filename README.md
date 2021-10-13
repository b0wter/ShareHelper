Disclaimer
==========
I've written this to get some basic understanding of how nodejs and typescript work. Please don't consider this application as safe to run without proper precaution.

Share Helper
============
The goal of this project is to make sharing songs from streaming providers easier. How often have you wanted to share a link with a friend only to realise that they do not use the same music streaming provider? This web app converts links from Spotify, Deezer or YouTube Music to the other services.

I would like to support additional services but:
 - Apple Music hides access to their api behind the 99$/year developer account
 - Amazon Music does not offer any api at all.

Demo
====
[Go here](https://sharehelper.gutsman.de).

Getting started
===============

Spotify
-------
To access the Spotify api you need to supply a client id and a client secret. You can get those for free by registering a Spotify Developer account. The app reads the client id and client secret from the environment variables:
```
SHARE_HELPER_SPOTIFY_CLIENT_ID
SHARE_HELPER_SPOTIFY_CLIENT_SECRET
```
The app supports the usage of an `.env` file. The file needs to be placed in the `dist` folder once the typescript has been transpiled to javascript.

Neither Deezer nor YouTube Music require any authentication for the basic querying that this app performs.

Running the web app
-------------------
The easiest way to run the web app yourself is to use Docker. 
```
docker build -t b0wter/share-helper .
docker run -p 8099:8099 -e SHARE_HELPER_SPOTIFY_CLIENT_ID=... -e SHARE_HELPER_SPOTIFY_CLIENT_SECRET=...  b0wter/share-helper
```
Add any additional parameters as you see fit (`-d`, `-it`, ...).

You can also use the following compose file (without the Spotify service!)
```
version: "3"

services:
  blog:
    container_name: share-helper
    image: b0wter/share-helper:latest
    ports:
      - "8083:8083/tcp"
    environment:
      TZ: 'Europe/Berlin'
      SHARE_HELPER_PORT: 8083
    restart: unless-stopped
```
or this if you want to use Spotify: (you need to set values for the Spotify environment variables!)
```
version: "3"

services:
  blog:
    container_name: share-helper
    image: b0wter/share-helper:latest
    ports:
      - "8083:8083/tcp"
    environment:
      TZ: 'Europe/Berlin'
      SHARE_HELPER_PORT: 8083
      SHARE_HELPER_SPOTIFY_CLIENT_ID: insert your id here
      SHARE_HELPER_SPOTIFY_CLIENT_SECRET: insert your secret here
    restart: unless-stopped
```

You can also run the web app using a local installation of NodeJS. Create a credentials file (see _requirements_ above) and then run the `build.sh` script. If you're on Windows you have to perform these steps manually:
 - open a terminal and change into the project's root folder
 - run `npm i` to install the required packages.
 - run `./node_modules/.bin/tsc` to transpile typescript to javascript
 - copy the `public` folder into the `dist` folder
 - copy the `views` folder into the `dist` folder 

To start the app change into the `dist` folder and run `node index.js`.

Port
----
To change the port the app is running use the `SHARE_HELPER_PORT` environment variable. It defaults to `8099`. If you're using docker you can change the variable in the `Dockerfile`.

Share Helper
============
The goal of this project is to make sharing songs from streaming providers easier. How often have you wanted to share a link with a friend only to realise that they do not use the same music streaming provider? This web app converts links from Spotify, Deezer or YouTube Music to the other services.

I would like to support additional services but:
 - Apple Music hides access to their api behind the 99$/year developer account
 - Amazon Music does not offer any api at all.

Getting started
===============

Requirements
------------
To access the Spotify api you need to supply a client id and a client secret. You can get those for free by registering a Spotify Developer account. You will then have to add a file named `credentials.ts` to the `src` folder:
```
export class Credentials {
	public static readonly spotify_client_id = 'put your client id here';
	public static readonly spotify_client_secret = 'put your client secret here';
}
```
Neither Deezer nor YouTube Music require any authentication for the basic querying that this app performs.

Running the web app
-------------------
The easiest way to run the web app yourself is to use Docker. Use the instructions above to create a credentials file and then simply run the `docker.sh` script from the projects root directory to build an image. Then run it like this:
```
docker run -p 8099:8099 b0wter/share-helper
```
Add any additional parameters as you see fit (`-d`, `-it`, ...). 

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

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
The easiest way to run the web app yourself is to use Docker. Use the instructions above to create a credentials file and then simply run the `docker.sh` script from the projects root directory. If you are on Windows you have to perform the following steps on your own:
 - run `npm i` to install the required packages.
 - run `./node_modules/.bin/tsc` to transpile typescript to javascript
 - copy the `public` folder into the `dist` folder
 - copy the `views` folder into the `dist` folder 
The default port is 8099. You can change it in the `Dockerfile`.

You can also run the web app using a local installation of NodeJS. Simply perform the steps above, change into the `dist` folder and run `node index.js`. You can change the default port 8099 to anything you like by setting the `SHARE_HELPER_PORT` environment variable.

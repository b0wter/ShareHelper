import { Deezer } from "./deezer";
import { Spotify } from "./spotify"
import { Provider, ProviderCollection } from "./provider";
import express from 'express';
import { Track } from "./track";
import _ from "lodash";
import { YoutubeMusic } from "./youtube-music";

require('dotenv').config();

const swig = require('swig');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.SHARE_HELPER_PORT ?? 8099;
const spotifyClientId = process.env.SHARE_HELPER_SPOTIFY_CLIENT_ID;
const spotifyClientSecret = process.env.SHARE_HELPER_SPOTIFY_CLIENT_SECRET;

async function retrieveForProvider(provider: Provider, track: Track)
{
    return await provider.findTrack(`${track.name} ${track.artist}`, track.duration);
}

async function retrieveTrackFromShareUrl(sharedUrl: string, providers: ProviderCollection) : Promise<Track[]>
{
    const url = sharedUrl.toLocaleLowerCase();
    const provider = providers.all.find(provider => url.includes(provider.urlIdentifier));
    if(provider === null || provider === undefined)
        throw new Error("The given url does not match any of the known streaming providers.");

    const others = providers.all.filter(p => p.urlIdentifier !== provider.urlIdentifier)
    if(others === null || others === undefined || others.length === 0)
        throw new Error("There is only a single provider implemented. Cannot do any meaningful translation.");

    const trackId = await provider.getTrackIdFromSharedUrl(sharedUrl);
    const track = await provider.getTrack(trackId);
    const promises = others.map(o => retrieveForProvider(o, track));
    const results = await Promise.all(promises);
    results.push(track);

    return results;
}

async function retrieveAndRenderOutputTemplate(providers: ProviderCollection, sharedUrl: string)
{
    const others = await retrieveTrackFromShareUrl(sharedUrl, providers)
    const path = __dirname + "/views/output.html";
    const template = swig.compileFile(path);
    return template.render({tracks: others});
}

async function main() {
    const spotify = await Spotify.createFromCredentials();
    const deezer = new Deezer();
    const ytmusic = await YoutubeMusic.createAndInit();
    const providers = new ProviderCollection(spotify, deezer, ytmusic);
    app.use(express.static('public'));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.get('/', async (req, res) => {
        const sharedUrl = req.query.sharedUrl;
        if(sharedUrl && typeof(sharedUrl) === "string")
        {
            const output = await retrieveAndRenderOutputTemplate(providers, sharedUrl);
            res.send(output);
        }
        else
        {
            const path = __dirname + "/views/index.html";
            const template = swig.compileFile(path);
            const output = template.render({});
            res.send(output);
        }
    });
    app.post('/', async function (req, res) {
        if(req.body.sharedUrl) {
            const output = await retrieveAndRenderOutputTemplate(providers, req.body.sharedUrl);
            res.send(output);
        } else {
            console.error('There was no value given for the parameter "sharedUrl".');
            res.redirect('/');
        }
    });
    app.listen(port, () => {
        console.log(`Server is running at port ${port}.`)
    });
}

// Running node locally does not require this but it is necessary to shut down properly in a container.
process.on('SIGINT', () => {
  console.info("Received exit signal")
  process.exit(0)
})

main();
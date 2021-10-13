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
const domainName = process.env.SHARE_HELPER_DOMAIN;

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

function renderOutputTemplate(tracks: Track[])
{
    const path = __dirname + "/views/output.html";
    const template = swig.compileFile(path);
    return template.render({tracks: tracks});
}

async function main() {
    var spotify: Spotify | undefined = undefined;
    if(spotifyClientId && spotifyClientSecret)
    {
        spotify = await Spotify.createFromCredentials(spotifyClientId, spotifyClientSecret);
    }
    const deezer = new Deezer();
    const ytmusic = await YoutubeMusic.createAndInit();
    const providers = new ProviderCollection(deezer, ytmusic, spotify);
    app.use(express.static('public'));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.get('/', async (req, res) => {
        const sharedUrl = req.query.sharedUrl;
        if(sharedUrl && typeof(sharedUrl) === "string")
        {
            const tracks = await retrieveTrackFromShareUrl(sharedUrl, providers)
            const output = renderOutputTemplate(tracks);
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
            const tracks = await retrieveTrackFromShareUrl(req.body.sharedUrl, providers);
            const output = renderOutputTemplate(tracks);
            res.send(output);
        } else {
            console.error('There was no value given for the parameter "sharedUrl".', req.body);
            res.redirect('/');
        }
    });
    app.post('/api', async function (req, res) {
        if(req.body.sharedUrl) {
            const tracks = await retrieveTrackFromShareUrl(req.body.sharedUrl, providers);
            const tracksWithoutProvider = tracks.map(track => track.forApi());
            res.json(tracksWithoutProvider);
        } else {
            console.error('There was no value given for the parameter "sharedUrl".', req.body);
            res.redirect('/');
        }
    });
    // Mainly for use with the ios shortcut app. Takes a shared link and generates a link to the results.
    app.post('/urlfor', function(req, res) {
        if(!domainName) {
            res.status(500).send('The app is not properly configured to answer this request. The admin needs to set the SHARE_HELPER_DOMAIN environment variable.');
        }
        else if(req.body.sharedUrl) {
            var url = new URL(domainName);
            url.searchParams.append('sharedUrl', req.body.sharedUrl);
            res.send(url.href);
        } 
        else {
            console.error('There was no value given for the parameter "sharedUrl".', req.body);
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
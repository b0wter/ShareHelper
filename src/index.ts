import { Deezer } from "./deezer";
import { Spotify } from "./spotify"
import { ApiResult, Provider, ProviderCollection, ProviderResults } from "./provider";
import express, { Response } from 'express';
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

async function retrieveTrackFromShareUrl(sharedUrl: string, providers: ProviderCollection) : Promise<ProviderResults>
{
    const url = sharedUrl.toLocaleLowerCase();
    const provider = providers.all.find(provider => url.includes(provider.urlIdentifier));
    if(provider === null || provider === undefined)
        throw new Error("The given url '" + sharedUrl + "' does not match any of the known streaming providers.");

    const others = providers.all.filter(p => p.urlIdentifier !== provider.urlIdentifier)
    if(others === null || others === undefined || others.length === 0)
        throw new Error("There is only a single provider implemented. Cannot do any meaningful translation.");

    console.log('retrieving track id from shared link');
    const trackId = await provider.getTrackIdFromSharedUrl(sharedUrl);
    if(trackId.isFailure())
    {
        if(trackId.isFailure())
        {
            throw new Error(`Could not get track id from url ${sharedUrl}.`);
        }
    }

    console.log('retrieving track from original streaming provider');
    const track = await provider.getTrack(trackId.value);
    if(track.isFailure())
    {
        throw new Error(`Could not get track from ${provider.name}.`);
    }

    console.log('retrieving from other providers');
    const promises = others.map(o => { 
        const r = retrieveForProvider(o, track.value);
        console.log(o.name, 'finished retrieving track details');
        return r;
    }); 
    const results = await Promise.all(promises);
    results.push(track);

    console.log('finished all api requests');

    const tracks = results.filter(r => r.isSuccess()).map(r => r.getOrThrow() as Track)
    const errors = results.filter(r => r.isFailure()).flatMap(r => {
        const e = r.errorOrNull();
        return e === null ? [] : [e]
    });

    return new ProviderResults(tracks, errors);
}

function renderOutputTemplate(results: ProviderResults)
{
    const path = __dirname + "/views/output.html";
    const template = swig.compileFile(path);
    return template.render({tracks: results.successes, errors: results.failures});
}

function sendErrorResponse(res: Response, error: string)
{
    res.send("The following error occured: " + error);
}

async function main() {
    var spotify: Spotify | undefined = undefined;
    if(spotifyClientId && spotifyClientSecret)
    {
        spotify = await Spotify.createFromCredentials(spotifyClientId, spotifyClientSecret);
        if(spotify === undefined)
            throw new Error("Could not initialize the spotify api client.");
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
            try {
                const tracks = await retrieveTrackFromShareUrl(sharedUrl, providers)
                console.log('rendering output');
                const output = renderOutputTemplate(tracks);
                res.send(output);
            }
            catch(error: any)
            {
                sendErrorResponse(res, error.message);
            }
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
            try {
                const tracks = await retrieveTrackFromShareUrl(req.body.sharedUrl, providers);
                console.log('rendering output');
                const output = renderOutputTemplate(tracks);
                res.send(output);
            }
            catch(error: any)
            {
                sendErrorResponse(res, error.message);
            }
        } else {
            console.error('There was no value given for the parameter "sharedUrl".', req.body);
            res.redirect('/');
        }
    });
    // Use this endpoint if you need machine readable results.
    app.post('/api', async function (req, res) {
        if(req.body.sharedUrl) {
            try
            {
                const results = await retrieveTrackFromShareUrl(req.body.sharedUrl, providers);
                const tracksWithoutProvider = results.forApi();
                res.json(tracksWithoutProvider);
            }
            catch(error: any)
            {
                sendErrorResponse(res, error.message);
            }
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
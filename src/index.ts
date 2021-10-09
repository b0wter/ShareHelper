import { Deezer } from "./deezer";
import { Spotify } from "./spotify"
import { Provider, ProviderCollection } from "./Provider";
import { Request, Response } from "express";
import express from 'express';
import { Html } from "./html";
import { Track } from "./track";
import _ from "lodash";
import { YoutubeMusic } from "./youtube-music";

const swig = require('swig');
const cons = require("consolidate");
const bodyParser = require('body-parser');
const app = express();
const port = process.env.SHARE_HELPER_PORT ?? 8099;

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
    console.log(`Using provider '${provider.urlIdentifier}'.`);

    const others = providers.all.filter(p => p.urlIdentifier !== provider.urlIdentifier)
    if(others === null || others === undefined || others.length === 0)
        throw new Error("There is only a single provider implemented. Cannot do any meaningful translation.");
    console.log('Other providers: ', others.map(p => p.urlIdentifier));

    const trackId = await provider.getTrackIdFromSharedUrl(sharedUrl);
    console.log(`Track id for ${provider.urlIdentifier} is ${trackId}.`);
    const track = await provider.getTrack(trackId);
    const promises = others.map(o => retrieveForProvider(o, track));
    const results = await Promise.all(promises);

    return results;
}

async function main() {
    const spotify = await Spotify.createFromCredentials();
    const deezer = new Deezer();
    const ytmusic = await YoutubeMusic.createAndInit();
    const providers = new ProviderCollection(spotify, deezer, ytmusic);
    app.use(express.static('public'));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.get('/', (req, res) => {
        const path = __dirname + "/views/index.html";
        const template = swig.compileFile(path);
        const output = template.render({});
        res.send(output);
    });
    app.post('/', async function (req, res) {
        if(req.body.sharedUrl) {
            const others = await retrieveTrackFromShareUrl(req.body.sharedUrl, providers)
            const path = __dirname + "/views/output.html";
            const template = swig.compileFile(path);
            const output = template.render({tracks: others});
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

async function yttest()
{
    const yt = await YoutubeMusic.createAndInit();
    const result = await yt.findTrack("citizen erased muse");
    console.log(result);

    const song = await yt.getTrack('jtXBocMpnaM');
    console.log(song);
    
}

//yttest();
main();
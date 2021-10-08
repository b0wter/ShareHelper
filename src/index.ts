import { Deezer } from "./deezer";
import { Spotify } from "./spotify"
import { Provider, ProviderCollection } from "./Provider";
import { Request, Response } from "express";
import express from 'express';
import { Html } from "./html";
import { Track } from "./track";
import _ from "lodash";

const swig = require('swig');
const cons = require("consolidate");
const bodyParser = require('body-parser');
const app = express();
const port = 8099;

async function retrieveForProvider(provider: Provider, track: Track)
{
    return await provider.findTrack(`${track.name} ${track.artist}`, track.duration);
}

async function retrieveTrackFromShareUrl(sharedUrl: string, providers: ProviderCollection) : Promise<Track[]>
{
    const url = sharedUrl.toLocaleLowerCase();
    const provider = providers.all.find(provider => url.includes(provider.identifier));
    if(provider === null || provider === undefined)
        throw new Error("The given url does not match any of the known streaming providers.");
    console.log(`Using provider '${provider.identifier}'.`);

    const others = providers.all.filter(p => p.identifier !== provider.identifier)
    if(others === null || others === undefined || others.length === 0)
        throw new Error("There is only a single provider implemented. Cannot do any meaningful translation.");
    console.log('Other providers: ', others.map(p => p.identifier));

    const trackId = await provider.getTrackIdFromSharedUrl(sharedUrl);
    console.log(`Track id for ${provider.identifier} is ${trackId}.`);
    const track = await provider.getTrack(trackId);
    const promises = others.map(o => retrieveForProvider(o, track));
    const results = await Promise.all(promises);

    return results;
}

async function main() {
    const spotify = await Spotify.createFromCredentials();
    const deezer = new Deezer();
    const providers = new ProviderCollection(spotify, deezer);
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
            const links = _.reduce(others, function (agg: string, next: Track) {
                return agg + " " + next.url;
            }, "");
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

main();
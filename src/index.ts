import { Deezer } from "./deezer";
import { Spotify } from "./spotify"
import { Provider, ProviderCollection } from "./Provider";
import { Request, Response } from "express";
import express from 'express';
import { Html } from "./html";
import { Track } from "./track";
import _ from "lodash";

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

    const others = providers.all.filter(p => p.identifier !== provider.identifier)
    if(others === null || others === undefined || others.length === 0)
        throw new Error("There is only a single provider implemented. Cannot do any meaningful translation.");

    const trackId = await provider.getTrackIdFromSharedUrl(sharedUrl);
    const track = await provider.getTrack(trackId);
    const promises = others.map(o => retrieveForProvider(o, track));
    const results = await Promise.all(promises);

    return results;
}

async function main() {
    const spotify = await Spotify.createFromCredentials();
    const deezer = new Deezer();
    const providers = new ProviderCollection(spotify, deezer);
    //await retrieveTrackFromShareUrl(sharedUrl, providers);
    app.use(bodyParser.urlencoded({ extended: true }));
    app.get('/', (req, res) => res.send(Html.page));
    app.post('/', async function (req, res) {
        if(req.body.sharedUrl) {
            const others = await retrieveTrackFromShareUrl(req.body.sharedUrl, providers)
            const links = _.reduce(others, function (agg: string, next: Track) {
                return agg + " " + next.url;
            }, "");
            res.send(links);
        } else {
            res.redirect('/');
        }
    });
    app.listen(port, () => {
        console.log(`Server is running at port ${port}.`)
    });
}

main();
import { Provider } from "./provider";
import { Track } from "./track";
const axios = require('axios').default;

const DeezerPublicApi = require('deezer-public-api');
const _ = require("lodash");

export class Deezer implements Provider
{
    private api : any = new DeezerPublicApi();
    public urlIdentifier = "deezer";
    public name = 'Deezer';
    public logo = 'deezer';

    private trackFromResult(result: any) : Track
    {
        return new Track(result.id, result.title, result.duration, result.album.title, result.artist.name, result.link, this);
    }

    public async findTrack(searchTerm: string, duration?: number)
    {
        const result = await this.api.search.track(searchTerm, undefined, 10);
        if(result.total === 0)
            throw new Error("Api did not deliver any results.");

        const hits = result.data;

        if(duration)
        {
            const selected = _.minBy(hits, function(hit: any) { return Math.abs(hit.duration - duration); })
            return this.trackFromResult(selected);
        }
        else
        {
            return this.trackFromResult(hits[0]);
        }
    }

    public async getTrack(trackId: string) : Promise<Track>
    {
        // The urls created by the deezer app do not directly contain a track id.

        const result = await this.api.track(trackId, 1);
        return this.trackFromResult(result);
    }

    public async getTrackIdFromSharedUrl(sharedUrl: string) : Promise<string>
    {
        if(sharedUrl.includes('https://deezer.page.link/'))
        {
            // https://deezer.page.link/ebTURw42M8zrrRSk6
            //const response = await fetch('https://github.com/');
            const response = await axios.get(sharedUrl).then(function(response: any) { return response; });
            //console.log(response);
            //const body = await response.text();
            const body = response.data.substring(0, 4000);
            const asLines = body.split(/\r?\n/);
            const trackIdLine = asLines.find((line: string) => line.includes('<meta property="og:url" content='));
            if (trackIdLine) {
                const url = trackIdLine.replace('<meta property="og:url" content="', '').replace('">', '');
                sharedUrl = url;
            } else {
                throw new Error ("Could not parse the contents of the retrieved page.");
            }
        }
        // Shared links may include a country identifier so we need to use a regex.
        var trackId = sharedUrl.replace(/https:\/\/www\.deezer\.com\/.*\//, '');
        // Shared links may come with additional url parameters.
        trackId = trackId.split('?')[0];
        return trackId;
    }
}
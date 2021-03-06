import _ from "lodash";
import { Result } from "typescript-result";
import { ApiError, ApiResult, Provider } from "./provider";
import { Track } from "./track";

const SpotifyWebApi = require('spotify-web-api-node');

export class Spotify implements Provider
{
    private constructor(private api: any) {
        //
    }

    public urlIdentifier = 'spotify';
    public name = 'Spotify';
    public logo = 'spotify';

    public static async createFromCredentials(clientId: string, clientSecret: string) {
        if(!clientId || !clientSecret)
        {
            throw new Error("Spotify client id and/or client secret are empty!");
        }
        
        const spotifyApi = new SpotifyWebApi({
            clientId: clientId,
            clientSecret: clientSecret
        })

        await spotifyApi.clientCredentialsGrant().then(
            function (data: any) {
                spotifyApi.setAccessToken(data.body['access_token']);
            },
            function (err: any) {
                console.log('Something went wrong when retrieving an access token', err);
            }
        );
        return new Spotify(spotifyApi);
    }

    private trackFromItem(item: any) : Track
    {
        const artistName = item.artists.reduce((aggregator: string, next: any) => aggregator + " " + next.name, "").trimLeft();
        return new Track(item.id, item.name, item.duration_ms / 1000, item.album.name, artistName, item.external_urls.spotify, this);
    }

    public async getTrack(trackId: string) : Promise<ApiResult<Track>>
    {
        try
        {
            const result = await this.api.getTrack(trackId);
            return Result.ok(this.trackFromItem(result.body));
        }
        catch(exception: any)
        {
            return Result.error(exception.message);
        }
    }

    public async findTrack(searchString: string, duration?: number) : Promise<ApiResult<Track>>
    {
        try
        {
            const result = await this.api.searchTracks(searchString);
            if(result.body.tracks && result.body.tracks.total > 0) {
                if(duration)
                {
                    const selected = _.minBy(result.body.tracks.items, (i: any) => Math.abs((i.duration_ms / 1000)));
                    return Result.ok(this.trackFromItem(selected));
                }
                else
                {
                const item = result.body.tracks.items[0];
                return Result.ok(this.trackFromItem(item));
                }
            }
            else
            {
                return Result.error(new ApiError("API did not return expected content.", this));
            }
        }
        catch(exception: any)
        {
            return Result.error(exception.message);
        }
    }

    public getTrackIdFromSharedUrl(url: string) : Promise<ApiResult<string>>
    {
        // Urls look like this:
        // > https://open.spotify.com/track/0nAnrVl7WVS2zQL36Fp357?si=43c250cc5d3949ad&nd=1
        url = url.replace('https://open.spotify.com/track/', '')
        url = url.split('?')[0]
        return Promise.resolve(Result.ok(url));
    }
}
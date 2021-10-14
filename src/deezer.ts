import { Result } from "typescript-result";
import { ApiError, ApiResult, Provider } from "./provider";
import { Track } from "./track";
const axios = require('axios').default;

const DeezerPublicApi = require('deezer-public-api');
const _ = require("lodash");

export class Deezer implements Provider {
    private api: any = new DeezerPublicApi();
    public urlIdentifier = "deezer";
    public name = 'Deezer';
    public logo = 'deezer';

    private trackFromResult(result: any): Track {
        return new Track(result.id, result.title, result.duration, result.album.title, result.artist.name, result.link, this);
    }

    public async findTrack(searchTerm: string, duration?: number): Promise<ApiResult<Track>> {
        // Search queries look like this:
        //     https://api.deezer.com/search/track?q=Forte%20Da%20Funk%20Binärpilot&limit=10
        try {
            var url = new URL('https://api.deezer.com/search/track');
            url.searchParams.append('q', searchTerm);
            url.searchParams.append('limit', '10');
            const result = await axios.get(url.toString());
            if (result.total === 0) {
                return Result.error(new ApiError("Api did not deliver any results.", this));
            }

            const hits = result.data.data; // extra data from axios

            if (duration) {
                const selected = _.minBy(hits, function (hit: any) { return Math.abs(hit.duration - duration); })
                return Result.ok(this.trackFromResult(selected));
            }
            else {
                return Result.ok(this.trackFromResult(hits[0]));
            }
        }
        catch (error: any) {
            return Result.error(new ApiError(error.message, this));
        }
    }

    public async getTrack(trackId: string): Promise<ApiResult<Track>> {
        try {
            const result = await this.api.track(trackId, 1)
                .then(
                    ((result: any) => {
                        return Result.ok(this.trackFromResult(result));
                    }),
                    ((error: any) => {
                        return Result.error(new ApiError(error.message, this));
                    }))
            return result;

        }
        catch (error: any) {
            return Result.error(new ApiError(error.message, this));
        }
    }

    public async getTrackIdFromSharedUrl(sharedUrl: string): Promise<ApiResult<string>> {
        try {
            if (sharedUrl.includes('https://deezer.page.link/')) {
                let makeError = function (error: any) { return { isError: true, error: error } }
                // https://deezer.page.link/ebTURw42M8zrrRSk6
                const response = await axios.get(sharedUrl).then((response: any) => response, (error: any) => makeError(error));
                if (response.isError) {
                    return Result.error(new ApiError(response.error.message, this));
                }
                const body = response.data.substring(0, 4000);
                const asLines = body.split(/\r?\n/);
                const trackIdLine = asLines.find((line: string) => line.includes('<meta property="og:url" content='));
                if (trackIdLine) {
                    const url = trackIdLine.replace('<meta property="og:url" content="', '').replace('">', '');
                    sharedUrl = url;
                } else {
                    return Result.error(new ApiError("Could not parse the contents of the retrieved page.", this));
                }
            }
            // Shared links may include a country identifier so we need to use a regex.
            var trackId = sharedUrl.replace(/https:\/\/www\.deezer\.com\/.*\//, '');
            // Shared links may come with additional url parameters.
            trackId = trackId.split('?')[0];
            return Result.ok(trackId);
        }
        catch (exception: any) {
            return Result.error(new ApiError(exception.message, this));
        }
    }
}
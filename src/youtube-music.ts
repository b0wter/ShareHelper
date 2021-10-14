import { ApiError, ApiResult, Provider } from "./provider";
import { Track } from "./track";
import _ from "lodash";
import { Result } from "typescript-result";

const YoutubeMusicApi = require('youtube-music-api')

export class YoutubeMusic implements Provider
{
    public urlIdentifier = 'youtube';
    public name = 'YouTube Music';
    public logo = 'youtube';

    private constructor(private readonly api: any)
    {
        //
    }

    public static async createAndInit()
    {
        const api = new YoutubeMusicApi();
        const foo = await api.initalize();
        return new YoutubeMusic(api);
    }

    public async getTrack(trackId: string): Promise<ApiResult<Track>> {
        try
        {
            const result = await this.api.search(trackId).then((c: any) => c.content[0]);
            return Result.ok(this.trackFromItem(result));
        }
        catch(exception: any)
        {
            return Result.error(exception.message);
        }
    }

    private trackFromItem(item: any) : Track
    {
        const url = `https://music.youtube.com/watch?v=${item.videoId}&feature=share`
        return new Track(item.videoId, item.name, item.duration / 1000, item.album.name, item.artist.name, url, this);
    }

    public async findTrack(trackId: string, duration?: number): Promise<ApiResult<Track>> {
        try
        {
            const results = await this.api.search(trackId, "song").then((r: any) => r.content);
            const songs = results.filter((r: any) => r.type === 'song');
            if(songs.length === 0)
                return Result.error(new ApiError("Api did not return any matches.", this));
            function getSong() {
                if(duration !== undefined && duration !== null && duration !== 0)
                {
                    return _.minBy(songs, (song: any) => Math.abs((song.duration / 1000) - duration));
                }
                else
                {
                    return songs[0];
                }
            }   
            const hit = getSong();
            return Result.ok(this.trackFromItem(hit));
        }
        catch(exception: any)
        {
            return Result.error(exception.message);
        }
    }

    public getTrackIdFromSharedUrl(url: string): Promise<ApiResult<string>> {
        // https://music.youtube.com/watch?v=jtXBocMpnaM&feature=share
        url = url.replace('https://music.youtube.com/watch?v=', '');
        url = url.split('&')[0];
        return Promise.resolve(Result.ok(url));
    }
}
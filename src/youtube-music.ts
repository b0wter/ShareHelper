import { Provider } from "./provider";
import { Track } from "./track";
import _ from "lodash";

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

    public async getTrack(trackId: string): Promise<Track> {
        const result = await this.api.search(trackId).then((c: any) => c.content[0]);
        return this.trackFromItem(result);
    }

    private trackFromItem(item: any) : Track
    {
        const url = `https://music.youtube.com/watch?v=${item.videoId}&feature=share`
        return new Track(item.videoId, item.name, item.duration / 1000, item.album.name, item.artist.name, url, this);
    }

    public async findTrack(trackId: string, duration?: number): Promise<Track> {
        const results = await this.api.search(trackId, "song").then((r: any) => r.content);
        const songs = results.filter((r: any) => r.type === 'song');
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
        return this.trackFromItem(hit);
    }

    public getTrackIdFromSharedUrl(url: string): Promise<string> {
        // https://music.youtube.com/watch?v=jtXBocMpnaM&feature=share
        url = url.replace('https://music.youtube.com/watch?v=', '');
        url = url.split('&')[0];
        return Promise.resolve(url);
    }
}
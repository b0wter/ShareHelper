import { Deezer } from "./deezer";
import { Spotify } from "./spotify";
import { Track } from "./track";
import { YoutubeMusic } from "./youtube-music";

export abstract class Provider
{
    public abstract getTrack(trackId: string) : Promise<Track>;
    public abstract findTrack(trackId: string, duration?: number) : Promise<Track>;
    public abstract getTrackIdFromSharedUrl(url: string) : Promise<string>;
    public abstract urlIdentifier : string;
    public abstract name : string;
    public abstract logo: string;
}

export class ProviderCollection {

    public get all()
    {
        return [ this.spotify, this.deezer, this.ytmusic ];
    }

    public constructor(
        public readonly spotify: Spotify,
        public readonly deezer: Deezer,
        public readonly ytmusic: YoutubeMusic)
    {
        //
    }
}
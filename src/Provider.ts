import { Deezer } from "./deezer";
import { Spotify } from "./spotify";
import { Track } from "./track";

export abstract class Provider
{
    public abstract getTrack(trackId: string) : Promise<Track>;
    public abstract findTrack(trackId: string, duration?: number) : Promise<Track>;
    public abstract getTrackIdFromSharedUrl(url: string) : Promise<string>;
    public abstract identifier : string;
}

export class ProviderCollection {

    public get all()
    {
        return [ this.spotify, this.deezer ];
    }

    public constructor(
        public readonly spotify: Spotify,
        public readonly deezer: Deezer)
    {
        //
    }
}
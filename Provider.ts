import { Track } from "./track";

export abstract class Provider
{
    public abstract getTrack(trackId: string) : Promise<Track>;
    public abstract findTrack(trackId: string, duration?: number) : Promise<Track>;
    public abstract getTrackIdFromSharedUrl(url: string) : Promise<string>;
    public abstract identifier : string;
}
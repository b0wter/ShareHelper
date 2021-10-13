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
    private providers: Provider[] = [];

    public get all()
    {
        return this.providers;
    }

    public constructor(deezer: Deezer, ytmusic: YoutubeMusic, spotify?: Spotify)
    {
        this.providers.push(deezer);
        this.providers.push(ytmusic);
        if(spotify)
        {
            console.log("Spotify credentials have been set.")
            this.providers.push(spotify);
        }
        else
        {
            console.log("Spotify credentials have not been set. Service is disabled.");
        }
    }
}
import { Result } from "typescript-result";
import { Deezer } from "./deezer";
import { Spotify } from "./spotify";
import { Track } from "./track";
import { YoutubeMusic } from "./youtube-music";
import { TrackForApiResult } from "./track";

export class ProviderResults
{
    constructor(public readonly successes: Track[], public readonly failures: ApiError[])
    {
        //
    }

    public forApi() : ProviderResultsForApi
    {
        return new ProviderResultsForApi(this.successes.map(s => s.forApi()), this.failures.map(f => f.forApi()));
    }
}

export class ProviderResultsForApi
{
    constructor(public readonly successes: TrackForApiResult[], public readonly failures: ApiErrorForApiResult[])
    {
        //
    }
}

export abstract class Provider
{
    public abstract getTrack(trackId: string) : Promise<ApiResult<Track>>;
    public abstract findTrack(trackId: string, duration?: number) : Promise<ApiResult<Track>>;
    public abstract getTrackIdFromSharedUrl(url: string) : Promise<ApiResult<string>>;
    public abstract urlIdentifier : string;
    public abstract name : string;
    public abstract logo: string;
}

export class ApiError
{
    constructor(public readonly message: string, public readonly source: Provider)
    {
        //
    }

    public forApi() : ApiErrorForApiResult
    {
        return new ApiErrorForApiResult(this.message, this.source);
    }
}

export class ApiErrorForApiResult
{
    public readonly source: string;

    constructor(public readonly message: string, source: Provider)
    {
        this.source = source.name;
    }
}

export type ApiResult<T> = Result<ApiError, T>

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
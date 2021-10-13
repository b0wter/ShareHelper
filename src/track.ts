import { Provider } from "./provider";

class TrackWithoutProvider {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly duration: number,
        public readonly album: string,
        public readonly artist: string,
        public readonly url: string)
    {
        //
    }
}

class TrackForApiResult extends TrackWithoutProvider{
    public readonly source: string;

    constructor(
        id: string,
        name: string,
        duration: number,
        album: string,
        artist: string,
        url: string,
        source: Provider)
    {
        super(id, name, duration, album, artist, url);
        this.source = source.name;
    }

}

export class Track extends TrackWithoutProvider {

    constructor(
        id: string,
        name: string,
        duration: number,
        album: string,
        artist: string,
        url: string,
        public readonly source: Provider)
    {
        super(id, name, duration, album, artist, url);
    }

    public forApi() : any
    {
        var track = new TrackForApiResult(this.id, this.name, this.duration, this.album, this.artist, this.url, this.source);
        return track;
    }

}
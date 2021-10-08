import { Deezer } from "./deezer";
import { Spotify } from "./spotify"

//const spotify = new Spotify();

//spotify.getTrackDetails("https://open.spotify.com/track/2OMhd07xb5PTLLUFOTEgvR?si=bc67c64b5d554b16");

class ProviderCollection {

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

async function test() {
    const spotify = await Spotify.createFromCredentials();

    const trackId = await spotify.getTrackIdFromSharedUrl('https://open.spotify.com/track/0nAnrVl7WVS2zQL36Fp357?si=43c250cc5d3949ad&nd=1');

    //var track = await spotify.getTrack('2OMhd07xb5PTLLUFOTEgvR');
    var track = await spotify.getTrack(trackId);
    console.log(track);

    const search = await spotify.findTrack(`${track.name} ${track.artist}`, 300);
    console.log(search);
}

async function test2() {
    const deezer = new Deezer();
    const foo = await deezer.getTrackIdFromSharedUrl('https://deezer.page.link/ebTURw42M8zrrRSk6');
    console.log('foo', foo);
    /*
    const deezer = new Deezer();
    const bar = await deezer.getTrack('102241218');
    console.log(bar);

    const foo = await deezer.findTrack("fox tales koloto", 245);
    console.log(foo);
    */

}

async function retrieveTrackFromShareUrl(sharedUrl: string, providers: ProviderCollection) {
    const url = sharedUrl.toLocaleLowerCase();
    const provider = providers.all.find(provider => url.includes(provider.identifier));
    if(provider === null || provider === undefined)
        throw new Error("The given url does not match any of the known streaming providers.");

    const other = providers.all.find(p => p.identifier !== provider.identifier)
    if(other === null || other === undefined)
        throw new Error("There is only a single provider implemented. Cannot do any meaningful translation.");

    const trackId = await provider.getTrackIdFromSharedUrl(sharedUrl);
    console.log('trackId', trackId);

    const track = await provider.getTrack(trackId);
    console.log('track retrieved');

    const otherTrack = await other.findTrack(`${track.name} ${track.artist}`);
    console.log(otherTrack.url);
}


async function main(argv: string[]) {
    if(argv.length !== 3)
        throw new Error("This script must be called with exactly one argument.");
    const sharedUrl = argv[2];
    const spotify = await Spotify.createFromCredentials();
    const deezer = new Deezer();
    const providers = new ProviderCollection(spotify, deezer);
    await retrieveTrackFromShareUrl(sharedUrl, providers);
}

main(process.argv);

//test2();


import { Provider } from "./provider";

export class Track {

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly duration: number,
        public readonly album: string,
        public readonly artist: string,
        public readonly url: string,
        public readonly source: Provider) {
        //
    }

}
import { RangeDecoder } from "./RangeDecoder";
/**
 * LZMA Decoder
 * @author Nidin Vinayakan | nidinthb@gmail.com
 */
export declare class LenDecoder {
    private choice;
    private lowCoder;
    private midCoder;
    private highCoder;
    constructor();
    init(): void;
    decode(rc: RangeDecoder, posState: number): number;
}

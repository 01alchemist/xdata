import { RangeDecoder } from "./RangeDecoder";
/**
 * LZMA Decoder
 * @author Nidin Vinayakan | nidinthb@gmail.com
 */
export declare class BitTreeDecoder {
    probs: Uint16Array;
    private numBits;
    constructor(numBits: number);
    init(): void;
    decode(rc: RangeDecoder): number;
    reverseDecode(rc: RangeDecoder): number;
    static constructArray(numBits: number, len: number): Array<BitTreeDecoder>;
}

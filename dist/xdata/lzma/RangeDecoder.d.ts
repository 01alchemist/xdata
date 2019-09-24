/**
 * LZMA Decoder
 * @author Nidin Vinayakan | nidinthb@gmail.com
 */
export declare class RangeDecoder {
    static kTopValue: number;
    inStream: Uint8Array;
    corrupted: boolean;
    in_pos: number;
    private rangeI;
    private codeI;
    private loc1;
    private loc2;
    private U32;
    private U16;
    constructor();
    isFinishedOK(): boolean;
    init(): void;
    normalize(): void;
    decodeDirectBits(numBits: number): number;
    decodeBit(prob: Uint16Array, index: number): number;
}

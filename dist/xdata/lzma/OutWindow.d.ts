/**
 * LZMA Decoder
 * @author Nidin Vinayakan | nidinthb@gmail.com
 */
export declare class OutWindow {
    totalPos: number;
    outStream: Uint8Array;
    private buf;
    private pos;
    out_pos: number;
    private size;
    private isFull;
    constructor();
    create(dictSize: number): void;
    putByte(b: number): void;
    getByte(dist: number): number;
    copyMatch(dist: number, len: number): void;
    checkDistance(dist: number): boolean;
    isEmpty(): boolean;
}

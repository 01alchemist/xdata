import { ByteArray } from "./ByteArray";
/**
 * JavaScript BitArray
 * version : 0.2
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 * Utility to read bits from ByteArray
 */
export declare class BitArray extends ByteArray {
    private bitsPending;
    constructor(buffer?: ArrayBuffer);
    readBits(bits: number, bitBuffer?: number): number;
    writeBits(bits: number, value: number): void;
    resetBitsPending(): void;
    static calculateMaxBits(signed: boolean, values: number[]): number;
}

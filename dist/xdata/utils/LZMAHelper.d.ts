import { LZMA } from "../lzma/LZMA";
/**
 * @author Nidin Vinayakan | nidinthb@gmail.com
 */
export declare class LZMAHelper {
    static decoder: LZMA;
    static decoderAsync: Worker | null;
    static enableAsync: boolean;
    static callback: Function | null;
    static ENCODE: number;
    static DECODE: number;
    private static workerScript;
    static init(workerScript?: string): void;
    /**
     * TODO : Implement encoder
     * @param data
     * @returns {null}
     */
    static encode(data: ArrayBuffer): ArrayBuffer;
    static decodeBuffer(data: ArrayBuffer): ArrayBuffer;
    static decode(data: Uint8Array): Uint8Array;
    /**
     * TODO : Implement encoder
     * @param data
     * @param _callback
     */
    static encodeAsync(data: ArrayBuffer, _callback: Function): void;
    static decodeAsync(data: ArrayBuffer, _callback: Function): void;
}

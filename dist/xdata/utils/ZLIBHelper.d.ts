import { ZLIB } from "../zlib/ZLIB";
/**
 * @author Nidin Vinayakan | nidinthb@gmail.com
 */
export declare class ZLIBHelper {
    static decoder: ZLIB;
    static decoderAsync: Worker | null;
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
    static encodeBuffer(data: ArrayBuffer): ArrayBuffer;
    static encode(data: Uint8Array): Uint8Array;
    static decodeBuffer(data: ArrayBuffer): ArrayBuffer;
    static decode(data: Uint8Array): Uint8Array;
    /**
     * TODO : Implement encoder
     * @param data
     * @param _callback
     */
    static encodeBufferAsync(data: ArrayBuffer, _callback: Function): void;
    static decodeBufferAsync(data: ArrayBuffer, _callback: Function): void;
}

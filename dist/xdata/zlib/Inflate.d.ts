/**
 * ZLIB Decoder
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 */
export declare class Inflate {
    /** @type {number} */
    bufferSize: number;
    /** @type {Inflate.BufferType} */
    bufferType: any;
    /** @type {number} */
    cmf: number;
    /** @type {number} */
    flg: number;
    method: any;
    /** @type {!(Uint8Array|Array)} */
    private input;
    /** @type {number} */
    private ip;
    /** @type {RawInflate} */
    private rawinflate;
    /** @type {(boolean|undefined)} verify flag. */
    private verify;
    static BufferType: {
        BLOCK: number;
        ADAPTIVE: number;
    };
    constructor(input: Uint8Array | number[], optParams?: any);
    /**
     * decompress.
     * @return {!(Uint8Array|Array)} inflated buffer.
     */
    decompress(): any;
}

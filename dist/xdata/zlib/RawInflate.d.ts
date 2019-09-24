/**
 * ZLIB Decoder
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 */
export declare class RawInflate {
    private ZLIB_RAW_INFLATE_BUFFER_SIZE;
    /** @type {!(Array.<number>|Uint8Array)} inflated buffer */
    buffer: Uint8Array;
    blocks: any;
    bufferSize: number;
    totalpos: number;
    ip: number;
    bitsbuf: number;
    bitsbuflen: number;
    input: Uint8Array;
    output: Uint8Array;
    op: number;
    bfinal: boolean;
    bufferType: any;
    resize: boolean;
    prev: any;
    currentLitlenTable: any;
    static BufferType: {
        BLOCK: number;
        ADAPTIVE: number;
    };
    static MaxBackwardLength: number;
    static MaxCopyLength: number;
    static Order: Uint16Array;
    static LengthCodeTable: Uint16Array;
    static LengthExtraTable: Uint8Array;
    static DistCodeTable: Uint16Array;
    static DistExtraTable: Uint8Array;
    static FixedLiteralLengthTable: any;
    static FixedDistanceTable: any;
    letructor(input: Uint8Array, opt_params: any): void;
    decompress(): Uint8Array;
    private parseBlock;
    private readBits;
    private readCodeByTable;
    private parseUncompressedBlock;
    private parseFixedHuffmanBlock;
    private parseDynamicHuffmanBlock;
    private decode;
    private decodeHuffman;
    private decodeHuffmanAdaptive;
    private expandBuffer;
    private expandBufferAdaptive;
    private concatBuffer;
    private concatBufferDynamic;
}

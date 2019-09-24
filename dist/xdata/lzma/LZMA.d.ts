import { LzmaDecoder } from "./LzmaDecoder";
import { RangeDecoder } from "./RangeDecoder";
/**
 * LZMA Decoder
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 */
export declare class LZMA {
    static LZMA_DIC_MIN: number;
    static LZMA_RES_ERROR: number;
    static LZMA_RES_FINISHED_WITH_MARKER: number;
    static LZMA_RES_FINISHED_WITHOUT_MARKER: number;
    static kNumBitModelTotalBits: number;
    static kNumMoveBits: number;
    static PROB_INIT_VAL: number;
    static kNumPosBitsMax: number;
    static kNumStates: number;
    static kNumLenToPosStates: number;
    static kNumAlignBits: number;
    static kStartPosModelIndex: number;
    static kEndPosModelIndex: number;
    static kNumFullDistances: number;
    static kMatchMinLen: number;
    decoder: LzmaDecoder;
    data: Uint8Array;
    ucdata: Uint8Array;
    static INIT_PROBS(p: Uint16Array): void;
    static BitTreeReverseDecode(probs: Uint16Array, numBits: number, rc: RangeDecoder, offset?: number): number;
    constructor();
    decode(data: Uint8Array): Uint8Array;
}

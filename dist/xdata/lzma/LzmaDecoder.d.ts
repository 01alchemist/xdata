import { RangeDecoder } from "./RangeDecoder";
import { OutWindow } from "./OutWindow";
/**
 * LZMA Decoder
 * @author Nidin Vinayakan | nidinthb@gmail.com
 */
export declare class LzmaDecoder {
    markerIsMandatory: boolean;
    rangeDec: RangeDecoder;
    outWindow: OutWindow;
    lc: number;
    pb: number;
    lp: number;
    dictSize: number;
    dictSizeInProperties: number;
    private litProbs;
    private posSlotDecoder;
    private alignDecoder;
    private posDecoders;
    private isMatch;
    private isRep;
    private isRepG0;
    private isRepG1;
    private isRepG2;
    private isRep0Long;
    private lenDecoder;
    private repLenDecoder;
    private loc1;
    private matchBitI;
    private matchByteI;
    private bitI;
    private symbolI;
    private prevByteI;
    private litStateI;
    constructor();
    init(): void;
    create(): void;
    private createLiterals;
    private initLiterals;
    private decodeLiteral;
    private decodeDistance;
    private initDist;
    decodeProperties(properties: Uint8Array): void;
    private updateState_Literal;
    private updateState_ShortRep;
    private updateState_Rep;
    private updateState_Match;
    decode(unpackSizeDefined: boolean, unpackSize: number): number;
}

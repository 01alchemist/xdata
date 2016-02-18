import {LzmaDecoder} from "./LzmaDecoder";
import {RangeDecoder} from "./RangeDecoder";
"use strict"
/**
 * LZMA Decoder
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 */

export class LZMA {
    static LZMA_DIC_MIN:number = (1 << 12);
    static LZMA_RES_ERROR:number = 0;
    static LZMA_RES_FINISHED_WITH_MARKER:number = 1;
    static LZMA_RES_FINISHED_WITHOUT_MARKER:number = 2;
    static kNumBitModelTotalBits:number = 11;
    static kNumMoveBits:number = 5;
    static PROB_INIT_VAL = ((1 << LZMA.kNumBitModelTotalBits) / 2);//1024
    static kNumPosBitsMax:number = 4;

    static kNumStates:number = 12;
    static kNumLenToPosStates:number = 4;
    static kNumAlignBits:number = 4;
    static kStartPosModelIndex:number = 4;
    static kEndPosModelIndex:number = 14;
    static kNumFullDistances:number = (1 << (LZMA.kEndPosModelIndex >>> 1));
    static kMatchMinLen:number = 2;

    public decoder:LzmaDecoder;
    public data:Uint8Array;
    public ucdata:Uint8Array;

    //Local registers
    private loc1:number;
    private loc2:number;

    static INIT_PROBS(p:Uint16Array):void {
        for (var i:number = 0; i < p.length; i++) {
            p[i] = this.PROB_INIT_VAL;
        }
    }

    static BitTreeReverseDecode(probs, numBits:number, rc:RangeDecoder, offset:number = 0):number {
        var m:number = 1;
        var symbol:number = 0;
        for (var i:number = 0; i < numBits; i++) {
            var bit:number = rc.decodeBit(probs, offset + m);
            m <<= 1;
            m += bit;
            symbol |= (bit << i);
        }
        return symbol;
    }

    constructor() {
        this.decoder = new LzmaDecoder();
    }

    public decode(data:Uint8Array):Uint8Array {
        this.data = data;
        //var header:Uint8Array = data.readUint8Array(13);
        var header:Uint8Array = new Uint8Array(13);
        var i:number;//int
        for (i = 0; i < 13; i++) {
            header[i] = data[i];
        }

        this.decoder.decodeProperties(header);

        console.log("\nlc=" + this.decoder.lc + ", lp=" + this.decoder.lp + ", pb=" + this.decoder.pb);
        console.log("\nDictionary Size in properties = " + this.decoder.dictSizeInProperties);
        console.log("\nDictionary Size for decoding  = " + this.decoder.dictSize);
        //return this.ucdata;
        var unpackSize:number = 0;//UInt64
        var unpackSizeDefined:boolean = false;
        for (i = 0; i < 8; i++) {
            var b:number = header[5 + i];
            if (b != 0xFF) {
                unpackSizeDefined = true;
            }
            unpackSize |= b << (8 * i);
        }

        this.decoder.markerIsMandatory = !unpackSizeDefined;

        console.log("\n");
        if (unpackSizeDefined) {
            console.log("Uncompressed Size : " + unpackSize + " bytes");
        } else {
            console.log("End marker is expected\n");
        }
        this.decoder.rangeDec.inStream = data;
        console.log("\n");

        this.decoder.create();
        // we support the streams that have uncompressed size and marker.
        var res:number = this.decoder.decode(unpackSizeDefined, unpackSize); //int

        console.log("Read    ", this.decoder.rangeDec.in_pos);
        console.log("Written ", this.decoder.outWindow.out_pos);

        if (res == LZMA.LZMA_RES_ERROR) {
            throw "LZMA decoding error";
        }
        else if (res == LZMA.LZMA_RES_FINISHED_WITHOUT_MARKER) {
            console.log("Finished without end marker");
        }
        else if (res == LZMA.LZMA_RES_FINISHED_WITH_MARKER) {
            if (unpackSizeDefined) {
                if (this.decoder.outWindow.out_pos != unpackSize) {
                    throw "Finished with end marker before than specified size";
                }
                console.log("Warning: ");
            }
            console.log("Finished with end marker");
        }
        else {
            throw "Internal Error";
        }

        console.log("\n");

        if (this.decoder.rangeDec.corrupted) {
            console.log("\nWarning: LZMA stream is corrupted\n");
        }
        return this.decoder.outWindow.outStream;
    }
}
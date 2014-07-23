/// <reference path="../src/lzma/LZMA.lib.d.ts" />
declare module nid.utils {
    class MEMORY {
        static u8Index: number;
        static u16Index: number;
        static u32Index: number;
        static u8: Uint32Array;
        static u16: Uint32Array;
        static u32: Uint32Array;
        static allocateUint8(len: number): void;
        static allocateUint16(len: number): void;
        static allocateUint32(len: number): void;
        static getUint8(): number;
        static getUint16(): number;
        static getUint32(): number;
    }
}
declare module nid {
    class LzmaDecoder {
        public markerIsMandatory: boolean;
        public rangeDec: nid.RangeDecoder;
        public outWindow: nid.OutWindow;
        public lc: number;
        public pb: number;
        public lp: number;
        public dictSize: number;
        public dictSizeInProperties: number;
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
        private loc2;
        private matchBitI;
        private matchByteI;
        private bitI;
        private symbolI;
        private prevByteI;
        private litStateI;
        constructor();
        public init(): void;
        public create(): void;
        private createLiterals();
        private initLiterals();
        private decodeLiteral(state, rep0);
        private decodeDistance(len);
        private initDist();
        public decodeProperties(properties: Uint8Array): void;
        private updateState_Literal(state);
        private updateState_ShortRep(state);
        private updateState_Rep(state);
        private updateState_Match(state);
        public decode(unpackSizeDefined: boolean, unpackSize: number): number;
    }
}
declare module nid {
    /**
    * LZMA Decoder
    * @author Nidin Vinayakan | nidinthb@gmail.com
    */
    class OutWindow {
        public totalPos: number;
        public outStream: Uint8Array;
        private buf;
        private pos;
        public out_pos: number;
        private size;
        private isFull;
        constructor();
        public create(dictSize: number): void;
        public putByte(b: any): void;
        public getByte(dist: number): number;
        public copyMatch(dist: any, len: any): void;
        public checkDistance(dist: any): boolean;
        public isEmpty(): boolean;
    }
}
declare module nid {
    class RangeDecoder {
        static kTopValue: number;
        public inStream: Uint8Array;
        public corrupted: boolean;
        public in_pos: number;
        private range;
        private code;
        private rangeI;
        private codeI;
        private loc1;
        private loc2;
        private U32;
        private U16;
        constructor();
        public isFinishedOK(): boolean;
        public init(): void;
        public normalize(): void;
        public decodeDirectBits(numBits: number): number;
        public decodeBit(prob: Uint16Array, index: number): number;
    }
}
declare module nid {
    /**
    * LZMA Decoder
    * @author Nidin Vinayakan | nidinthb@gmail.com
    */
    class BitTreeDecoder {
        public probs: Uint16Array;
        private numBits;
        constructor(numBits: any);
        public init(): void;
        public decode(rc: nid.RangeDecoder): number;
        public reverseDecode(rc: nid.RangeDecoder): number;
        static constructArray(numBits: number, len: number): BitTreeDecoder[];
    }
}
declare module nid {
    /**
    * LZMA Decoder
    * @author Nidin Vinayakan | nidinthb@gmail.com
    */
    class LenDecoder {
        private choice;
        private lowCoder;
        private midCoder;
        private highCoder;
        constructor();
        public init(): void;
        public decode(rc: nid.RangeDecoder, posState: number): number;
    }
}
declare module nid {
    /**
    * LZMA Decoder
    * @author Nidin Vinayakan | nidinthb@gmail.com
    */
    class LZMA {
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
        public decoder: nid.LzmaDecoder;
        public data: Uint8Array;
        public ucdata: Uint8Array;
        private loc1;
        private loc2;
        static INIT_PROBS(p: Uint16Array): void;
        static BitTreeReverseDecode(probs: any, numBits: number, rc: nid.RangeDecoder, offset?: number): number;
        constructor();
        public decode(data: Uint8Array): Uint8Array;
    }
}
declare module nid {
    class LZMAWorker {
        static ENCODE: number;
        static DECODE: number;
        private decoder;
        private command;
        constructor();
        private decode(data);
    }
}
declare var w: nid.LZMAWorker;

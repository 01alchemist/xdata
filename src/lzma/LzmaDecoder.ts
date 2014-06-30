///<reference path="LZMA.d.ts" />
///<reference path="../ByteArray.ts" />
module nid.lzma
{
	/**
	 * LZMA Decoder
	 * @author Nidin Vinayakan | nidinthb@gmail.com
	 */
    import ByteArray = nid.utils.ByteArray;
    import MEMORY = nid.utils.MEMORY;

	export class LzmaDecoder
	{
        //Public
        public markerIsMandatory:boolean;
        public rangeDec:RangeDecoder;//RangeDecoder
        public outWindow:OutWindow;//OutWindow
        public lc:number;
        public pb:number;
        public lp:number;//unsigned byte
        public dictSize:number;//UInt32
        public dictSizeInProperties:number;//UInt32

        //Private
        private litProbs:Uint16Array;

        private posSlotDecoder:Array<BitTreeDecoder>;
        private alignDecoder:BitTreeDecoder;
        private posDecoders:Uint16Array;

        private isMatch:Uint16Array;
        private isRep:Uint16Array;
        private isRepG0:Uint16Array;
        private isRepG1:Uint16Array;
        private isRepG2:Uint16Array;
        private isRep0Long:Uint16Array;

        private lenDecoder:LenDecoder;
        private repLenDecoder:LenDecoder;

        //Local registers
        private loc1:number;
        private loc2:number;

        constructor() {
            this.posSlotDecoder = BitTreeDecoder.constructArray(6,LZMA.kNumLenToPosStates);//6
            this.alignDecoder   = new BitTreeDecoder(LZMA.kNumAlignBits);
            this.posDecoders    = new Uint16Array(1 + LZMA.kNumFullDistances - LZMA.kEndPosModelIndex);

            this.isMatch    = new Uint16Array(LZMA.kNumStates << LZMA.kNumPosBitsMax);
            this.isRep      = new Uint16Array(LZMA.kNumStates);
            this.isRepG0    = new Uint16Array(LZMA.kNumStates);
            this.isRepG1    = new Uint16Array(LZMA.kNumStates);
            this.isRepG2    = new Uint16Array(LZMA.kNumStates);
            this.isRep0Long = new Uint16Array(LZMA.kNumStates << LZMA.kNumPosBitsMax);

            this.lenDecoder     = new LenDecoder();
            this.repLenDecoder  = new LenDecoder();
            this.rangeDec       = new RangeDecoder();
            this.outWindow      = new OutWindow();
        }

        public init():void
        {
            this.loc1 = MEMORY.getUint32();
            this.loc2 = MEMORY.getUint32();

            this.initLiterals();
            this.initDist();

            LZMA.INIT_PROBS(this.isMatch);
            LZMA.INIT_PROBS(this.isRep);
            LZMA.INIT_PROBS(this.isRepG0);
            LZMA.INIT_PROBS(this.isRepG1);
            LZMA.INIT_PROBS(this.isRepG2);
            LZMA.INIT_PROBS(this.isRep0Long);

            this.lenDecoder.init();
            this.repLenDecoder.init();
        }
        public create():void
        {
            this.outWindow.create(this.dictSize);
            this.createLiterals();
        }
        //Private
        private createLiterals():void
        {
            this.litProbs = new Uint16Array(0x300 << (this.lc + this.lp));
        }
        private initLiterals():void
        {
            var num:number = 0x300 << (this.lc + this.lp);//UInt32
            for (var i:number = 0; i < num; i++) {
                this.litProbs[i] = LZMA.PROB_INIT_VAL;
            }
        }
        private decodeLiteral(state, rep0):void//unsigned , UInt32
        {
            var prevByte = 0;//unsigned byte
            if (!this.outWindow.isEmpty())
            prevByte = this.outWindow.getByte(1);

            var symbol:number = 1;
            var litState:number = ((this.outWindow.totalPos & ((1 << this.lp) - 1)) << this.lc) + (prevByte >>> (8 - this.lc));
            var probsOffset:number = 0x300 * litState;

            if (state >= 7)
            {
                var matchByte:number = this.outWindow.getByte(rep0 + 1);
                do
                {
                    var matchBit:number = (matchByte >>> 7) & 1;
                    matchByte <<= 1;
                    var bit:number = this.rangeDec.decodeBit(this.litProbs,probsOffset + ((1 + matchBit) << 8) + symbol);
                    symbol = (symbol << 1) | bit;
                    if (matchBit != bit)
                    break;
                }
                while (symbol < 0x100);
            }
            while (symbol < 0x100)
                symbol = (symbol << 1) | this.rangeDec.decodeBit(this.litProbs,probsOffset + symbol);
            this.outWindow.putByte(symbol - 0x100);
        }
        private decodeDistance(len):number//unsigned byte
        {
            var lenState:number = len;//unsigned byte
            if (lenState > LZMA.kNumLenToPosStates - 1)
                lenState = LZMA.kNumLenToPosStates - 1;

            var posSlot = this.posSlotDecoder[lenState].decode(this.rangeDec);//unsigned byte
            if (posSlot < 4)
                return posSlot;

            var numDirectBits = ((posSlot >>> 1) - 1);//unsigned byte
            MEMORY.u32[this.loc1] = ((2 | (posSlot & 1)) << numDirectBits);//UInt32
            if (posSlot < LZMA.kEndPosModelIndex){
                MEMORY.u32[this.loc1] += LZMA.BitTreeReverseDecode(this.posDecoders, numDirectBits, this.rangeDec, MEMORY.u32[this.loc1] - posSlot);
            }
            else
            {
                MEMORY.u32[this.loc1] += this.rangeDec.decodeDirectBits(numDirectBits - LZMA.kNumAlignBits) << LZMA.kNumAlignBits;
                MEMORY.u32[this.loc1] += this.alignDecoder.reverseDecode(this.rangeDec);
            }
            return MEMORY.u32[this.loc1];
        }
        private initDist():void
        {
            for (var i = 0; i < LZMA.kNumLenToPosStates; i++){
                this.posSlotDecoder[i].init();
            }
            this.alignDecoder.init();
            LZMA.INIT_PROBS(this.posDecoders);
        }
        public decodeProperties(properties:Uint8Array):void
        {
            var prop = new Uint8Array(4);
            prop[0] = properties[0];
            if (prop[0] >= (9 * 5 * 5)){
                throw "Incorrect LZMA properties";
            }
            prop[1] = prop[0] % 9;
            prop[0] /= 9;
            prop[2] = prop[0] / 5;
            prop[3] = prop[0] % 5;

            this.lc = prop[1];
            this.pb = prop[2];
            this.lp = prop[3];

            this.dictSizeInProperties = 0;
            for (var i:number = 0; i < 4; i++){
                this.dictSizeInProperties |= properties[i + 1] << (8 * i);
            }

            this.dictSize = this.dictSizeInProperties;

            if (this.dictSize < LZMA.LZMA_DIC_MIN){
                this.dictSize = LZMA.LZMA_DIC_MIN;
            }
        }
        private updateState_Literal(state:number):number
        {
            if (state < 4) return 0;
            else if (state < 10) return state - 3;
            else return state - 6;
        }
        private updateState_ShortRep(state:number):number { return state < 7 ? 9 : 11; }
        private updateState_Rep     (state:number):number { return state < 7 ? 8 : 11; }
        private updateState_Match   (state:number):number { return state < 7 ? 7 : 10; }

        public decode(unpackSizeDefined:boolean, unpackSize:number):number//UInt64
        {
            this.init();
            this.rangeDec.init();

            if(unpackSizeDefined){
                this.outWindow.outStream = new ByteArray(new ArrayBuffer(unpackSize));
            }

            var rep0 = 0, rep1 = 0, rep2 = 0, rep3 = 0;//UInt32
            var state = 0;//unsigned byte

            for (;;)
            {
                if (unpackSizeDefined && unpackSize == 0 && !this.markerIsMandatory){
                    if (this.rangeDec.isFinishedOK()){
                        return LZMA.LZMA_RES_FINISHED_WITHOUT_MARKER;
                    }
                }

                var posState = this.outWindow.totalPos & ((1 << this.pb) - 1);

                if (this.rangeDec.decodeBit(this.isMatch,(state << LZMA.kNumPosBitsMax) + posState) == 0)
                {
                    if (unpackSizeDefined && unpackSize == 0){
                        return LZMA.LZMA_RES_ERROR;
                    }
                    this.decodeLiteral(state, rep0);
                    state = this.updateState_Literal(state);
                    unpackSize--;
                    continue;
                }

                var len;

                if (this.rangeDec.decodeBit(this.isRep,state) != 0)
                {
                    if (unpackSizeDefined && unpackSize == 0){
                        return LZMA.LZMA_RES_ERROR;
                    }
                    if (this.outWindow.isEmpty()){
                        return LZMA.LZMA_RES_ERROR;
                    }
                    if (this.rangeDec.decodeBit(this.isRepG0,state) == 0)
                    {
                        if (this.rangeDec.decodeBit(this.isRep0Long,(state << LZMA.kNumPosBitsMax) + posState) == 0)
                        {
                            state = this.updateState_ShortRep(state);
                            this.outWindow.putByte(this.outWindow.getByte(rep0 + 1));
                            unpackSize--;
                            continue;
                        }
                    }
                    else
                    {
                        var dist:number;
                        if (this.rangeDec.decodeBit(this.isRepG1,state) == 0){
                            dist = rep1;
                        }
                        else
                        {
                            if (this.rangeDec.decodeBit(this.isRepG2,state) == 0){
                                dist = rep2;
                            }
                            else
                            {
                                dist = rep3;
                                rep3 = rep2;
                            }
                            rep2 = rep1;
                        }
                        rep1 = rep0;
                        rep0 = dist;
                    }
                    len = this.repLenDecoder.decode(this.rangeDec, posState);
                    state = this.updateState_Rep(state);
                }
                else
                {
                    rep3 = rep2;
                    rep2 = rep1;
                    rep1 = rep0;
                    len   = this.lenDecoder.decode(this.rangeDec, posState);
                    state = this.updateState_Match(state);
                    rep0  = this.decodeDistance(len);
                    if (rep0 == 0xFFFFFFFF) {
                        return this.rangeDec.isFinishedOK() ?
                            LZMA.LZMA_RES_FINISHED_WITH_MARKER :
                            LZMA.LZMA_RES_ERROR;
                    }

                    if (unpackSizeDefined && unpackSize == 0){
                        return LZMA.LZMA_RES_ERROR;
                    }
                    if (rep0 >= this.dictSize || !this.outWindow.checkDistance(rep0)){
                        return LZMA.LZMA_RES_ERROR;
                    }
                }
                len += LZMA.kMatchMinLen;
                var isError:boolean = false;
                if (unpackSizeDefined && unpackSize < len)
                {
                    len = unpackSize;
                    isError = true;
                }
                this.outWindow.copyMatch(rep0 + 1, len);
                unpackSize -= len;
                if (isError){
                    return LZMA.LZMA_RES_ERROR;
                }
            }
        }
	}
	
}
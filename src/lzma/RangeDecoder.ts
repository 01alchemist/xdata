///<reference path="LZMA.d.ts" />
module nid.lzma
{
    /**
     * LZMA Decoder
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */
    import ByteArray = nid.utils.ByteArray;
    import MEMORY = nid.utils.MEMORY;

    export class RangeDecoder
    {
        static kTopValue:number = (1 << 24);

        public inStream:ByteArray;
        public corrupted:boolean;

        private in_pos:number;
        private range:number;//UInt32
        private code:number;//UInt32
        private rangeI:number;
        private codeI:number;
        private loc1:number;
        private loc2:number;

        constructor(){
            this.in_pos = 0;
        }
        public isFinishedOK():boolean{
            return MEMORY.u32[this.codeI] == 0;
        }
        public init():void
        {
            this.rangeI = MEMORY.getUint32();
            this.codeI  = MEMORY.getUint32();
            this.loc1   = MEMORY.getUint32();
            this.loc2   = MEMORY.getUint32();

            this.corrupted = false;
            if (this.inStream.readUnsignedByte() != 0){
                this.corrupted = true;
            }

            MEMORY.u32[this.rangeI] = 0xFFFFFFFF;
            MEMORY.u32[this.codeI] = 0;

            for (var i:number = 0; i < 4; i++){
                MEMORY.u32[this.codeI] = (MEMORY.u32[this.codeI] << 8) | this.inStream.readUnsignedByte();
            }

            if (MEMORY.u32[this.codeI] == MEMORY.u32[this.rangeI]){
                this.corrupted = true;
            }
        }

        public normalize()
        {
            if (MEMORY.u32[this.rangeI] < RangeDecoder.kTopValue)
            {
                MEMORY.u32[this.rangeI] <<= 8;
                MEMORY.u32[this.codeI] = (MEMORY.u32[this.codeI] << 8) | this.inStream.readUnsignedByte();
            }
        }

        public decodeDirectBits(numBits:number):number
        {
            MEMORY.u32[this.loc1] = 0;//UInt32
            do
            {
                MEMORY.u32[this.rangeI] >>>= 1;
                MEMORY.u32[this.codeI] -= MEMORY.u32[this.rangeI];
                MEMORY.u32[this.loc2] = 0 - (MEMORY.u32[this.codeI] >>> 31);
                MEMORY.u32[this.codeI] += MEMORY.u32[this.rangeI] & MEMORY.u32[this.loc2];

                if (MEMORY.u32[this.codeI] == MEMORY.u32[this.rangeI]){
                    this.corrupted = true;
                }

                this.normalize();
                MEMORY.u32[this.loc1] <<= 1;
                MEMORY.u32[this.loc1] += MEMORY.u32[this.loc2] + 1;
            }
            while (--numBits);
            return MEMORY.u32[this.loc1];
        }

        public decodeBit(prob:Uint16Array,index:number):number
        {
            var v = prob[index];
            //bound
            MEMORY.u32[this.loc1] = (MEMORY.u32[this.rangeI] >>> 11) * v;
            var symbol:number;
            if (MEMORY.u32[this.codeI] < MEMORY.u32[this.loc1])
            {
                v += ((1 << 11) - v) >>> 5;
                MEMORY.u32[this.rangeI] = MEMORY.u32[this.loc1];
                symbol = 0;
            }
            else
            {
                v -= v >>> LZMA.kNumMoveBits;
                MEMORY.u32[this.codeI] -= MEMORY.u32[this.loc1];
                MEMORY.u32[this.rangeI] -= MEMORY.u32[this.loc1];
                symbol = 1;
            }
            prob[index] = v;
            this.normalize();
            return symbol;
        }

    }
}



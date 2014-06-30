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
        private rangeI:number = 0;
        private codeI:number = 1;
        private loc1:number = 2;
        private loc2:number = 3;
        private m:Uint32Array;

        constructor(){
            this.in_pos = 0;
        }
        public isFinishedOK():boolean{
            return this.m[this.codeI] == 0;
        }
        public init():void
        {
            /*this.rangeI = MEMORY.getUint32();
            this.codeI  = MEMORY.getUint32();
            this.loc1   = MEMORY.getUint32();
            this.loc2   = MEMORY.getUint32();*/
            this.m   = new Uint32Array(4);
            this.corrupted = false;
            if (this.inStream.readUnsignedByte() != 0){
                this.corrupted = true;
            }

            this.m[this.rangeI] = 0xFFFFFFFF;
            this.m[this.codeI] = 0;

            for (var i:number = 0; i < 4; i++){
                this.m[this.codeI] = (this.m[this.codeI] << 8) | this.inStream.readUnsignedByte();
            }

            if (this.m[this.codeI] == this.m[this.rangeI]){
                this.corrupted = true;
            }
        }

        public normalize()
        {
            if (this.m[this.rangeI] < RangeDecoder.kTopValue)
            {
                this.m[this.rangeI] <<= 8;
                this.m[this.codeI] = (this.m[this.codeI] << 8) | this.inStream.readUnsignedByte();
            }
        }

        public decodeDirectBits(numBits:number):number
        {
            this.m[this.loc1] = 0;//UInt32
            do
            {
                this.m[this.rangeI] >>>= 1;
                this.m[this.codeI] -= this.m[this.rangeI];
                this.m[this.loc2] = 0 - (this.m[this.codeI] >>> 31);
                this.m[this.codeI] += this.m[this.rangeI] & this.m[this.loc2];

                if (this.m[this.codeI] == this.m[this.rangeI]){
                    this.corrupted = true;
                }

                this.normalize();
                this.m[this.loc1] <<= 1;
                this.m[this.loc1] += this.m[this.loc2] + 1;
            }
            while (--numBits);
            return this.m[this.loc1];
        }

        public decodeBit(prob:Uint16Array,index:number):number
        {
            var v = prob[index];
            //bound
            //this.m[this.loc1] = (this.m[this.rangeI] >>> 11) * v;
            this.m[this.loc1] = (this.m[this.rangeI] >>> 11) * v;
            var symbol:number;
            if (this.m[this.codeI] < this.m[this.loc1])
            {
                v += ((1 << 11) - v) >>> 5;
                this.m[this.rangeI] = this.m[this.loc1];
                symbol = 0;
            }
            else
            {
                v -= v >>> LZMA.kNumMoveBits;
                this.m[this.codeI] -= this.m[this.loc1];
                this.m[this.rangeI] -= this.m[this.loc1];
                symbol = 1;
            }
            prob[index] = v;
            this.normalize();
            return symbol;
        }

    }
}



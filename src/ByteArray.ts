///<reference path="./ByteArrayBase.ts" />
///<reference path="./LZMAHelper.ts" />
/*///<reference path="./ZLIBHelper.ts" />*/
///<reference path="./CompressionAlgorithm.ts" />
/**
* JavaScript ByteArray 
* version : 0.2
* @author Nidin Vinayakan | nidinthb@gmail.com
*
* ActionScript3 ByteArray implementation in JavaScript
* limitation : size of ByteArray cannot be changed
* 
*/
module nid.utils
{

	export class ByteArray extends ByteArrayBase
	{
        static BIG_ENDIAN:string = "bigEndian";
        static LITTLE_ENDIAN:string = "littleEndian";

		constructor(buffer?:ArrayBuffer,offset:number=0,length:number=0){
            
            super(buffer,offset,length);
        }
		public compress(algorithm:string=CompressionAlgorithm.LZMA) : void{
            throw "Compression error! "+algorithm+" not implemented";
            if(algorithm == CompressionAlgorithm.LZMA) {

            }else{
                throw "Compression error! "+algorithm+" not implemented";
            }
        }
		public decompressBuffer(algorithm:string=CompressionAlgorithm.LZMA) : void{
            if(algorithm == CompressionAlgorithm.LZMA) {
                try {
                    this.buffer = LZMAHelper.decodeBuffer(this.buffer);
                } catch (e) {
                    throw "Uncompression error! "+algorithm+" not implemented";
                }
            }else if(algorithm == CompressionAlgorithm.ZLIB){
                /*this.buffer = ZLIBHelper.decodeBuffer(this.buffer);*/
            }else{
                throw "Uncompression error! "+algorithm+" not implemented";
            }
        }
		public decompress(algorithm:string=CompressionAlgorithm.LZMA) : void{
            if(algorithm == CompressionAlgorithm.LZMA) {
                try {
                    this.array = LZMAHelper.decode(this.array);
                } catch (e) {
                    throw "Uncompression error! "+algorithm+" not implemented";
                }
            }else if(algorithm == CompressionAlgorithm.ZLIB){
                /*this.array = ZLIBHelper.decode(this.array);*/
            }else{
                throw "Uncompression error! "+algorithm+" not implemented";
            }
        }
        public compressAsync(algorithm:string,callback) : void{
            throw "Compression error! "+algorithm+" not implemented";
            if(algorithm == CompressionAlgorithm.LZMA) {

            }else{
                throw "Compression error! "+algorithm+" not implemented";
            }
        }
        public decompressAsync(algorithm:string=CompressionAlgorithm.LZMA,callback=null) : void{
            if(algorithm == CompressionAlgorithm.LZMA){
                LZMAHelper.decodeAsync(this.buffer,function(_data){
                    this.buffer = _data;
                })
            }else{
                throw "Uncompression error! "+algorithm+" not implemented";
            }
        }
		public deflate():void{}
        public inflate(): void{}

        /**
         * Reads the number of data bytes, specified by the length parameter, from the byte stream.
         * The bytes are read into the ByteArray object specified by the bytes parameter,
         * and the bytes are written into the destination ByteArrayBase starting at the _position specified by offset.
         * @param	bytes	The ByteArray object to read data into.
         * @param	offset	The offset (_position) in bytes at which the read data should be written.
         * @param	length	The number of bytes to read.  The default value of 0 causes all available data to be read.
         */

        public readBytesAsByteArray(_bytes:ByteArray=null, offset:number= 0, length:number= 0,createNewBuffer:boolean=false): ByteArray{
            if(length == 0){
                length = this.bytesAvailable;
            }
            else if (!this.validate(length)) return null;

            if(createNewBuffer){
                _bytes = _bytes == null?new ByteArray(new ArrayBuffer(length)):_bytes;
                //This method is expensive
                for(var i=0; i < length;i++){
                    _bytes.data.setUint8(i+offset,this.data.getUint8(this.position++));
                }
            }else{
                //Offset argument ignored
                _bytes = _bytes == null?new ByteArray(null):_bytes;
                _bytes.dataView = new DataView(this.data.buffer,this.bufferOffset+this.position,length);
                this.position += length;
            }

            return _bytes;
        }

		/**
		 * Reads an object from the byte array, encoded in AMF
		 * serialized format.
		 * @return	The deserialized object.
         */
		public readObject():any{
			//return this.readAmfObject();
			return null;
        }


        /**
		 * Writes an object into the byte array in AMF
		 * serialized format.
		 * @param	object	The object to serialize.
         */
        public writeObject(value: any): void {

        }
	}
}

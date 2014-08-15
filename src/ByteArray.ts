///<reference path="./ByteArrayBase.ts" />
///<reference path="./LZMAHelper.ts" />
///<reference path="CompressionAlgorithm.ts" />
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
            if(algorithm == CompressionAlgorithm.LZMA) {

            }else{
                throw "Compression error! "+algorithm+" not implemented";
            }
        }
		/*public uncompress(algorithm:string=CompressionAlgorithm.LZMA) : void{
            if(algorithm == CompressionAlgorithm.LZMA) {
                try {
                    this.buffer = LZMAHelper.decode(this.buffer);
                } catch (e) {
                    throw "Uncompression error! "+algorithm+" not implemented";
                }
            }else{
                throw "Uncompression error! "+algorithm+" not implemented";
            }
        }*/
        public compressAsync(algorithm:string,callback) : void{
            if(algorithm == CompressionAlgorithm.LZMA) {

            }else{
                throw "Compression error! "+algorithm+" not implemented";
            }
        }
        public uncompressAsync(algorithm:string=CompressionAlgorithm.LZMA,callback=null) : void{
            if(algorithm == CompressionAlgorithm.LZMA){
                LZMAHelper.decodeAsync(this.buffer,function(_data){
                    this.buffer = _data;
                })
            }else{
                throw "Uncompression error! "+algorithm+" not implemented";
            }
        }
		public deflate():void{}
        public inflate(): void{ }


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

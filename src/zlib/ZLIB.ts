///<reference path="ZLIB.lib.d.ts" />
module nid.utils {
    "use strict"
    /**
     * ZLIB Decoder
     * @author Nidin Vinayakan | nidinthb@gmail.com
     *
     */

    export class ZLIB{

        constructor(){

        }
        public encode():any{

        }
        public decode(compressed):any{
            var decompressed = new Inflate(compressed).decompress();
        }

    }

}
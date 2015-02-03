///<reference path="zlib/ZLIB.ts" />
module nid.utils{

    export class ZLIBHelper{
        static decoder:ZLIB = new ZLIB();
        static decoderAsync:Worker = new Worker('ZLIBWorker.min.js');
        static callback:Function;
        static ENCODE:number = 1;
        static DECODE:number = 2;

        static init():void{
            var command = 0;
            ZLIBHelper.decoderAsync.onmessage = function(e){
                if(command == 0){
                    command = e.data;
                }else if(command == ZLIBHelper.ENCODE){
                    command = 0;//encode not implemented
                }else if(command == ZLIBHelper.DECODE){
                    command = 0;
                    ZLIBHelper.callback(e.data);
                    ZLIBHelper.callback = null;
                }
            }
        }

        /**
         * TODO : Implement encoder
         * @param data
         * @returns {null}
         */
        static encodeBuffer(data:ArrayBuffer):ArrayBuffer{
            throw "ZLIB encoder not implemented!";
            return null;
        }
        static encode(data:Uint8Array):Uint8Array{
            throw "ZLIB encoder not implemented!";
            return null;
        }
        static decodeBuffer(data:ArrayBuffer):ArrayBuffer{
            return ZLIBHelper.decoder.decode(new Uint8Array(data)).buffer;
        }
        static decode(data:Uint8Array):Uint8Array{
            return ZLIBHelper.decoder.decode(data);
        }

        /**
         * TODO : Implement encoder
         * @param data
         * @param _callback
         */
        static encodeBufferAsync(data:ArrayBuffer,_callback:Function):void{

        }
        static decodeBufferAsync(data:ArrayBuffer,_callback:Function):void{
            if(ZLIBHelper.callback == null){
                ZLIBHelper.callback = _callback;
                ZLIBHelper.decoderAsync.postMessage(ZLIBHelper.DECODE);
                ZLIBHelper.decoderAsync.postMessage(data,[data]);
            }else{
                console.log('Warning! Another ZLIB decoding is running...');
            }
        }
    }
}
nid.utils.ZLIBHelper.init();
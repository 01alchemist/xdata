import {ZLIB} from "../zlib/ZLIB";
/**
 * @author Nidin Vinayakan | nidinthb@gmail.com
 */
export class ZLIBHelper {
    static decoder:ZLIB = new ZLIB();
    static decoderAsync:Worker = new Worker('ZLIBWorker.min.js');
    static callback:Function;
    static ENCODE:number = 1;
    static DECODE:number = 2;

    static init():void {
        ZLIBHelper.decoderAsync.onmessage = function (e) {

            var receivedData:any = e.data;

            if (receivedData.command === ZLIBHelper.ENCODE) {
                //encode not implemented
            } else if (receivedData.command === ZLIBHelper.DECODE) {
                ZLIBHelper.callback(receivedData.result);
                ZLIBHelper.callback = null;
            }
        }
    }

    /**
     * TODO : Implement encoder
     * @param data
     * @returns {null}
     */
    static encodeBuffer(data:ArrayBuffer):ArrayBuffer {
        throw "ZLIB encoder not implemented!";
    }

    static encode(data:Uint8Array):Uint8Array {
        throw "ZLIB encoder not implemented!";
    }

    static decodeBuffer(data:ArrayBuffer):ArrayBuffer {
        return ZLIBHelper.decoder.decode(new Uint8Array(data)).buffer;
    }

    static decode(data:Uint8Array):Uint8Array {
        return ZLIBHelper.decoder.decode(data);
    }

    /**
     * TODO : Implement encoder
     * @param data
     * @param _callback
     */
    static encodeBufferAsync(data:ArrayBuffer, _callback:Function):void {

    }

    static decodeBufferAsync(data:ArrayBuffer, _callback:Function):void {
        if (ZLIBHelper.callback == null) {
            ZLIBHelper.callback = _callback;
            ZLIBHelper.decoderAsync.postMessage({command: ZLIBHelper.DECODE, data: data}, [data]);
        } else {
            console.log('Warning! Another ZLIB decoding is running...');
        }
    }
}
ZLIBHelper.init();
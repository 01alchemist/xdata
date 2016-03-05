import {LZMA} from "../lzma/LZMA";
/**
 * @author Nidin Vinayakan | nidinthb@gmail.com
 */
export class LZMAHelper {
    static decoder:LZMA = new LZMA();
    static decoderAsync:Worker;
    static enableAsync:boolean = false;
    static callback:Function;
    static ENCODE:number = 1;
    static DECODE:number = 2;

    static init():void {
        var command = 0;
        if (LZMAHelper.enableAsync) {
            LZMAHelper.decoderAsync = new Worker('LZMAWorker.min.js');
            LZMAHelper.decoderAsync.onmessage = function (e) {

                var receivedData:any = e.data;

                if (receivedData.command === LZMAHelper.ENCODE) {
                    //encode not implemented
                } else if (receivedData.command === LZMAHelper.DECODE) {
                    LZMAHelper.callback(receivedData.result);
                    LZMAHelper.callback = null;
                }
            }
        }
    }

    /**
     * TODO : Implement encoder
     * @param data
     * @returns {null}
     */
    static encode(data:ArrayBuffer):ArrayBuffer {
        return null;
    }

    static decodeBuffer(data:ArrayBuffer):ArrayBuffer {
        return LZMAHelper.decoder.decode(new Uint8Array(data)).buffer;
    }

    static decode(data:Uint8Array):Uint8Array {
        return LZMAHelper.decoder.decode(data);
    }

    /**
     * TODO : Implement encoder
     * @param data
     * @param _callback
     */
    static encodeAsync(data:ArrayBuffer, _callback:Function):void {
        if (LZMAHelper.enableAsync) {

        } else {
            console.log('Error! Asynchronous encoding is disabled');
        }
    }

    static decodeAsync(data:ArrayBuffer, _callback:Function):void {
        if (LZMAHelper.enableAsync) {
            if (LZMAHelper.callback == null) {
                LZMAHelper.callback = _callback;
                LZMAHelper.decoderAsync.postMessage({command: LZMAHelper.DECODE, data: data}, [data]);
            } else {
                console.log('Warning! Another LZMA decoding is running...');
            }
        } else {
            console.log('Error! Asynchronous decoding is disabled');
        }
    }
}
LZMAHelper.init();
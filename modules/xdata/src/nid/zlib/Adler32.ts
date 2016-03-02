/**
 * ZLIB Decoder
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 */

export class Adler32 {

    static OptimizationParameter:number = 1024;
    static encoder:any;

    static calc(array) {
        if (typeof(array) === 'string') {
            array = Adler32.encodeString(array);
        }
        return Adler32.update(1, array);
    }

    static update(adler, array) {
        var s1:number = adler & 0xffff;
        var s2:number = (adler >>> 16) & 0xffff;
        var len:number = array.length;
        var tlen:number;//loop length
        var i:number = 0;//array index

        while (len > 0) {
            tlen = len > Adler32.OptimizationParameter ?
                Adler32.OptimizationParameter : len;
            len -= tlen;
            do {
                s1 += array[i++];
                s2 += s1;
            } while (--tlen);

            s1 %= 65521;
            s2 %= 65521;
        }

        return ((s2 << 16) | s1) >>> 0;
    }

    static encodeString(str:string) {
        if(!Adler32.encoder){
            if(window["TextEncoder"]){
                Adler32.encoder = new window["TextEncoder"]();
            }else{
                //fallback
                Adler32.encoder = {
                    encode: function (str:string):Uint8Array {
                        var tmp = str.split('');
                        var data:Uint8Array = new Uint8Array(tmp.length);
                        var i:number;
                        var il:number;

                        for (i = 0, il = tmp.length; i < il; i++) {
                            data[i] = (tmp[i].charCodeAt(0) & 0xff) >>> 0;
                        }
                        return data;
                    }
                }
            }
        }
        return Adler32.encoder.encode(str);
    }
}
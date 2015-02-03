///<reference path="ZLIB.lib.d.ts" />
module nid.utils {
    "use strict"
    /**
     * ZLIB Decoder
     * @author Nidin Vinayakan | nidinthb@gmail.com
     *
     */
    import stringToByteArray = nid.utils.stringToByteArray;

    export class Adler32{

        static OptimizationParameter:number = 1024;

        static calc(array){
            if (typeof(array) === 'string') {
                array = stringToByteArray(array);
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
    }
}
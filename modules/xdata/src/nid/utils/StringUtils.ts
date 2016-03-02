/**
 * String Utilities
 * @author Nidin Vinayakan | nidinthb@gmail.com
 */
export class StringUtils {

    static encoder:any;

    static encodeString(str):Uint8Array {
        if (!StringUtils.encoder) {
            if (window["TextEncoder"]) {
                StringUtils.encoder = new window["TextEncoder"]();
            } else {
                //fallback
                StringUtils.encoder = {
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
        return StringUtils.encoder.encode(str);
    }
}
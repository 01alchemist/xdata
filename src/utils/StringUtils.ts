module nid.utils {
    "use strict"
    /**
     * String Utilities
     * @author Nidin Vinayakan | nidinthb@gmail.com
     *
     */
    export function stringToByteArray(str) {
        var tmp = str.split('');
        var i:number;
        var il:number;

        for (i = 0, il = tmp.length; i < il; i++) {
            tmp[i] = (tmp[i].charCodeAt(0) & 0xff) >>> 0;
        }

        return tmp;
    }
}
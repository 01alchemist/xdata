"use strict";
/**
 * CompressionMethod
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 */

export class CompressionMethod {

    static ZLIB = {
        DEFLATE: 8,
        RESERVED: 15
    };
    static ZIP = {
        STORE: 0,
        DEFLATE: 8
    };
}
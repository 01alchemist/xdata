import {LZMA} from "./LZMA";
"use strict";
export class LZMAWorker {
    static ENCODE:number = 1;
    static DECODE:number = 2;
    private decoder:LZMA;
    private command:number = 0;

    constructor() {
        var _this = this;
        this.decoder = new LZMA();

        addEventListener('message', (e:any) => {
            if (_this.command == 0) {
                _this.command = e.data;
            } else if (_this.command == 1) {
                _this.command = 0;
            } else if (_this.command == 2) {
                _this.decode(e.data);
            }
        }, false);
    }

    private decode(data):void {
        var result = this.decoder.decode(new Uint8Array(data));
        (<any> postMessage)(LZMAWorker.DECODE);
        (<any> postMessage)(result.buffer, [result.buffer]);
    }
}
var zlma_w = new LZMAWorker();
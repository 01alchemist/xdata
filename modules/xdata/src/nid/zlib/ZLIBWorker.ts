import {ZLIB} from "./ZLIB";

export class ZLIBWorker {
    static ENCODE:number = 1;
    static DECODE:number = 2;
    private decoder:ZLIB;
    private command:number = 0;

    constructor() {
        var _this = this;
        this.decoder = new ZLIB();

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
        (<any> postMessage)(ZLIBWorker.DECODE);
        (<any> postMessage)(result.buffer, [result.buffer]);
    }
}
var zlib_w = new ZLIBWorker();
import {ZLIB} from "./ZLIB";

export class ZLIBWorker {
    static ENCODE:number = 1;
    static DECODE:number = 2;
    private decoder:ZLIB;
    private payload:any;

    constructor() {
        var _this = this;
        this.decoder = new ZLIB();

        addEventListener('message', (e:any) => {
            _this.payload = e.data;

            if (_this.payload.command === ZLIBWorker.DECODE) {
                _this.decode(_this.payload.data);
            } else if (_this.payload.command === ZLIBWorker.ENCODE) {
                //not yet implemented
            }
        }, false);
    }

    private decode(data):void {
        var result = this.decoder.decode(new Uint8Array(data));
        (<any> postMessage)({command:ZLIBWorker.DECODE, result:result.buffer}, [result.buffer]);
    }
}
var zlib_w = new ZLIBWorker();
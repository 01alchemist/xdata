import {LZMA} from "./LZMA";

export class LZMAWorker {
    static ENCODE:number = 1;
    static DECODE:number = 2;
    private decoder:LZMA;
    private payload:any;

    constructor() {
        var _this = this;
        this.decoder = new LZMA();

        addEventListener('message', (e:any) => {

            _this.payload = e.data;

            if (_this.payload.command === LZMAWorker.DECODE) {
                _this.decode(_this.payload.data);
            } else if (_this.payload.command === LZMAWorker.ENCODE) {
                //not yet implemented
            }

        }, false);
    }

    private decode(data):void {
        var result = this.decoder.decode(new Uint8Array(data));
        (<any> postMessage)({command: LZMAWorker.DECODE, result: result.buffer}, [result.buffer]);
    }
}
var zlma_w = new LZMAWorker();
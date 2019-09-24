import {LZMA} from "../xdata/src/nid/lzma/LZMA";
import {ByteArray} from "../xdata/src/nid/utils/ByteArray";
/**
 * Created by Nidin Vinayakan on 04-03-2016.
 */

export class LzmaTest {

    file;
    file2;
    reader:FileReader;
    reader2:FileReader;
    decoder:Worker;
    decoder2 = new LZMA();
    ENCODE = 1;
    DECODE = 2;
    command = 0;
    command2 = 0;

    constructor() {
        window.onload = this.init.bind(this);
    }

    init() {
        let self = this;
        this.decoder = new Worker('../modules/xdata/workers/lzma-worker-bootstrap.js');
        this.reader = new FileReader();
        this.reader2 = new FileReader();
        this.reader.onload = (e) => {
            //let decoder = new nid.lzma.LZMA();
            //let inData = new nid.utils.ByteArray(e.target.result);
            let inData = new Uint8Array(e.target["result"]);
            console.log(inData.length);
            console.time("decode");
            this.decode(inData, function (result) {
                let outData = new ByteArray(result);
                console.timeEnd("decode");
                console.log(outData.length);
                //console.log(outData.readUTFBytes(327));
            });

            //outData.position = 0;
            //console.log(outData.readUTFBytes(327));
        };
        this.reader2.onload = (e) => {
            let inData = new Uint8Array(e.target["result"]);
            console.log(inData.length);
            console.time("decode");
            let result = this.decoder2.decode(inData);
            let outData = new ByteArray(result.buffer);
            console.timeEnd("decode");
            console.log(outData.length);
        };

        let fileInput:HTMLInputElement = <HTMLInputElement>document.getElementById("fileBrowser");
        let fileInput2:HTMLInputElement = <HTMLInputElement>document.getElementById("fileBrowser2");
        fileInput.onchange = function (e) {
            self.file = this.files[0];
            self.reader.readAsArrayBuffer(self.file);
        };
        fileInput2.onchange = function (e) {
            self.file2 = this.files[0];
            self.reader2.readAsArrayBuffer(self.file2);
        }

    }

    decode(data, callback) {

        let self = this;

        this.decoder.onmessage = function (e) {
            if (e.data.command === self.ENCODE) {
                //encode not implemented
            } else if (e.data.command === self.DECODE) {
                callback(e.data.result);
            }
        };

        this.decoder.postMessage({command: this.DECODE, data: data.buffer}, [data.buffer]);
        //decoder.postMessage(data.buffer);
    }
}
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
        var self = this;
        this.decoder = new Worker('../modules/xdata/workers/lzma-worker-bootstrap.js');
        this.reader = new FileReader();
        this.reader2 = new FileReader();
        this.reader.onload = (e) => {
            //var decoder = new nid.lzma.LZMA();
            //var inData = new nid.utils.ByteArray(e.target.result);
            var inData = new Uint8Array(e.target["result"]);
            console.log(inData.length);
            console.time("decode");
            this.decode(inData, function (result) {
                var outData = new ByteArray(result);
                console.timeEnd("decode");
                console.log(outData.length);
                //console.log(outData.readUTFBytes(327));
            });

            //outData.position = 0;
            //console.log(outData.readUTFBytes(327));
        };
        this.reader2.onload = (e) => {
            var inData = new Uint8Array(e.target["result"]);
            console.log(inData.length);
            console.time("decode");
            var result = this.decoder2.decode(inData);
            var outData = new ByteArray(result.buffer);
            console.timeEnd("decode");
            console.log(outData.length);
        };

        var fileInput = document.getElementById("fileBrowser");
        var fileInput2 = document.getElementById("fileBrowser2");
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

        var self = this;

        this.decoder.onmessage = function (e) {
            if (e.data.command == self.ENCODE) {
                //encode not implemented
            } else if (e.data.command == self.DECODE) {
                callback(e.data.result);
            }
        };

        this.decoder.postMessage({command: this.DECODE, data: data.buffer}, [data.buffer]);
        //decoder.postMessage(data.buffer);
    }
}
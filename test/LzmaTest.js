System.register(["../xdata/src/nid/lzma/LZMA", "../xdata/src/nid/utils/ByteArray"], function(exports_1, context_1) {
    "use strict";
    let __moduleName = context_1 && context_1.id;
    let LZMA_1, ByteArray_1;
    let LzmaTest;
    return {
        setters:[
            function (LZMA_1_1) {
                LZMA_1 = LZMA_1_1;
            },
            function (ByteArray_1_1) {
                ByteArray_1 = ByteArray_1_1;
            }],
        execute: function() {
            LzmaTest = (function () {
                function LzmaTest() {
                    this.decoder2 = new LZMA_1.LZMA();
                    this.ENCODE = 1;
                    this.DECODE = 2;
                    this.command = 0;
                    this.command2 = 0;
                    window.onload = this.init.bind(this);
                }
                LzmaTest.prototype.init = function () {
                    let _this = this;
                    let self = this;
                    this.decoder = new Worker('../modules/xdata/workers/lzma-worker-bootstrap.js');
                    this.reader = new FileReader();
                    this.reader2 = new FileReader();
                    this.reader.onload = function (e) {
                        let inData = new Uint8Array(e.target["result"]);
                        console.log(inData.length);
                        console.time("decode");
                        _this.decode(inData, function (result) {
                            let outData = new ByteArray_1.ByteArray(result);
                            console.timeEnd("decode");
                            console.log(outData.length);
                        });
                    };
                    this.reader2.onload = function (e) {
                        let inData = new Uint8Array(e.target["result"]);
                        console.log(inData.length);
                        console.time("decode");
                        let result = _this.decoder2.decode(inData);
                        let outData = new ByteArray_1.ByteArray(result.buffer);
                        console.timeEnd("decode");
                        console.log(outData.length);
                    };
                    let fileInput = document.getElementById("fileBrowser");
                    let fileInput2 = document.getElementById("fileBrowser2");
                    fileInput.onchange = function (e) {
                        self.file = this.files[0];
                        self.reader.readAsArrayBuffer(self.file);
                    };
                    fileInput2.onchange = function (e) {
                        self.file2 = this.files[0];
                        self.reader2.readAsArrayBuffer(self.file2);
                    };
                };
                LzmaTest.prototype.decode = function (data, callback) {
                    let self = this;
                    this.decoder.onmessage = function (e) {
                        if (e.data.command === self.ENCODE) {
                        }
                        else if (e.data.command === self.DECODE) {
                            callback(e.data.result);
                        }
                    };
                    this.decoder.postMessage({ command: this.DECODE, data: data.buffer }, [data.buffer]);
                };
                return LzmaTest;
            }());
            exports_1("LzmaTest", LzmaTest);
        }
    }
});
//# sourceMappingURL=LzmaTest.js.map
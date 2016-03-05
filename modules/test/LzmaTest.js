System.register(["../modules/xdata/src/nid/utils/ByteArray", "../modules/xdata/src/nid/lzma/LZMA"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var ByteArray_1, LZMA_1;
    var LzmaTest;
    return {
        setters:[
            function (ByteArray_1_1) {
                ByteArray_1 = ByteArray_1_1;
            },
            function (LZMA_1_1) {
                LZMA_1 = LZMA_1_1;
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
                    var _this = this;
                    var self = this;
                    this.decoder = new Worker('../modules/xdata/workers/lzma-worker-bootstrap.js');
                    this.reader = new FileReader();
                    this.reader2 = new FileReader();
                    this.reader.onload = function (e) {
                        var inData = new Uint8Array(e.target["result"]);
                        console.log(inData.length);
                        console.time("decode");
                        _this.decode(inData, function (result) {
                            var outData = new ByteArray_1.ByteArray(result);
                            console.timeEnd("decode");
                            console.log(outData.length);
                        });
                    };
                    this.reader2.onload = function (e) {
                        var inData = new Uint8Array(e.target["result"]);
                        console.log(inData.length);
                        console.time("decode");
                        var result = _this.decoder2.decode(inData);
                        var outData = new ByteArray_1.ByteArray(result.buffer);
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
                    };
                };
                LzmaTest.prototype.decode = function (data, callback) {
                    var self = this;
                    this.decoder.onmessage = function (e) {
                        if (e.data.command == self.ENCODE) {
                        }
                        else if (e.data.command == self.DECODE) {
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
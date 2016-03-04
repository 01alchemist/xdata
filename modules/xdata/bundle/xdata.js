var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define("src/nid/zlib/Huffman", ["require", "exports"], function (require, exports) {
    "use strict";
    var Huffman = (function () {
        function Huffman() {
        }
        Huffman.buildHuffmanTable = function (lengths) {
            var listSize = lengths.length;
            var maxCodeLength = 0;
            var minCodeLength = Number.POSITIVE_INFINITY;
            var size;
            var table;
            var bitLength;
            var code;
            var skip;
            var reversed;
            var rtemp;
            var i;
            var il;
            var j;
            var value;
            for (i = 0, il = listSize; i < il; ++i) {
                if (lengths[i] > maxCodeLength) {
                    maxCodeLength = lengths[i];
                }
                if (lengths[i] < minCodeLength) {
                    minCodeLength = lengths[i];
                }
            }
            size = 1 << maxCodeLength;
            table = new Uint32Array(size);
            for (bitLength = 1, code = 0, skip = 2; bitLength <= maxCodeLength;) {
                for (i = 0; i < listSize; ++i) {
                    if (lengths[i] === bitLength) {
                        for (reversed = 0, rtemp = code, j = 0; j < bitLength; ++j) {
                            reversed = (reversed << 1) | (rtemp & 1);
                            rtemp >>= 1;
                        }
                        value = (bitLength << 16) | i;
                        for (j = reversed; j < size; j += skip) {
                            table[j] = value;
                        }
                        ++code;
                    }
                }
                ++bitLength;
                code <<= 1;
                skip <<= 1;
            }
            return [table, maxCodeLength, minCodeLength];
        };
        return Huffman;
    }());
    exports.Huffman = Huffman;
});
define("src/nid/zlib/RawInflate", ["require", "exports", "src/nid/zlib/Huffman"], function (require, exports, Huffman_1) {
    "use strict";
    var RawInflate = (function () {
        function RawInflate(input, opt_params) {
            this.ZLIB_RAW_INFLATE_BUFFER_SIZE = 0x8000;
            if (!RawInflate.FixedLiteralLengthTable) {
                var lengths = new Uint8Array(288);
                var i, il;
                for (i = 0, il = lengths.length; i < il; ++i) {
                    lengths[i] =
                        (i <= 143) ? 8 :
                            (i <= 255) ? 9 :
                                (i <= 279) ? 7 :
                                    8;
                }
                RawInflate.FixedLiteralLengthTable = Huffman_1.Huffman.buildHuffmanTable(lengths);
            }
            if (!RawInflate.FixedDistanceTable) {
                var lengths = new Uint8Array(30);
                var i, il;
                for (i = 0, il = lengths.length; i < il; ++i) {
                    lengths[i] = 5;
                }
                RawInflate.FixedDistanceTable = Huffman_1.Huffman.buildHuffmanTable(lengths);
            }
            this.blocks = [];
            this.bufferSize = this.ZLIB_RAW_INFLATE_BUFFER_SIZE;
            this.totalpos = 0;
            this.ip = 0;
            this.bitsbuf = 0;
            this.bitsbuflen = 0;
            this.input = input;
            this.output;
            this.bfinal = false;
            this.bufferType = RawInflate.BufferType.ADAPTIVE;
            this.resize = false;
            if (opt_params || !(opt_params = {})) {
                if (opt_params['index']) {
                    this.ip = opt_params['index'];
                }
                if (opt_params['bufferSize']) {
                    this.bufferSize = opt_params['bufferSize'];
                }
                if (opt_params['bufferType']) {
                    this.bufferType = opt_params['bufferType'];
                }
                if (opt_params['resize']) {
                    this.resize = opt_params['resize'];
                }
            }
            switch (this.bufferType) {
                case RawInflate.BufferType.BLOCK:
                    this.op = RawInflate.MaxBackwardLength;
                    this.output =
                        new Uint8Array(RawInflate.MaxBackwardLength +
                            this.bufferSize +
                            RawInflate.MaxCopyLength);
                    break;
                case RawInflate.BufferType.ADAPTIVE:
                    this.op = 0;
                    this.output = new Uint8Array(this.bufferSize);
                    this.expandBuffer = this.expandBufferAdaptive;
                    this.concatBuffer = this.concatBufferDynamic;
                    this.decodeHuffman = this.decodeHuffmanAdaptive;
                    break;
                default:
                    throw new Error('invalid inflate mode');
            }
        }
        RawInflate.prototype.decompress = function () {
            while (!this.bfinal) {
                this.parseBlock();
            }
            return this.concatBuffer();
        };
        RawInflate.prototype.parseBlock = function () {
            var hdr = this.readBits(3);
            if (hdr & 0x1) {
                this.bfinal = true;
            }
            hdr >>>= 1;
            switch (hdr) {
                case 0:
                    this.parseUncompressedBlock();
                    break;
                case 1:
                    this.parseFixedHuffmanBlock();
                    break;
                case 2:
                    this.parseDynamicHuffmanBlock();
                    break;
                default:
                    throw new Error('unknown BTYPE: ' + hdr);
            }
        };
        RawInflate.prototype.readBits = function (length) {
            var bitsbuf = this.bitsbuf;
            var bitsbuflen = this.bitsbuflen;
            var input = this.input;
            var ip = this.ip;
            var inputLength = input.length;
            var octet;
            while (bitsbuflen < length) {
                if (ip >= inputLength) {
                    throw new Error('input buffer is broken');
                }
                bitsbuf |= input[ip++] << bitsbuflen;
                bitsbuflen += 8;
            }
            octet = bitsbuf & ((1 << length) - 1);
            bitsbuf >>>= length;
            bitsbuflen -= length;
            this.bitsbuf = bitsbuf;
            this.bitsbuflen = bitsbuflen;
            this.ip = ip;
            return octet;
        };
        RawInflate.prototype.readCodeByTable = function (table) {
            var bitsbuf = this.bitsbuf;
            var bitsbuflen = this.bitsbuflen;
            var input = this.input;
            var ip = this.ip;
            var inputLength = input.length;
            var codeTable = table[0];
            var maxCodeLength = table[1];
            var codeWithLength;
            var codeLength;
            while (bitsbuflen < maxCodeLength) {
                if (ip >= inputLength) {
                    break;
                }
                bitsbuf |= input[ip++] << bitsbuflen;
                bitsbuflen += 8;
            }
            codeWithLength = codeTable[bitsbuf & ((1 << maxCodeLength) - 1)];
            codeLength = codeWithLength >>> 16;
            this.bitsbuf = bitsbuf >> codeLength;
            this.bitsbuflen = bitsbuflen - codeLength;
            this.ip = ip;
            return codeWithLength & 0xffff;
        };
        RawInflate.prototype.parseUncompressedBlock = function () {
            var input = this.input;
            var ip = this.ip;
            var output = this.output;
            var op = this.op;
            var inputLength = input.length;
            var len;
            var nlen;
            var olength = output.length;
            var preCopy;
            this.bitsbuf = 0;
            this.bitsbuflen = 0;
            if (ip + 1 >= inputLength) {
                throw new Error('invalid uncompressed block header: LEN');
            }
            len = input[ip++] | (input[ip++] << 8);
            if (ip + 1 >= inputLength) {
                throw new Error('invalid uncompressed block header: NLEN');
            }
            nlen = input[ip++] | (input[ip++] << 8);
            if (len === ~nlen) {
                throw new Error('invalid uncompressed block header: length verify');
            }
            if (ip + len > input.length) {
                throw new Error('input buffer is broken');
            }
            switch (this.bufferType) {
                case RawInflate.BufferType.BLOCK:
                    while (op + len > output.length) {
                        preCopy = olength - op;
                        len -= preCopy;
                        output.set(input.subarray(ip, ip + preCopy), op);
                        op += preCopy;
                        ip += preCopy;
                        this.op = op;
                        output = this.expandBuffer();
                        op = this.op;
                    }
                    break;
                case RawInflate.BufferType.ADAPTIVE:
                    while (op + len > output.length) {
                        output = this.expandBuffer({ fixRatio: 2 });
                    }
                    break;
                default:
                    throw new Error('invalid inflate mode');
            }
            output.set(input.subarray(ip, ip + len), op);
            op += len;
            ip += len;
            this.ip = ip;
            this.op = op;
            this.output = output;
        };
        RawInflate.prototype.parseFixedHuffmanBlock = function () {
            this.decodeHuffman(RawInflate.FixedLiteralLengthTable, RawInflate.FixedDistanceTable);
        };
        RawInflate.prototype.parseDynamicHuffmanBlock = function () {
            var hlit = this.readBits(5) + 257;
            var hdist = this.readBits(5) + 1;
            var hclen = this.readBits(4) + 4;
            var codeLengths = new Uint8Array(RawInflate.Order.length);
            var codeLengthsTable;
            var litlenLengths;
            var distLengths;
            var i;
            for (i = 0; i < hclen; ++i) {
                codeLengths[RawInflate.Order[i]] = this.readBits(3);
            }
            codeLengthsTable = Huffman_1.Huffman.buildHuffmanTable(codeLengths);
            litlenLengths = new Uint8Array(hlit);
            distLengths = new Uint8Array(hdist);
            this.prev = 0;
            this.decodeHuffman(Huffman_1.Huffman.buildHuffmanTable(this.decode.call(this, hlit, codeLengthsTable, litlenLengths)), Huffman_1.Huffman.buildHuffmanTable(this.decode.call(this, hdist, codeLengthsTable, distLengths)));
        };
        RawInflate.prototype.decode = function (num, table, lengths) {
            var code;
            var prev = this.prev;
            var repeat;
            var i;
            for (i = 0; i < num;) {
                code = this.readCodeByTable(table);
                switch (code) {
                    case 16:
                        repeat = 3 + this.readBits(2);
                        while (repeat--) {
                            lengths[i++] = prev;
                        }
                        break;
                    case 17:
                        repeat = 3 + this.readBits(3);
                        while (repeat--) {
                            lengths[i++] = 0;
                        }
                        prev = 0;
                        break;
                    case 18:
                        repeat = 11 + this.readBits(7);
                        while (repeat--) {
                            lengths[i++] = 0;
                        }
                        prev = 0;
                        break;
                    default:
                        lengths[i++] = code;
                        prev = code;
                        break;
                }
            }
            this.prev = prev;
            return lengths;
        };
        RawInflate.prototype.decodeHuffman = function (litlen, dist) {
            var output = this.output;
            var op = this.op;
            this.currentLitlenTable = litlen;
            var olength = output.length - RawInflate.MaxCopyLength;
            var code;
            var ti;
            var codeDist;
            var codeLength;
            while ((code = this.readCodeByTable(litlen)) !== 256) {
                if (code < 256) {
                    if (op >= olength) {
                        this.op = op;
                        output = this.expandBuffer();
                        op = this.op;
                    }
                    output[op++] = code;
                    continue;
                }
                ti = code - 257;
                codeLength = RawInflate.LengthCodeTable[ti];
                if (RawInflate.LengthExtraTable[ti] > 0) {
                    codeLength += this.readBits(RawInflate.LengthExtraTable[ti]);
                }
                code = this.readCodeByTable(dist);
                codeDist = RawInflate.DistCodeTable[code];
                if (RawInflate.DistExtraTable[code] > 0) {
                    codeDist += this.readBits(RawInflate.DistExtraTable[code]);
                }
                if (op >= olength) {
                    this.op = op;
                    output = this.expandBuffer();
                    op = this.op;
                }
                while (codeLength--) {
                    output[op] = output[(op++) - codeDist];
                }
            }
            while (this.bitsbuflen >= 8) {
                this.bitsbuflen -= 8;
                this.ip--;
            }
            this.op = op;
        };
        RawInflate.prototype.decodeHuffmanAdaptive = function (litlen, dist) {
            var output = this.output;
            var op = this.op;
            this.currentLitlenTable = litlen;
            var olength = output.length;
            var code;
            var ti;
            var codeDist;
            var codeLength;
            while ((code = this.readCodeByTable(litlen)) !== 256) {
                if (code < 256) {
                    if (op >= olength) {
                        output = this.expandBuffer();
                        olength = output.length;
                    }
                    output[op++] = code;
                    continue;
                }
                ti = code - 257;
                codeLength = RawInflate.LengthCodeTable[ti];
                if (RawInflate.LengthExtraTable[ti] > 0) {
                    codeLength += this.readBits(RawInflate.LengthExtraTable[ti]);
                }
                code = this.readCodeByTable(dist);
                codeDist = RawInflate.DistCodeTable[code];
                if (RawInflate.DistExtraTable[code] > 0) {
                    codeDist += this.readBits(RawInflate.DistExtraTable[code]);
                }
                if (op + codeLength > olength) {
                    output = this.expandBuffer();
                    olength = output.length;
                }
                while (codeLength--) {
                    output[op] = output[(op++) - codeDist];
                }
            }
            while (this.bitsbuflen >= 8) {
                this.bitsbuflen -= 8;
                this.ip--;
            }
            this.op = op;
        };
        RawInflate.prototype.expandBuffer = function (opt_param) {
            if (opt_param === void 0) { opt_param = null; }
            var buffer = new Uint8Array(this.op - RawInflate.MaxBackwardLength);
            var backward = this.op - RawInflate.MaxBackwardLength;
            var i;
            var il;
            var output = this.output;
            buffer.set(output.subarray(RawInflate.MaxBackwardLength, buffer.length));
            this.blocks.push(buffer);
            this.totalpos += buffer.length;
            output.set(output.subarray(backward, backward + RawInflate.MaxBackwardLength));
            this.op = RawInflate.MaxBackwardLength;
            return output;
        };
        RawInflate.prototype.expandBufferAdaptive = function (opt_param) {
            var buffer;
            var ratio = (this.input.length / this.ip + 1) | 0;
            var maxHuffCode;
            var newSize;
            var maxInflateSize;
            var input = this.input;
            var output = this.output;
            if (opt_param) {
                if (typeof opt_param.fixRatio === 'number') {
                    ratio = opt_param.fixRatio;
                }
                if (typeof opt_param.addRatio === 'number') {
                    ratio += opt_param.addRatio;
                }
            }
            if (ratio < 2) {
                maxHuffCode =
                    (input.length - this.ip) / this.currentLitlenTable[2];
                maxInflateSize = (maxHuffCode / 2 * 258) | 0;
                newSize = maxInflateSize < output.length ?
                    output.length + maxInflateSize :
                    output.length << 1;
            }
            else {
                newSize = output.length * ratio;
            }
            buffer = new Uint8Array(newSize);
            buffer.set(output);
            this.output = buffer;
            return this.output;
        };
        RawInflate.prototype.concatBuffer = function () {
            var pos = 0;
            var limit = this.totalpos + (this.op - RawInflate.MaxBackwardLength);
            var output = this.output;
            var blocks = this.blocks;
            var block;
            var buffer = new Uint8Array(limit);
            var i;
            var il;
            var j;
            var jl;
            if (blocks.length === 0) {
                return this.output.subarray(RawInflate.MaxBackwardLength, this.op);
            }
            for (i = 0, il = blocks.length; i < il; ++i) {
                block = blocks[i];
                for (j = 0, jl = block.length; j < jl; ++j) {
                    buffer[pos++] = block[j];
                }
            }
            for (i = RawInflate.MaxBackwardLength, il = this.op; i < il; ++i) {
                buffer[pos++] = output[i];
            }
            this.blocks = [];
            this.buffer = buffer;
            return this.buffer;
        };
        RawInflate.prototype.concatBufferDynamic = function () {
            var buffer;
            var op = this.op;
            if (this.resize) {
                buffer = new Uint8Array(op);
                buffer.set(this.output.subarray(0, op));
            }
            else {
                buffer = this.output.subarray(0, op);
            }
            this.buffer = buffer;
            return this.buffer;
        };
        RawInflate.BufferType = {
            BLOCK: 0,
            ADAPTIVE: 1
        };
        RawInflate.MaxBackwardLength = 32768;
        RawInflate.MaxCopyLength = 32768;
        RawInflate.Order = new Uint16Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
        RawInflate.LengthCodeTable = new Uint16Array([
            0x0003, 0x0004, 0x0005, 0x0006, 0x0007, 0x0008, 0x0009, 0x000a, 0x000b,
            0x000d, 0x000f, 0x0011, 0x0013, 0x0017, 0x001b, 0x001f, 0x0023, 0x002b,
            0x0033, 0x003b, 0x0043, 0x0053, 0x0063, 0x0073, 0x0083, 0x00a3, 0x00c3,
            0x00e3, 0x0102, 0x0102, 0x0102
        ]);
        RawInflate.LengthExtraTable = new Uint8Array([
            0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5,
            5, 5, 0, 0, 0
        ]);
        RawInflate.DistCodeTable = new Uint16Array([
            0x0001, 0x0002, 0x0003, 0x0004, 0x0005, 0x0007, 0x0009, 0x000d, 0x0011,
            0x0019, 0x0021, 0x0031, 0x0041, 0x0061, 0x0081, 0x00c1, 0x0101, 0x0181,
            0x0201, 0x0301, 0x0401, 0x0601, 0x0801, 0x0c01, 0x1001, 0x1801, 0x2001,
            0x3001, 0x4001, 0x6001
        ]);
        RawInflate.DistExtraTable = new Uint8Array([
            0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11,
            11, 12, 12, 13, 13
        ]);
        return RawInflate;
    }());
    exports.RawInflate = RawInflate;
});
define("src/nid/zlib/CompressionMethod", ["require", "exports"], function (require, exports) {
    "use strict";
    var CompressionMethod = (function () {
        function CompressionMethod() {
        }
        CompressionMethod.ZLIB = {
            DEFLATE: 8,
            RESERVED: 15
        };
        CompressionMethod.ZIP = {
            STORE: 0,
            DEFLATE: 8
        };
        return CompressionMethod;
    }());
    exports.CompressionMethod = CompressionMethod;
});
define("src/nid/zlib/Adler32", ["require", "exports"], function (require, exports) {
    "use strict";
    var Adler32 = (function () {
        function Adler32() {
        }
        Adler32.calc = function (array) {
            if (typeof (array) === 'string') {
                array = Adler32.encodeString(array);
            }
            return Adler32.update(1, array);
        };
        Adler32.update = function (adler, array) {
            var s1 = adler & 0xffff;
            var s2 = (adler >>> 16) & 0xffff;
            var len = array.length;
            var tlen;
            var i = 0;
            while (len > 0) {
                tlen = len > Adler32.OptimizationParameter ?
                    Adler32.OptimizationParameter : len;
                len -= tlen;
                do {
                    s1 += array[i++];
                    s2 += s1;
                } while (--tlen);
                s1 %= 65521;
                s2 %= 65521;
            }
            return ((s2 << 16) | s1) >>> 0;
        };
        Adler32.encodeString = function (str) {
            if (!Adler32.encoder) {
                if (window["TextEncoder"]) {
                    Adler32.encoder = new window["TextEncoder"]();
                }
                else {
                    Adler32.encoder = {
                        encode: function (str) {
                            var tmp = str.split('');
                            var data = new Uint8Array(tmp.length);
                            var i;
                            var il;
                            for (i = 0, il = tmp.length; i < il; i++) {
                                data[i] = (tmp[i].charCodeAt(0) & 0xff) >>> 0;
                            }
                            return data;
                        }
                    };
                }
            }
            return Adler32.encoder.encode(str);
        };
        Adler32.OptimizationParameter = 1024;
        return Adler32;
    }());
    exports.Adler32 = Adler32;
});
define("src/nid/zlib/Inflate", ["require", "exports", "src/nid/zlib/RawInflate", "src/nid/zlib/CompressionMethod", "src/nid/zlib/Adler32"], function (require, exports, RawInflate_1, CompressionMethod_1, Adler32_1) {
    "use strict";
    var Inflate = (function () {
        function Inflate(input, opt_params) {
            if (opt_params === void 0) { opt_params = null; }
            this.ip = 0;
            this.input = input;
            if (opt_params || !(opt_params = {})) {
                if (opt_params['index']) {
                    this.ip = opt_params['index'];
                }
                if (opt_params['verify']) {
                    this.verify = opt_params['verify'];
                }
            }
            this.cmf = input[this.ip++];
            this.flg = input[this.ip++];
            switch (this.cmf & 0x0f) {
                case CompressionMethod_1.CompressionMethod.ZLIB.DEFLATE:
                    this.method = CompressionMethod_1.CompressionMethod.ZLIB.DEFLATE;
                    break;
                default:
                    throw new Error('unsupported compression method');
            }
            if (((this.cmf << 8) + this.flg) % 31 !== 0) {
                throw new Error('invalid fcheck flag:' + ((this.cmf << 8) + this.flg) % 31);
            }
            if (this.flg & 0x20) {
                throw new Error('fdict flag is not supported');
            }
            this.rawinflate = new RawInflate_1.RawInflate(input, {
                'index': this.ip,
                'bufferSize': opt_params['bufferSize'],
                'bufferType': opt_params['bufferType'],
                'resize': opt_params['resize']
            });
        }
        Inflate.prototype.decompress = function () {
            var input = this.input;
            var buffer;
            var adler32;
            buffer = this.rawinflate.decompress();
            this.ip = this.rawinflate.ip;
            if (this.verify) {
                adler32 = (input[this.ip++] << 24 | input[this.ip++] << 16 |
                    input[this.ip++] << 8 | input[this.ip++]) >>> 0;
                if (adler32 !== Adler32_1.Adler32.calc(buffer)) {
                    throw new Error('invalid adler-32 checksum');
                }
            }
            return buffer;
        };
        Inflate.BufferType = RawInflate_1.RawInflate.BufferType;
        return Inflate;
    }());
    exports.Inflate = Inflate;
});
define("src/nid/zlib/ZLIB", ["require", "exports", "src/nid/zlib/Inflate"], function (require, exports, Inflate_1) {
    "use strict";
    var ZLIB = (function () {
        function ZLIB() {
        }
        ZLIB.prototype.encode = function () {
        };
        ZLIB.prototype.decode = function (compressed) {
            var decompressed = new Inflate_1.Inflate(compressed).decompress();
        };
        return ZLIB;
    }());
    exports.ZLIB = ZLIB;
});
define("src/nid/lzma/RangeDecoder", ["require", "exports"], function (require, exports) {
    "use strict";
    var RangeDecoder = (function () {
        function RangeDecoder() {
            this.rangeI = 0;
            this.codeI = 1;
            this.loc1 = 2;
            this.loc2 = 3;
            this.in_pos = 13;
        }
        RangeDecoder.prototype.isFinishedOK = function () {
            return this.U32[this.codeI] == 0;
        };
        RangeDecoder.prototype.init = function () {
            this.U32 = new Uint32Array(4);
            this.U16 = new Uint16Array(4);
            this.corrupted = false;
            if (this.inStream[this.in_pos++] != 0) {
                this.corrupted = true;
            }
            this.U32[this.rangeI] = 0xFFFFFFFF;
            this.U32[this.codeI] = 0;
            for (var i = 0; i < 4; i++) {
                this.U32[this.codeI] = (this.U32[this.codeI] << 8) | this.inStream[this.in_pos++];
            }
            if (this.U32[this.codeI] == this.U32[this.rangeI]) {
                this.corrupted = true;
            }
        };
        RangeDecoder.prototype.normalize = function () {
            if (this.U32[this.rangeI] < RangeDecoder.kTopValue) {
                this.U32[this.rangeI] <<= 8;
                this.U32[this.codeI] = (this.U32[this.codeI] << 8) | this.inStream[this.in_pos++];
            }
        };
        RangeDecoder.prototype.decodeDirectBits = function (numBits) {
            this.U32[this.loc1] = 0;
            do {
                this.U32[this.rangeI] >>>= 1;
                this.U32[this.codeI] -= this.U32[this.rangeI];
                this.U32[this.loc2] = 0 - (this.U32[this.codeI] >>> 31);
                this.U32[this.codeI] += this.U32[this.rangeI] & this.U32[this.loc2];
                if (this.U32[this.codeI] == this.U32[this.rangeI]) {
                    this.corrupted = true;
                }
                this.normalize();
                this.U32[this.loc1] <<= 1;
                this.U32[this.loc1] += this.U32[this.loc2] + 1;
            } while (--numBits);
            return this.U32[this.loc1];
        };
        RangeDecoder.prototype.decodeBit = function (prob, index) {
            this.U16[0] = prob[index];
            this.U32[2] = (this.U32[0] >>> 11) * this.U16[0];
            if (this.U32[1] < this.U32[2]) {
                this.U16[0] += ((1 << 11) - this.U16[0]) >>> 5;
                this.U32[0] = this.U32[2];
                this.U16[1] = 0;
            }
            else {
                this.U16[0] -= this.U16[0] >>> 5;
                this.U32[1] -= this.U32[2];
                this.U32[0] -= this.U32[2];
                this.U16[1] = 1;
            }
            prob[index] = this.U16[0];
            if (this.U32[0] < 16777216) {
                this.U32[0] <<= 8;
                this.U32[1] = (this.U32[1] << 8) | this.inStream[this.in_pos++];
            }
            return this.U16[1];
        };
        RangeDecoder.kTopValue = (1 << 24);
        return RangeDecoder;
    }());
    exports.RangeDecoder = RangeDecoder;
});
define("src/nid/lzma/OutWindow", ["require", "exports"], function (require, exports) {
    "use strict";
    var OutWindow = (function () {
        function OutWindow() {
            this.out_pos = 0;
        }
        OutWindow.prototype.create = function (dictSize) {
            this.buf = new Uint8Array(dictSize);
            this.pos = 0;
            this.size = dictSize;
            this.isFull = false;
            this.totalPos = 0;
        };
        OutWindow.prototype.putByte = function (b) {
            this.totalPos++;
            this.buf[this.pos++] = b;
            if (this.pos == this.size) {
                this.pos = 0;
                this.isFull = true;
            }
            this.outStream[this.out_pos++] = b;
        };
        OutWindow.prototype.getByte = function (dist) {
            return this.buf[dist <= this.pos ? this.pos - dist : this.size - dist + this.pos];
        };
        OutWindow.prototype.copyMatch = function (dist, len) {
            for (; len > 0; len--) {
                this.putByte(this.getByte(dist));
            }
        };
        OutWindow.prototype.checkDistance = function (dist) {
            return dist <= this.pos || this.isFull;
        };
        OutWindow.prototype.isEmpty = function () {
            return this.pos == 0 && !this.isFull;
        };
        return OutWindow;
    }());
    exports.OutWindow = OutWindow;
});
define("src/nid/lzma/BitTreeDecoder", ["require", "exports", "src/nid/lzma/LZMA"], function (require, exports, LZMA_1) {
    "use strict";
    var BitTreeDecoder = (function () {
        function BitTreeDecoder(numBits) {
            this.numBits = numBits;
            this.probs = new Uint16Array(1 << this.numBits);
        }
        BitTreeDecoder.prototype.init = function () {
            LZMA_1.LZMA.INIT_PROBS(this.probs);
        };
        BitTreeDecoder.prototype.decode = function (rc) {
            var m = 1;
            for (var i = 0; i < this.numBits; i++)
                m = (m << 1) + rc.decodeBit(this.probs, m);
            return m - (1 << this.numBits);
        };
        BitTreeDecoder.prototype.reverseDecode = function (rc) {
            return LZMA_1.LZMA.BitTreeReverseDecode(this.probs, this.numBits, rc);
        };
        BitTreeDecoder.constructArray = function (numBits, len) {
            var vec = [];
            for (var i = 0; i < len; i++) {
                vec[i] = new BitTreeDecoder(numBits);
            }
            return vec;
        };
        return BitTreeDecoder;
    }());
    exports.BitTreeDecoder = BitTreeDecoder;
});
define("src/nid/lzma/LenDecoder", ["require", "exports", "src/nid/lzma/BitTreeDecoder", "src/nid/lzma/LZMA"], function (require, exports, BitTreeDecoder_1, LZMA_2) {
    "use strict";
    var LenDecoder = (function () {
        function LenDecoder() {
            this.lowCoder = BitTreeDecoder_1.BitTreeDecoder.constructArray(3, 1 << LZMA_2.LZMA.kNumPosBitsMax);
            this.midCoder = BitTreeDecoder_1.BitTreeDecoder.constructArray(3, 1 << LZMA_2.LZMA.kNumPosBitsMax);
            this.highCoder = new BitTreeDecoder_1.BitTreeDecoder(8);
        }
        LenDecoder.prototype.init = function () {
            this.choice = [LZMA_2.LZMA.PROB_INIT_VAL, LZMA_2.LZMA.PROB_INIT_VAL];
            this.highCoder.init();
            for (var i = 0; i < (1 << LZMA_2.LZMA.kNumPosBitsMax); i++) {
                this.lowCoder[i].init();
                this.midCoder[i].init();
            }
        };
        LenDecoder.prototype.decode = function (rc, posState) {
            if (rc.decodeBit(this.choice, 0) == 0) {
                return this.lowCoder[posState].decode(rc);
            }
            if (rc.decodeBit(this.choice, 1) == 0) {
                return 8 + this.midCoder[posState].decode(rc);
            }
            return 16 + this.highCoder.decode(rc);
        };
        return LenDecoder;
    }());
    exports.LenDecoder = LenDecoder;
});
define("src/nid/utils/MEMORY", ["require", "exports"], function (require, exports) {
    "use asm";
    "use strict";
    var MEMORY = (function () {
        function MEMORY() {
        }
        MEMORY.allocateUint8 = function (len) {
            MEMORY.u8 = new Uint8Array(len);
        };
        MEMORY.allocateUint16 = function (len) {
            MEMORY.u16 = new Uint16Array(len);
        };
        MEMORY.allocateUint32 = function (len) {
            MEMORY.u32 = new Uint32Array(len);
        };
        MEMORY.getUint8 = function () {
            if (!MEMORY.u8) {
                MEMORY.allocateUint8(10);
            }
            return MEMORY.u8Index++;
        };
        MEMORY.getUint16 = function () {
            if (!MEMORY.u16) {
                MEMORY.allocateUint16(24);
            }
            return MEMORY.u16Index++;
        };
        MEMORY.getUint32 = function () {
            if (!MEMORY.u32) {
                MEMORY.allocateUint32(10);
            }
            return MEMORY.u32Index++;
        };
        MEMORY.u8Index = 0;
        MEMORY.u16Index = 0;
        MEMORY.u32Index = 0;
        return MEMORY;
    }());
    exports.MEMORY = MEMORY;
});
define("src/nid/lzma/LzmaDecoder", ["require", "exports", "src/nid/lzma/RangeDecoder", "src/nid/lzma/OutWindow", "src/nid/lzma/BitTreeDecoder", "src/nid/lzma/LenDecoder", "src/nid/lzma/LZMA", "src/nid/utils/MEMORY"], function (require, exports, RangeDecoder_1, OutWindow_1, BitTreeDecoder_2, LenDecoder_1, LZMA_3, MEMORY_1) {
    "use strict";
    var LzmaDecoder = (function () {
        function LzmaDecoder() {
            this.posSlotDecoder = BitTreeDecoder_2.BitTreeDecoder.constructArray(6, LZMA_3.LZMA.kNumLenToPosStates);
            this.alignDecoder = new BitTreeDecoder_2.BitTreeDecoder(LZMA_3.LZMA.kNumAlignBits);
            this.posDecoders = new Uint16Array(1 + LZMA_3.LZMA.kNumFullDistances - LZMA_3.LZMA.kEndPosModelIndex);
            this.isMatch = new Uint16Array(LZMA_3.LZMA.kNumStates << LZMA_3.LZMA.kNumPosBitsMax);
            this.isRep = new Uint16Array(LZMA_3.LZMA.kNumStates);
            this.isRepG0 = new Uint16Array(LZMA_3.LZMA.kNumStates);
            this.isRepG1 = new Uint16Array(LZMA_3.LZMA.kNumStates);
            this.isRepG2 = new Uint16Array(LZMA_3.LZMA.kNumStates);
            this.isRep0Long = new Uint16Array(LZMA_3.LZMA.kNumStates << LZMA_3.LZMA.kNumPosBitsMax);
            this.lenDecoder = new LenDecoder_1.LenDecoder();
            this.repLenDecoder = new LenDecoder_1.LenDecoder();
            this.rangeDec = new RangeDecoder_1.RangeDecoder();
            this.outWindow = new OutWindow_1.OutWindow();
        }
        LzmaDecoder.prototype.init = function () {
            this.loc1 = MEMORY_1.MEMORY.getUint32() | 0;
            this.loc2 = MEMORY_1.MEMORY.getUint32() | 0;
            this.matchBitI = MEMORY_1.MEMORY.getUint16() | 0;
            this.matchByteI = MEMORY_1.MEMORY.getUint16() | 0;
            this.bitI = MEMORY_1.MEMORY.getUint16() | 0;
            this.symbolI = MEMORY_1.MEMORY.getUint16() | 0;
            this.prevByteI = MEMORY_1.MEMORY.getUint16() | 0;
            this.litStateI = MEMORY_1.MEMORY.getUint16() | 0;
            this.initLiterals();
            this.initDist();
            LZMA_3.LZMA.INIT_PROBS(this.isMatch);
            LZMA_3.LZMA.INIT_PROBS(this.isRep);
            LZMA_3.LZMA.INIT_PROBS(this.isRepG0);
            LZMA_3.LZMA.INIT_PROBS(this.isRepG1);
            LZMA_3.LZMA.INIT_PROBS(this.isRepG2);
            LZMA_3.LZMA.INIT_PROBS(this.isRep0Long);
            this.lenDecoder.init();
            this.repLenDecoder.init();
        };
        LzmaDecoder.prototype.create = function () {
            this.outWindow.create(this.dictSize);
            this.createLiterals();
        };
        LzmaDecoder.prototype.createLiterals = function () {
            this.litProbs = new Uint16Array(0x300 << (this.lc + this.lp));
        };
        LzmaDecoder.prototype.initLiterals = function () {
            var num = 0x300 << (this.lc + this.lp);
            for (var i = 0; i < num; i++) {
                this.litProbs[i] = LZMA_3.LZMA.PROB_INIT_VAL;
            }
        };
        LzmaDecoder.prototype.decodeLiteral = function (state, rep0) {
            MEMORY_1.MEMORY.u16[this.prevByteI] = 0;
            if (!this.outWindow.isEmpty())
                MEMORY_1.MEMORY.u16[this.prevByteI] = this.outWindow.getByte(1);
            MEMORY_1.MEMORY.u16[this.symbolI] = 1;
            MEMORY_1.MEMORY.u16[this.litStateI] = ((this.outWindow.totalPos & ((1 << this.lp) - 1)) << this.lc) + (MEMORY_1.MEMORY.u16[this.prevByteI] >>> (8 - this.lc));
            var probsOffset = (0x300 * MEMORY_1.MEMORY.u16[this.litStateI]) | 0;
            if (state >= 7) {
                MEMORY_1.MEMORY.u16[this.matchByteI] = this.outWindow.getByte(rep0 + 1);
                do {
                    MEMORY_1.MEMORY.u16[this.matchBitI] = (MEMORY_1.MEMORY.u16[this.matchByteI] >>> 7) & 1;
                    MEMORY_1.MEMORY.u16[this.matchByteI] <<= 1;
                    MEMORY_1.MEMORY.u16[this.bitI] = this.rangeDec.decodeBit(this.litProbs, probsOffset + ((1 + MEMORY_1.MEMORY.u16[this.matchBitI]) << 8) + MEMORY_1.MEMORY.u16[this.symbolI]);
                    MEMORY_1.MEMORY.u16[this.symbolI] = (MEMORY_1.MEMORY.u16[this.symbolI] << 1) | MEMORY_1.MEMORY.u16[this.bitI];
                    if (MEMORY_1.MEMORY.u16[this.matchBitI] != MEMORY_1.MEMORY.u16[this.bitI])
                        break;
                } while (MEMORY_1.MEMORY.u16[this.symbolI] < 0x100);
            }
            while (MEMORY_1.MEMORY.u16[this.symbolI] < 0x100) {
                MEMORY_1.MEMORY.u16[this.symbolI] = (MEMORY_1.MEMORY.u16[this.symbolI] << 1) | this.rangeDec.decodeBit(this.litProbs, probsOffset + MEMORY_1.MEMORY.u16[this.symbolI]);
            }
            this.outWindow.putByte(MEMORY_1.MEMORY.u16[this.symbolI] - 0x100);
        };
        LzmaDecoder.prototype.decodeDistance = function (len) {
            var lenState = len;
            if (lenState > LZMA_3.LZMA.kNumLenToPosStates - 1)
                lenState = LZMA_3.LZMA.kNumLenToPosStates - 1;
            var posSlot = this.posSlotDecoder[lenState].decode(this.rangeDec);
            if (posSlot < 4)
                return posSlot;
            var numDirectBits = ((posSlot >>> 1) - 1);
            MEMORY_1.MEMORY.u32[this.loc1] = ((2 | (posSlot & 1)) << numDirectBits);
            if (posSlot < LZMA_3.LZMA.kEndPosModelIndex) {
                MEMORY_1.MEMORY.u32[this.loc1] += LZMA_3.LZMA.BitTreeReverseDecode(this.posDecoders, numDirectBits, this.rangeDec, MEMORY_1.MEMORY.u32[this.loc1] - posSlot);
            }
            else {
                MEMORY_1.MEMORY.u32[this.loc1] += this.rangeDec.decodeDirectBits(numDirectBits - LZMA_3.LZMA.kNumAlignBits) << LZMA_3.LZMA.kNumAlignBits;
                MEMORY_1.MEMORY.u32[this.loc1] += this.alignDecoder.reverseDecode(this.rangeDec);
            }
            return MEMORY_1.MEMORY.u32[this.loc1];
        };
        LzmaDecoder.prototype.initDist = function () {
            for (var i = 0; i < LZMA_3.LZMA.kNumLenToPosStates; i++) {
                this.posSlotDecoder[i].init();
            }
            this.alignDecoder.init();
            LZMA_3.LZMA.INIT_PROBS(this.posDecoders);
        };
        LzmaDecoder.prototype.decodeProperties = function (properties) {
            var prop = new Uint8Array(4);
            prop[0] = properties[0];
            if (prop[0] >= (9 * 5 * 5)) {
                throw "Incorrect LZMA properties";
            }
            prop[1] = prop[0] % 9;
            prop[0] /= 9;
            prop[2] = prop[0] / 5;
            prop[3] = prop[0] % 5;
            this.lc = prop[1];
            this.pb = prop[2];
            this.lp = prop[3];
            this.dictSizeInProperties = 0;
            for (var i = 0; i < 4; i++) {
                this.dictSizeInProperties |= properties[i + 1] << (8 * i);
            }
            this.dictSize = this.dictSizeInProperties;
            if (this.dictSize < LZMA_3.LZMA.LZMA_DIC_MIN) {
                this.dictSize = LZMA_3.LZMA.LZMA_DIC_MIN;
            }
        };
        LzmaDecoder.prototype.updateState_Literal = function (state) {
            if (state < 4)
                return 0;
            else if (state < 10)
                return state - 3;
            else
                return state - 6;
        };
        LzmaDecoder.prototype.updateState_ShortRep = function (state) {
            return state < 7 ? 9 : 11;
        };
        LzmaDecoder.prototype.updateState_Rep = function (state) {
            return state < 7 ? 8 : 11;
        };
        LzmaDecoder.prototype.updateState_Match = function (state) {
            return state < 7 ? 7 : 10;
        };
        LzmaDecoder.prototype.decode = function (unpackSizeDefined, unpackSize) {
            this.init();
            this.rangeDec.init();
            if (unpackSizeDefined) {
                this.outWindow.outStream = new Uint8Array(new ArrayBuffer(unpackSize));
            }
            var rep0 = 0, rep1 = 0, rep2 = 0, rep3 = 0;
            var state = 0;
            for (;;) {
                if (unpackSizeDefined && unpackSize == 0 && !this.markerIsMandatory) {
                    if (this.rangeDec.isFinishedOK()) {
                        return LZMA_3.LZMA.LZMA_RES_FINISHED_WITHOUT_MARKER;
                    }
                }
                var posState = this.outWindow.totalPos & ((1 << this.pb) - 1);
                if (this.rangeDec.decodeBit(this.isMatch, (state << LZMA_3.LZMA.kNumPosBitsMax) + posState) == 0) {
                    if (unpackSizeDefined && unpackSize == 0) {
                        return LZMA_3.LZMA.LZMA_RES_ERROR;
                    }
                    this.decodeLiteral(state, rep0);
                    state = this.updateState_Literal(state);
                    unpackSize--;
                    continue;
                }
                var len;
                if (this.rangeDec.decodeBit(this.isRep, state) != 0) {
                    if (unpackSizeDefined && unpackSize == 0) {
                        return LZMA_3.LZMA.LZMA_RES_ERROR;
                    }
                    if (this.outWindow.isEmpty()) {
                        return LZMA_3.LZMA.LZMA_RES_ERROR;
                    }
                    if (this.rangeDec.decodeBit(this.isRepG0, state) == 0) {
                        if (this.rangeDec.decodeBit(this.isRep0Long, (state << LZMA_3.LZMA.kNumPosBitsMax) + posState) == 0) {
                            state = this.updateState_ShortRep(state);
                            this.outWindow.putByte(this.outWindow.getByte(rep0 + 1));
                            unpackSize--;
                            continue;
                        }
                    }
                    else {
                        var dist;
                        if (this.rangeDec.decodeBit(this.isRepG1, state) == 0) {
                            dist = rep1;
                        }
                        else {
                            if (this.rangeDec.decodeBit(this.isRepG2, state) == 0) {
                                dist = rep2;
                            }
                            else {
                                dist = rep3;
                                rep3 = rep2;
                            }
                            rep2 = rep1;
                        }
                        rep1 = rep0;
                        rep0 = dist;
                    }
                    len = this.repLenDecoder.decode(this.rangeDec, posState);
                    state = this.updateState_Rep(state);
                }
                else {
                    rep3 = rep2;
                    rep2 = rep1;
                    rep1 = rep0;
                    len = this.lenDecoder.decode(this.rangeDec, posState);
                    state = this.updateState_Match(state);
                    rep0 = this.decodeDistance(len);
                    if (rep0 == 0xFFFFFFFF) {
                        return this.rangeDec.isFinishedOK() ?
                            LZMA_3.LZMA.LZMA_RES_FINISHED_WITH_MARKER :
                            LZMA_3.LZMA.LZMA_RES_ERROR;
                    }
                    if (unpackSizeDefined && unpackSize == 0) {
                        return LZMA_3.LZMA.LZMA_RES_ERROR;
                    }
                    if (rep0 >= this.dictSize || !this.outWindow.checkDistance(rep0)) {
                        return LZMA_3.LZMA.LZMA_RES_ERROR;
                    }
                }
                len += LZMA_3.LZMA.kMatchMinLen;
                var isError = false;
                if (unpackSizeDefined && unpackSize < len) {
                    len = unpackSize;
                    isError = true;
                }
                this.outWindow.copyMatch(rep0 + 1, len);
                unpackSize -= len;
                if (isError) {
                    return LZMA_3.LZMA.LZMA_RES_ERROR;
                }
            }
        };
        return LzmaDecoder;
    }());
    exports.LzmaDecoder = LzmaDecoder;
});
define("src/nid/lzma/LZMA", ["require", "exports", "src/nid/lzma/LzmaDecoder"], function (require, exports, LzmaDecoder_1) {
    "use strict";
    var LZMA = (function () {
        function LZMA() {
            this.decoder = new LzmaDecoder_1.LzmaDecoder();
        }
        LZMA.INIT_PROBS = function (p) {
            for (var i = 0; i < p.length; i++) {
                p[i] = this.PROB_INIT_VAL;
            }
        };
        LZMA.BitTreeReverseDecode = function (probs, numBits, rc, offset) {
            if (offset === void 0) { offset = 0; }
            var m = 1;
            var symbol = 0;
            for (var i = 0; i < numBits; i++) {
                var bit = rc.decodeBit(probs, offset + m);
                m <<= 1;
                m += bit;
                symbol |= (bit << i);
            }
            return symbol;
        };
        LZMA.prototype.decode = function (data) {
            this.data = data;
            var header = new Uint8Array(13);
            var i;
            for (i = 0; i < 13; i++) {
                header[i] = data[i];
            }
            this.decoder.decodeProperties(header);
            console.log("\nlc=" + this.decoder.lc + ", lp=" + this.decoder.lp + ", pb=" + this.decoder.pb);
            console.log("\nDictionary Size in properties = " + this.decoder.dictSizeInProperties);
            console.log("\nDictionary Size for decoding  = " + this.decoder.dictSize);
            var unpackSize = 0;
            var unpackSizeDefined = false;
            for (i = 0; i < 8; i++) {
                var b = header[5 + i];
                if (b != 0xFF) {
                    unpackSizeDefined = true;
                }
                unpackSize |= b << (8 * i);
            }
            this.decoder.markerIsMandatory = !unpackSizeDefined;
            console.log("\n");
            if (unpackSizeDefined) {
                console.log("Uncompressed Size : " + unpackSize + " bytes");
            }
            else {
                console.log("End marker is expected\n");
            }
            this.decoder.rangeDec.inStream = data;
            console.log("\n");
            this.decoder.create();
            var res = this.decoder.decode(unpackSizeDefined, unpackSize);
            console.log("Read    ", this.decoder.rangeDec.in_pos);
            console.log("Written ", this.decoder.outWindow.out_pos);
            if (res == LZMA.LZMA_RES_ERROR) {
                throw "LZMA decoding error";
            }
            else if (res == LZMA.LZMA_RES_FINISHED_WITHOUT_MARKER) {
                console.log("Finished without end marker");
            }
            else if (res == LZMA.LZMA_RES_FINISHED_WITH_MARKER) {
                if (unpackSizeDefined) {
                    if (this.decoder.outWindow.out_pos != unpackSize) {
                        throw "Finished with end marker before than specified size";
                    }
                    console.log("Warning: ");
                }
                console.log("Finished with end marker");
            }
            else {
                throw "Internal Error";
            }
            console.log("\n");
            if (this.decoder.rangeDec.corrupted) {
                console.log("\nWarning: LZMA stream is corrupted\n");
            }
            return this.decoder.outWindow.outStream;
        };
        LZMA.LZMA_DIC_MIN = (1 << 12);
        LZMA.LZMA_RES_ERROR = 0;
        LZMA.LZMA_RES_FINISHED_WITH_MARKER = 1;
        LZMA.LZMA_RES_FINISHED_WITHOUT_MARKER = 2;
        LZMA.kNumBitModelTotalBits = 11;
        LZMA.kNumMoveBits = 5;
        LZMA.PROB_INIT_VAL = ((1 << LZMA.kNumBitModelTotalBits) / 2);
        LZMA.kNumPosBitsMax = 4;
        LZMA.kNumStates = 12;
        LZMA.kNumLenToPosStates = 4;
        LZMA.kNumAlignBits = 4;
        LZMA.kStartPosModelIndex = 4;
        LZMA.kEndPosModelIndex = 14;
        LZMA.kNumFullDistances = (1 << (LZMA.kEndPosModelIndex >>> 1));
        LZMA.kMatchMinLen = 2;
        return LZMA;
    }());
    exports.LZMA = LZMA;
});
define("src/ctypes/Int64", ["require", "exports"], function (require, exports) {
    "use strict";
    var Int64 = (function () {
        function Int64(low, high) {
            this.low = low;
            this.high = high;
        }
        Int64.prototype.value = function () {
            var _h = this.high.toString(16);
            var _hd = 8 - _h.length;
            if (_hd > 0) {
                for (var i = 0; i < _hd; i++) {
                    _h = '0' + _h;
                }
            }
            var _l = this.low.toString(16);
            var _ld = 8 - _l.length;
            if (_ld > 0) {
                for (i = 0; i < _ld; i++) {
                    _l = '0' + _l;
                }
            }
            this._value = Number('0x' + _h + _l);
            return this._value;
        };
        return Int64;
    }());
    exports.Int64 = Int64;
});
define("src/ctypes/UInt64", ["require", "exports"], function (require, exports) {
    "use strict";
    var UInt64 = (function () {
        function UInt64(low, high) {
            if (low === void 0) { low = 0; }
            if (high === void 0) { high = 0; }
            this.low = low;
            this.high = high;
        }
        UInt64.prototype.value = function () {
            var _h = this.high.toString(16);
            var _hd = 8 - _h.length;
            if (_hd > 0) {
                for (var i = 0; i < _hd; i++) {
                    _h = '0' + _h;
                }
            }
            var _l = this.low.toString(16);
            var _ld = 8 - _l.length;
            if (_ld > 0) {
                for (i = 0; i < _ld; i++) {
                    _l = '0' + _l;
                }
            }
            this._value = Number('0x' + _h + _l);
            return this._value;
        };
        return UInt64;
    }());
    exports.UInt64 = UInt64;
});
define("src/nid/utils/ByteArray", ["require", "exports", "src/ctypes/Int64", "src/ctypes/UInt64"], function (require, exports, Int64_1, UInt64_1) {
    "use strict";
    var ByteArray = (function () {
        function ByteArray(buffer, offset, length) {
            if (offset === void 0) { offset = 0; }
            if (length === void 0) { length = 0; }
            this.BUFFER_EXT_SIZE = 1024;
            this.array = null;
            this.EOF_byte = -1;
            this.EOF_code_point = -1;
            if (buffer == undefined) {
                buffer = new ArrayBuffer(this.BUFFER_EXT_SIZE);
                this.write_position = 0;
            }
            else if (buffer == null) {
                this.write_position = 0;
            }
            else {
                this.write_position = length > 0 ? length : buffer.byteLength;
            }
            if (buffer) {
                this.data = new DataView(buffer, offset, length > 0 ? length : buffer.byteLength);
            }
            this._position = 0;
            this.endian = ByteArray.BIG_ENDIAN;
        }
        Object.defineProperty(ByteArray.prototype, "buffer", {
            get: function () {
                return this.data.buffer;
            },
            set: function (value) {
                this.data = new DataView(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ByteArray.prototype, "dataView", {
            get: function () {
                return this.data;
            },
            set: function (value) {
                this.data = value;
                this.write_position = value.byteLength;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ByteArray.prototype, "phyPosition", {
            get: function () {
                return this._position + this.data.byteOffset;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ByteArray.prototype, "bufferOffset", {
            get: function () {
                return this.data.byteOffset;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ByteArray.prototype, "position", {
            get: function () {
                return this._position;
            },
            set: function (value) {
                if (this._position < value) {
                    if (!this.validate(this._position - value)) {
                        return;
                    }
                }
                this._position = value;
                this.write_position = value > this.write_position ? value : this.write_position;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ByteArray.prototype, "length", {
            get: function () {
                return this.write_position;
            },
            set: function (value) {
                this.validateBuffer(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ByteArray.prototype, "bytesAvailable", {
            get: function () {
                return this.data.byteLength - this._position;
            },
            enumerable: true,
            configurable: true
        });
        ByteArray.prototype.clear = function () {
            this._position = 0;
        };
        ByteArray.prototype.getArray = function () {
            if (this.array == null) {
                this.array = new Uint8Array(this.data.buffer, this.data.byteOffset, this.data.byteLength);
            }
            return this.array;
        };
        ByteArray.prototype.setArray = function (array) {
            this.array = array;
            this.setBuffer(array.buffer, array.byteOffset, array.byteLength);
        };
        ByteArray.prototype.setBuffer = function (buffer, offset, length) {
            if (offset === void 0) { offset = 0; }
            if (length === void 0) { length = 0; }
            if (buffer) {
                this.data = new DataView(buffer, offset, length > 0 ? length : buffer.byteLength);
                this.write_position = length > 0 ? length : buffer.byteLength;
            }
            else {
                this.write_position = 0;
            }
            this._position = 0;
        };
        ByteArray.prototype.readBoolean = function () {
            if (!this.validate(ByteArray.SIZE_OF_BOOLEAN))
                return null;
            return this.data.getUint8(this.position++) != 0;
        };
        ByteArray.prototype.readByte = function () {
            if (!this.validate(ByteArray.SIZE_OF_INT8))
                return null;
            return this.data.getInt8(this.position++);
        };
        ByteArray.prototype.readBytes = function (_bytes, offset, length, createNewBuffer) {
            if (_bytes === void 0) { _bytes = null; }
            if (offset === void 0) { offset = 0; }
            if (length === void 0) { length = 0; }
            if (createNewBuffer === void 0) { createNewBuffer = false; }
            if (length == 0) {
                length = this.bytesAvailable;
            }
            else if (!this.validate(length))
                return null;
            if (createNewBuffer) {
                _bytes = _bytes == null ? new ByteArray(new ArrayBuffer(length)) : _bytes;
                for (var i = 0; i < length; i++) {
                    _bytes.data.setUint8(i + offset, this.data.getUint8(this.position++));
                }
            }
            else {
                _bytes = _bytes == null ? new ByteArray(null) : _bytes;
                _bytes.dataView = new DataView(this.data.buffer, this.bufferOffset + this.position, length);
                this.position += length;
            }
            return _bytes;
        };
        ByteArray.prototype.readDouble = function () {
            if (!this.validate(ByteArray.SIZE_OF_FLOAT64))
                return null;
            var value = this.data.getFloat64(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_FLOAT64;
            return value;
        };
        ByteArray.prototype.readFloat = function () {
            if (!this.validate(ByteArray.SIZE_OF_FLOAT32))
                return null;
            var value = this.data.getFloat32(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_FLOAT32;
            return value;
        };
        ByteArray.prototype.readInt = function () {
            if (!this.validate(ByteArray.SIZE_OF_INT32))
                return null;
            var value = this.data.getInt32(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_INT32;
            return value;
        };
        ByteArray.prototype.readInt64 = function () {
            if (!this.validate(ByteArray.SIZE_OF_UINT32))
                return null;
            var low = this.data.getInt32(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_INT32;
            var high = this.data.getInt32(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_INT32;
            return new Int64_1.Int64(low, high);
        };
        ByteArray.prototype.readMultiByte = function (length, charSet) {
            if (!this.validate(length))
                return null;
            return "";
        };
        ByteArray.prototype.readShort = function () {
            if (!this.validate(ByteArray.SIZE_OF_INT16))
                return null;
            var value = this.data.getInt16(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_INT16;
            return value;
        };
        ByteArray.prototype.readUnsignedByte = function () {
            if (!this.validate(ByteArray.SIZE_OF_UINT8))
                return null;
            return this.data.getUint8(this.position++);
        };
        ByteArray.prototype.readUnsignedInt = function () {
            if (!this.validate(ByteArray.SIZE_OF_UINT32))
                return null;
            var value = this.data.getUint32(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_UINT32;
            return value;
        };
        ByteArray.prototype.readVariableSizedUnsignedInt = function () {
            var value;
            var c = this.readUnsignedByte();
            if (c != 0xFF) {
                value = c << 8;
                c = this.readUnsignedByte();
                value |= c;
            }
            else {
                c = this.readUnsignedByte();
                value = c << 16;
                c = this.readUnsignedByte();
                value |= c << 8;
                c = this.readUnsignedByte();
                value |= c;
            }
            return value;
        };
        ByteArray.prototype.readU16VX = function () {
            return (this.readUnsignedByte() << 8) | this.readUnsignedByte();
        };
        ByteArray.prototype.readUnsignedInt64 = function () {
            if (!this.validate(ByteArray.SIZE_OF_UINT32))
                return null;
            var low = this.data.getUint32(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_UINT32;
            var high = this.data.getUint32(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_UINT32;
            return new UInt64_1.UInt64(low, high);
        };
        ByteArray.prototype.readUnsignedShort = function () {
            if (!this.validate(ByteArray.SIZE_OF_UINT16))
                return null;
            var value = this.data.getUint16(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_UINT16;
            return value;
        };
        ByteArray.prototype.readUTF = function () {
            if (!this.validate(ByteArray.SIZE_OF_UINT16))
                return null;
            var length = this.data.getUint16(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_UINT16;
            if (length > 0) {
                return this.readUTFBytes(length);
            }
            else {
                return "";
            }
        };
        ByteArray.prototype.readUTFBytes = function (length) {
            if (!this.validate(length))
                return null;
            var _bytes = new Uint8Array(this.buffer, this.bufferOffset + this.position, length);
            this.position += length;
            return this.decodeUTF8(_bytes);
        };
        ByteArray.prototype.readStandardString = function (length) {
            if (!this.validate(length))
                return null;
            var str = "";
            for (var i = 0; i < length; i++) {
                str += String.fromCharCode(this.data.getUint8(this.position++));
            }
            return str;
        };
        ByteArray.prototype.readStringTillNull = function (keepEvenByte) {
            if (keepEvenByte === void 0) { keepEvenByte = true; }
            var str = "";
            var num = 0;
            while (this.bytesAvailable > 0) {
                var _byte = this.data.getUint8(this.position++);
                num++;
                if (_byte != 0) {
                    str += String.fromCharCode(_byte);
                }
                else {
                    if (keepEvenByte && num % 2 != 0) {
                        this.position++;
                    }
                    break;
                }
            }
            return str;
        };
        ByteArray.prototype.writeBoolean = function (value) {
            this.validateBuffer(ByteArray.SIZE_OF_BOOLEAN);
            this.data.setUint8(this.position++, value ? 1 : 0);
        };
        ByteArray.prototype.writeByte = function (value) {
            this.validateBuffer(ByteArray.SIZE_OF_INT8);
            this.data.setInt8(this.position++, value);
        };
        ByteArray.prototype.writeUnsignedByte = function (value) {
            this.validateBuffer(ByteArray.SIZE_OF_UINT8);
            this.data.setUint8(this.position++, value);
        };
        ByteArray.prototype.writeBytes = function (_bytes, offset, length) {
            if (offset === void 0) { offset = 0; }
            if (length === void 0) { length = 0; }
            this.validateBuffer(length);
            var tmp_data = new DataView(_bytes.buffer);
            for (var i = 0; i < _bytes.length; i++) {
                this.data.setUint8(this.position++, tmp_data.getUint8(i));
            }
        };
        ByteArray.prototype.writeDouble = function (value) {
            this.validateBuffer(ByteArray.SIZE_OF_FLOAT64);
            this.data.setFloat64(this.position, value, this.endian == ByteArray.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_FLOAT64;
        };
        ByteArray.prototype.writeFloat = function (value) {
            this.validateBuffer(ByteArray.SIZE_OF_FLOAT32);
            this.data.setFloat32(this.position, value, this.endian == ByteArray.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_FLOAT32;
        };
        ByteArray.prototype.writeInt = function (value) {
            this.validateBuffer(ByteArray.SIZE_OF_INT32);
            this.data.setInt32(this.position, value, this.endian == ByteArray.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_INT32;
        };
        ByteArray.prototype.writeMultiByte = function (value, charSet) {
        };
        ByteArray.prototype.writeShort = function (value) {
            this.validateBuffer(ByteArray.SIZE_OF_INT16);
            this.data.setInt16(this.position, value, this.endian == ByteArray.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_INT16;
        };
        ByteArray.prototype.writeUnsignedShort = function (value) {
            this.validateBuffer(ByteArray.SIZE_OF_UINT16);
            this.data.setUint16(this.position, value, this.endian == ByteArray.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_UINT16;
        };
        ByteArray.prototype.writeUnsignedInt = function (value) {
            this.validateBuffer(ByteArray.SIZE_OF_UINT32);
            this.data.setUint32(this.position, value, this.endian == ByteArray.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_UINT32;
        };
        ByteArray.prototype.writeUTF = function (value) {
            var utf8bytes = this.encodeUTF8(value);
            var length = utf8bytes.length;
            this.validateBuffer(ByteArray.SIZE_OF_UINT16 + length);
            this.data.setUint16(this.position, length, this.endian === ByteArray.LITTLE_ENDIAN);
            this.position += ByteArray.SIZE_OF_UINT16;
            this.writeUint8Array(utf8bytes);
        };
        ByteArray.prototype.writeUTFBytes = function (value) {
            this.writeUint8Array(this.encodeUTF8(value));
        };
        ByteArray.prototype.toString = function () {
            return "[ByteArray] length:" + this.length + ", bytesAvailable:" + this.bytesAvailable;
        };
        ByteArray.prototype.writeUint8Array = function (_bytes) {
            this.validateBuffer(this.position + _bytes.length);
            for (var i = 0; i < _bytes.length; i++) {
                this.data.setUint8(this.position++, _bytes[i]);
            }
        };
        ByteArray.prototype.writeUint16Array = function (_bytes) {
            this.validateBuffer(this.position + _bytes.length);
            for (var i = 0; i < _bytes.length; i++) {
                this.data.setUint16(this.position, _bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_UINT16;
            }
        };
        ByteArray.prototype.writeUint32Array = function (_bytes) {
            this.validateBuffer(this.position + _bytes.length);
            for (var i = 0; i < _bytes.length; i++) {
                this.data.setUint32(this.position, _bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_UINT32;
            }
        };
        ByteArray.prototype.writeInt8Array = function (_bytes) {
            this.validateBuffer(this.position + _bytes.length);
            for (var i = 0; i < _bytes.length; i++) {
                this.data.setInt8(this.position++, _bytes[i]);
            }
        };
        ByteArray.prototype.writeInt16Array = function (_bytes) {
            this.validateBuffer(this.position + _bytes.length);
            for (var i = 0; i < _bytes.length; i++) {
                this.data.setInt16(this.position, _bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_INT16;
            }
        };
        ByteArray.prototype.writeInt32Array = function (_bytes) {
            this.validateBuffer(this.position + _bytes.length);
            for (var i = 0; i < _bytes.length; i++) {
                this.data.setInt32(this.position, _bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_INT32;
            }
        };
        ByteArray.prototype.writeFloat32Array = function (_bytes) {
            this.validateBuffer(this.position + _bytes.length);
            for (var i = 0; i < _bytes.length; i++) {
                this.data.setFloat32(this.position, _bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_FLOAT32;
            }
        };
        ByteArray.prototype.writeFloat64Array = function (_bytes) {
            this.validateBuffer(this.position + _bytes.length);
            for (var i = 0; i < _bytes.length; i++) {
                this.data.setFloat64(this.position, _bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_FLOAT64;
            }
        };
        ByteArray.prototype.readUint8Array = function (length, createNewBuffer) {
            if (createNewBuffer === void 0) { createNewBuffer = true; }
            if (!this.validate(length))
                return null;
            if (!createNewBuffer) {
                var result = new Uint8Array(this.buffer, this.bufferOffset + this.position, length);
                this.position += length;
            }
            else {
                result = new Uint8Array(new ArrayBuffer(length));
                for (var i = 0; i < length; i++) {
                    result[i] = this.data.getUint8(this.position);
                    this.position += ByteArray.SIZE_OF_UINT8;
                }
            }
            return result;
        };
        ByteArray.prototype.readUint16Array = function (length, createNewBuffer) {
            if (createNewBuffer === void 0) { createNewBuffer = true; }
            var size = length * ByteArray.SIZE_OF_UINT16;
            if (!this.validate(size))
                return null;
            if (!createNewBuffer) {
                var result = new Uint16Array(this.buffer, this.bufferOffset + this.position, length);
                this.position += size;
            }
            else {
                result = new Uint16Array(new ArrayBuffer(size));
                for (var i = 0; i < length; i++) {
                    result[i] = this.data.getUint16(this.position, this.endian === ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_UINT16;
                }
            }
            return result;
        };
        ByteArray.prototype.readUint32Array = function (length, createNewBuffer) {
            if (createNewBuffer === void 0) { createNewBuffer = true; }
            var size = length * ByteArray.SIZE_OF_UINT32;
            if (!this.validate(size))
                return null;
            if (!createNewBuffer) {
                var result = new Uint32Array(this.buffer, this.bufferOffset + this.position, length);
                this.position += size;
            }
            else {
                result = new Uint32Array(new ArrayBuffer(size));
                for (var i = 0; i < length; i++) {
                    result[i] = this.data.getUint32(this.position, this.endian === ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_UINT32;
                }
            }
            return result;
        };
        ByteArray.prototype.readInt8Array = function (length, createNewBuffer) {
            if (createNewBuffer === void 0) { createNewBuffer = true; }
            if (!this.validate(length))
                return null;
            if (!createNewBuffer) {
                var result = new Int8Array(this.buffer, this.bufferOffset + this.position, length);
                this.position += length;
            }
            else {
                result = new Int8Array(new ArrayBuffer(length));
                for (var i = 0; i < length; i++) {
                    result[i] = this.data.getInt8(this.position);
                    this.position += ByteArray.SIZE_OF_INT8;
                }
            }
            return result;
        };
        ByteArray.prototype.readInt16Array = function (length, createNewBuffer) {
            if (createNewBuffer === void 0) { createNewBuffer = true; }
            var size = length * ByteArray.SIZE_OF_INT16;
            if (!this.validate(size))
                return null;
            if (!createNewBuffer) {
                var result = new Int16Array(this.buffer, this.bufferOffset + this.position, length);
                this.position += size;
            }
            else {
                result = new Int16Array(new ArrayBuffer(size));
                for (var i = 0; i < length; i++) {
                    result[i] = this.data.getInt16(this.position, this.endian === ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_INT16;
                }
            }
            return result;
        };
        ByteArray.prototype.readInt32Array = function (length, createNewBuffer) {
            if (createNewBuffer === void 0) { createNewBuffer = true; }
            var size = length * ByteArray.SIZE_OF_INT32;
            if (!this.validate(size))
                return null;
            if (!createNewBuffer) {
                if ((this.bufferOffset + this.position) % 4 == 0) {
                    var result = new Int32Array(this.buffer, this.bufferOffset + this.position, length);
                    this.position += size;
                }
                else {
                    var tmp = new Uint8Array(new ArrayBuffer(size));
                    for (var i = 0; i < size; i++) {
                        tmp[i] = this.data.getUint8(this.position);
                        this.position += ByteArray.SIZE_OF_UINT8;
                    }
                    result = new Int32Array(tmp.buffer);
                }
            }
            else {
                result = new Int32Array(new ArrayBuffer(size));
                for (var i = 0; i < length; i++) {
                    result[i] = this.data.getInt32(this.position, this.endian === ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_INT32;
                }
            }
            return result;
        };
        ByteArray.prototype.readFloat32Array = function (length, createNewBuffer) {
            if (createNewBuffer === void 0) { createNewBuffer = true; }
            var size = length * ByteArray.SIZE_OF_FLOAT32;
            if (!this.validate(size))
                return null;
            if (!createNewBuffer) {
                if ((this.bufferOffset + this.position) % 4 == 0) {
                    var result = new Float32Array(this.buffer, this.bufferOffset + this.position, length);
                    this.position += size;
                }
                else {
                    var tmp = new Uint8Array(new ArrayBuffer(size));
                    for (var i = 0; i < size; i++) {
                        tmp[i] = this.data.getUint8(this.position);
                        this.position += ByteArray.SIZE_OF_UINT8;
                    }
                    result = new Float32Array(tmp.buffer);
                }
            }
            else {
                result = new Float32Array(new ArrayBuffer(size));
                for (var i = 0; i < length; i++) {
                    result[i] = this.data.getFloat32(this.position, this.endian === ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_FLOAT32;
                }
            }
            return result;
        };
        ByteArray.prototype.readFloat64Array = function (length, createNewBuffer) {
            if (createNewBuffer === void 0) { createNewBuffer = true; }
            var size = length * ByteArray.SIZE_OF_FLOAT64;
            if (!this.validate(size))
                return null;
            if (!createNewBuffer) {
                var result = new Float64Array(this.buffer, this.position, length);
                this.position += size;
            }
            else {
                result = new Float64Array(new ArrayBuffer(size));
                for (var i = 0; i < length; i++) {
                    result[i] = this.data.getFloat64(this.position, this.endian === ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_FLOAT64;
                }
            }
            return result;
        };
        ByteArray.prototype.validate = function (len) {
            if (this.data.byteLength > 0 && this._position + len <= this.data.byteLength) {
                return true;
            }
            else {
                throw 'Error #2030: End of file was encountered.';
            }
        };
        ByteArray.prototype.validateBuffer = function (len) {
            this.write_position = len > this.write_position ? len : this.write_position;
            if (this.data.byteLength < len) {
                var tmp = new Uint8Array(new ArrayBuffer(len + this.BUFFER_EXT_SIZE));
                tmp.set(new Uint8Array(this.data.buffer));
                this.data.buffer = tmp.buffer;
            }
        };
        ByteArray.prototype.encodeUTF8 = function (str) {
            var pos = 0;
            var codePoints = this.stringToCodePoints(str);
            var outputBytes = [];
            while (codePoints.length > pos) {
                var code_point = codePoints[pos++];
                if (this.inRange(code_point, 0xD800, 0xDFFF)) {
                    this.encoderError(code_point);
                }
                else if (this.inRange(code_point, 0x0000, 0x007f)) {
                    outputBytes.push(code_point);
                }
                else {
                    var count, offset;
                    if (this.inRange(code_point, 0x0080, 0x07FF)) {
                        count = 1;
                        offset = 0xC0;
                    }
                    else if (this.inRange(code_point, 0x0800, 0xFFFF)) {
                        count = 2;
                        offset = 0xE0;
                    }
                    else if (this.inRange(code_point, 0x10000, 0x10FFFF)) {
                        count = 3;
                        offset = 0xF0;
                    }
                    outputBytes.push(this.div(code_point, Math.pow(64, count)) + offset);
                    while (count > 0) {
                        var temp = this.div(code_point, Math.pow(64, count - 1));
                        outputBytes.push(0x80 + (temp % 64));
                        count -= 1;
                    }
                }
            }
            return new Uint8Array(outputBytes);
        };
        ByteArray.prototype.decodeUTF8 = function (data) {
            var fatal = false;
            var pos = 0;
            var result = "";
            var code_point;
            var utf8_code_point = 0;
            var utf8_bytes_needed = 0;
            var utf8_bytes_seen = 0;
            var utf8_lower_boundary = 0;
            while (data.length > pos) {
                var _byte = data[pos++];
                if (_byte === this.EOF_byte) {
                    if (utf8_bytes_needed !== 0) {
                        code_point = this.decoderError(fatal);
                    }
                    else {
                        code_point = this.EOF_code_point;
                    }
                }
                else {
                    if (utf8_bytes_needed === 0) {
                        if (this.inRange(_byte, 0x00, 0x7F)) {
                            code_point = _byte;
                        }
                        else {
                            if (this.inRange(_byte, 0xC2, 0xDF)) {
                                utf8_bytes_needed = 1;
                                utf8_lower_boundary = 0x80;
                                utf8_code_point = _byte - 0xC0;
                            }
                            else if (this.inRange(_byte, 0xE0, 0xEF)) {
                                utf8_bytes_needed = 2;
                                utf8_lower_boundary = 0x800;
                                utf8_code_point = _byte - 0xE0;
                            }
                            else if (this.inRange(_byte, 0xF0, 0xF4)) {
                                utf8_bytes_needed = 3;
                                utf8_lower_boundary = 0x10000;
                                utf8_code_point = _byte - 0xF0;
                            }
                            else {
                                this.decoderError(fatal);
                            }
                            utf8_code_point = utf8_code_point * Math.pow(64, utf8_bytes_needed);
                            code_point = null;
                        }
                    }
                    else if (!this.inRange(_byte, 0x80, 0xBF)) {
                        utf8_code_point = 0;
                        utf8_bytes_needed = 0;
                        utf8_bytes_seen = 0;
                        utf8_lower_boundary = 0;
                        pos--;
                        code_point = this.decoderError(fatal, _byte);
                    }
                    else {
                        utf8_bytes_seen += 1;
                        utf8_code_point = utf8_code_point + (_byte - 0x80) * Math.pow(64, utf8_bytes_needed - utf8_bytes_seen);
                        if (utf8_bytes_seen !== utf8_bytes_needed) {
                            code_point = null;
                        }
                        else {
                            var cp = utf8_code_point;
                            var lower_boundary = utf8_lower_boundary;
                            utf8_code_point = 0;
                            utf8_bytes_needed = 0;
                            utf8_bytes_seen = 0;
                            utf8_lower_boundary = 0;
                            if (this.inRange(cp, lower_boundary, 0x10FFFF) && !this.inRange(cp, 0xD800, 0xDFFF)) {
                                code_point = cp;
                            }
                            else {
                                code_point = this.decoderError(fatal, _byte);
                            }
                        }
                    }
                }
                if (code_point !== null && code_point !== this.EOF_code_point) {
                    if (code_point <= 0xFFFF) {
                        if (code_point > 0)
                            result += String.fromCharCode(code_point);
                    }
                    else {
                        code_point -= 0x10000;
                        result += String.fromCharCode(0xD800 + ((code_point >> 10) & 0x3ff));
                        result += String.fromCharCode(0xDC00 + (code_point & 0x3ff));
                    }
                }
            }
            return result;
        };
        ByteArray.prototype.encoderError = function (code_point) {
            throw 'EncodingError! The code point ' + code_point + ' could not be encoded.';
        };
        ByteArray.prototype.decoderError = function (fatal, opt_code_point) {
            if (fatal) {
                throw 'DecodingError';
            }
            return opt_code_point || 0xFFFD;
        };
        ByteArray.prototype.inRange = function (a, min, max) {
            return min <= a && a <= max;
        };
        ByteArray.prototype.div = function (n, d) {
            return Math.floor(n / d);
        };
        ByteArray.prototype.stringToCodePoints = function (string) {
            var cps = [];
            var i = 0, n = string.length;
            while (i < string.length) {
                var c = string.charCodeAt(i);
                if (!this.inRange(c, 0xD800, 0xDFFF)) {
                    cps.push(c);
                }
                else if (this.inRange(c, 0xDC00, 0xDFFF)) {
                    cps.push(0xFFFD);
                }
                else {
                    if (i === n - 1) {
                        cps.push(0xFFFD);
                    }
                    else {
                        var d = string.charCodeAt(i + 1);
                        if (this.inRange(d, 0xDC00, 0xDFFF)) {
                            var a = c & 0x3FF;
                            var b = d & 0x3FF;
                            i += 1;
                            cps.push(0x10000 + (a << 10) + b);
                        }
                        else {
                            cps.push(0xFFFD);
                        }
                    }
                }
                i += 1;
            }
            return cps;
        };
        ByteArray.BIG_ENDIAN = "bigEndian";
        ByteArray.LITTLE_ENDIAN = "littleEndian";
        ByteArray.SIZE_OF_BOOLEAN = 1;
        ByteArray.SIZE_OF_INT8 = 1;
        ByteArray.SIZE_OF_INT16 = 2;
        ByteArray.SIZE_OF_INT32 = 4;
        ByteArray.SIZE_OF_INT64 = 8;
        ByteArray.SIZE_OF_UINT8 = 1;
        ByteArray.SIZE_OF_UINT16 = 2;
        ByteArray.SIZE_OF_UINT32 = 4;
        ByteArray.SIZE_OF_UINT64 = 8;
        ByteArray.SIZE_OF_FLOAT32 = 4;
        ByteArray.SIZE_OF_FLOAT64 = 8;
        return ByteArray;
    }());
    exports.ByteArray = ByteArray;
});
define("src/nid/utils/BitArray", ["require", "exports", "src/nid/utils/ByteArray"], function (require, exports, ByteArray_1) {
    "use strict";
    var BitArray = (function (_super) {
        __extends(BitArray, _super);
        function BitArray(buffer) {
            _super.call(this, buffer);
            this.bitsPending = 0;
        }
        BitArray.prototype.readBits = function (bits, bitBuffer) {
            if (bitBuffer === void 0) { bitBuffer = 0; }
            if (bits == 0) {
                return bitBuffer;
            }
            var partial;
            var bitsConsumed;
            if (this.bitsPending > 0) {
                var _byte = this[this.position - 1] & (0xff >> (8 - this.bitsPending));
                bitsConsumed = Math.min(this.bitsPending, bits);
                this.bitsPending -= bitsConsumed;
                partial = _byte >> this.bitsPending;
            }
            else {
                bitsConsumed = Math.min(8, bits);
                this.bitsPending = 8 - bitsConsumed;
                partial = this.readUnsignedByte() >> this.bitsPending;
            }
            bits -= bitsConsumed;
            bitBuffer = (bitBuffer << bitsConsumed) | partial;
            return (bits > 0) ? this.readBits(bits, bitBuffer) : bitBuffer;
        };
        BitArray.prototype.writeBits = function (bits, value) {
            if (bits == 0) {
                return;
            }
            value &= (0xffffffff >>> (32 - bits));
            var bitsConsumed;
            if (this.bitsPending > 0) {
                if (this.bitsPending > bits) {
                    this[this.position - 1] |= value << (this.bitsPending - bits);
                    bitsConsumed = bits;
                    this.bitsPending -= bits;
                }
                else if (this.bitsPending == bits) {
                    this[this.position - 1] |= value;
                    bitsConsumed = bits;
                    this.bitsPending = 0;
                }
                else {
                    this[this.position - 1] |= value >> (bits - this.bitsPending);
                    bitsConsumed = this.bitsPending;
                    this.bitsPending = 0;
                }
            }
            else {
                bitsConsumed = Math.min(8, bits);
                this.bitsPending = 8 - bitsConsumed;
                this.writeByte((value >> (bits - bitsConsumed)) << this.bitsPending);
            }
            bits -= bitsConsumed;
            if (bits > 0) {
                this.writeBits(bits, value);
            }
        };
        BitArray.prototype.resetBitsPending = function () {
            this.bitsPending = 0;
        };
        BitArray.calculateMaxBits = function (signed, values) {
            var b = 0;
            var vmax = -2147483648;
            if (!signed) {
                for (var i = 0; i < values.length; i++) {
                    b |= values[i];
                }
            }
            else {
                for (var i = 0; i < values.length; i++) {
                    var svalue = values[i];
                    if (svalue >= 0) {
                        b |= svalue;
                    }
                    else {
                        b |= ~svalue << 1;
                    }
                    if (vmax < svalue) {
                        vmax = svalue;
                    }
                }
            }
            var bits = 0;
            if (b > 0) {
                bits = b.toString(2).length;
                if (signed && vmax > 0 && vmax.toString(2).length >= bits) {
                    bits++;
                }
            }
            return bits;
        };
        return BitArray;
    }(ByteArray_1.ByteArray));
    exports.BitArray = BitArray;
});
define("src/nid/utils/CompressionAlgorithm", ["require", "exports"], function (require, exports) {
    "use strict";
    var CompressionAlgorithm = (function () {
        function CompressionAlgorithm() {
        }
        CompressionAlgorithm.DEFLATE = "deflate";
        CompressionAlgorithm.LZMA = "lzma";
        CompressionAlgorithm.ZLIB = "zlib";
        return CompressionAlgorithm;
    }());
    exports.CompressionAlgorithm = CompressionAlgorithm;
});
define("src/nid/utils/LZMAHelper", ["require", "exports", "src/nid/lzma/LZMA"], function (require, exports, LZMA_4) {
    "use strict";
    var LZMAHelper = (function () {
        function LZMAHelper() {
        }
        LZMAHelper.init = function () {
            var command = 0;
            if (LZMAHelper.enableAsync) {
                LZMAHelper.decoderAsync = new Worker('LZMAWorker.min.js');
                LZMAHelper.decoderAsync.onmessage = function (e) {
                    if (command == 0) {
                        command = e.data;
                    }
                    else if (command == LZMAHelper.ENCODE) {
                        command = 0;
                    }
                    else if (command == LZMAHelper.DECODE) {
                        command = 0;
                        LZMAHelper.callback(e.data);
                        LZMAHelper.callback = null;
                    }
                };
            }
        };
        LZMAHelper.encode = function (data) {
            return null;
        };
        LZMAHelper.decodeBuffer = function (data) {
            return LZMAHelper.decoder.decode(new Uint8Array(data)).buffer;
        };
        LZMAHelper.decode = function (data) {
            return LZMAHelper.decoder.decode(data);
        };
        LZMAHelper.encodeAsync = function (data, _callback) {
            if (LZMAHelper.enableAsync) {
            }
            else {
                console.log('Error! Asynchronous encoding is disabled');
            }
        };
        LZMAHelper.decodeAsync = function (data, _callback) {
            if (LZMAHelper.enableAsync) {
                if (LZMAHelper.callback == null) {
                    LZMAHelper.callback = _callback;
                    LZMAHelper.decoderAsync.postMessage(LZMAHelper.DECODE);
                    LZMAHelper.decoderAsync.postMessage(data, [data]);
                }
                else {
                    console.log('Warning! Another LZMA decoding is running...');
                }
            }
            else {
                console.log('Error! Asynchronous decoding is disabled');
            }
        };
        LZMAHelper.decoder = new LZMA_4.LZMA();
        LZMAHelper.enableAsync = false;
        LZMAHelper.ENCODE = 1;
        LZMAHelper.DECODE = 2;
        return LZMAHelper;
    }());
    exports.LZMAHelper = LZMAHelper;
    LZMAHelper.init();
});
define("src/nid/utils/DataArray", ["require", "exports", "src/nid/utils/ByteArray", "src/nid/utils/CompressionAlgorithm", "src/nid/utils/LZMAHelper"], function (require, exports, ByteArray_2, CompressionAlgorithm_1, LZMAHelper_1) {
    "use strict";
    var DataArray = (function (_super) {
        __extends(DataArray, _super);
        function DataArray(buffer, offset, length) {
            if (offset === void 0) { offset = 0; }
            if (length === void 0) { length = 0; }
            _super.call(this, buffer, offset, length);
        }
        DataArray.prototype.compress = function (algorithm) {
            if (algorithm === void 0) { algorithm = CompressionAlgorithm_1.CompressionAlgorithm.LZMA; }
            if (algorithm == CompressionAlgorithm_1.CompressionAlgorithm.LZMA) {
                throw "Compression error! " + algorithm + " not implemented";
            }
            else {
                throw "Compression error! " + algorithm + " not implemented";
            }
        };
        DataArray.prototype.decompressBuffer = function (algorithm) {
            if (algorithm === void 0) { algorithm = CompressionAlgorithm_1.CompressionAlgorithm.LZMA; }
            if (algorithm == CompressionAlgorithm_1.CompressionAlgorithm.LZMA) {
                try {
                    this.buffer = LZMAHelper_1.LZMAHelper.decodeBuffer(this.buffer);
                }
                catch (e) {
                    throw "Uncompression error! " + algorithm + " not implemented";
                }
            }
            else if (algorithm == CompressionAlgorithm_1.CompressionAlgorithm.ZLIB) {
            }
            else {
                throw "Uncompression error! " + algorithm + " not implemented";
            }
        };
        DataArray.prototype.decompress = function (algorithm) {
            if (algorithm === void 0) { algorithm = CompressionAlgorithm_1.CompressionAlgorithm.LZMA; }
            if (algorithm == CompressionAlgorithm_1.CompressionAlgorithm.LZMA) {
                try {
                    this.array = LZMAHelper_1.LZMAHelper.decode(this.array);
                }
                catch (e) {
                    throw "Uncompression error! " + algorithm + " not implemented";
                }
            }
            else if (algorithm == CompressionAlgorithm_1.CompressionAlgorithm.ZLIB) {
            }
            else {
                throw "Uncompression error! " + algorithm + " not implemented";
            }
        };
        DataArray.prototype.compressAsync = function (algorithm, callback) {
            if (algorithm == CompressionAlgorithm_1.CompressionAlgorithm.LZMA) {
                throw "Compression error! " + algorithm + " not implemented";
            }
            else {
                throw "Compression error! " + algorithm + " not implemented";
            }
        };
        DataArray.prototype.decompressAsync = function (algorithm, callback) {
            if (algorithm === void 0) { algorithm = CompressionAlgorithm_1.CompressionAlgorithm.LZMA; }
            if (callback === void 0) { callback = null; }
            if (algorithm == CompressionAlgorithm_1.CompressionAlgorithm.LZMA) {
                LZMAHelper_1.LZMAHelper.decodeAsync(this.buffer, function (_data) {
                    this.buffer = _data;
                });
            }
            else {
                throw "Uncompression error! " + algorithm + " not implemented";
            }
        };
        DataArray.prototype.deflate = function () {
        };
        DataArray.prototype.inflate = function () {
        };
        DataArray.prototype.readBytesAsByteArray = function (_bytes, offset, length, createNewBuffer) {
            if (_bytes === void 0) { _bytes = null; }
            if (offset === void 0) { offset = 0; }
            if (length === void 0) { length = 0; }
            if (createNewBuffer === void 0) { createNewBuffer = false; }
            console.warn("[DEPRECATED] readBytesAsByteArray is deprecated use readBytesAsDataArray instead");
            return this.readBytesAsDataArray(_bytes, offset, length, createNewBuffer);
        };
        DataArray.prototype.readBytesAsDataArray = function (_bytes, offset, length, createNewBuffer) {
            if (_bytes === void 0) { _bytes = null; }
            if (offset === void 0) { offset = 0; }
            if (length === void 0) { length = 0; }
            if (createNewBuffer === void 0) { createNewBuffer = false; }
            if (length == 0) {
                length = this.bytesAvailable;
            }
            else if (!this.validate(length))
                return null;
            if (createNewBuffer) {
                _bytes = _bytes == null ? new DataArray(new ArrayBuffer(length)) : _bytes;
                for (var i = 0; i < length; i++) {
                    _bytes.data.setUint8(i + offset, this.data.getUint8(this.position++));
                }
            }
            else {
                _bytes = _bytes == null ? new DataArray(null) : _bytes;
                _bytes.dataView = new DataView(this.data.buffer, this.bufferOffset + this.position, length);
                this.position += length;
            }
            return _bytes;
        };
        DataArray.prototype.readObject = function () {
            return null;
        };
        DataArray.prototype.writeObject = function (value) {
        };
        DataArray.BIG_ENDIAN = "bigEndian";
        DataArray.LITTLE_ENDIAN = "littleEndian";
        return DataArray;
    }(ByteArray_2.ByteArray));
    exports.DataArray = DataArray;
});
define("core", ["require", "exports", "src/nid/zlib/ZLIB", "src/nid/lzma/LZMA", "src/nid/utils/ByteArray", "src/nid/utils/BitArray", "src/nid/utils/DataArray"], function (require, exports, ZLIB_1, LZMA_5, ByteArray_3, BitArray_1, DataArray_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    __export(ZLIB_1);
    __export(LZMA_5);
    __export(ByteArray_3);
    __export(BitArray_1);
    __export(DataArray_1);
});
define("src/nid/lzma/LZMAWorker", ["require", "exports", "src/nid/lzma/LZMA"], function (require, exports, LZMA_6) {
    "use strict";
    var LZMAWorker = (function () {
        function LZMAWorker() {
            this.command = 0;
            var _this = this;
            this.decoder = new LZMA_6.LZMA();
            addEventListener('message', function (e) {
                if (_this.command == 0) {
                    _this.command = e.data;
                }
                else if (_this.command == 1) {
                    _this.command = 0;
                }
                else if (_this.command == 2) {
                    _this.decode(e.data);
                }
            }, false);
        }
        LZMAWorker.prototype.decode = function (data) {
            var result = this.decoder.decode(new Uint8Array(data));
            postMessage(LZMAWorker.DECODE);
            postMessage(result.buffer, [result.buffer]);
        };
        LZMAWorker.ENCODE = 1;
        LZMAWorker.DECODE = 2;
        return LZMAWorker;
    }());
    exports.LZMAWorker = LZMAWorker;
    var zlma_w = new LZMAWorker();
});
define("src/nid/utils/HalfPrecisionWriter", ["require", "exports"], function (require, exports) {
    "use strict";
    var HalfPrecisionWriter = (function () {
        function HalfPrecisionWriter() {
        }
        HalfPrecisionWriter.write = function (value, data) {
            data.resetBitsPending();
            var dword;
            var sign;
            var exponent;
            var significand;
            var halfSignificand;
            var signedExponent;
            var result;
            var p;
            p = data.position;
            data.writeDouble(value);
            data.position -= 4;
            dword = data.readUnsignedInt();
            data.position = p;
            if ((dword & 0x7FFFFFFF) == 0) {
                result = dword >> 16;
            }
            else {
                sign = dword & 0x80000000;
                exponent = dword & 0x7FF00000;
                significand = dword & 0x000FFFFF;
                if (exponent == 0) {
                    result = sign >> 16;
                }
                else if (exponent == 0x7FF00000) {
                    if (significand == 0) {
                        result = ((sign >> 16) | 0x7C00);
                    }
                    else {
                        result = 0xFE00;
                    }
                }
                else {
                    sign = sign >> 16;
                    signedExponent = (exponent >> 20) - 1023 + 15;
                    if (signedExponent >= 0x1F) {
                        result = ((significand >> 16) | 0x7C00);
                    }
                    else if (signedExponent <= 0) {
                        if ((10 - signedExponent) > 21) {
                            halfSignificand = 0;
                        }
                        else {
                            significand |= 0x00100000;
                            halfSignificand = (significand >> (11 - signedExponent));
                            if ((significand >> (10 - signedExponent)) & 0x00000001) {
                                halfSignificand += 1;
                            }
                        }
                        result = (sign | halfSignificand);
                    }
                    else {
                        exponent = signedExponent << 10;
                        halfSignificand = significand >> 10;
                        if (significand & 0x00000200) {
                            result = (sign | exponent | halfSignificand) + 1;
                        }
                        else {
                            result = (sign | exponent | halfSignificand);
                        }
                    }
                }
            }
            data.writeShort(result);
            data.length = p + 2;
        };
        return HalfPrecisionWriter;
    }());
    exports.HalfPrecisionWriter = HalfPrecisionWriter;
});
define("src/nid/utils/StringUtils", ["require", "exports"], function (require, exports) {
    "use strict";
    var StringUtils = (function () {
        function StringUtils() {
        }
        StringUtils.encodeString = function (str) {
            if (!StringUtils.encoder) {
                if (window["TextEncoder"]) {
                    StringUtils.encoder = new window["TextEncoder"]();
                }
                else {
                    StringUtils.encoder = {
                        encode: function (str) {
                            var tmp = str.split('');
                            var data = new Uint8Array(tmp.length);
                            var i;
                            var il;
                            for (i = 0, il = tmp.length; i < il; i++) {
                                data[i] = (tmp[i].charCodeAt(0) & 0xff) >>> 0;
                            }
                            return data;
                        }
                    };
                }
            }
            return StringUtils.encoder.encode(str);
        };
        return StringUtils;
    }());
    exports.StringUtils = StringUtils;
});
define("src/nid/utils/ZLIBHelper", ["require", "exports", "src/nid/zlib/ZLIB"], function (require, exports, ZLIB_2) {
    "use strict";
    var ZLIBHelper = (function () {
        function ZLIBHelper() {
        }
        ZLIBHelper.init = function () {
            var command = 0;
            ZLIBHelper.decoderAsync.onmessage = function (e) {
                if (command == 0) {
                    command = e.data;
                }
                else if (command == ZLIBHelper.ENCODE) {
                    command = 0;
                }
                else if (command == ZLIBHelper.DECODE) {
                    command = 0;
                    ZLIBHelper.callback(e.data);
                    ZLIBHelper.callback = null;
                }
            };
        };
        ZLIBHelper.encodeBuffer = function (data) {
            throw "ZLIB encoder not implemented!";
        };
        ZLIBHelper.encode = function (data) {
            throw "ZLIB encoder not implemented!";
        };
        ZLIBHelper.decodeBuffer = function (data) {
            return ZLIBHelper.decoder.decode(new Uint8Array(data)).buffer;
        };
        ZLIBHelper.decode = function (data) {
            return ZLIBHelper.decoder.decode(data);
        };
        ZLIBHelper.encodeBufferAsync = function (data, _callback) {
        };
        ZLIBHelper.decodeBufferAsync = function (data, _callback) {
            if (ZLIBHelper.callback == null) {
                ZLIBHelper.callback = _callback;
                ZLIBHelper.decoderAsync.postMessage(ZLIBHelper.DECODE);
                ZLIBHelper.decoderAsync.postMessage(data, [data]);
            }
            else {
                console.log('Warning! Another ZLIB decoding is running...');
            }
        };
        ZLIBHelper.decoder = new ZLIB_2.ZLIB();
        ZLIBHelper.decoderAsync = new Worker('ZLIBWorker.min.js');
        ZLIBHelper.ENCODE = 1;
        ZLIBHelper.DECODE = 2;
        return ZLIBHelper;
    }());
    exports.ZLIBHelper = ZLIBHelper;
    ZLIBHelper.init();
});
define("src/nid/zlib/CRC32", ["require", "exports"], function (require, exports) {
    "use strict";
    var CRC32 = (function () {
        function CRC32() {
        }
        CRC32.single = function (num, crc) {
            return (CRC32.Table[(num ^ crc) & 0xff] ^ (num >>> 8)) >>> 0;
        };
        CRC32.calc = function (data, pos, length) {
            return CRC32.update(data, 0, pos, length);
        };
        CRC32.update = function (data, crc, pos, length) {
            var table = CRC32.Table;
            var i = (typeof pos === 'number') ? pos : (pos = 0);
            var il = (typeof length === 'number') ? length : data.length;
            crc ^= 0xffffffff;
            for (i = il & 7; i--; ++pos) {
                crc = (crc >>> 8) ^ table[(crc ^ data[pos]) & 0xff];
            }
            for (i = il >> 3; i--; pos += 8) {
                crc = (crc >>> 8) ^ table[(crc ^ data[pos]) & 0xff];
                crc = (crc >>> 8) ^ table[(crc ^ data[pos + 1]) & 0xff];
                crc = (crc >>> 8) ^ table[(crc ^ data[pos + 2]) & 0xff];
                crc = (crc >>> 8) ^ table[(crc ^ data[pos + 3]) & 0xff];
                crc = (crc >>> 8) ^ table[(crc ^ data[pos + 4]) & 0xff];
                crc = (crc >>> 8) ^ table[(crc ^ data[pos + 5]) & 0xff];
                crc = (crc >>> 8) ^ table[(crc ^ data[pos + 6]) & 0xff];
                crc = (crc >>> 8) ^ table[(crc ^ data[pos + 7]) & 0xff];
            }
            return (crc ^ 0xffffffff) >>> 0;
        };
        CRC32.ZLIB_CRC32_COMPACT = false;
        CRC32.Table = CRC32.ZLIB_CRC32_COMPACT ? (function () {
            var table = new Uint32Array(256);
            var c;
            var i;
            var j;
            for (i = 0; i < 256; ++i) {
                c = i;
                for (j = 0; j < 8; ++j) {
                    c = (c & 1) ? (0xedB88320 ^ (c >>> 1)) : (c >>> 1);
                }
                table[i] = c >>> 0;
            }
            return table;
        })() : new Uint32Array(CRC32.Table_);
        CRC32.Table_ = [
            0x00000000, 0x77073096, 0xee0e612c, 0x990951ba, 0x076dc419, 0x706af48f,
            0xe963a535, 0x9e6495a3, 0x0edb8832, 0x79dcb8a4, 0xe0d5e91e, 0x97d2d988,
            0x09b64c2b, 0x7eb17cbd, 0xe7b82d07, 0x90bf1d91, 0x1db71064, 0x6ab020f2,
            0xf3b97148, 0x84be41de, 0x1adad47d, 0x6ddde4eb, 0xf4d4b551, 0x83d385c7,
            0x136c9856, 0x646ba8c0, 0xfd62f97a, 0x8a65c9ec, 0x14015c4f, 0x63066cd9,
            0xfa0f3d63, 0x8d080df5, 0x3b6e20c8, 0x4c69105e, 0xd56041e4, 0xa2677172,
            0x3c03e4d1, 0x4b04d447, 0xd20d85fd, 0xa50ab56b, 0x35b5a8fa, 0x42b2986c,
            0xdbbbc9d6, 0xacbcf940, 0x32d86ce3, 0x45df5c75, 0xdcd60dcf, 0xabd13d59,
            0x26d930ac, 0x51de003a, 0xc8d75180, 0xbfd06116, 0x21b4f4b5, 0x56b3c423,
            0xcfba9599, 0xb8bda50f, 0x2802b89e, 0x5f058808, 0xc60cd9b2, 0xb10be924,
            0x2f6f7c87, 0x58684c11, 0xc1611dab, 0xb6662d3d, 0x76dc4190, 0x01db7106,
            0x98d220bc, 0xefd5102a, 0x71b18589, 0x06b6b51f, 0x9fbfe4a5, 0xe8b8d433,
            0x7807c9a2, 0x0f00f934, 0x9609a88e, 0xe10e9818, 0x7f6a0dbb, 0x086d3d2d,
            0x91646c97, 0xe6635c01, 0x6b6b51f4, 0x1c6c6162, 0x856530d8, 0xf262004e,
            0x6c0695ed, 0x1b01a57b, 0x8208f4c1, 0xf50fc457, 0x65b0d9c6, 0x12b7e950,
            0x8bbeb8ea, 0xfcb9887c, 0x62dd1ddf, 0x15da2d49, 0x8cd37cf3, 0xfbd44c65,
            0x4db26158, 0x3ab551ce, 0xa3bc0074, 0xd4bb30e2, 0x4adfa541, 0x3dd895d7,
            0xa4d1c46d, 0xd3d6f4fb, 0x4369e96a, 0x346ed9fc, 0xad678846, 0xda60b8d0,
            0x44042d73, 0x33031de5, 0xaa0a4c5f, 0xdd0d7cc9, 0x5005713c, 0x270241aa,
            0xbe0b1010, 0xc90c2086, 0x5768b525, 0x206f85b3, 0xb966d409, 0xce61e49f,
            0x5edef90e, 0x29d9c998, 0xb0d09822, 0xc7d7a8b4, 0x59b33d17, 0x2eb40d81,
            0xb7bd5c3b, 0xc0ba6cad, 0xedb88320, 0x9abfb3b6, 0x03b6e20c, 0x74b1d29a,
            0xead54739, 0x9dd277af, 0x04db2615, 0x73dc1683, 0xe3630b12, 0x94643b84,
            0x0d6d6a3e, 0x7a6a5aa8, 0xe40ecf0b, 0x9309ff9d, 0x0a00ae27, 0x7d079eb1,
            0xf00f9344, 0x8708a3d2, 0x1e01f268, 0x6906c2fe, 0xf762575d, 0x806567cb,
            0x196c3671, 0x6e6b06e7, 0xfed41b76, 0x89d32be0, 0x10da7a5a, 0x67dd4acc,
            0xf9b9df6f, 0x8ebeeff9, 0x17b7be43, 0x60b08ed5, 0xd6d6a3e8, 0xa1d1937e,
            0x38d8c2c4, 0x4fdff252, 0xd1bb67f1, 0xa6bc5767, 0x3fb506dd, 0x48b2364b,
            0xd80d2bda, 0xaf0a1b4c, 0x36034af6, 0x41047a60, 0xdf60efc3, 0xa867df55,
            0x316e8eef, 0x4669be79, 0xcb61b38c, 0xbc66831a, 0x256fd2a0, 0x5268e236,
            0xcc0c7795, 0xbb0b4703, 0x220216b9, 0x5505262f, 0xc5ba3bbe, 0xb2bd0b28,
            0x2bb45a92, 0x5cb36a04, 0xc2d7ffa7, 0xb5d0cf31, 0x2cd99e8b, 0x5bdeae1d,
            0x9b64c2b0, 0xec63f226, 0x756aa39c, 0x026d930a, 0x9c0906a9, 0xeb0e363f,
            0x72076785, 0x05005713, 0x95bf4a82, 0xe2b87a14, 0x7bb12bae, 0x0cb61b38,
            0x92d28e9b, 0xe5d5be0d, 0x7cdcefb7, 0x0bdbdf21, 0x86d3d2d4, 0xf1d4e242,
            0x68ddb3f8, 0x1fda836e, 0x81be16cd, 0xf6b9265b, 0x6fb077e1, 0x18b74777,
            0x88085ae6, 0xff0f6a70, 0x66063bca, 0x11010b5c, 0x8f659eff, 0xf862ae69,
            0x616bffd3, 0x166ccf45, 0xa00ae278, 0xd70dd2ee, 0x4e048354, 0x3903b3c2,
            0xa7672661, 0xd06016f7, 0x4969474d, 0x3e6e77db, 0xaed16a4a, 0xd9d65adc,
            0x40df0b66, 0x37d83bf0, 0xa9bcae53, 0xdebb9ec5, 0x47b2cf7f, 0x30b5ffe9,
            0xbdbdf21c, 0xcabac28a, 0x53b39330, 0x24b4a3a6, 0xbad03605, 0xcdd70693,
            0x54de5729, 0x23d967bf, 0xb3667a2e, 0xc4614ab8, 0x5d681b02, 0x2a6f2b94,
            0xb40bbe37, 0xc30c8ea1, 0x5a05df1b, 0x2d02ef8d
        ];
        return CRC32;
    }());
    exports.CRC32 = CRC32;
});
//# sourceMappingURL=xdata.js.map
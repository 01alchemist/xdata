import {Huffman} from "./Huffman";
"use strict";
/**
 * ZLIB Decoder
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 */

export class RawInflate {

    private ZLIB_RAW_INFLATE_BUFFER_SIZE:number = 0x8000; // [ 0x8000 >= ZLIB_BUFFER_BLOCK_SIZE ]

    /** @type {!(Array.<number>|Uint8Array)} inflated buffer */
    public buffer:Uint8Array;
    public blocks;
    public bufferSize:number;//block size
    public totalpos:number;//total output buffer pointer
    public ip:number;//input buffer pointer
    public bitsbuf:number;//bit stream reader buffer
    public bitsbuflen:number;//bit stream reader buffer size
    public input:Uint8Array;//input buffer
    public output:Uint8Array;//output buffer
    public op:number;//output buffer pointer
    public bfinal:boolean;//is final block flag
    public bufferType:any;//buffer management
    public resize:boolean;//resize flag for memory size optimization
    public prev;//previous RLE value
    public currentLitlenTable;

    static BufferType = {
        BLOCK: 0,
        ADAPTIVE: 1
    };
    //max backward length for LZ77
    static MaxBackwardLength = 32768;
    //max copy length for LZ77
    static MaxCopyLength = 32768;
    //huffman order
    static Order:Uint16Array = new Uint16Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
    //huffman length code table.
    static LengthCodeTable:Uint16Array = new Uint16Array([
        0x0003, 0x0004, 0x0005, 0x0006, 0x0007, 0x0008, 0x0009, 0x000a, 0x000b,
        0x000d, 0x000f, 0x0011, 0x0013, 0x0017, 0x001b, 0x001f, 0x0023, 0x002b,
        0x0033, 0x003b, 0x0043, 0x0053, 0x0063, 0x0073, 0x0083, 0x00a3, 0x00c3,
        0x00e3, 0x0102, 0x0102, 0x0102
    ]);
    //huffman length extra-bits table.
    static LengthExtraTable:Uint8Array = new Uint8Array([
        0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5,
        5, 5, 0, 0, 0
    ]);
    //huffman dist code table.
    static DistCodeTable:Uint16Array = new Uint16Array([
        0x0001, 0x0002, 0x0003, 0x0004, 0x0005, 0x0007, 0x0009, 0x000d, 0x0011,
        0x0019, 0x0021, 0x0031, 0x0041, 0x0061, 0x0081, 0x00c1, 0x0101, 0x0181,
        0x0201, 0x0301, 0x0401, 0x0601, 0x0801, 0x0c01, 0x1001, 0x1801, 0x2001,
        0x3001, 0x4001, 0x6001
    ]);
    //huffman dist extra-bits table.
    static DistExtraTable:Uint8Array = new Uint8Array([
        0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11,
        11, 12, 12, 13, 13
    ]);
    //fixed huffman length code table
    static FixedLiteralLengthTable:any;
    //fixed huffman distance code table
    static FixedDistanceTable:any;

    constructor(input:Uint8Array, opt_params) {

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
            RawInflate.FixedLiteralLengthTable = Huffman.buildHuffmanTable(lengths);
        }
        if (!RawInflate.FixedDistanceTable) {
            var lengths = new Uint8Array(30);
            var i, il;

            for (i = 0, il = lengths.length; i < il; ++i) {
                lengths[i] = 5;
            }

            RawInflate.FixedDistanceTable = Huffman.buildHuffmanTable(lengths);
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

        // option parameters
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

        // initialize
        switch (this.bufferType) {
            case RawInflate.BufferType.BLOCK:
                this.op = RawInflate.MaxBackwardLength;
                this.output =
                    new Uint8Array(
                        RawInflate.MaxBackwardLength +
                        this.bufferSize +
                        RawInflate.MaxCopyLength
                    );
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

    public decompress() {
        while (!this.bfinal) {
            this.parseBlock();
        }

        return this.concatBuffer();
    }

    private parseBlock() {
        /** @type {number} header */
        var hdr = this.readBits(3);

        // BFINAL
        if (hdr & 0x1) {
            this.bfinal = true;
        }

        // BTYPE
        hdr >>>= 1;
        switch (hdr) {
            // uncompressed
            case 0:
                this.parseUncompressedBlock();
                break;
            // fixed huffman
            case 1:
                this.parseFixedHuffmanBlock();
                break;
            // dynamic huffman
            case 2:
                this.parseDynamicHuffmanBlock();
                break;
            // reserved or other
            default:
                throw new Error('unknown BTYPE: ' + hdr);
        }
    }

    //read inflate bits
    private readBits(length) {
        var bitsbuf = this.bitsbuf;
        var bitsbuflen = this.bitsbuflen;
        var input = this.input;
        var ip = this.ip;

        /** @type {number} */
        var inputLength = input.length;
        /** @type {number} input and output byte. */
        var octet;

        // not enough buffer
        while (bitsbuflen < length) {
            // input byte
            if (ip >= inputLength) {
                throw new Error('input buffer is broken');
            }

            // concat octet
            bitsbuf |= input[ip++] << bitsbuflen;
            bitsbuflen += 8;
        }

        // output byte
        octet = bitsbuf & /* MASK */ ((1 << length) - 1);
        bitsbuf >>>= length;
        bitsbuflen -= length;

        this.bitsbuf = bitsbuf;
        this.bitsbuflen = bitsbuflen;
        this.ip = ip;

        return octet;
    }

    //read huffman code using table
    private readCodeByTable(table) {
        var bitsbuf = this.bitsbuf;
        var bitsbuflen = this.bitsbuflen;
        var input = this.input;
        var ip = this.ip;

        /** @type {number} */
        var inputLength = input.length;
        /** @type {!(Array.<number>|Uint8Array)} huffman code table */
        var codeTable = table[0];
        /** @type {number} */
        var maxCodeLength = table[1];
        /** @type {number} code length & code (16bit, 16bit) */
        var codeWithLength;
        /** @type {number} code bits length */
        var codeLength;

        // not enough buffer
        while (bitsbuflen < maxCodeLength) {
            if (ip >= inputLength) {
                break;
            }
            bitsbuf |= input[ip++] << bitsbuflen;
            bitsbuflen += 8;
        }

        // read max length
        codeWithLength = codeTable[bitsbuf & ((1 << maxCodeLength) - 1)];
        codeLength = codeWithLength >>> 16;

        this.bitsbuf = bitsbuf >> codeLength;
        this.bitsbuflen = bitsbuflen - codeLength;
        this.ip = ip;

        return codeWithLength & 0xffff;
    }

    private parseUncompressedBlock() {
        var input = this.input;
        var ip = this.ip;
        var output = this.output;
        var op = this.op;

        /** @type {number} */
        var inputLength = input.length;
        /** @type {number} block length */
        var len;
        /** @type {number} number for check block length */
        var nlen;
        /** @type {number} output buffer length */
        var olength = output.length;
        /** @type {number} copy counter */
        var preCopy;

        // skip buffered header bits
        this.bitsbuf = 0;
        this.bitsbuflen = 0;

        // len
        if (ip + 1 >= inputLength) {
            throw new Error('invalid uncompressed block header: LEN');
        }
        len = input[ip++] | (input[ip++] << 8);

        // nlen
        if (ip + 1 >= inputLength) {
            throw new Error('invalid uncompressed block header: NLEN');
        }
        nlen = input[ip++] | (input[ip++] << 8);

        // check len & nlen
        if (len === ~nlen) {
            throw new Error('invalid uncompressed block header: length verify');
        }

        // check size
        if (ip + len > input.length) {
            throw new Error('input buffer is broken');
        }

        // expand buffer
        switch (this.bufferType) {
            case RawInflate.BufferType.BLOCK:
                // pre copy
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
                    output = this.expandBuffer({fixRatio: 2});
                }
                break;
            default:
                throw new Error('invalid inflate mode');
        }

        // copy
        output.set(input.subarray(ip, ip + len), op);
        op += len;
        ip += len;

        this.ip = ip;
        this.op = op;
        this.output = output;
    }

    private parseFixedHuffmanBlock() {
        this.decodeHuffman(
            RawInflate.FixedLiteralLengthTable,
            RawInflate.FixedDistanceTable
        );
    }

    private parseDynamicHuffmanBlock() {
        /** @type {number} number of literal and length codes. */
        var hlit = this.readBits(5) + 257;
        /** @type {number} number of distance codes. */
        var hdist = this.readBits(5) + 1;
        /** @type {number} number of code lengths. */
        var hclen = this.readBits(4) + 4;
        /** @type {!(Uint8Array|Array.<number>)} code lengths. */
        var codeLengths =
            new Uint8Array(RawInflate.Order.length);
        /** @type {!Array} code lengths table. */
        var codeLengthsTable;
        /** @type {!(Uint8Array|Array.<number>)} literal and length code lengths. */
        var litlenLengths;
        /** @type {!(Uint8Array|Array.<number>)} distance code lengths. */
        var distLengths;
        /** @type {number} loop counter. */
        var i;

        // decode code lengths
        for (i = 0; i < hclen; ++i) {
            codeLengths[RawInflate.Order[i]] = this.readBits(3);
        }
        codeLengthsTable = Huffman.buildHuffmanTable(codeLengths);

        /**
         * decode function
         * @param {number} num number of lengths.
         * @param {!Array} table code lengths table.
         * @param {!(Uint8Array|Array.<number>)} lengths code lengths buffer.
         * @return {!(Uint8Array|Array.<number>)} code lengths buffer.
         */


            // literal and length code
        litlenLengths = new Uint8Array(hlit);

        // distance code
        distLengths = new Uint8Array(hdist);

        this.prev = 0;
        this.decodeHuffman(
            Huffman.buildHuffmanTable(this.decode.call(this, hlit, codeLengthsTable, litlenLengths)),
            Huffman.buildHuffmanTable(this.decode.call(this, hdist, codeLengthsTable, distLengths))
        );
    }

    private decode(num, table, lengths) {
        var code:number;
        var prev:number = this.prev;
        var repeat:number;
        var i:number;

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
    }

    private decodeHuffman(litlen, dist) {
        var output = this.output;
        var op = this.op;

        this.currentLitlenTable = litlen;

        /** @type {number} output position limit. */
        var olength = output.length - RawInflate.MaxCopyLength;
        /** @type {number} huffman code. */
        var code;
        /** @type {number} table index. */
        var ti;
        /** @type {number} huffman code distination. */
        var codeDist;
        /** @type {number} huffman code length. */
        var codeLength;

        while ((code = this.readCodeByTable(litlen)) !== 256) {
            // literal
            if (code < 256) {
                if (op >= olength) {
                    this.op = op;
                    output = this.expandBuffer();
                    op = this.op;
                }
                output[op++] = code;

                continue;
            }

            // length code
            ti = code - 257;
            codeLength = RawInflate.LengthCodeTable[ti];
            if (RawInflate.LengthExtraTable[ti] > 0) {
                codeLength += this.readBits(RawInflate.LengthExtraTable[ti]);
            }

            // dist code
            code = this.readCodeByTable(dist);
            codeDist = RawInflate.DistCodeTable[code];
            if (RawInflate.DistExtraTable[code] > 0) {
                codeDist += this.readBits(RawInflate.DistExtraTable[code]);
            }

            // lz77 decode
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
    }

    private decodeHuffmanAdaptive(litlen, dist) {
        var output = this.output;
        var op = this.op;

        this.currentLitlenTable = litlen;

        /** @type {number} output position limit. */
        var olength = output.length;
        /** @type {number} huffman code. */
        var code;
        /** @type {number} table index. */
        var ti;
        /** @type {number} huffman code distination. */
        var codeDist;
        /** @type {number} huffman code length. */
        var codeLength;

        while ((code = this.readCodeByTable(litlen)) !== 256) {
            // literal
            if (code < 256) {
                if (op >= olength) {
                    output = this.expandBuffer();
                    olength = output.length;
                }
                output[op++] = code;

                continue;
            }

            // length code
            ti = code - 257;
            codeLength = RawInflate.LengthCodeTable[ti];
            if (RawInflate.LengthExtraTable[ti] > 0) {
                codeLength += this.readBits(RawInflate.LengthExtraTable[ti]);
            }

            // dist code
            code = this.readCodeByTable(dist);
            codeDist = RawInflate.DistCodeTable[code];
            if (RawInflate.DistExtraTable[code] > 0) {
                codeDist += this.readBits(RawInflate.DistExtraTable[code]);
            }

            // lz77 decode
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
    }

    private expandBuffer(opt_param = null) {
        /** @type {!(Array.<number>|Uint8Array)} store buffer. */
        var buffer =
            new Uint8Array(
                this.op - RawInflate.MaxBackwardLength
            );
        /** @type {number} backward base point */
        var backward = this.op - RawInflate.MaxBackwardLength;
        /** @type {number} copy index. */
        var i;
        /** @type {number} copy limit */
        var il;

        var output = this.output;

        // copy to output buffer
        buffer.set(output.subarray(RawInflate.MaxBackwardLength, buffer.length));

        this.blocks.push(buffer);
        this.totalpos += buffer.length;

        // copy to backward buffer
        output.set(
            output.subarray(backward, backward + RawInflate.MaxBackwardLength)
        );

        this.op = RawInflate.MaxBackwardLength;

        return output;
    }

    private expandBufferAdaptive(opt_param) {
        /** @type {!(Array.<number>|Uint8Array)} store buffer. */
        var buffer;
        /** @type {number} expantion ratio. */
        var ratio = (this.input.length / this.ip + 1) | 0;
        /** @type {number} maximum number of huffman code. */
        var maxHuffCode;
        /** @type {number} new output buffer size. */
        var newSize;
        /** @type {number} max inflate size. */
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

        // calculate new buffer size
        if (ratio < 2) {
            maxHuffCode =
                (input.length - this.ip) / this.currentLitlenTable[2];
            maxInflateSize = (maxHuffCode / 2 * 258) | 0;
            newSize = maxInflateSize < output.length ?
            output.length + maxInflateSize :
            output.length << 1;
        } else {
            newSize = output.length * ratio;
        }

        // buffer expantion
        buffer = new Uint8Array(newSize);
        buffer.set(output);

        this.output = buffer;

        return this.output;
    }

    private concatBuffer() {
        /** @type {number} buffer pointer. */
        var pos = 0;
        /** @type {number} buffer pointer. */
        var limit = this.totalpos + (this.op - RawInflate.MaxBackwardLength);
        /** @type {!(Array.<number>|Uint8Array)} output block array. */
        var output = this.output;
        /** @type {!Array} blocks array. */
        var blocks = this.blocks;
        /** @type {!(Array.<number>|Uint8Array)} output block array. */
        var block;
        /** @type {!(Array.<number>|Uint8Array)} output buffer. */
        var buffer = new Uint8Array(limit);
        /** @type {number} loop counter. */
        var i;
        /** @type {number} loop limiter. */
        var il;
        /** @type {number} loop counter. */
        var j;
        /** @type {number} loop limiter. */
        var jl;

        // single buffer
        if (blocks.length === 0) {
            return this.output.subarray(RawInflate.MaxBackwardLength, this.op)
        }

        // copy to buffer
        for (i = 0, il = blocks.length; i < il; ++i) {
            block = blocks[i];
            for (j = 0, jl = block.length; j < jl; ++j) {
                buffer[pos++] = block[j];
            }
        }

        // current buffer
        for (i = RawInflate.MaxBackwardLength, il = this.op; i < il; ++i) {
            buffer[pos++] = output[i];
        }

        this.blocks = [];
        this.buffer = buffer;

        return this.buffer;
    }

    private concatBufferDynamic() {
        /** @type {Array.<number>|Uint8Array} output buffer. */
        var buffer;
        var op = this.op;

        if (this.resize) {
            buffer = new Uint8Array(op);
            buffer.set(this.output.subarray(0, op));
        } else {
            buffer = this.output.subarray(0, op);
        }

        this.buffer = buffer;

        return this.buffer;
    }
}
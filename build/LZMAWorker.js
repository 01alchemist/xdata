var nid;
(function (nid) {
    (function (utils) {
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
        })();
        utils.MEMORY = MEMORY;
    })(nid.utils || (nid.utils = {}));
    var utils = nid.utils;
})(nid || (nid = {}));
///<reference path="LZMA.lib.d.ts" />
var nid;
(function (nid) {
    /**
    * LZMA Decoder
    * @author Nidin Vinayakan | nidinthb@gmail.com
    */
    var MEMORY = nid.utils.MEMORY;

    var LzmaDecoder = (function () {
        function LzmaDecoder() {
            this.posSlotDecoder = nid.BitTreeDecoder.constructArray(6, nid.LZMA.kNumLenToPosStates); //6
            this.alignDecoder = new nid.BitTreeDecoder(nid.LZMA.kNumAlignBits);
            this.posDecoders = new Uint16Array(1 + nid.LZMA.kNumFullDistances - nid.LZMA.kEndPosModelIndex);

            this.isMatch = new Uint16Array(nid.LZMA.kNumStates << nid.LZMA.kNumPosBitsMax);
            this.isRep = new Uint16Array(nid.LZMA.kNumStates);
            this.isRepG0 = new Uint16Array(nid.LZMA.kNumStates);
            this.isRepG1 = new Uint16Array(nid.LZMA.kNumStates);
            this.isRepG2 = new Uint16Array(nid.LZMA.kNumStates);
            this.isRep0Long = new Uint16Array(nid.LZMA.kNumStates << nid.LZMA.kNumPosBitsMax);

            this.lenDecoder = new nid.LenDecoder();
            this.repLenDecoder = new nid.LenDecoder();
            this.rangeDec = new nid.RangeDecoder();
            this.outWindow = new nid.OutWindow();
        }
        LzmaDecoder.prototype.init = function () {
            this.loc1 = MEMORY.getUint32() | 0;
            this.loc2 = MEMORY.getUint32() | 0;
            this.matchBitI = MEMORY.getUint16() | 0;
            this.matchByteI = MEMORY.getUint16() | 0;
            this.bitI = MEMORY.getUint16() | 0;
            this.symbolI = MEMORY.getUint16() | 0;
            this.prevByteI = MEMORY.getUint16() | 0;
            this.litStateI = MEMORY.getUint16() | 0;

            this.initLiterals();
            this.initDist();

            nid.LZMA.INIT_PROBS(this.isMatch);
            nid.LZMA.INIT_PROBS(this.isRep);
            nid.LZMA.INIT_PROBS(this.isRepG0);
            nid.LZMA.INIT_PROBS(this.isRepG1);
            nid.LZMA.INIT_PROBS(this.isRepG2);
            nid.LZMA.INIT_PROBS(this.isRep0Long);

            this.lenDecoder.init();
            this.repLenDecoder.init();
        };
        LzmaDecoder.prototype.create = function () {
            this.outWindow.create(this.dictSize);
            this.createLiterals();
        };

        //Private
        LzmaDecoder.prototype.createLiterals = function () {
            this.litProbs = new Uint16Array(0x300 << (this.lc + this.lp));
        };
        LzmaDecoder.prototype.initLiterals = function () {
            var num = 0x300 << (this.lc + this.lp);
            for (var i = 0; i < num; i++) {
                this.litProbs[i] = nid.LZMA.PROB_INIT_VAL;
            }
        };
        LzmaDecoder.prototype.decodeLiteral = function (state, rep0) {
            MEMORY.u16[this.prevByteI] = 0; //unsigned byte
            if (!this.outWindow.isEmpty())
                MEMORY.u16[this.prevByteI] = this.outWindow.getByte(1);

            MEMORY.u16[this.symbolI] = 1;
            MEMORY.u16[this.litStateI] = ((this.outWindow.totalPos & ((1 << this.lp) - 1)) << this.lc) + (MEMORY.u16[this.prevByteI] >>> (8 - this.lc));
            var probsOffset = (0x300 * MEMORY.u16[this.litStateI]) | 0;

            if (state >= 7) {
                MEMORY.u16[this.matchByteI] = this.outWindow.getByte(rep0 + 1);
                do {
                    MEMORY.u16[this.matchBitI] = (MEMORY.u16[this.matchByteI] >>> 7) & 1;
                    MEMORY.u16[this.matchByteI] <<= 1;
                    MEMORY.u16[this.bitI] = this.rangeDec.decodeBit(this.litProbs, probsOffset + ((1 + MEMORY.u16[this.matchBitI]) << 8) + MEMORY.u16[this.symbolI]);
                    MEMORY.u16[this.symbolI] = (MEMORY.u16[this.symbolI] << 1) | MEMORY.u16[this.bitI];
                    if (MEMORY.u16[this.matchBitI] != MEMORY.u16[this.bitI])
                        break;
                } while(MEMORY.u16[this.symbolI] < 0x100);
            }
            while (MEMORY.u16[this.symbolI] < 0x100) {
                MEMORY.u16[this.symbolI] = (MEMORY.u16[this.symbolI] << 1) | this.rangeDec.decodeBit(this.litProbs, probsOffset + MEMORY.u16[this.symbolI]);
            }
            this.outWindow.putByte(MEMORY.u16[this.symbolI] - 0x100);
        };

        LzmaDecoder.prototype.decodeDistance = function (len) {
            var lenState = len;
            if (lenState > nid.LZMA.kNumLenToPosStates - 1)
                lenState = nid.LZMA.kNumLenToPosStates - 1;

            var posSlot = this.posSlotDecoder[lenState].decode(this.rangeDec);
            if (posSlot < 4)
                return posSlot;

            var numDirectBits = ((posSlot >>> 1) - 1);
            MEMORY.u32[this.loc1] = ((2 | (posSlot & 1)) << numDirectBits); //UInt32
            if (posSlot < nid.LZMA.kEndPosModelIndex) {
                MEMORY.u32[this.loc1] += nid.LZMA.BitTreeReverseDecode(this.posDecoders, numDirectBits, this.rangeDec, MEMORY.u32[this.loc1] - posSlot);
            } else {
                MEMORY.u32[this.loc1] += this.rangeDec.decodeDirectBits(numDirectBits - nid.LZMA.kNumAlignBits) << nid.LZMA.kNumAlignBits;
                MEMORY.u32[this.loc1] += this.alignDecoder.reverseDecode(this.rangeDec);
            }
            return MEMORY.u32[this.loc1];
        };
        LzmaDecoder.prototype.initDist = function () {
            for (var i = 0; i < nid.LZMA.kNumLenToPosStates; i++) {
                this.posSlotDecoder[i].init();
            }
            this.alignDecoder.init();
            nid.LZMA.INIT_PROBS(this.posDecoders);
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

            if (this.dictSize < nid.LZMA.LZMA_DIC_MIN) {
                this.dictSize = nid.LZMA.LZMA_DIC_MIN;
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

            for (; ;) {
                if (unpackSizeDefined && unpackSize == 0 && !this.markerIsMandatory) {
                    if (this.rangeDec.isFinishedOK()) {
                        return nid.LZMA.LZMA_RES_FINISHED_WITHOUT_MARKER;
                    }
                }

                var posState = this.outWindow.totalPos & ((1 << this.pb) - 1);

                if (this.rangeDec.decodeBit(this.isMatch, (state << nid.LZMA.kNumPosBitsMax) + posState) == 0) {
                    if (unpackSizeDefined && unpackSize == 0) {
                        return nid.LZMA.LZMA_RES_ERROR;
                    }
                    this.decodeLiteral(state, rep0);
                    state = this.updateState_Literal(state);
                    unpackSize--;
                    continue;
                }

                var len;

                if (this.rangeDec.decodeBit(this.isRep, state) != 0) {
                    if (unpackSizeDefined && unpackSize == 0) {
                        return nid.LZMA.LZMA_RES_ERROR;
                    }
                    if (this.outWindow.isEmpty()) {
                        return nid.LZMA.LZMA_RES_ERROR;
                    }
                    if (this.rangeDec.decodeBit(this.isRepG0, state) == 0) {
                        if (this.rangeDec.decodeBit(this.isRep0Long, (state << nid.LZMA.kNumPosBitsMax) + posState) == 0) {
                            state = this.updateState_ShortRep(state);
                            this.outWindow.putByte(this.outWindow.getByte(rep0 + 1));
                            unpackSize--;
                            continue;
                        }
                    } else {
                        var dist;
                        if (this.rangeDec.decodeBit(this.isRepG1, state) == 0) {
                            dist = rep1;
                        } else {
                            if (this.rangeDec.decodeBit(this.isRepG2, state) == 0) {
                                dist = rep2;
                            } else {
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
                } else {
                    rep3 = rep2;
                    rep2 = rep1;
                    rep1 = rep0;
                    len = this.lenDecoder.decode(this.rangeDec, posState);
                    state = this.updateState_Match(state);
                    rep0 = this.decodeDistance(len);
                    if (rep0 == 0xFFFFFFFF) {
                        return this.rangeDec.isFinishedOK() ? nid.LZMA.LZMA_RES_FINISHED_WITH_MARKER : nid.LZMA.LZMA_RES_ERROR;
                    }

                    if (unpackSizeDefined && unpackSize == 0) {
                        return nid.LZMA.LZMA_RES_ERROR;
                    }
                    if (rep0 >= this.dictSize || !this.outWindow.checkDistance(rep0)) {
                        return nid.LZMA.LZMA_RES_ERROR;
                    }
                }
                len += nid.LZMA.kMatchMinLen;
                var isError = false;
                if (unpackSizeDefined && unpackSize < len) {
                    len = unpackSize;
                    isError = true;
                }
                this.outWindow.copyMatch(rep0 + 1, len);
                unpackSize -= len;
                if (isError) {
                    return nid.LZMA.LZMA_RES_ERROR;
                }
            }
        };
        return LzmaDecoder;
    })();
    nid.LzmaDecoder = LzmaDecoder;
})(nid || (nid = {}));
var nid;
(function (nid) {
    /**
    * LZMA Decoder
    * @author Nidin Vinayakan | nidinthb@gmail.com
    */
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

            //this.outStream.writeUnsignedByte(b);
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
    })();
    nid.OutWindow = OutWindow;
})(nid || (nid = {}));
///<reference path="LZMA.lib.d.ts" />
var nid;
(function (nid) {
    /**
    * LZMA Decoder
    * @author Nidin Vinayakan | nidinthb@gmail.com
    */
    var MEMORY = nid.utils.MEMORY;

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
            this.U32[this.loc1] = 0; //UInt32
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
            } while(--numBits);
            return this.U32[this.loc1];
        };

        RangeDecoder.prototype.decodeBit = function (prob, index) {
            this.U16[0] = prob[index];

            //bound
            this.U32[2] = (this.U32[0] >>> 11) * this.U16[0];

            //var symbol:number;
            if (this.U32[1] < this.U32[2]) {
                this.U16[0] += ((1 << 11) - this.U16[0]) >>> 5;
                this.U32[0] = this.U32[2];
                this.U16[1] = 0;
            } else {
                //v -= v >>> LZMA.kNumMoveBits;
                this.U16[0] -= this.U16[0] >>> 5;
                this.U32[1] -= this.U32[2];
                this.U32[0] -= this.U32[2];
                this.U16[1] = 1;
            }
            prob[index] = this.U16[0];

            //this.normalize();
            if (this.U32[0] < 16777216) {
                this.U32[0] <<= 8;
                this.U32[1] = (this.U32[1] << 8) | this.inStream[this.in_pos++];
            }
            return this.U16[1];
        };
        RangeDecoder.kTopValue = (1 << 24);
        return RangeDecoder;
    })();
    nid.RangeDecoder = RangeDecoder;
})(nid || (nid = {}));
///<reference path="LZMA.lib.d.ts" />
var nid;
(function (nid) {
    /**
    * LZMA Decoder
    * @author Nidin Vinayakan | nidinthb@gmail.com
    */
    var BitTreeDecoder = (function () {
        function BitTreeDecoder(numBits) {
            this.numBits = numBits;
            this.probs = new Uint16Array(1 << this.numBits);
        }
        BitTreeDecoder.prototype.init = function () {
            nid.LZMA.INIT_PROBS(this.probs);
        };
        BitTreeDecoder.prototype.decode = function (rc) {
            var m = 1;
            for (var i = 0; i < this.numBits; i++)
                m = (m << 1) + rc.decodeBit(this.probs, m);
            return m - (1 << this.numBits);
        };
        BitTreeDecoder.prototype.reverseDecode = function (rc) {
            return nid.LZMA.BitTreeReverseDecode(this.probs, this.numBits, rc);
        };
        BitTreeDecoder.constructArray = function (numBits, len) {
            var vec = [];
            for (var i = 0; i < len; i++) {
                vec[i] = new BitTreeDecoder(numBits);
            }
            return vec;
        };
        return BitTreeDecoder;
    })();
    nid.BitTreeDecoder = BitTreeDecoder;
})(nid || (nid = {}));
///<reference path="LZMA.lib.d.ts" />
var nid;
(function (nid) {
    /**
    * LZMA Decoder
    * @author Nidin Vinayakan | nidinthb@gmail.com
    */
    var LenDecoder = (function () {
        function LenDecoder() {
            this.lowCoder = nid.BitTreeDecoder.constructArray(3, 1 << nid.LZMA.kNumPosBitsMax);
            this.midCoder = nid.BitTreeDecoder.constructArray(3, 1 << nid.LZMA.kNumPosBitsMax);
            this.highCoder = new nid.BitTreeDecoder(8);
        }
        LenDecoder.prototype.init = function () {
            this.choice = [nid.LZMA.PROB_INIT_VAL, nid.LZMA.PROB_INIT_VAL];
            this.highCoder.init();
            for (var i = 0; i < (1 << nid.LZMA.kNumPosBitsMax); i++) {
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
    })();
    nid.LenDecoder = LenDecoder;
})(nid || (nid = {}));
///<reference path="LZMA.lib.d.ts" />
var nid;
(function (nid) {
    "use strict";

    /**
    * LZMA Decoder
    * @author Nidin Vinayakan | nidinthb@gmail.com
    */
    var LZMA = (function () {
        function LZMA() {
            this.decoder = new nid.LzmaDecoder();
        }
        LZMA.INIT_PROBS = function (p) {
            for (var i = 0; i < p.length; i++) {
                p[i] = this.PROB_INIT_VAL;
            }
        };
        LZMA.BitTreeReverseDecode = function (probs, numBits, rc, offset) {
            if (typeof offset === "undefined") { offset = 0; }
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

            //var header:Uint8Array = data.readUint8Array(13);
            var header = new Uint8Array(13);
            var i;
            for (i = 0; i < 13; i++) {
                header[i] = data[i];
            }

            this.decoder.decodeProperties(header);

            console.log("\nlc=" + this.decoder.lc + ", lp=" + this.decoder.lp + ", pb=" + this.decoder.pb);
            console.log("\nDictionary Size in properties = " + this.decoder.dictSizeInProperties);
            console.log("\nDictionary Size for decoding  = " + this.decoder.dictSize);

            //return this.ucdata;
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
            } else {
                console.log("End marker is expected\n");
            }
            this.decoder.rangeDec.inStream = data;
            console.log("\n");

            this.decoder.create();

            // we support the streams that have uncompressed size and marker.
            var res = this.decoder.decode(unpackSizeDefined, unpackSize);

            console.log("Read    ", this.decoder.rangeDec.in_pos);
            console.log("Written ", this.decoder.outWindow.out_pos);

            if (res == LZMA.LZMA_RES_ERROR) {
                throw "LZMA decoding error";
            } else if (res == LZMA.LZMA_RES_FINISHED_WITHOUT_MARKER) {
                console.log("Finished without end marker");
            } else if (res == LZMA.LZMA_RES_FINISHED_WITH_MARKER) {
                if (unpackSizeDefined) {
                    if (this.decoder.outWindow.out_pos != unpackSize) {
                        throw "Finished with end marker before than specified size";
                    }
                    console.log("Warning: ");
                }
                console.log("Finished with end marker");
            } else {
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
    })();
    nid.LZMA = LZMA;
})(nid || (nid = {}));
///<reference path="LZMA.ts" />
var nid;
(function (nid) {
    "use strict";
    var LZMAWorker = (function () {
        function LZMAWorker() {
            this.command = 0;
            var _this = this;
            this.decoder = new nid.LZMA();

            addEventListener('message', function (e) {
                if (_this.command == 0) {
                    _this.command = e.data;
                } else if (_this.command == 1) {
                    _this.command = 0;
                } else if (_this.command == 2) {
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
    })();
    nid.LZMAWorker = LZMAWorker;
})(nid || (nid = {}));
var w = new nid.LZMAWorker();
//# sourceMappingURL=LZMAWorker.js.map

System.register(["./tsUnit", "../xdata/src/nid/utils/ByteArray"], function(exports_1, context_1) {
    "use strict";
    let __moduleName = context_1 && context_1.id;
    let __extends = (this && this.__extends) || function (d, b) {
        for (let p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    let tsUnit_1, tsUnit_2, ByteArray_1;
    let ByteArrayUnitTest, test, TestRunner;
    return {
        setters:[
            function (tsUnit_1_1) {
                tsUnit_1 = tsUnit_1_1;
                tsUnit_2 = tsUnit_1_1;
            },
            function (ByteArray_1_1) {
                ByteArray_1 = ByteArray_1_1;
            }],
        execute: function() {
            ByteArrayUnitTest = (function (_super) {
                __extends(ByteArrayUnitTest, _super);
                function ByteArrayUnitTest() {
                    _super.apply(this, arguments);
                    this.target = new ByteArray_1.ByteArray(new ArrayBuffer(1024 * 2));
                    this.BYTE_MAX = 127;
                    this.BYTE_MIN = -128;
                    this.UBYTE_MAX = 255;
                    this.UBYTE_MIN = 0;
                    this.INT_MAX = 2147483647;
                    this.INT_MIN = -2147483648;
                    this.UINT_MAX = 4294967295;
                    this.UINT_MIN = 0;
                    this.SHORT_MAX = 32767;
                    this.SHORT_MIN = -32768;
                    this.USHORT_MAX = 65535;
                    this.USHORT_MIN = 0;
                    this.FLOAT_MAX = 3.4028234663852886e+38;
                    this.FLOAT_MIN = 1.1754943508222875e-38;
                    this.DOUBLE_MAX = Number.MAX_VALUE;
                    this.DOUBLE_MIN = Number.MIN_VALUE;
                    this.UTF_STR = "this is a utf8 encoded string";
                    this.SIZE_OF_BOOLEAN = ByteArray_1.ByteArray.SIZE_OF_BOOLEAN;
                    this.SIZE_OF_INT8 = ByteArray_1.ByteArray.SIZE_OF_INT8;
                    this.SIZE_OF_INT16 = ByteArray_1.ByteArray.SIZE_OF_INT16;
                    this.SIZE_OF_INT32 = ByteArray_1.ByteArray.SIZE_OF_INT32;
                    this.SIZE_OF_UINT8 = ByteArray_1.ByteArray.SIZE_OF_UINT8;
                    this.SIZE_OF_UINT16 = ByteArray_1.ByteArray.SIZE_OF_UINT16;
                    this.SIZE_OF_UINT32 = ByteArray_1.ByteArray.SIZE_OF_UINT32;
                    this.SIZE_OF_FLOAT32 = ByteArray_1.ByteArray.SIZE_OF_FLOAT32;
                    this.SIZE_OF_FLOAT64 = ByteArray_1.ByteArray.SIZE_OF_FLOAT64;
                }
                ByteArrayUnitTest.prototype.writeAndReadBoolean = function () {
                    this.target.writeBoolean(true);
                    this.target.position = this.target.position - this.SIZE_OF_BOOLEAN;
                    let result = this.target.readBoolean();
                    this.areIdentical(true, result);
                    this.target.writeBoolean(false);
                    this.target.position = this.target.position - this.SIZE_OF_BOOLEAN;
                    let result = this.target.readBoolean();
                    this.areIdentical(false, result);
                };
                ByteArrayUnitTest.prototype.writeAndReadByte = function () {
                    this.target.writeByte(this.BYTE_MAX);
                    this.target.writeByte(this.BYTE_MIN);
                    this.target.position = this.target.position - (2 * this.SIZE_OF_INT8);
                    let result = this.target.readByte();
                    this.areIdentical(this.BYTE_MAX, result);
                    result = this.target.readByte();
                    this.areIdentical(this.BYTE_MIN, result);
                };
                ByteArrayUnitTest.prototype.writeAndReadUnsignedByte = function () {
                    this.target.writeUnsignedByte(this.UBYTE_MAX);
                    this.target.writeUnsignedByte(this.UBYTE_MIN);
                    this.target.position = this.target.position - (2 * this.SIZE_OF_UINT8);
                    let result = this.target.readUnsignedByte();
                    this.areIdentical(this.UBYTE_MAX, result);
                    result = this.target.readUnsignedByte();
                    this.areIdentical(this.UBYTE_MIN, result);
                };
                ByteArrayUnitTest.prototype.writeAndReadDouble = function () {
                    this.target.writeDouble(this.DOUBLE_MAX);
                    this.target.writeDouble(this.DOUBLE_MIN);
                    this.target.position = this.target.position - (2 * this.SIZE_OF_FLOAT64);
                    let result = this.target.readDouble();
                    this.areIdentical(this.DOUBLE_MAX, result);
                    result = this.target.readDouble();
                    this.areIdentical(this.DOUBLE_MIN, result);
                };
                ByteArrayUnitTest.prototype.writeAndReadFloat = function () {
                    this.target.writeFloat(this.FLOAT_MAX);
                    this.target.writeFloat(this.FLOAT_MIN);
                    this.target.position = this.target.position - (2 * this.SIZE_OF_FLOAT32);
                    let result = this.target.readFloat();
                    this.areIdentical(this.FLOAT_MAX, result);
                    let result = this.target.readFloat();
                    this.areIdentical(this.FLOAT_MIN, result);
                };
                ByteArrayUnitTest.prototype.writeAndReadInt = function () {
                    this.target.writeInt(this.INT_MAX);
                    this.target.writeInt(this.INT_MIN);
                    this.target.position = this.target.position - (2 * this.SIZE_OF_INT32);
                    let result = this.target.readInt();
                    this.areIdentical(this.INT_MAX, result);
                    result = this.target.readInt();
                    this.areIdentical(this.INT_MIN, result);
                };
                ByteArrayUnitTest.prototype.writeAndReadUnsignedInt = function () {
                    this.target.writeUnsignedInt(this.UINT_MAX);
                    this.target.writeUnsignedInt(this.UINT_MIN);
                    this.target.position = this.target.position - (2 * this.SIZE_OF_UINT32);
                    let result = this.target.readUnsignedInt();
                    this.areIdentical(this.UINT_MAX, result);
                    result = this.target.readInt();
                    this.areIdentical(this.UINT_MIN, result);
                };
                ByteArrayUnitTest.prototype.writeAndReadShort = function () {
                    this.target.writeShort(this.SHORT_MAX);
                    this.target.writeShort(this.SHORT_MIN);
                    this.target.position = this.target.position - (2 * this.SIZE_OF_INT16);
                    let result = this.target.readShort();
                    this.areIdentical(this.SHORT_MAX, result);
                    result = this.target.readShort();
                    this.areIdentical(this.SHORT_MIN, result);
                };
                ByteArrayUnitTest.prototype.writeAndReadUnsignedShort = function () {
                    this.target.writeUnsignedShort(this.USHORT_MAX);
                    this.target.writeUnsignedShort(this.USHORT_MIN);
                    this.target.position = this.target.position - (2 * this.SIZE_OF_UINT16);
                    let result = this.target.readUnsignedShort();
                    this.areIdentical(this.USHORT_MAX, result);
                    result = this.target.readUnsignedShort();
                    this.areIdentical(this.USHORT_MIN, result);
                };
                ByteArrayUnitTest.prototype.writeAndReadUTF = function () {
                    this.target.writeUTF(this.UTF_STR);
                    this.target.position = this.target.position - (this.SIZE_OF_UINT16 + this.UTF_STR.length);
                    let result = this.target.readUTF();
                    this.areIdentical(this.UTF_STR, result);
                };
                ByteArrayUnitTest.prototype.writeAndReadUTFBytes = function () {
                    this.target.writeUTFBytes(this.UTF_STR);
                    this.target.position = this.target.position - this.UTF_STR.length;
                    let result = this.target.readUTFBytes(this.UTF_STR.length);
                    this.areIdentical(this.UTF_STR, result);
                };
                ByteArrayUnitTest.prototype.writeAndReadUint8Array = function () {
                    let _array = new Uint8Array(new ArrayBuffer(4));
                    _array[0] = 1;
                    _array[1] = 11;
                    _array[2] = 22;
                    _array[3] = 33;
                    this.target.writeUint8Array(_array);
                    this.target.position = this.target.position - _array.length;
                    let result = this.target.readUint8Array(_array.length);
                    this.areIdenticalArray(_array, result);
                };
                ByteArrayUnitTest.prototype.writeAndReadUint16Array = function () {
                    let size = 4 * this.SIZE_OF_UINT16;
                    let _array = new Uint16Array(new ArrayBuffer(size));
                    _array[0] = 1;
                    _array[1] = 11;
                    _array[2] = 22;
                    _array[3] = 33;
                    this.target.writeUint16Array(_array);
                    this.target.position = this.target.position - size;
                    let result = this.target.readUint16Array(_array.length);
                    this.areIdenticalArray(_array, result);
                };
                ByteArrayUnitTest.prototype.writeAndReadUint32Array = function () {
                    let size = 4 * this.SIZE_OF_UINT32;
                    let _array = new Uint32Array(new ArrayBuffer(size));
                    _array[0] = 1;
                    _array[1] = 11;
                    _array[2] = 22;
                    _array[3] = 33;
                    this.target.writeUint32Array(_array);
                    this.target.position = this.target.position - size;
                    let result = this.target.readUint32Array(_array.length);
                    this.areIdenticalArray(_array, result);
                };
                ByteArrayUnitTest.prototype.writeAndReadInt8Array = function () {
                    let _array = new Int8Array(new ArrayBuffer(4));
                    _array[0] = 1;
                    _array[1] = 11;
                    _array[2] = 22;
                    _array[3] = 33;
                    this.target.writeInt8Array(_array);
                    this.target.position = this.target.position - _array.length;
                    let result = this.target.readInt8Array(_array.length);
                    this.areIdenticalArray(_array, result);
                };
                ByteArrayUnitTest.prototype.writeAndReadInt16Array = function () {
                    let size = 4 * this.SIZE_OF_INT16;
                    let _array = new Int16Array(new ArrayBuffer(size));
                    _array[0] = 1;
                    _array[1] = 11;
                    _array[2] = 22;
                    _array[3] = 33;
                    this.target.writeInt16Array(_array);
                    this.target.position = this.target.position - size;
                    let result = this.target.readInt16Array(_array.length);
                    this.areIdenticalArray(_array, result);
                };
                ByteArrayUnitTest.prototype.writeAndReadInt32Array = function () {
                    let size = 4 * this.SIZE_OF_INT32;
                    let _array = new Int32Array(new ArrayBuffer(size));
                    _array[0] = 1;
                    _array[1] = 11;
                    _array[2] = 22;
                    _array[3] = 33;
                    this.target.writeInt32Array(_array);
                    this.target.position = this.target.position - size;
                    let result = this.target.readInt32Array(_array.length);
                    this.areIdenticalArray(_array, result);
                };
                ByteArrayUnitTest.prototype.writeAndReadFloat32Array = function () {
                    let size = 4 * this.SIZE_OF_FLOAT32;
                    let _array = new Float32Array(new ArrayBuffer(size));
                    _array[0] = 1.02563;
                    _array[1] = 11.056256;
                    _array[2] = 22.0165465;
                    _array[3] = 33.65486;
                    this.target.writeFloat32Array(_array);
                    this.target.position = this.target.position - size;
                    let result = this.target.readFloat32Array(_array.length);
                    this.areIdenticalArray(_array, result);
                };
                ByteArrayUnitTest.prototype.writeAndReadFloat64Array = function () {
                    let size = 4 * this.SIZE_OF_FLOAT64;
                    let _array = new Float64Array(new ArrayBuffer(size));
                    _array[0] = 1.02563;
                    _array[1] = 11.056256;
                    _array[2] = 22.0165465;
                    _array[3] = 33.65486;
                    this.target.writeFloat64Array(_array);
                    this.target.position = this.target.position - size;
                    let result = this.target.readFloat64Array(_array.length);
                    this.areIdenticalArray(_array, result);
                };
                return ByteArrayUnitTest;
            }(tsUnit_1.TestClass));
            test = new tsUnit_2.Test();
            test.addTestClass(new ByteArrayUnitTest());
            TestRunner = {
                run: function run() {
                    test.showResults(document.getElementById('results'), test.run());
                }
            };
            TestRunner.run();
        }
    }
});
//# sourceMappingURL=ByteArrayUnitTest.js.map
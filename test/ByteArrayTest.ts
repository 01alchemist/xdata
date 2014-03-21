/// <reference path="../src/ByteArray.ts" />
/// <reference path="tsUnit.ts" />
class ByteArrayTest extends tsUnit.TestClass {
	
	private target = new nid.utils.ByteArray(new ArrayBuffer(1024 * 2));
	
	private BYTE_MAX =  127;
	private BYTE_MIN = -128;
	private UBYTE_MAX = 255;
	private UBYTE_MIN = 0;
	private INT_MAX =  2147483647;
	private INT_MIN = -2147483648;
	private UINT_MAX = 4294967295;
	private UINT_MIN = 0;
	private SHORT_MAX =  32767;
	private SHORT_MIN = -32768;
	private USHORT_MAX = 65535;
	private USHORT_MIN = 0;
	private FLOAT_MAX = 3.4028234663852886e+38;
	private FLOAT_MIN = 1.1754943508222875e-38;
	private DOUBLE_MAX = Number.MAX_VALUE;
	private DOUBLE_MIN = Number.MIN_VALUE;
	private UTF_STR = "this is a utf8 encoded string";
	
	writeAndReadBoolean() {
		//this.target.endian = nid.utils.ByteArray.LITTLE_ENDIAN;
		this.target.writeBoolean(true);
		this.target.position = this.target.position - nid.utils.ByteArray.SIZE_OF_BOOLEAN;
		var result = this.target.readBoolean();
		this.areIdentical(true, result);
		this.target.writeBoolean(false);
		this.target.position = this.target.position - nid.utils.ByteArray.SIZE_OF_BOOLEAN;
		var result = this.target.readBoolean();
		this.areIdentical(false, result);
	}
	writeAndReadByte() {
		this.target.writeByte(this.BYTE_MAX);
		this.target.writeByte(this.BYTE_MIN);
		this.target.position = this.target.position - ( 2 * nid.utils.ByteArray.SIZE_OF_INT8);
		var result = this.target.readByte();
		this.areIdentical(this.BYTE_MAX, result);
		result = this.target.readByte();
		this.areIdentical(this.BYTE_MIN, result);
	}
	
	writeAndReadUnsignedByte() {
		this.target.writeUnsignedByte(this.UBYTE_MAX);
		this.target.writeUnsignedByte(this.UBYTE_MIN);
		this.target.position = this.target.position - ( 2 * nid.utils.ByteArray.SIZE_OF_INT8);
		var result = this.target.readUnsignedByte();
		this.areIdentical(this.UBYTE_MAX, result);
		result = this.target.readUnsignedByte();
		this.areIdentical(this.UBYTE_MIN, result);
	}
	writeAndReadDouble() {
		this.target.writeDouble(this.DOUBLE_MAX);
		this.target.writeDouble(this.DOUBLE_MIN);
		this.target.position = this.target.position - (2 * nid.utils.ByteArray.SIZE_OF_FLOAT64);
		var result = this.target.readDouble();
		this.areIdentical(this.DOUBLE_MAX, result);
		result = this.target.readDouble();
		this.areIdentical(this.DOUBLE_MIN, result);
	}
	writeAndReadFloat() {
		this.target.writeFloat(this.FLOAT_MAX);
		this.target.writeFloat(this.FLOAT_MIN);
		this.target.position = this.target.position - (2 * nid.utils.ByteArray.SIZE_OF_FLOAT32);
		var result = this.target.readFloat();
		this.areIdentical(this.FLOAT_MAX, result);
		var result = this.target.readFloat();
		this.areIdentical(this.FLOAT_MIN, result);
	}
	writeAndReadInt() {
		this.target.writeInt(this.INT_MAX);
		this.target.writeInt(this.INT_MIN);
		this.target.position = this.target.position - (2 * nid.utils.ByteArray.SIZE_OF_INT32);
		var result = this.target.readInt();
		this.areIdentical(this.INT_MAX, result);
		result = this.target.readInt();
		this.areIdentical(this.INT_MIN, result);
	}
	writeAndReadUnsignedInt() {
		this.target.writeUnsignedInt(this.UINT_MAX);
		this.target.writeUnsignedInt(this.UINT_MIN);
		this.target.position = this.target.position - (2 * nid.utils.ByteArray.SIZE_OF_UINT32);
		var result = this.target.readUnsignedInt();
		this.areIdentical(this.UINT_MAX, result);
		result = this.target.readInt();
		this.areIdentical(this.UINT_MIN, result);
	}
	writeAndReadShort() {
		this.target.writeShort(this.SHORT_MAX);
		this.target.writeShort(this.SHORT_MIN);
		this.target.position = this.target.position - (2 * nid.utils.ByteArray.SIZE_OF_INT16);
		var result = this.target.readShort();
		this.areIdentical(this.SHORT_MAX, result);
		result = this.target.readShort();
		this.areIdentical(this.SHORT_MIN, result);
	}
	writeAndReadUnsignedShort() {
		this.target.writeUnsignedShort(this.USHORT_MAX);
		this.target.writeUnsignedShort(this.USHORT_MIN);
		this.target.position = this.target.position - (2 * nid.utils.ByteArray.SIZE_OF_UINT16);
		var result = this.target.readUnsignedShort();
		this.areIdentical(this.USHORT_MAX, result);
		result = this.target.readUnsignedShort();
		this.areIdentical(this.USHORT_MIN, result);
	}
	writeAndReadUTF() {
		this.target.writeUTF(this.UTF_STR);
		this.target.position = this.target.position - (nid.utils.ByteArray.SIZE_OF_UINT16 + this.UTF_STR.length);
		var result = this.target.readUTF();
		this.areIdentical(this.UTF_STR, result);
	}
	writeAndReadUTFBytes() {
		this.target.writeUTFBytes(this.UTF_STR);
		this.target.position = this.target.position - this.UTF_STR.length;
		var result = this.target.readUTFBytes(this.UTF_STR.length);
		this.areIdentical(this.UTF_STR, result);
	}
}

// new instance of tsUnit
var test = new tsUnit.Test();

// add your test class (you can call this multiple times)
test.addTestClass(new ByteArrayTest());

// Use the built in results display
var TestRunner = {
	run:function run(){
		test.showResults(document.getElementById('results'), test.run());
	}
}
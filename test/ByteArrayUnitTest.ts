import {TestClass} from "./tsUnit";
import {Test} from "./tsUnit";
import {ByteArray} from "../xdata/src/nid/utils/ByteArray";

class ByteArrayUnitTest extends TestClass {
	
	private target = new ByteArray(new ArrayBuffer(1024 * 2));
	
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
	
	private SIZE_OF_BOOLEAN = ByteArray.SIZE_OF_BOOLEAN;
	private SIZE_OF_INT8 = ByteArray.SIZE_OF_INT8;
	private SIZE_OF_INT16 = ByteArray.SIZE_OF_INT16;
	private SIZE_OF_INT32 = ByteArray.SIZE_OF_INT32;
	private SIZE_OF_UINT8 = ByteArray.SIZE_OF_UINT8;
	private SIZE_OF_UINT16 = ByteArray.SIZE_OF_UINT16;
	private SIZE_OF_UINT32 = ByteArray.SIZE_OF_UINT32;
	private SIZE_OF_FLOAT32 = ByteArray.SIZE_OF_FLOAT32;
	private SIZE_OF_FLOAT64 = ByteArray.SIZE_OF_FLOAT64;

	writeAndReadBoolean() {
		//this.target.endian = ByteArray.LITTLE_ENDIAN;
		this.target.writeBoolean(true);
		this.target.position = this.target.position - this.SIZE_OF_BOOLEAN;
		let result = this.target.readBoolean();
		this.areIdentical(true, result);
		this.target.writeBoolean(false);
		this.target.position = this.target.position - this.SIZE_OF_BOOLEAN;
		let result = this.target.readBoolean();
		this.areIdentical(false, result);
	}
	writeAndReadByte() {
		this.target.writeByte(this.BYTE_MAX);
		this.target.writeByte(this.BYTE_MIN);
		this.target.position = this.target.position - ( 2 * this.SIZE_OF_INT8);
		let result = this.target.readByte();
		this.areIdentical(this.BYTE_MAX, result);
		result = this.target.readByte();
		this.areIdentical(this.BYTE_MIN, result);
	}
	
	writeAndReadUnsignedByte() {
		this.target.writeUnsignedByte(this.UBYTE_MAX);
		this.target.writeUnsignedByte(this.UBYTE_MIN);
		this.target.position = this.target.position - ( 2 * this.SIZE_OF_UINT8);
		let result = this.target.readUnsignedByte();
		this.areIdentical(this.UBYTE_MAX, result);
		result = this.target.readUnsignedByte();
		this.areIdentical(this.UBYTE_MIN, result);
	}
	writeAndReadDouble() {
		this.target.writeDouble(this.DOUBLE_MAX);
		this.target.writeDouble(this.DOUBLE_MIN);
		this.target.position = this.target.position - (2 * this.SIZE_OF_FLOAT64);
		let result = this.target.readDouble();
		this.areIdentical(this.DOUBLE_MAX, result);
		result = this.target.readDouble();
		this.areIdentical(this.DOUBLE_MIN, result);
	}
	writeAndReadFloat() {
		this.target.writeFloat(this.FLOAT_MAX);
		this.target.writeFloat(this.FLOAT_MIN);
		this.target.position = this.target.position - (2 * this.SIZE_OF_FLOAT32);
		let result = this.target.readFloat();
		this.areIdentical(this.FLOAT_MAX, result);
		let result = this.target.readFloat();
		this.areIdentical(this.FLOAT_MIN, result);
	}
	writeAndReadInt() {
		this.target.writeInt(this.INT_MAX);
		this.target.writeInt(this.INT_MIN);
		this.target.position = this.target.position - (2 * this.SIZE_OF_INT32);
		let result = this.target.readInt();
		this.areIdentical(this.INT_MAX, result);
		result = this.target.readInt();
		this.areIdentical(this.INT_MIN, result);
	}
	writeAndReadUnsignedInt() {
		this.target.writeUnsignedInt(this.UINT_MAX);
		this.target.writeUnsignedInt(this.UINT_MIN);
		this.target.position = this.target.position - (2 * this.SIZE_OF_UINT32);
		let result = this.target.readUnsignedInt();
		this.areIdentical(this.UINT_MAX, result);
		result = this.target.readInt();
		this.areIdentical(this.UINT_MIN, result);
	}
	writeAndReadShort() {
		this.target.writeShort(this.SHORT_MAX);
		this.target.writeShort(this.SHORT_MIN);
		this.target.position = this.target.position - (2 * this.SIZE_OF_INT16);
		let result = this.target.readShort();
		this.areIdentical(this.SHORT_MAX, result);
		result = this.target.readShort();
		this.areIdentical(this.SHORT_MIN, result);
	}
	writeAndReadUnsignedShort() {
		this.target.writeUnsignedShort(this.USHORT_MAX);
		this.target.writeUnsignedShort(this.USHORT_MIN);
		this.target.position = this.target.position - (2 * this.SIZE_OF_UINT16);
		let result = this.target.readUnsignedShort();
		this.areIdentical(this.USHORT_MAX, result);
		result = this.target.readUnsignedShort();
		this.areIdentical(this.USHORT_MIN, result);
	}
	writeAndReadUTF() {
		this.target.writeUTF(this.UTF_STR);
		this.target.position = this.target.position - (this.SIZE_OF_UINT16 + this.UTF_STR.length);
		let result = this.target.readUTF();
		this.areIdentical(this.UTF_STR, result);
	}
	writeAndReadUTFBytes() {
		this.target.writeUTFBytes(this.UTF_STR);
		this.target.position = this.target.position - this.UTF_STR.length;
		let result = this.target.readUTFBytes(this.UTF_STR.length);
		this.areIdentical(this.UTF_STR, result);
	}
	//EXTAR JS API
	writeAndReadUint8Array() {
		let _array:Uint8Array = new Uint8Array(new ArrayBuffer(4));
		_array[0] = 1;
		_array[1] = 11;
		_array[2] = 22;
		_array[3] = 33;
		this.target.writeUint8Array(_array);
		this.target.position = this.target.position - _array.length;
		let result = this.target.readUint8Array(_array.length);
		this.areIdenticalArray(_array, result);
	}
	writeAndReadUint16Array() {
		let size:number = 4 * this.SIZE_OF_UINT16;
		let _array:Uint16Array = new Uint16Array(new ArrayBuffer(size));
		_array[0] = 1;
		_array[1] = 11;
		_array[2] = 22;
		_array[3] = 33;
		this.target.writeUint16Array(_array);
		this.target.position = this.target.position - size;
		let result = this.target.readUint16Array(_array.length);
		this.areIdenticalArray(_array, result);
	}
	writeAndReadUint32Array() {
		let size:number = 4 * this.SIZE_OF_UINT32;
		let _array:Uint32Array = new Uint32Array(new ArrayBuffer(size));
		_array[0] = 1;
		_array[1] = 11;
		_array[2] = 22;
		_array[3] = 33;
		this.target.writeUint32Array(_array);
		this.target.position = this.target.position - size;
		let result = this.target.readUint32Array(_array.length);
		this.areIdenticalArray(_array, result);
	}
	writeAndReadInt8Array() {
		let _array:Int8Array = new Int8Array(new ArrayBuffer(4));
		_array[0] = 1;
		_array[1] = 11;
		_array[2] = 22;
		_array[3] = 33;
		this.target.writeInt8Array(_array);
		this.target.position = this.target.position - _array.length;
		let result = this.target.readInt8Array(_array.length);
		this.areIdenticalArray(_array, result);
	}
	writeAndReadInt16Array() {
		let size:number = 4 * this.SIZE_OF_INT16;
		let _array:Int16Array = new Int16Array(new ArrayBuffer(size));
		_array[0] = 1;
		_array[1] = 11;
		_array[2] = 22;
		_array[3] = 33;
		this.target.writeInt16Array(_array);
		this.target.position = this.target.position - size;
		let result = this.target.readInt16Array(_array.length);
		this.areIdenticalArray(_array, result);
	}
	writeAndReadInt32Array() {
		let size:number = 4 * this.SIZE_OF_INT32;
		let _array:Int32Array = new Int32Array(new ArrayBuffer(size));
		_array[0] = 1;
		_array[1] = 11;
		_array[2] = 22;
		_array[3] = 33;
		this.target.writeInt32Array(_array);
		this.target.position = this.target.position - size;
		let result = this.target.readInt32Array(_array.length);
		this.areIdenticalArray(_array, result);
	}
	writeAndReadFloat32Array() {
		let size:number = 4 * this.SIZE_OF_FLOAT32;
		let _array:Float32Array = new Float32Array(new ArrayBuffer(size));
		_array[0] = 1.02563;
		_array[1] = 11.056256;
		_array[2] = 22.0165465;
		_array[3] = 33.65486;
		this.target.writeFloat32Array(_array);
		this.target.position = this.target.position - size;
		let result = this.target.readFloat32Array(_array.length);
		this.areIdenticalArray(_array, result);
	}
	writeAndReadFloat64Array() {
		let size:number = 4 * this.SIZE_OF_FLOAT64;
		let _array:Float64Array = new Float64Array(new ArrayBuffer(size));
		_array[0] = 1.02563;
		_array[1] = 11.056256;
		_array[2] = 22.0165465;
		_array[3] = 33.65486;
		this.target.writeFloat64Array(_array);
		this.target.position = this.target.position - size;
		let result = this.target.readFloat64Array(_array.length);
		this.areIdenticalArray(_array, result);
	}
}

// new instance of tsUnit
let test = new Test();

// add your test class (you can call this multiple times)
test.addTestClass(new ByteArrayUnitTest());

// Use the built in results display
let TestRunner = {
	run:function run(){
		test.showResults(document.getElementById('results'), test.run());
	}
};
TestRunner.run();
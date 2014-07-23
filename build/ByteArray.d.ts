/// <reference path="../src/ctypes/ctypes.d.ts" />
/**
* JavaScript Uint64
* version : 0.1
* @author Nidin Vinayakan | nidinthb@gmail.com
*
*/
declare module ctypes {
    class Uint64 {
        public low: number;
        public high: number;
        constructor(low: number, high: number);
        public value(): number;
    }
}
/**
* JavaScript Int64
* version : 0.1
* @author Nidin Vinayakan | nidinthb@gmail.com
*
*/
declare module ctypes {
    class Int64 {
        public low: number;
        public high: number;
        constructor(low: number, high: number);
        public value(): number;
    }
}
declare module nid.utils {
    class LZMAHelper {
        static decoderAsync: Worker;
        static callback: Function;
        static ENCODE: number;
        static DECODE: number;
        static init(): void;
        static encodeAsync(data: ArrayBuffer, _callback: Function): void;
        static decodeAsync(data: ArrayBuffer, _callback: Function): void;
    }
}
declare module nid.utils {
    /**
    * JavaScript ByteArray
    * version : 0.2
    * @author Nidin Vinayakan | nidinthb@gmail.com
    */
    class CompressionAlgorithm {
        static DEFLATE: string;
        static LZMA: string;
        static ZLIB: string;
    }
}
/**
* JavaScript ByteArray
* version : 0.2
* @author Nidin Vinayakan | nidinthb@gmail.com
*
* ActionScript3 ByteArray implementation in JavaScript
* limitation : size of ByteArray cannot be changed
*
*/
declare module nid.utils {
    class ByteArray {
        static BIG_ENDIAN: string;
        static LITTLE_ENDIAN: string;
        static SIZE_OF_BOOLEAN: number;
        static SIZE_OF_INT8: number;
        static SIZE_OF_INT16: number;
        static SIZE_OF_INT32: number;
        static SIZE_OF_UINT8: number;
        static SIZE_OF_UINT16: number;
        static SIZE_OF_UINT32: number;
        static SIZE_OF_FLOAT32: number;
        static SIZE_OF_FLOAT64: number;
        private BUFFER_EXT_SIZE;
        public data: DataView;
        private _position;
        public offset: number;
        public write_position: number;
        public endian: string;
        constructor(buffer?: ArrayBuffer, offset?: number);
        public buffer : ArrayBuffer;
        public dataView : DataView;
        public position : number;
        public length : number;
        public bytesAvailable : number;
        public clear(): void;
        public compress(algorithm?: string): void;
        public compressAsync(algorithm: string, callback: any): void;
        public uncompressAsync(algorithm?: string, callback?: any): void;
        public deflate(): void;
        public inflate(): void;
        /**
        * Reads a Boolean value from the byte stream. A single byte is read,
        * and true is returned if the byte is nonzero,
        * false otherwise.
        * @return	Returns true if the byte is nonzero, false otherwise.
        */
        public readBoolean(): boolean;
        /**
        * Reads a signed byte from the byte stream.
        * The returned value is in the range -128 to 127.
        * @return	An integer between -128 and 127.
        */
        public readByte(): number;
        /**
        * Reads the number of data bytes, specified by the length parameter, from the byte stream.
        * The bytes are read into the ByteArray object specified by the bytes parameter,
        * and the bytes are written into the destination ByteArray starting at the _position specified by offset.
        * @param	bytes	The ByteArray object to read data into.
        * @param	offset	The offset (_position) in bytes at which the read data should be written.
        * @param	length	The number of bytes to read.  The default value of 0 causes all available data to be read.
        */
        public readBytes(bytes: ByteArray, offset?: number, length?: number): void;
        /**
        * Reads an IEEE 754 double-precision (64-bit) floating-point number from the byte stream.
        * @return	A double-precision (64-bit) floating-point number.
        */
        public readDouble(): number;
        /**
        * Reads an IEEE 754 single-precision (32-bit) floating-point number from the byte stream.
        * @return	A single-precision (32-bit) floating-point number.
        */
        public readFloat(): number;
        /**
        * Reads a signed 32-bit integer from the byte stream.
        *
        *   The returned value is in the range -2147483648 to 2147483647.
        * @return	A 32-bit signed integer between -2147483648 and 2147483647.
        */
        public readInt(): number;
        /**
        * Reads a signed 64-bit integer from the byte stream.
        *
        *   The returned value is in the range −(2^63) to 2^63 − 1
        * @return	A 64-bit signed integer between −(2^63) to 2^63 − 1
        */
        public readInt64(): ctypes.Int64;
        /**
        * Reads a multibyte string of specified length from the byte stream using the
        * specified character set.
        * @param	length	The number of bytes from the byte stream to read.
        * @param	charSet	The string denoting the character set to use to interpret the bytes.
        *   Possible character set strings include "shift-jis", "cn-gb",
        *   "iso-8859-1", and others.
        *   For a complete list, see Supported Character Sets.
        *   Note: If the value for the charSet parameter
        *   is not recognized by the current system, the application uses the system's default
        *   code page as the character set. For example, a value for the charSet parameter,
        *   as in myTest.readMultiByte(22, "iso-8859-01") that uses 01 instead of
        *   1 might work on your development system, but not on another system.
        *   On the other system, the application will use the system's default code page.
        * @return	UTF-8 encoded string.
        */
        public readMultiByte(length: number, charSet?: string): string;
        /**
        * Reads an object from the byte array, encoded in AMF
        * serialized format.
        * @return	The deserialized object.
        */
        public readObject(): any;
        /**
        * Reads a signed 16-bit integer from the byte stream.
        *
        *   The returned value is in the range -32768 to 32767.
        * @return	A 16-bit signed integer between -32768 and 32767.
        */
        public readShort(): number;
        /**
        * Reads an unsigned byte from the byte stream.
        *
        *   The returned value is in the range 0 to 255.
        * @return	A 32-bit unsigned integer between 0 and 255.
        */
        public readUnsignedByte(): number;
        /**
        * Reads an unsigned 32-bit integer from the byte stream.
        *
        *   The returned value is in the range 0 to 4294967295.
        * @return	A 32-bit unsigned integer between 0 and 4294967295.
        */
        public readUnsignedInt(): number;
        /**
        * Reads an unsigned 64-bit integer from the byte stream.
        *
        *   The returned value is in the range 0 to 2^64 − 1.
        * @return	A 64-bit unsigned integer between 0 and 2^64 − 1
        */
        public readUnsignedInt64(): ctypes.Uint64;
        /**
        * Reads an unsigned 16-bit integer from the byte stream.
        *
        *   The returned value is in the range 0 to 65535.
        * @return	A 16-bit unsigned integer between 0 and 65535.
        */
        public readUnsignedShort(): number;
        /**
        * Reads a UTF-8 string from the byte stream.  The string
        * is assumed to be prefixed with an unsigned short indicating
        * the length in bytes.
        * @return	UTF-8 encoded  string.
        */
        public readUTF(): string;
        /**
        * Reads a sequence of UTF-8 bytes specified by the length
        * parameter from the byte stream and returns a string.
        * @param	length	An unsigned short indicating the length of the UTF-8 bytes.
        * @return	A string composed of the UTF-8 bytes of the specified length.
        */
        public readUTFBytes(length: number): string;
        /**
        * Writes a Boolean value. A single byte is written according to the value parameter,
        * either 1 if true or 0 if false.
        * @param	value	A Boolean value determining which byte is written. If the parameter is true,
        *   the method writes a 1; if false, the method writes a 0.
        */
        public writeBoolean(value: boolean): void;
        /**
        * Writes a byte to the byte stream.
        * The low 8 bits of the
        * parameter are used. The high 24 bits are ignored.
        * @param	value	A 32-bit integer. The low 8 bits are written to the byte stream.
        */
        public writeByte(value: number): void;
        public writeUnsignedByte(value: number): void;
        /**
        * Writes a sequence of length bytes from the
        * specified byte array, bytes,
        * starting offset(zero-based index) bytes
        * into the byte stream.
        *
        *   If the length parameter is omitted, the default
        * length of 0 is used; the method writes the entire buffer starting at
        * offset.
        * If the offset parameter is also omitted, the entire buffer is
        * written. If offset or length
        * is out of range, they are clamped to the beginning and end
        * of the bytes array.
        * @param	bytes	The ByteArray object.
        * @param	offset	A zero-based index indicating the _position into the array to begin writing.
        * @param	length	An unsigned integer indicating how far into the buffer to write.
        */
        public writeBytes(bytes: ByteArray, offset?: number, length?: number): void;
        /**
        * Writes an IEEE 754 double-precision (64-bit) floating-point number to the byte stream.
        * @param	value	A double-precision (64-bit) floating-point number.
        */
        public writeDouble(value: number): void;
        /**
        * Writes an IEEE 754 single-precision (32-bit) floating-point number to the byte stream.
        * @param	value	A single-precision (32-bit) floating-point number.
        */
        public writeFloat(value: number): void;
        /**
        * Writes a 32-bit signed integer to the byte stream.
        * @param	value	An integer to write to the byte stream.
        */
        public writeInt(value: number): void;
        /**
        * Writes a multibyte string to the byte stream using the specified character set.
        * @param	value	The string value to be written.
        * @param	charSet	The string denoting the character set to use. Possible character set strings
        *   include "shift-jis", "cn-gb", "iso-8859-1", and others.
        *   For a complete list, see Supported Character Sets.
        */
        public writeMultiByte(value: string, charSet: string): void;
        /**
        * Writes an object into the byte array in AMF
        * serialized format.
        * @param	object	The object to serialize.
        */
        public writeObject(value: any): void;
        /**
        * Writes a 16-bit integer to the byte stream. The low 16 bits of the parameter are used.
        * The high 16 bits are ignored.
        * @param	value	32-bit integer, whose low 16 bits are written to the byte stream.
        */
        public writeShort(value: number): void;
        public writeUnsignedShort(value: number): void;
        /**
        * Writes a 32-bit unsigned integer to the byte stream.
        * @param	value	An unsigned integer to write to the byte stream.
        */
        public writeUnsignedInt(value: number): void;
        /**
        * Writes a UTF-8 string to the byte stream. The length of the UTF-8 string in bytes
        * is written first, as a 16-bit integer, followed by the bytes representing the
        * characters of the string.
        * @param	value	The string value to be written.
        */
        public writeUTF(value: string): void;
        /**
        * Writes a UTF-8 string to the byte stream. Similar to the writeUTF() method,
        * but writeUTFBytes() does not prefix the string with a 16-bit length word.
        * @param	value	The string value to be written.
        */
        public writeUTFBytes(value: string): void;
        public toString(): string;
        /****************************/
        /**
        * Writes a Uint8Array to the byte stream.
        * @param	value	The Uint8Array to be written.
        */
        public writeUint8Array(bytes: Uint8Array): void;
        /**
        * Writes a Uint16Array to the byte stream.
        * @param	value	The Uint16Array to be written.
        */
        public writeUint16Array(bytes: Uint16Array): void;
        /**
        * Writes a Uint32Array to the byte stream.
        * @param	value	The Uint32Array to be written.
        */
        public writeUint32Array(bytes: Uint32Array): void;
        /**
        * Writes a Int8Array to the byte stream.
        * @param	value	The Int8Array to be written.
        */
        public writeInt8Array(bytes: Int8Array): void;
        /**
        * Writes a Int16Array to the byte stream.
        * @param	value	The Int16Array to be written.
        */
        public writeInt16Array(bytes: Int16Array): void;
        /**
        * Writes a Int32Array to the byte stream.
        * @param	value	The Int32Array to be written.
        */
        public writeInt32Array(bytes: Int32Array): void;
        /**
        * Writes a Float32Array to the byte stream.
        * @param	value	The Float32Array to be written.
        */
        public writeFloat32Array(bytes: Float32Array): void;
        /**
        * Writes a Float64Array to the byte stream.
        * @param	value	The Float64Array to be written.
        */
        public writeFloat64Array(bytes: Float64Array): void;
        /**
        * Read a Uint8Array from the byte stream.
        * @param	length An unsigned short indicating the length of the Uint8Array.
        */
        public readUint8Array(length: number): Uint8Array;
        /**
        * Read a Uint16Array from the byte stream.
        * @param	length An unsigned short indicating the length of the Uint16Array.
        */
        public readUint16Array(length: number): Uint16Array;
        /**
        * Read a Uint32Array from the byte stream.
        * @param	length An unsigned short indicating the length of the Uint32Array.
        */
        public readUint32Array(length: number): Uint32Array;
        /**
        * Read a Int8Array from the byte stream.
        * @param	length An unsigned short indicating the length of the Int8Array.
        */
        public readInt8Array(length: number): Int8Array;
        /**
        * Read a Int16Array from the byte stream.
        * @param	length An unsigned short indicating the length of the Int16Array.
        */
        public readInt16Array(length: number): Int16Array;
        /**
        * Read a Int32Array from the byte stream.
        * @param	length An unsigned short indicating the length of the Int32Array.
        */
        public readInt32Array(length: number): Int32Array;
        /**
        * Read a Float32Array from the byte stream.
        * @param	length An unsigned short indicating the length of the Float32Array.
        */
        public readFloat32Array(length: number): Float32Array;
        /**
        * Read a Float64Array from the byte stream.
        * @param	length An unsigned short indicating the length of the Float64Array.
        */
        public readFloat64Array(length: number): Float64Array;
        /**********************/
        private validate(len);
        private validateBuffer(len);
        /**
        * UTF-8 Encoding/Decoding
        */
        private encodeUTF8(str);
        private decodeUTF8(data);
        private encoderError(code_point);
        private decoderError(fatal, opt_code_point?);
        private EOF_byte;
        private EOF_code_point;
        private inRange(a, min, max);
        private div(n, d);
        private stringToCodePoints(string);
    }
}

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
                    MEMORY.allocateUint16(10);
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
var nid;
(function (nid) {
    /**
    * JavaScript ByteArray
    * version : 0.1
    * @author Nidin Vinayak | nidinthb@gmail.com
    *
    * ActionScript3 ByteArray implementation in JavaScript
    * limitation : size of ByteArray cannot be changed
    *
    */
    (function (utils) {
        var ByteArray = (function () {
            function ByteArray(buffer, offset) {
                if (typeof offset === "undefined") { offset = 0; }
                this.BUFFER_EXT_SIZE = 1024;
                this.offset = 0;
                this.EOF_byte = -1;
                this.EOF_code_point = -1;
                if (typeof (buffer) === "undefined") {
                    buffer = new ArrayBuffer(this.BUFFER_EXT_SIZE);
                    this.write_position = 0;
                } else {
                    this.write_position = buffer.byteLength;
                }
                this.data = new DataView(buffer);
                this._position = 0;
                this.offset = offset;
                this.endian = ByteArray.BIG_ENDIAN;
            }
            Object.defineProperty(ByteArray.prototype, "buffer", {
                // getter setter
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
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ByteArray.prototype, "position", {
                get: function () {
                    return this._position + this.offset;
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
                    return this.data.byteLength - this.position;
                },
                enumerable: true,
                configurable: true
            });

            //end
            ByteArray.prototype.clear = function () {
                this._position = 0;
            };
            ByteArray.prototype.compress = function (algorithm) {
                if (typeof algorithm === "undefined") { algorithm = "zlib"; }
            };
            ByteArray.prototype.uncompress = function (algorithm) {
                if (typeof algorithm === "undefined") { algorithm = "zlib"; }
            };
            ByteArray.prototype.deflate = function () {
            };
            ByteArray.prototype.inflate = function () {
            };

            /**
            * Reads a Boolean value from the byte stream. A single byte is read,
            * and true is returned if the byte is nonzero,
            * false otherwise.
            * @return	Returns true if the byte is nonzero, false otherwise.
            */
            ByteArray.prototype.readBoolean = function () {
                if (!this.validate(ByteArray.SIZE_OF_BOOLEAN))
                    return null;

                return this.data.getUint8(this.position++) != 0;
            };

            /**
            * Reads a signed byte from the byte stream.
            * The returned value is in the range -128 to 127.
            * @return	An integer between -128 and 127.
            */
            ByteArray.prototype.readByte = function () {
                if (!this.validate(ByteArray.SIZE_OF_INT8))
                    return null;

                return this.data.getInt8(this.position++);
            };

            /**
            * Reads the number of data bytes, specified by the length parameter, from the byte stream.
            * The bytes are read into the ByteArray object specified by the bytes parameter,
            * and the bytes are written into the destination ByteArray starting at the _position specified by offset.
            * @param	bytes	The ByteArray object to read data into.
            * @param	offset	The offset (_position) in bytes at which the read data should be written.
            * @param	length	The number of bytes to read.  The default value of 0 causes all available data to be read.
            */
            ByteArray.prototype.readBytes = function (bytes, offset, length) {
                if (typeof offset === "undefined") { offset = 0; }
                if (typeof length === "undefined") { length = 0; }
                if (!this.validate(length))
                    return;
                var tmp_data = new DataView(this.data.buffer, this.position, length);
                this.position += length;

                //This method is expensive
                //for(var i=0; i < length;i++){
                //tmp_data.setUint8(i,this.data.getUint8(this.position++));
                //}
                bytes.dataView = tmp_data;
            };

            /**
            * Reads an IEEE 754 double-precision (64-bit) floating-point number from the byte stream.
            * @return	A double-precision (64-bit) floating-point number.
            */
            ByteArray.prototype.readDouble = function () {
                if (!this.validate(ByteArray.SIZE_OF_FLOAT64))
                    return null;

                var value = this.data.getFloat64(this.position);
                this.position += ByteArray.SIZE_OF_FLOAT64;
                return value;
            };

            /**
            * Reads an IEEE 754 single-precision (32-bit) floating-point number from the byte stream.
            * @return	A single-precision (32-bit) floating-point number.
            */
            ByteArray.prototype.readFloat = function () {
                if (!this.validate(ByteArray.SIZE_OF_FLOAT32))
                    return null;

                var value = this.data.getFloat32(this.position);
                this.position += ByteArray.SIZE_OF_FLOAT32;
                return value;
            };

            /**
            * Reads a signed 32-bit integer from the byte stream.
            *
            *   The returned value is in the range -2147483648 to 2147483647.
            * @return	A 32-bit signed integer between -2147483648 and 2147483647.
            */
            ByteArray.prototype.readInt = function () {
                if (!this.validate(ByteArray.SIZE_OF_INT32))
                    return null;

                var value = this.data.getInt32(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_INT32;
                return value;
            };

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
            ByteArray.prototype.readMultiByte = function (length, charSet) {
                if (!this.validate(length))
                    return null;

                return "";
            };

            /**
            * Reads an object from the byte array, encoded in AMF
            * serialized format.
            * @return	The deserialized object.
            */
            ByteArray.prototype.readObject = function () {
                //return this.readAmfObject();
                return null;
            };

            /**
            * Reads a signed 16-bit integer from the byte stream.
            *
            *   The returned value is in the range -32768 to 32767.
            * @return	A 16-bit signed integer between -32768 and 32767.
            */
            ByteArray.prototype.readShort = function () {
                if (!this.validate(ByteArray.SIZE_OF_INT16))
                    return null;

                var value = this.data.getInt16(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_INT16;
                return value;
            };

            /**
            * Reads an unsigned byte from the byte stream.
            *
            *   The returned value is in the range 0 to 255.
            * @return	A 32-bit unsigned integer between 0 and 255.
            */
            ByteArray.prototype.readUnsignedByte = function () {
                if (!this.validate(ByteArray.SIZE_OF_UINT8))
                    return null;

                return this.data.getUint8(this.position++);
            };

            /**
            * Reads an unsigned 32-bit integer from the byte stream.
            *
            *   The returned value is in the range 0 to 4294967295.
            * @return	A 32-bit unsigned integer between 0 and 4294967295.
            */
            ByteArray.prototype.readUnsignedInt = function () {
                if (!this.validate(ByteArray.SIZE_OF_UINT32))
                    return null;

                var value = this.data.getUint32(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_UINT32;
                return value;
            };

            /**
            * Reads an unsigned 16-bit integer from the byte stream.
            *
            *   The returned value is in the range 0 to 65535.
            * @return	A 16-bit unsigned integer between 0 and 65535.
            */
            ByteArray.prototype.readUnsignedShort = function () {
                if (!this.validate(ByteArray.SIZE_OF_UINT16))
                    return null;

                var value = this.data.getUint16(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_UINT16;
                return value;
            };

            /**
            * Reads a UTF-8 string from the byte stream.  The string
            * is assumed to be prefixed with an unsigned short indicating
            * the length in bytes.
            * @return	UTF-8 encoded  string.
            */
            ByteArray.prototype.readUTF = function () {
                if (!this.validate(ByteArray.SIZE_OF_UINT16))
                    return null;

                var length = this.data.getUint16(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_UINT16;

                if (length > 0) {
                    return this.readUTFBytes(length);
                } else {
                    return "";
                }
            };

            /**
            * Reads a sequence of UTF-8 bytes specified by the length
            * parameter from the byte stream and returns a string.
            * @param	length	An unsigned short indicating the length of the UTF-8 bytes.
            * @return	A string composed of the UTF-8 bytes of the specified length.
            */
            ByteArray.prototype.readUTFBytes = function (length) {
                if (!this.validate(length))
                    return null;

                var bytes = new Uint8Array(new ArrayBuffer(length));
                for (var i = 0; i < length; i++) {
                    bytes[i] = this.data.getUint8(this.position++);
                }
                return this.decodeUTF8(bytes);
            };

            /**
            * Writes a Boolean value. A single byte is written according to the value parameter,
            * either 1 if true or 0 if false.
            * @param	value	A Boolean value determining which byte is written. If the parameter is true,
            *   the method writes a 1; if false, the method writes a 0.
            */
            ByteArray.prototype.writeBoolean = function (value) {
                this.validateBuffer(ByteArray.SIZE_OF_BOOLEAN);

                this.data.setUint8(this.position++, value ? 1 : 0);
            };

            /**
            * Writes a byte to the byte stream.
            * The low 8 bits of the
            * parameter are used. The high 24 bits are ignored.
            * @param	value	A 32-bit integer. The low 8 bits are written to the byte stream.
            */
            ByteArray.prototype.writeByte = function (value) {
                this.validateBuffer(ByteArray.SIZE_OF_INT8);

                this.data.setInt8(this.position++, value);
            };
            ByteArray.prototype.writeUnsignedByte = function (value) {
                this.validateBuffer(ByteArray.SIZE_OF_UINT8);

                this.data.setUint8(this.position++, value);
            };

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
            ByteArray.prototype.writeBytes = function (bytes, offset, length) {
                if (typeof offset === "undefined") { offset = 0; }
                if (typeof length === "undefined") { length = 0; }
                this.validateBuffer(length);

                var tmp_data = new DataView(bytes.buffer);
                for (var i = 0; i < bytes.length; i++) {
                    this.data.setUint8(this.position++, tmp_data.getUint8(i));
                }
            };

            /**
            * Writes an IEEE 754 double-precision (64-bit) floating-point number to the byte stream.
            * @param	value	A double-precision (64-bit) floating-point number.
            */
            ByteArray.prototype.writeDouble = function (value) {
                this.validateBuffer(ByteArray.SIZE_OF_FLOAT64);

                this.data.setFloat64(this.position, value, this.endian == ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_FLOAT64;
            };

            /**
            * Writes an IEEE 754 single-precision (32-bit) floating-point number to the byte stream.
            * @param	value	A single-precision (32-bit) floating-point number.
            */
            ByteArray.prototype.writeFloat = function (value) {
                this.validateBuffer(ByteArray.SIZE_OF_FLOAT32);

                this.data.setFloat32(this.position, value, this.endian == ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_FLOAT32;
            };

            /**
            * Writes a 32-bit signed integer to the byte stream.
            * @param	value	An integer to write to the byte stream.
            */
            ByteArray.prototype.writeInt = function (value) {
                this.validateBuffer(ByteArray.SIZE_OF_INT32);

                this.data.setInt32(this.position, value, this.endian == ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_INT32;
            };

            /**
            * Writes a multibyte string to the byte stream using the specified character set.
            * @param	value	The string value to be written.
            * @param	charSet	The string denoting the character set to use. Possible character set strings
            *   include "shift-jis", "cn-gb", "iso-8859-1", and others.
            *   For a complete list, see Supported Character Sets.
            */
            ByteArray.prototype.writeMultiByte = function (value, charSet) {
            };

            /**
            * Writes an object into the byte array in AMF
            * serialized format.
            * @param	object	The object to serialize.
            */
            ByteArray.prototype.writeObject = function (value) {
            };

            /**
            * Writes a 16-bit integer to the byte stream. The low 16 bits of the parameter are used.
            * The high 16 bits are ignored.
            * @param	value	32-bit integer, whose low 16 bits are written to the byte stream.
            */
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

            /**
            * Writes a 32-bit unsigned integer to the byte stream.
            * @param	value	An unsigned integer to write to the byte stream.
            */
            ByteArray.prototype.writeUnsignedInt = function (value) {
                this.validateBuffer(ByteArray.SIZE_OF_UINT32);

                this.data.setUint32(this.position, value, this.endian == ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_UINT32;
            };

            /**
            * Writes a UTF-8 string to the byte stream. The length of the UTF-8 string in bytes
            * is written first, as a 16-bit integer, followed by the bytes representing the
            * characters of the string.
            * @param	value	The string value to be written.
            */
            ByteArray.prototype.writeUTF = function (value) {
                var utf8bytes = this.encodeUTF8(value);
                var length = utf8bytes.length;

                this.validateBuffer(ByteArray.SIZE_OF_UINT16 + length);

                this.data.setUint16(this.position, length, this.endian === ByteArray.LITTLE_ENDIAN);
                this.position += ByteArray.SIZE_OF_UINT16;
                this.writeUint8Array(utf8bytes);
            };

            /**
            * Writes a UTF-8 string to the byte stream. Similar to the writeUTF() method,
            * but writeUTFBytes() does not prefix the string with a 16-bit length word.
            * @param	value	The string value to be written.
            */
            ByteArray.prototype.writeUTFBytes = function (value) {
                this.writeUint8Array(this.encodeUTF8(value));
            };

            ByteArray.prototype.toString = function () {
                return "[ByteArray]";
            };

            /****************************/
            /* EXTRA JAVASCRIPT APIs    */
            /****************************/
            /**
            * Writes a Uint8Array to the byte stream.
            * @param	value	The Uint8Array to be written.
            */
            ByteArray.prototype.writeUint8Array = function (bytes) {
                this.validateBuffer(this.position + bytes.length);

                for (var i = 0; i < bytes.length; i++) {
                    this.data.setUint8(this.position++, bytes[i]);
                }
            };

            /**
            * Writes a Uint16Array to the byte stream.
            * @param	value	The Uint16Array to be written.
            */
            ByteArray.prototype.writeUint16Array = function (bytes) {
                this.validateBuffer(this.position + bytes.length);

                for (var i = 0; i < bytes.length; i++) {
                    this.data.setUint16(this.position, bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_UINT16;
                }
            };

            /**
            * Writes a Uint32Array to the byte stream.
            * @param	value	The Uint32Array to be written.
            */
            ByteArray.prototype.writeUint32Array = function (bytes) {
                this.validateBuffer(this.position + bytes.length);

                for (var i = 0; i < bytes.length; i++) {
                    this.data.setUint32(this.position, bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_UINT32;
                }
            };

            /**
            * Writes a Int8Array to the byte stream.
            * @param	value	The Int8Array to be written.
            */
            ByteArray.prototype.writeInt8Array = function (bytes) {
                this.validateBuffer(this.position + bytes.length);

                for (var i = 0; i < bytes.length; i++) {
                    this.data.setInt8(this.position++, bytes[i]);
                }
            };

            /**
            * Writes a Int16Array to the byte stream.
            * @param	value	The Int16Array to be written.
            */
            ByteArray.prototype.writeInt16Array = function (bytes) {
                this.validateBuffer(this.position + bytes.length);

                for (var i = 0; i < bytes.length; i++) {
                    this.data.setInt16(this.position, bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_INT16;
                }
            };

            /**
            * Writes a Int32Array to the byte stream.
            * @param	value	The Int32Array to be written.
            */
            ByteArray.prototype.writeInt32Array = function (bytes) {
                this.validateBuffer(this.position + bytes.length);

                for (var i = 0; i < bytes.length; i++) {
                    this.data.setInt32(this.position, bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_INT32;
                }
            };

            /**
            * Writes a Float32Array to the byte stream.
            * @param	value	The Float32Array to be written.
            */
            ByteArray.prototype.writeFloat32Array = function (bytes) {
                this.validateBuffer(this.position + bytes.length);

                for (var i = 0; i < bytes.length; i++) {
                    this.data.setFloat32(this.position, bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_FLOAT32;
                }
            };

            /**
            * Writes a Float64Array to the byte stream.
            * @param	value	The Float64Array to be written.
            */
            ByteArray.prototype.writeFloat64Array = function (bytes) {
                this.validateBuffer(this.position + bytes.length);

                for (var i = 0; i < bytes.length; i++) {
                    this.data.setFloat64(this.position, bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_FLOAT64;
                }
            };

            /**
            * Read a Uint8Array from the byte stream.
            * @param	length An unsigned short indicating the length of the Uint8Array.
            */
            ByteArray.prototype.readUint8Array = function (length) {
                if (!this.validate(length))
                    return null;
                var result = new Uint8Array(new ArrayBuffer(length));
                for (var i = 0; i < length; i++) {
                    result[i] = this.data.getUint8(this.position);
                    this.position += ByteArray.SIZE_OF_UINT8;
                }
                return result;
            };

            /**
            * Read a Uint16Array from the byte stream.
            * @param	length An unsigned short indicating the length of the Uint16Array.
            */
            ByteArray.prototype.readUint16Array = function (length) {
                var size = length * ByteArray.SIZE_OF_UINT16;
                if (!this.validate(size))
                    return null;
                var result = new Uint16Array(new ArrayBuffer(size));
                for (var i = 0; i < length; i++) {
                    result[i] = this.data.getUint16(this.position);
                    this.position += ByteArray.SIZE_OF_UINT16;
                }
                return result;
            };

            /**
            * Read a Uint32Array from the byte stream.
            * @param	length An unsigned short indicating the length of the Uint32Array.
            */
            ByteArray.prototype.readUint32Array = function (length) {
                var size = length * ByteArray.SIZE_OF_UINT32;
                if (!this.validate(size))
                    return null;
                var result = new Uint32Array(new ArrayBuffer(size));
                for (var i = 0; i < length; i++) {
                    result[i] = this.data.getUint32(this.position);
                    this.position += ByteArray.SIZE_OF_UINT32;
                }
                return result;
            };

            /**
            * Read a Int8Array from the byte stream.
            * @param	length An unsigned short indicating the length of the Int8Array.
            */
            ByteArray.prototype.readInt8Array = function (length) {
                if (!this.validate(length))
                    return null;
                var result = new Int8Array(new ArrayBuffer(length));
                for (var i = 0; i < length; i++) {
                    result[i] = this.data.getInt8(this.position);
                    this.position += ByteArray.SIZE_OF_INT8;
                }
                return result;
            };

            /**
            * Read a Int16Array from the byte stream.
            * @param	length An unsigned short indicating the length of the Int16Array.
            */
            ByteArray.prototype.readInt16Array = function (length) {
                var size = length * ByteArray.SIZE_OF_INT16;
                if (!this.validate(size))
                    return null;
                var result = new Int16Array(new ArrayBuffer(size));
                for (var i = 0; i < length; i++) {
                    result[i] = this.data.getInt16(this.position);
                    this.position += ByteArray.SIZE_OF_INT16;
                }
                return result;
            };

            /**
            * Read a Int32Array from the byte stream.
            * @param	length An unsigned short indicating the length of the Int32Array.
            */
            ByteArray.prototype.readInt32Array = function (length) {
                var size = length * ByteArray.SIZE_OF_INT32;
                if (!this.validate(size))
                    return null;
                var result = new Int32Array(new ArrayBuffer(size));
                for (var i = 0; i < length; i++) {
                    result[i] = this.data.getUint32(this.position);
                    this.position += ByteArray.SIZE_OF_INT32;
                }
                return result;
            };

            /**
            * Read a Float32Array from the byte stream.
            * @param	length An unsigned short indicating the length of the Float32Array.
            */
            ByteArray.prototype.readFloat32Array = function (length) {
                var size = length * ByteArray.SIZE_OF_FLOAT32;
                if (!this.validate(size))
                    return null;
                var result = new Float32Array(new ArrayBuffer(size));
                for (var i = 0; i < length; i++) {
                    result[i] = this.data.getFloat32(this.position);
                    this.position += ByteArray.SIZE_OF_FLOAT32;
                }
                return result;
            };

            /**
            * Read a Float64Array from the byte stream.
            * @param	length An unsigned short indicating the length of the Float64Array.
            */
            ByteArray.prototype.readFloat64Array = function (length) {
                var size = length * ByteArray.SIZE_OF_FLOAT64;
                if (!this.validate(size))
                    return null;
                var result = new Float64Array(new ArrayBuffer(size));
                for (var i = 0; i < length; i++) {
                    result[i] = this.data.getFloat64(this.position);
                    this.position += ByteArray.SIZE_OF_FLOAT64;
                }
                return result;
            };

            /**********************/
            /*  PRIVATE METHODS   */
            /**********************/
            ByteArray.prototype.validate = function (len) {
                len += this.offset;
                if (this.data.byteLength > 0 && this._position + len <= this.data.byteLength) {
                    return true;
                } else {
                    throw {
                        name: 'Error',
                        message: 'Error #2030: End of file was encountered.',
                        errorID: 2030
                    };
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

            /**
            * UTF-8 Encoding/Decoding
            */
            ByteArray.prototype.encodeUTF8 = function (str) {
                var pos = 0;
                var codePoints = this.stringToCodePoints(str);
                var outputBytes = [];

                while (codePoints.length > pos) {
                    var code_point = codePoints[pos++];

                    if (this.inRange(code_point, 0xD800, 0xDFFF)) {
                        this.encoderError(code_point);
                    } else if (this.inRange(code_point, 0x0000, 0x007f)) {
                        outputBytes.push(code_point);
                    } else {
                        var count, offset;
                        if (this.inRange(code_point, 0x0080, 0x07FF)) {
                            count = 1;
                            offset = 0xC0;
                        } else if (this.inRange(code_point, 0x0800, 0xFFFF)) {
                            count = 2;
                            offset = 0xE0;
                        } else if (this.inRange(code_point, 0x10000, 0x10FFFF)) {
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
                        } else {
                            code_point = this.EOF_code_point;
                        }
                    } else {
                        if (utf8_bytes_needed === 0) {
                            if (this.inRange(_byte, 0x00, 0x7F)) {
                                code_point = _byte;
                            } else {
                                if (this.inRange(_byte, 0xC2, 0xDF)) {
                                    utf8_bytes_needed = 1;
                                    utf8_lower_boundary = 0x80;
                                    utf8_code_point = _byte - 0xC0;
                                } else if (this.inRange(_byte, 0xE0, 0xEF)) {
                                    utf8_bytes_needed = 2;
                                    utf8_lower_boundary = 0x800;
                                    utf8_code_point = _byte - 0xE0;
                                } else if (this.inRange(_byte, 0xF0, 0xF4)) {
                                    utf8_bytes_needed = 3;
                                    utf8_lower_boundary = 0x10000;
                                    utf8_code_point = _byte - 0xF0;
                                } else {
                                    this.decoderError(fatal);
                                }
                                utf8_code_point = utf8_code_point * Math.pow(64, utf8_bytes_needed);
                                code_point = null;
                            }
                        } else if (!this.inRange(_byte, 0x80, 0xBF)) {
                            utf8_code_point = 0;
                            utf8_bytes_needed = 0;
                            utf8_bytes_seen = 0;
                            utf8_lower_boundary = 0;
                            pos--;
                            code_point = this.decoderError(fatal, _byte);
                        } else {
                            utf8_bytes_seen += 1;
                            utf8_code_point = utf8_code_point + (_byte - 0x80) * Math.pow(64, utf8_bytes_needed - utf8_bytes_seen);

                            if (utf8_bytes_seen !== utf8_bytes_needed) {
                                code_point = null;
                            } else {
                                var cp = utf8_code_point;
                                var lower_boundary = utf8_lower_boundary;
                                utf8_code_point = 0;
                                utf8_bytes_needed = 0;
                                utf8_bytes_seen = 0;
                                utf8_lower_boundary = 0;
                                if (this.inRange(cp, lower_boundary, 0x10FFFF) && !this.inRange(cp, 0xD800, 0xDFFF)) {
                                    code_point = cp;
                                } else {
                                    code_point = this.decoderError(fatal, _byte);
                                }
                            }
                        }
                    }

                    //Decode string
                    if (code_point !== null && code_point !== this.EOF_code_point) {
                        if (code_point <= 0xFFFF) {
                            if (code_point > 0)
                                result += String.fromCharCode(code_point);
                        } else {
                            code_point -= 0x10000;
                            result += String.fromCharCode(0xD800 + ((code_point >> 10) & 0x3ff));
                            result += String.fromCharCode(0xDC00 + (code_point & 0x3ff));
                        }
                    }
                }
                return result;
            };
            ByteArray.prototype.encoderError = function (code_point) {
                throw {
                    name: 'EncodingError',
                    message: 'The code point ' + code_point + ' could not be encoded.',
                    errorID: 0
                };
            };
            ByteArray.prototype.decoderError = function (fatal, opt_code_point) {
                if (fatal) {
                    throw {
                        name: 'DecodingError',
                        message: 'DecodingError.',
                        errorID: 0
                    };
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
                /** @type {Array.<number>} */
                var cps = [];

                // Based on http://www.w3.org/TR/WebIDL/#idl-DOMString
                var i = 0, n = string.length;
                while (i < string.length) {
                    var c = string.charCodeAt(i);
                    if (!this.inRange(c, 0xD800, 0xDFFF)) {
                        cps.push(c);
                    } else if (this.inRange(c, 0xDC00, 0xDFFF)) {
                        cps.push(0xFFFD);
                    } else {
                        if (i === n - 1) {
                            cps.push(0xFFFD);
                        } else {
                            var d = string.charCodeAt(i + 1);
                            if (this.inRange(d, 0xDC00, 0xDFFF)) {
                                var a = c & 0x3FF;
                                var b = d & 0x3FF;
                                i += 1;
                                cps.push(0x10000 + (a << 10) + b);
                            } else {
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
            ByteArray.SIZE_OF_UINT8 = 1;
            ByteArray.SIZE_OF_UINT16 = 2;
            ByteArray.SIZE_OF_UINT32 = 4;
            ByteArray.SIZE_OF_FLOAT32 = 4;
            ByteArray.SIZE_OF_FLOAT64 = 8;
            return ByteArray;
        })();
        utils.ByteArray = ByteArray;
    })(nid.utils || (nid.utils = {}));
    var utils = nid.utils;
})(nid || (nid = {}));
var nid;
(function (nid) {
    ///<reference path="LZMA.d.ts" />
    ///<reference path="../ByteArray.ts" />
    (function (lzma) {
        /**
        * LZMA Decoder
        * @author Nidin Vinayakan | nidinthb@gmail.com
        */
        var ByteArray = nid.utils.ByteArray;

        var LzmaDecoder = (function () {
            function LzmaDecoder() {
                this.posSlotDecoder = lzma.BitTreeDecoder.constructArray(6, lzma.LZMA.kNumLenToPosStates); //6
                this.alignDecoder = new lzma.BitTreeDecoder(lzma.LZMA.kNumAlignBits);
                this.posDecoders = new Uint16Array(1 + lzma.LZMA.kNumFullDistances - lzma.LZMA.kEndPosModelIndex);

                this.isMatch = new Uint16Array(lzma.LZMA.kNumStates << lzma.LZMA.kNumPosBitsMax);
                this.isRep = new Uint16Array(lzma.LZMA.kNumStates);
                this.isRepG0 = new Uint16Array(lzma.LZMA.kNumStates);
                this.isRepG1 = new Uint16Array(lzma.LZMA.kNumStates);
                this.isRepG2 = new Uint16Array(lzma.LZMA.kNumStates);
                this.isRep0Long = new Uint16Array(lzma.LZMA.kNumStates << lzma.LZMA.kNumPosBitsMax);

                this.lenDecoder = new lzma.LenDecoder();
                this.repLenDecoder = new lzma.LenDecoder();
                this.rangeDec = new lzma.RangeDecoder();
                this.outWindow = new lzma.OutWindow();
            }
            LzmaDecoder.prototype.init = function () {
                this.initLiterals();
                this.initDist();

                lzma.LZMA.INIT_PROBS(this.isMatch);
                lzma.LZMA.INIT_PROBS(this.isRep);
                lzma.LZMA.INIT_PROBS(this.isRepG0);
                lzma.LZMA.INIT_PROBS(this.isRepG1);
                lzma.LZMA.INIT_PROBS(this.isRepG2);
                lzma.LZMA.INIT_PROBS(this.isRep0Long);

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
                    this.litProbs[i] = lzma.LZMA.PROB_INIT_VAL;
                }
            };
            LzmaDecoder.prototype.decodeLiteral = function (state, rep0) {
                var prevByte = 0;
                if (!this.outWindow.isEmpty())
                    prevByte = this.outWindow.getByte(1);

                var symbol = 1;
                var litState = ((this.outWindow.totalPos & ((1 << this.lp) - 1)) << this.lc) + (prevByte >> (8 - this.lc));
                var probsOffset = 0x300 * litState;

                if (state >= 7) {
                    var matchByte = this.outWindow.getByte(rep0 + 1);
                    do {
                        var matchBit = (matchByte >> 7) & 1;
                        matchByte <<= 1;
                        var bit = this.rangeDec.decodeBit(this.litProbs, probsOffset + ((1 + matchBit) << 8) + symbol);
                        symbol = (symbol << 1) | bit;
                        if (matchBit != bit)
                            break;
                    } while(symbol < 0x100);
                }
                while (symbol < 0x100)
                    symbol = (symbol << 1) | this.rangeDec.decodeBit(this.litProbs, probsOffset + symbol);
                this.outWindow.putByte(symbol - 0x100);
            };
            LzmaDecoder.prototype.decodeDistance = function (len) {
                var lenState = len;
                if (lenState > lzma.LZMA.kNumLenToPosStates - 1)
                    lenState = lzma.LZMA.kNumLenToPosStates - 1;

                var posSlot = this.posSlotDecoder[lenState].decode(this.rangeDec);
                if (posSlot < 4)
                    return posSlot;

                var numDirectBits = ((posSlot >> 1) - 1);
                var dist = ((2 | (posSlot & 1)) << numDirectBits);
                if (posSlot < lzma.LZMA.kEndPosModelIndex) {
                    dist += lzma.LZMA.BitTreeReverseDecode(this.posDecoders, numDirectBits, this.rangeDec, dist - posSlot);
                } else {
                    dist += this.rangeDec.decodeDirectBits(numDirectBits - lzma.LZMA.kNumAlignBits) << lzma.LZMA.kNumAlignBits;
                    dist += this.alignDecoder.reverseDecode(this.rangeDec);
                }
                return dist;
            };
            LzmaDecoder.prototype.initDist = function () {
                for (var i = 0; i < lzma.LZMA.kNumLenToPosStates; i++) {
                    this.posSlotDecoder[i].init();
                }
                this.alignDecoder.init();
                lzma.LZMA.INIT_PROBS(this.posDecoders);
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

                if (this.dictSize < lzma.LZMA.LZMA_DIC_MIN) {
                    this.dictSize = lzma.LZMA.LZMA_DIC_MIN;
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
                    this.outWindow.outStream = new ByteArray(new ArrayBuffer(unpackSize));
                }

                var rep0 = 0, rep1 = 0, rep2 = 0, rep3 = 0;
                var state = 0;

                for (; ;) {
                    if (unpackSizeDefined && unpackSize == 0 && !this.markerIsMandatory) {
                        if (this.rangeDec.isFinishedOK()) {
                            return lzma.LZMA.LZMA_RES_FINISHED_WITHOUT_MARKER;
                        }
                    }

                    var posState = this.outWindow.totalPos & ((1 << this.pb) - 1);

                    if (this.rangeDec.decodeBit(this.isMatch, (state << lzma.LZMA.kNumPosBitsMax) + posState) == 0) {
                        if (unpackSizeDefined && unpackSize == 0) {
                            return lzma.LZMA.LZMA_RES_ERROR;
                        }
                        this.decodeLiteral(state, rep0);
                        state = this.updateState_Literal(state);
                        unpackSize--;
                        continue;
                    }

                    var len;

                    if (this.rangeDec.decodeBit(this.isRep, state) != 0) {
                        if (unpackSizeDefined && unpackSize == 0) {
                            return lzma.LZMA.LZMA_RES_ERROR;
                        }
                        if (this.outWindow.isEmpty()) {
                            return lzma.LZMA.LZMA_RES_ERROR;
                        }
                        if (this.rangeDec.decodeBit(this.isRepG0, state) == 0) {
                            if (this.rangeDec.decodeBit(this.isRep0Long, (state << lzma.LZMA.kNumPosBitsMax) + posState) == 0) {
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
                            return this.rangeDec.isFinishedOK() ? lzma.LZMA.LZMA_RES_FINISHED_WITH_MARKER : lzma.LZMA.LZMA_RES_ERROR;
                        }

                        if (unpackSizeDefined && unpackSize == 0) {
                            return lzma.LZMA.LZMA_RES_ERROR;
                        }
                        if (rep0 >= this.dictSize || !this.outWindow.checkDistance(rep0)) {
                            return lzma.LZMA.LZMA_RES_ERROR;
                        }
                    }
                    len += lzma.LZMA.kMatchMinLen;
                    var isError = false;
                    if (unpackSizeDefined && unpackSize < len) {
                        len = unpackSize;
                        isError = true;
                    }
                    this.outWindow.copyMatch(rep0 + 1, len);
                    unpackSize -= len;
                    if (isError) {
                        return lzma.LZMA.LZMA_RES_ERROR;
                    }
                }
            };
            return LzmaDecoder;
        })();
        lzma.LzmaDecoder = LzmaDecoder;
    })(nid.lzma || (nid.lzma = {}));
    var lzma = nid.lzma;
})(nid || (nid = {}));
var nid;
(function (nid) {
    ///<reference path="../ByteArray.ts" />
    (function (lzma) {
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
                this.outStream.writeUnsignedByte(b);
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
        lzma.OutWindow = OutWindow;
    })(nid.lzma || (nid.lzma = {}));
    var lzma = nid.lzma;
})(nid || (nid = {}));
var nid;
(function (nid) {
    ///<reference path="LZMA.d.ts" />
    (function (lzma) {
        var MEMORY = nid.utils.MEMORY;

        var RangeDecoder = (function () {
            function RangeDecoder() {
                this.in_pos = 0;
            }
            RangeDecoder.prototype.isFinishedOK = function () {
                return MEMORY.u32[this.codeI] == 0;
            };
            RangeDecoder.prototype.init = function () {
                this.rangeI = MEMORY.getUint32();
                this.codeI = MEMORY.getUint32();
                this.loc1 = MEMORY.getUint32();
                this.loc2 = MEMORY.getUint32();

                this.corrupted = false;
                if (this.inStream.readUnsignedByte() != 0) {
                    this.corrupted = true;
                }

                MEMORY.u32[this.rangeI] = 0xFFFFFFFF;
                MEMORY.u32[this.codeI] = 0;

                for (var i = 0; i < 4; i++) {
                    MEMORY.u32[this.codeI] = (MEMORY.u32[this.codeI] << 8) | this.inStream.readUnsignedByte();
                }

                if (MEMORY.u32[this.codeI] == MEMORY.u32[this.rangeI]) {
                    this.corrupted = true;
                }
            };

            RangeDecoder.prototype.normalize = function () {
                if (MEMORY.u32[this.rangeI] < RangeDecoder.kTopValue) {
                    MEMORY.u32[this.rangeI] <<= 8;
                    MEMORY.u32[this.codeI] = (MEMORY.u32[this.codeI] << 8) | this.inStream.readUnsignedByte();
                }
            };

            RangeDecoder.prototype.decodeDirectBits = function (numBits) {
                MEMORY.u32[this.loc1] = 0; //UInt32
                do {
                    MEMORY.u32[this.rangeI] >>= 1;
                    MEMORY.u32[this.codeI] -= MEMORY.u32[this.rangeI];
                    MEMORY.u32[this.loc2] = 0 - (MEMORY.u32[this.codeI] >> 31);
                    MEMORY.u32[this.codeI] += MEMORY.u32[this.rangeI] & MEMORY.u32[this.loc2];

                    if (MEMORY.u32[this.codeI] == MEMORY.u32[this.rangeI]) {
                        this.corrupted = true;
                    }

                    this.normalize();
                    MEMORY.u32[this.loc1] <<= 1;
                    MEMORY.u32[this.loc1] += MEMORY.u32[this.loc2] + 1;
                } while(--numBits);
                return MEMORY.u32[this.loc1];
            };

            RangeDecoder.prototype.decodeBit = function (prob, index) {
                var v = prob[index];

                //bound
                MEMORY.u32[this.loc1] = (MEMORY.u32[this.rangeI] >>> 11) * v;
                var symbol;
                if (MEMORY.u32[this.codeI] < MEMORY.u32[this.loc1]) {
                    v += ((1 << 11) - v) >> 5;
                    MEMORY.u32[this.rangeI] = MEMORY.u32[this.loc1];
                    symbol = 0;
                } else {
                    v -= v >> lzma.LZMA.kNumMoveBits;
                    MEMORY.u32[this.codeI] -= MEMORY.u32[this.loc1];
                    MEMORY.u32[this.rangeI] -= MEMORY.u32[this.loc1];
                    symbol = 1;
                }
                prob[index] = v;
                this.normalize();
                return symbol;
            };
            RangeDecoder.kTopValue = (1 << 24);
            return RangeDecoder;
        })();
        lzma.RangeDecoder = RangeDecoder;
    })(nid.lzma || (nid.lzma = {}));
    var lzma = nid.lzma;
})(nid || (nid = {}));
var nid;
(function (nid) {
    ///<reference path="LZMA.d.ts" />
    (function (lzma) {
        /**
        * LZMA Decoder
        * @author Nidin Vinayakan | nidinthb@gmail.com
        */
        var BitTreeDecoder = (function () {
            function BitTreeDecoder(numBits) {
                this.numBits = numBits;
                this.probs = new Uint8Array(1 << this.numBits);
            }
            BitTreeDecoder.prototype.init = function () {
                lzma.LZMA.INIT_PROBS(this.probs);
            };
            BitTreeDecoder.prototype.decode = function (rc) {
                var m = 1;
                for (var i = 0; i < this.numBits; i++)
                    m = (m << 1) + rc.decodeBit(this.probs, m);
                return m - (1 << this.numBits);
            };
            BitTreeDecoder.prototype.reverseDecode = function (rc) {
                return lzma.LZMA.BitTreeReverseDecode(this.probs, this.numBits, rc);
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
        lzma.BitTreeDecoder = BitTreeDecoder;
    })(nid.lzma || (nid.lzma = {}));
    var lzma = nid.lzma;
})(nid || (nid = {}));
var nid;
(function (nid) {
    ///<reference path="LZMA.d.ts" />
    (function (lzma) {
        /**
        * LZMA Decoder
        * @author Nidin Vinayakan | nidinthb@gmail.com
        */
        var LenDecoder = (function () {
            function LenDecoder() {
                this.lowCoder = lzma.BitTreeDecoder.constructArray(3, 1 << lzma.LZMA.kNumPosBitsMax);
                this.midCoder = lzma.BitTreeDecoder.constructArray(3, 1 << lzma.LZMA.kNumPosBitsMax);
                this.highCoder = new lzma.BitTreeDecoder(8);
            }
            LenDecoder.prototype.init = function () {
                this.choice = [lzma.LZMA.PROB_INIT_VAL, lzma.LZMA.PROB_INIT_VAL];
                this.highCoder.init();
                for (var i = 0; i < (1 << lzma.LZMA.kNumPosBitsMax); i++) {
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
        lzma.LenDecoder = LenDecoder;
    })(nid.lzma || (nid.lzma = {}));
    var lzma = nid.lzma;
})(nid || (nid = {}));
var nid;
(function (nid) {
    ///<reference path="LZMA.d.ts" />
    ///<reference path="../ByteArray.ts" />
    (function (lzma) {
        var LZMA = (function () {
            function LZMA() {
                this.decoder = new lzma.LzmaDecoder();
            }
            LZMA.INIT_PROBS = function (p) {
                for (var i = 0; i < p.length / 2; i++) {
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
                var header = data.readUint8Array(13);
                var i;

                /*for (i = 0; i < 13; i++){
                header[i] = data[i];
                }*/
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

                console.log("Read    ", data.position);
                console.log("Written ", this.decoder.outWindow.outStream.position);

                if (res == LZMA.LZMA_RES_ERROR) {
                    throw "LZMA decoding error";
                } else if (res == LZMA.LZMA_RES_FINISHED_WITHOUT_MARKER) {
                    console.log("Finished without end marker");
                } else if (res == LZMA.LZMA_RES_FINISHED_WITH_MARKER) {
                    if (unpackSizeDefined) {
                        if (this.decoder.outWindow.outStream.position != unpackSize) {
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
                return this.ucdata;
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
            LZMA.kNumFullDistances = (1 << (LZMA.kEndPosModelIndex >> 1));
            LZMA.kMatchMinLen = 2;
            return LZMA;
        })();
        lzma.LZMA = LZMA;
    })(nid.lzma || (nid.lzma = {}));
    var lzma = nid.lzma;
})(nid || (nid = {}));
//# sourceMappingURL=LZMA.js.map

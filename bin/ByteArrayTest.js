var nid;
(function (nid) {
    /**
    * JavaScript ByteArray
    * version : 0.1
    * @author Nidin Vinayakan | nidinthb@gmail.com
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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var tsUnit;
(function (tsUnit) {
    var Test = (function () {
        function Test() {
            this.tests = [];
            this.testClass = new TestClass();
        }
        Test.prototype.addTestClass = function (testClass, name) {
            if (typeof name === "undefined") { name = 'Tests'; }
            this.tests.push(new TestDefintion(testClass, name));
        };

        Test.prototype.isReservedFunctionName = function (functionName) {
            for (var prop in this.testClass) {
                if (prop === functionName) {
                    return true;
                }
            }
            return false;
        };

        Test.prototype.run = function () {
            var testContext = new TestContext();
            var testResult = new TestResult();

            for (var i = 0; i < this.tests.length; ++i) {
                var testClass = this.tests[i].testClass;
                var testName = this.tests[i].name;
                for (var prop in testClass) {
                    if (!this.isReservedFunctionName(prop)) {
                        if (typeof testClass[prop] === 'function') {
                            if (typeof testClass['setUp'] === 'function') {
                                testClass['setUp']();
                            }
                            try  {
                                testClass[prop](testContext);
                                testResult.passes.push(new TestDescription(testName, prop, 'OK'));
                            } catch (err) {
                                testResult.errors.push(new TestDescription(testName, prop, err));
                            }
                            if (typeof testClass['tearDown'] === 'function') {
                                testClass['tearDown']();
                            }
                        }
                    }
                }
            }

            return testResult;
        };

        Test.prototype.showResults = function (target, result) {
            var template = '<article>' + '<h1>' + this.getTestResult(result) + '</h1>' + '<p>' + this.getTestSummary(result) + '</p>' + '<section id="tsFail">' + '<h2>Errors</h2>' + '<ul class="bad">' + this.getTestResultList(result.errors) + '</ul>' + '</section>' + '<section id="tsOkay">' + '<h2>Passing Tests</h2>' + '<ul class="good">' + this.getTestResultList(result.passes) + '</ul>' + '</section>' + '</article>';

            target.innerHTML = template;
        };

        Test.prototype.getTestResult = function (result) {
            return result.errors.length === 0 ? 'Test Passed' : 'Test Failed';
        };

        Test.prototype.getTestSummary = function (result) {
            return 'Total tests: <span id="tsUnitTotalCout">' + (result.passes.length + result.errors.length).toString() + '</span>. ' + 'Passed tests: <span id="tsUnitPassCount" class="good">' + result.passes.length + '</span>. ' + 'Failed tests: <span id="tsUnitFailCount" class="bad">' + result.errors.length + '</span>.';
        };

        Test.prototype.getTestResultList = function (testResults) {
            var list = '';
            var group = '';
            var isFirst = true;
            for (var i = 0; i < testResults.length; ++i) {
                var result = testResults[i];
                if (result.testName !== group) {
                    group = result.testName;
                    if (isFirst) {
                        isFirst = false;
                    } else {
                        list += '</li></ul>';
                    }
                    list += '<li>' + result.testName + '<ul>';
                }
                list += '<li>' + result.funcName + '(): ' + this.encodeHtmlEntities(result.message) + '</li>';
            }
            return list + '</ul>';
        };

        Test.prototype.encodeHtmlEntities = function (input) {
            var entitiesToReplace = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
            input.replace(/[&<>]/g, function (entity) {
                return entitiesToReplace[entity] || entity;
            });
            return input;
        };
        return Test;
    })();
    tsUnit.Test = Test;

    var TestContext = (function () {
        function TestContext() {
        }
        TestContext.prototype.setUp = function () {
        };

        TestContext.prototype.tearDown = function () {
        };

        TestContext.prototype.areIdentical = function (a, b) {
            if (a !== b) {
                throw 'areIdentical failed when passed ' + '{' + (typeof a) + '} "' + a + '" and ' + '{' + (typeof b) + '} "' + b + '"';
            }
        };
        TestContext.prototype.areIdenticalArray = function (a, b) {
            var r;
            r = a.length == b.length;
            if (r) {
                for (var i = 0; i < a.length; i++) {
                    if (a[i] != b[i]) {
                        r = false;
                        break;
                    }
                }
            }
            if (!r) {
                throw 'areIdentical failed when passed ' + '{' + (typeof a) + '} "' + a + '" and ' + '{' + (typeof b) + '} "' + b + '"';
            }
        };

        TestContext.prototype.areNotIdentical = function (a, b) {
            if (a === b) {
                throw 'areNotIdentical failed when passed ' + '{' + (typeof a) + '} "' + a + '" and ' + '{' + (typeof b) + '} "' + b + '"';
            }
        };

        TestContext.prototype.isTrue = function (a) {
            if (!a) {
                throw 'isTrue failed when passed ' + '{' + (typeof a) + '} "' + a + '"';
            }
        };

        TestContext.prototype.isFalse = function (a) {
            if (a) {
                throw 'isFalse failed when passed ' + '{' + (typeof a) + '} "' + a + '"';
            }
        };

        TestContext.prototype.isTruthy = function (a) {
            if (!a) {
                throw 'isTrue failed when passed ' + '{' + (typeof a) + '} "' + a + '"';
            }
        };

        TestContext.prototype.isFalsey = function (a) {
            if (a) {
                throw 'isFalse failed when passed ' + '{' + (typeof a) + '} "' + a + '"';
            }
        };

        TestContext.prototype.throws = function (a) {
            var isThrown = false;
            try  {
                a();
            } catch (ex) {
                isThrown = true;
            }
            if (!isThrown) {
                throw 'did not throw an error';
            }
        };

        TestContext.prototype.fail = function () {
            throw 'fail';
        };
        return TestContext;
    })();
    tsUnit.TestContext = TestContext;

    var TestClass = (function (_super) {
        __extends(TestClass, _super);
        function TestClass() {
            _super.apply(this, arguments);
        }
        return TestClass;
    })(TestContext);
    tsUnit.TestClass = TestClass;

    var FakeFunction = (function () {
        function FakeFunction(name, delgate) {
            this.name = name;
            this.delgate = delgate;
        }
        return FakeFunction;
    })();
    tsUnit.FakeFunction = FakeFunction;

    var Fake = (function () {
        function Fake(obj) {
            for (var prop in obj) {
                if (typeof obj[prop] === 'function') {
                    this[prop] = function () {
                    };
                } else {
                    this[prop] = null;
                }
            }
        }
        Fake.prototype.create = function () {
            return this;
        };

        Fake.prototype.addFunction = function (name, delegate) {
            this[name] = delegate;
        };

        Fake.prototype.addProperty = function (name, value) {
            this[name] = value;
        };
        return Fake;
    })();
    tsUnit.Fake = Fake;

    var TestDefintion = (function () {
        function TestDefintion(testClass, name) {
            this.testClass = testClass;
            this.name = name;
        }
        return TestDefintion;
    })();

    var TestError = (function () {
        function TestError(name, message) {
            this.name = name;
            this.message = message;
        }
        return TestError;
    })();

    var TestDescription = (function () {
        function TestDescription(testName, funcName, message) {
            this.testName = testName;
            this.funcName = funcName;
            this.message = message;
        }
        return TestDescription;
    })();
    tsUnit.TestDescription = TestDescription;

    var TestResult = (function () {
        function TestResult() {
            this.passes = [];
            this.errors = [];
        }
        return TestResult;
    })();
    tsUnit.TestResult = TestResult;
})(tsUnit || (tsUnit = {}));
/// <reference path="../src/ByteArray.ts" />
/// <reference path="tsUnit.ts" />
var ByteArrayTest = (function (_super) {
    __extends(ByteArrayTest, _super);
    function ByteArrayTest() {
        _super.apply(this, arguments);
        this.target = new nid.utils.ByteArray(new ArrayBuffer(1024 * 2));
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
        this.SIZE_OF_BOOLEAN = nid.utils.ByteArray.SIZE_OF_BOOLEAN;
        this.SIZE_OF_INT8 = nid.utils.ByteArray.SIZE_OF_INT8;
        this.SIZE_OF_INT16 = nid.utils.ByteArray.SIZE_OF_INT16;
        this.SIZE_OF_INT32 = nid.utils.ByteArray.SIZE_OF_INT32;
        this.SIZE_OF_UINT8 = nid.utils.ByteArray.SIZE_OF_UINT8;
        this.SIZE_OF_UINT16 = nid.utils.ByteArray.SIZE_OF_UINT16;
        this.SIZE_OF_UINT32 = nid.utils.ByteArray.SIZE_OF_UINT32;
        this.SIZE_OF_FLOAT32 = nid.utils.ByteArray.SIZE_OF_FLOAT32;
        this.SIZE_OF_FLOAT64 = nid.utils.ByteArray.SIZE_OF_FLOAT64;
    }
    ByteArrayTest.prototype.writeAndReadBoolean = function () {
        //this.target.endian = nid.utils.ByteArray.LITTLE_ENDIAN;
        this.target.writeBoolean(true);
        this.target.position = this.target.position - this.SIZE_OF_BOOLEAN;
        var result = this.target.readBoolean();
        this.areIdentical(true, result);
        this.target.writeBoolean(false);
        this.target.position = this.target.position - this.SIZE_OF_BOOLEAN;
        var result = this.target.readBoolean();
        this.areIdentical(false, result);
    };
    ByteArrayTest.prototype.writeAndReadByte = function () {
        this.target.writeByte(this.BYTE_MAX);
        this.target.writeByte(this.BYTE_MIN);
        this.target.position = this.target.position - (2 * this.SIZE_OF_INT8);
        var result = this.target.readByte();
        this.areIdentical(this.BYTE_MAX, result);
        result = this.target.readByte();
        this.areIdentical(this.BYTE_MIN, result);
    };

    ByteArrayTest.prototype.writeAndReadUnsignedByte = function () {
        this.target.writeUnsignedByte(this.UBYTE_MAX);
        this.target.writeUnsignedByte(this.UBYTE_MIN);
        this.target.position = this.target.position - (2 * this.SIZE_OF_UINT8);
        var result = this.target.readUnsignedByte();
        this.areIdentical(this.UBYTE_MAX, result);
        result = this.target.readUnsignedByte();
        this.areIdentical(this.UBYTE_MIN, result);
    };
    ByteArrayTest.prototype.writeAndReadDouble = function () {
        this.target.writeDouble(this.DOUBLE_MAX);
        this.target.writeDouble(this.DOUBLE_MIN);
        this.target.position = this.target.position - (2 * this.SIZE_OF_FLOAT64);
        var result = this.target.readDouble();
        this.areIdentical(this.DOUBLE_MAX, result);
        result = this.target.readDouble();
        this.areIdentical(this.DOUBLE_MIN, result);
    };
    ByteArrayTest.prototype.writeAndReadFloat = function () {
        this.target.writeFloat(this.FLOAT_MAX);
        this.target.writeFloat(this.FLOAT_MIN);
        this.target.position = this.target.position - (2 * this.SIZE_OF_FLOAT32);
        var result = this.target.readFloat();
        this.areIdentical(this.FLOAT_MAX, result);
        var result = this.target.readFloat();
        this.areIdentical(this.FLOAT_MIN, result);
    };
    ByteArrayTest.prototype.writeAndReadInt = function () {
        this.target.writeInt(this.INT_MAX);
        this.target.writeInt(this.INT_MIN);
        this.target.position = this.target.position - (2 * this.SIZE_OF_INT32);
        var result = this.target.readInt();
        this.areIdentical(this.INT_MAX, result);
        result = this.target.readInt();
        this.areIdentical(this.INT_MIN, result);
    };
    ByteArrayTest.prototype.writeAndReadUnsignedInt = function () {
        this.target.writeUnsignedInt(this.UINT_MAX);
        this.target.writeUnsignedInt(this.UINT_MIN);
        this.target.position = this.target.position - (2 * this.SIZE_OF_UINT32);
        var result = this.target.readUnsignedInt();
        this.areIdentical(this.UINT_MAX, result);
        result = this.target.readInt();
        this.areIdentical(this.UINT_MIN, result);
    };
    ByteArrayTest.prototype.writeAndReadShort = function () {
        this.target.writeShort(this.SHORT_MAX);
        this.target.writeShort(this.SHORT_MIN);
        this.target.position = this.target.position - (2 * this.SIZE_OF_INT16);
        var result = this.target.readShort();
        this.areIdentical(this.SHORT_MAX, result);
        result = this.target.readShort();
        this.areIdentical(this.SHORT_MIN, result);
    };
    ByteArrayTest.prototype.writeAndReadUnsignedShort = function () {
        this.target.writeUnsignedShort(this.USHORT_MAX);
        this.target.writeUnsignedShort(this.USHORT_MIN);
        this.target.position = this.target.position - (2 * this.SIZE_OF_UINT16);
        var result = this.target.readUnsignedShort();
        this.areIdentical(this.USHORT_MAX, result);
        result = this.target.readUnsignedShort();
        this.areIdentical(this.USHORT_MIN, result);
    };
    ByteArrayTest.prototype.writeAndReadUTF = function () {
        this.target.writeUTF(this.UTF_STR);
        this.target.position = this.target.position - (this.SIZE_OF_UINT16 + this.UTF_STR.length);
        var result = this.target.readUTF();
        this.areIdentical(this.UTF_STR, result);
    };
    ByteArrayTest.prototype.writeAndReadUTFBytes = function () {
        this.target.writeUTFBytes(this.UTF_STR);
        this.target.position = this.target.position - this.UTF_STR.length;
        var result = this.target.readUTFBytes(this.UTF_STR.length);
        this.areIdentical(this.UTF_STR, result);
    };

    //EXTAR JS API
    ByteArrayTest.prototype.writeAndReadUint8Array = function () {
        var _array = new Uint8Array(new ArrayBuffer(4));
        _array[0] = 1;
        _array[1] = 11;
        _array[2] = 22;
        _array[3] = 33;
        this.target.writeUint8Array(_array);
        this.target.position = this.target.position - _array.length;
        var result = this.target.readUint8Array(_array.length);
        this.areIdenticalArray(_array, result);
    };
    ByteArrayTest.prototype.writeAndReadUint16Array = function () {
        var size = 4 * this.SIZE_OF_UINT16;
        var _array = new Uint16Array(new ArrayBuffer(size));
        _array[0] = 1;
        _array[1] = 11;
        _array[2] = 22;
        _array[3] = 33;
        this.target.writeUint16Array(_array);
        this.target.position = this.target.position - size;
        var result = this.target.readUint16Array(_array.length);
        this.areIdenticalArray(_array, result);
    };
    ByteArrayTest.prototype.writeAndReadUint32Array = function () {
        var size = 4 * this.SIZE_OF_UINT32;
        var _array = new Uint32Array(new ArrayBuffer(size));
        _array[0] = 1;
        _array[1] = 11;
        _array[2] = 22;
        _array[3] = 33;
        this.target.writeUint32Array(_array);
        this.target.position = this.target.position - size;
        var result = this.target.readUint32Array(_array.length);
        this.areIdenticalArray(_array, result);
    };
    ByteArrayTest.prototype.writeAndReadInt8Array = function () {
        var _array = new Int8Array(new ArrayBuffer(4));
        _array[0] = 1;
        _array[1] = 11;
        _array[2] = 22;
        _array[3] = 33;
        this.target.writeInt8Array(_array);
        this.target.position = this.target.position - _array.length;
        var result = this.target.readInt8Array(_array.length);
        this.areIdenticalArray(_array, result);
    };
    ByteArrayTest.prototype.writeAndReadInt16Array = function () {
        var size = 4 * this.SIZE_OF_INT16;
        var _array = new Int16Array(new ArrayBuffer(size));
        _array[0] = 1;
        _array[1] = 11;
        _array[2] = 22;
        _array[3] = 33;
        this.target.writeInt16Array(_array);
        this.target.position = this.target.position - size;
        var result = this.target.readInt16Array(_array.length);
        this.areIdenticalArray(_array, result);
    };
    ByteArrayTest.prototype.writeAndReadInt32Array = function () {
        var size = 4 * this.SIZE_OF_INT32;
        var _array = new Int32Array(new ArrayBuffer(size));
        _array[0] = 1;
        _array[1] = 11;
        _array[2] = 22;
        _array[3] = 33;
        this.target.writeInt32Array(_array);
        this.target.position = this.target.position - size;
        var result = this.target.readInt32Array(_array.length);
        this.areIdenticalArray(_array, result);
    };
    ByteArrayTest.prototype.writeAndReadFloat32Array = function () {
        var size = 4 * this.SIZE_OF_FLOAT32;
        var _array = new Float32Array(new ArrayBuffer(size));
        _array[0] = 1.02563;
        _array[1] = 11.056256;
        _array[2] = 22.0165465;
        _array[3] = 33.65486;
        this.target.writeFloat32Array(_array);
        this.target.position = this.target.position - size;
        var result = this.target.readFloat32Array(_array.length);
        this.areIdenticalArray(_array, result);
    };
    ByteArrayTest.prototype.writeAndReadFloat64Array = function () {
        var size = 4 * this.SIZE_OF_FLOAT64;
        var _array = new Float64Array(new ArrayBuffer(size));
        _array[0] = 1.02563;
        _array[1] = 11.056256;
        _array[2] = 22.0165465;
        _array[3] = 33.65486;
        this.target.writeFloat64Array(_array);
        this.target.position = this.target.position - size;
        var result = this.target.readFloat64Array(_array.length);
        this.areIdenticalArray(_array, result);
    };
    return ByteArrayTest;
})(tsUnit.TestClass);

// new instance of tsUnit
var test = new tsUnit.Test();

// add your test class (you can call this multiple times)
test.addTestClass(new ByteArrayTest());

// Use the built in results display
var TestRunner = {
    run: function run() {
        test.showResults(document.getElementById('results'), test.run());
    }
};

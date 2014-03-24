/**
* JavaScript ByteArray 
* version : 0.1
* @author Nidin Vinayak | nidinthb@gmail.com
*
* ActionScript3 ByteArray implementation in JavaScript
* limitation : size of ByteArray cannot be changed
* 
*/
module nid.utils
{
	
	export class ByteArray
	{
		static BIG_ENDIAN:string = "bigEndian";
		static LITTLE_ENDIAN:string = "littleEndian";

        static SIZE_OF_BOOLEAN: number = 1;
        static SIZE_OF_INT8: number = 1;
        static SIZE_OF_INT16: number = 2;
        static SIZE_OF_INT32: number = 4;
        static SIZE_OF_UINT8: number = 1;
        static SIZE_OF_UINT16: number = 2;
        static SIZE_OF_UINT32: number = 4;
        static SIZE_OF_FLOAT32: number = 4;
        static SIZE_OF_FLOAT64: number = 8;

        private BUFFER_EXT_SIZE: number = 1024;//Buffer expansion szie
		
		public data:DataView;
        private _position: number;
        public write_position: number;
        public endian: string;

		constructor(buffer?:ArrayBuffer){
            
            if (typeof (buffer) === "undefined") {
                buffer = new ArrayBuffer(this.BUFFER_EXT_SIZE);
                this.write_position = 0;
            } else {
                this.write_position = buffer.byteLength;
            }
			this.data = new DataView(buffer);
            this._position = 0;
           
			this.endian = ByteArray.BIG_ENDIAN;
        }
        
        // getter setter
        get buffer(): ArrayBuffer {
            return this.data.buffer;
        }
        set buffer(value: ArrayBuffer) { 
            this.data = new DataView(value); 
        }
        get dataView(): DataView {
            return this.data;
        }
        set dataView(value: DataView) { 
            this.data = value; 
        }
        get position(): number {
            return this._position;
        }
        set position(value:number) {
            this._position = value;
            this.write_position = value > this.write_position ? value : this.write_position;
        }
        get length(): number {
            return this.data.byteLength;
        }
        set length(value: number) {
            this.validateBuffer(value);
        }
		
        get bytesAvailable():number {
            return this.data.byteLength - this._position;
        }
        //end 

		public clear():void{
			this._position=0;
		}
		public compress(algorithm:string="zlib") : void{}
		public uncompress(algorithm:string="zlib") : void{}
		public deflate():void{}
        public inflate(): void{ }
        
        /**
         * Reads a Boolean value from the byte stream. A single byte is read,
		 * and true is returned if the byte is nonzero,
		 * false otherwise.
		 * @return	Returns true if the byte is nonzero, false otherwise.
        */
        public readBoolean(): boolean{
            if (!this.validate(ByteArray.SIZE_OF_BOOLEAN)) return null;

            return this.data.getUint8(this._position++) != 0;
        }

        /**
		 * Reads a signed byte from the byte stream.
		 * The returned value is in the range -128 to 127.
		 * @return	An integer between -128 and 127.
         */
        public readByte(): number{
            if (!this.validate(ByteArray.SIZE_OF_INT8)) return null;

            return this.data.getInt8(this._position++);
        }

        /**
		 * Reads the number of data bytes, specified by the length parameter, from the byte stream.
		 * The bytes are read into the ByteArray object specified by the bytes parameter, 
		 * and the bytes are written into the destination ByteArray starting at the _position specified by offset.
		 * @param	bytes	The ByteArray object to read data into.
		 * @param	offset	The offset (_position) in bytes at which the read data should be written.
		 * @param	length	The number of bytes to read.  The default value of 0 causes all available data to be read.
         */
        public readBytes(bytes: ByteArray, offset: number= 0, length: number= 0): void{
            if (!this.validate(length)) return;
			var tmp_data:any = new DataView(this.data.buffer,this._position,length);
			this._position += length;
			//This method is expensive
			//for(var i=0; i < length;i++){
				//tmp_data.setUint8(i,this.data.getUint8(this._position++));
			//}
			bytes.dataView = tmp_data;
        }

		/**
		 * Reads an IEEE 754 double-precision (64-bit) floating-point number from the byte stream.
		 * @return	A double-precision (64-bit) floating-point number.
         */
        public readDouble(): number{
            if (!this.validate(ByteArray.SIZE_OF_FLOAT64)) return null;

            var value:number  = this.data.getFloat64(this._position);
            this._position += ByteArray.SIZE_OF_FLOAT64;
            return value;
        }

		/**
		 * Reads an IEEE 754 single-precision (32-bit) floating-point number from the byte stream.
		 * @return	A single-precision (32-bit) floating-point number.
         */
        public readFloat(): number{
            if (!this.validate(ByteArray.SIZE_OF_FLOAT32)) return null;

            var value: number = this.data.getFloat32(this._position);
            this._position += ByteArray.SIZE_OF_FLOAT32;
            return value;
        }

        /**
		 * Reads a signed 32-bit integer from the byte stream.
		 * 
		 *   The returned value is in the range -2147483648 to 2147483647.
		 * @return	A 32-bit signed integer between -2147483648 and 2147483647.
         */
        public readInt(): number{
            if (!this.validate(ByteArray.SIZE_OF_INT32)) return null;

			var value = this.data.getInt32(this._position,this.endian == ByteArray.LITTLE_ENDIAN);
            this._position += ByteArray.SIZE_OF_INT32;
			return value;
        }

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
        public readMultiByte(length: number, charSet?: string): string{
            if (!this.validate(length)) return null;

			return "";
        }

		/**
		 * Reads an object from the byte array, encoded in AMF
		 * serialized format.
		 * @return	The deserialized object.
         */
		public readObject():any{
			return this.readAmfObject();
        }

        /**
		 * Reads a signed 16-bit integer from the byte stream.
		 * 
		 *   The returned value is in the range -32768 to 32767.
		 * @return	A 16-bit signed integer between -32768 and 32767.
         */
        public readShort(): number{
            if (!this.validate(ByteArray.SIZE_OF_INT16)) return null;

            var value = this.data.getInt16(this._position, this.endian == ByteArray.LITTLE_ENDIAN);
            this._position += ByteArray.SIZE_OF_INT16;
            return value;
        }

        /**
		 * Reads an unsigned byte from the byte stream.
		 * 
		 *   The returned value is in the range 0 to 255.
		 * @return	A 32-bit unsigned integer between 0 and 255.
         */
        public readUnsignedByte(): number{
            if (!this.validate(ByteArray.SIZE_OF_UINT8)) return null;

            return this.data.getUint8(this._position++);
        }

        /**
		 * Reads an unsigned 32-bit integer from the byte stream.
		 * 
		 *   The returned value is in the range 0 to 4294967295.
		 * @return	A 32-bit unsigned integer between 0 and 4294967295.
         */
		public readUnsignedInt():number{
            if (!this.validate(ByteArray.SIZE_OF_UINT32)) return null;

			var value = this.data.getUint32(this._position,this.endian == ByteArray.LITTLE_ENDIAN);
            this._position += ByteArray.SIZE_OF_UINT32;
			return value;
        }

        /**
		 * Reads an unsigned 16-bit integer from the byte stream.
		 * 
		 *   The returned value is in the range 0 to 65535.
		 * @return	A 16-bit unsigned integer between 0 and 65535.
         */
		public readUnsignedShort():number{
            if (!this.validate(ByteArray.SIZE_OF_UINT16)) return null;

            var value = this.data.getUint16(this._position, this.endian == ByteArray.LITTLE_ENDIAN);
            this._position += ByteArray.SIZE_OF_UINT16;
            return value;
        }

        /**
		 * Reads a UTF-8 string from the byte stream.  The string
		 * is assumed to be prefixed with an unsigned short indicating
		 * the length in bytes.
		 * @return	UTF-8 encoded  string.
         */
        public readUTF(): string{
            if (!this.validate(ByteArray.SIZE_OF_UINT16)) return null;

            var length: number = this.data.getUint16(this._position, this.endian == ByteArray.LITTLE_ENDIAN);
			this._position += ByteArray.SIZE_OF_UINT16;
			
            if (length > 0) {
                return this.readUTFBytes(length);
            } else {
                return "";
            }
        }

        /**
		 * Reads a sequence of UTF-8 bytes specified by the length
		 * parameter from the byte stream and returns a string.
		 * @param	length	An unsigned short indicating the length of the UTF-8 bytes.
		 * @return	A string composed of the UTF-8 bytes of the specified length.
         */
        public readUTFBytes(length: number): string{
            if (!this.validate(length)) return null;

            var bytes: Uint8Array = new Uint8Array(new ArrayBuffer(length));
            for (var i = 0; i < length; i++) {
                bytes[i] = this.data.getUint8(this._position++);
            }
            return this.decodeUTF8(bytes);
        }

        /**
		 * Writes a Boolean value. A single byte is written according to the value parameter,
		 * either 1 if true or 0 if false.
		 * @param	value	A Boolean value determining which byte is written. If the parameter is true,
		 *   the method writes a 1; if false, the method writes a 0.
         */
        public writeBoolean(value: boolean): void{
            this.validateBuffer(ByteArray.SIZE_OF_BOOLEAN);

            this.data.setUint8(this._position++, value ? 1 : 0);
        }

        /**
		 * Writes a byte to the byte stream.
		 * The low 8 bits of the
		 * parameter are used. The high 24 bits are ignored.
		 * @param	value	A 32-bit integer. The low 8 bits are written to the byte stream.
         */
        public writeByte(value: number): void{
            this.validateBuffer(ByteArray.SIZE_OF_INT8);

            this.data.setInt8(this._position++, value);
        }
		public writeUnsignedByte(value: number):void{
            this.validateBuffer(ByteArray.SIZE_OF_UINT8);

            this.data.setUint8(this._position++, value);
        }
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
        public writeBytes(bytes: ByteArray, offset: number= 0, length: number= 0): void{
            this.validateBuffer(length);

            var tmp_data = new DataView(bytes.buffer);
			for(var i=0; i < bytes.length;i++){
				this.data.setUint8(this._position++,tmp_data.getUint8(i));
			}
        }

        /**
		 * Writes an IEEE 754 double-precision (64-bit) floating-point number to the byte stream.
		 * @param	value	A double-precision (64-bit) floating-point number.
         */
        public writeDouble(value: number): void{
            this.validateBuffer(ByteArray.SIZE_OF_FLOAT64);

            this.data.setFloat64(this._position, value, this.endian == ByteArray.LITTLE_ENDIAN);
            this._position += ByteArray.SIZE_OF_FLOAT64;
        }

        /**
		 * Writes an IEEE 754 single-precision (32-bit) floating-point number to the byte stream.
		 * @param	value	A single-precision (32-bit) floating-point number.
        */
        public writeFloat(value: number): void{
            this.validateBuffer(ByteArray.SIZE_OF_FLOAT32);

            this.data.setFloat32(this._position, value, this.endian == ByteArray.LITTLE_ENDIAN);
            this._position += ByteArray.SIZE_OF_FLOAT32;
        }

        /**
		 * Writes a 32-bit signed integer to the byte stream.
		 * @param	value	An integer to write to the byte stream.
        */
		public writeInt(value:number):void{
            this.validateBuffer(ByteArray.SIZE_OF_INT32);

            this.data.setInt32(this._position, value, this.endian == ByteArray.LITTLE_ENDIAN);
			this._position += ByteArray.SIZE_OF_INT32;
        }

        /**
		 * Writes a multibyte string to the byte stream using the specified character set.
		 * @param	value	The string value to be written.
		 * @param	charSet	The string denoting the character set to use. Possible character set strings
		 *   include "shift-jis", "cn-gb", "iso-8859-1", and others.
		 *   For a complete list, see Supported Character Sets.
         */
        public writeMultiByte(value: string, charSet: string): void{
			
        }

        /**
		 * Writes an object into the byte array in AMF
		 * serialized format.
		 * @param	object	The object to serialize.
         */
        public writeObject(value: any): void{
			
        }

        /**
		 * Writes a 16-bit integer to the byte stream. The low 16 bits of the parameter are used. 
		 * The high 16 bits are ignored.
		 * @param	value	32-bit integer, whose low 16 bits are written to the byte stream.
         */
        public writeShort(value: number): void{
            this.validateBuffer(ByteArray.SIZE_OF_INT16);

            this.data.setInt16(this._position, value, this.endian == ByteArray.LITTLE_ENDIAN);
            this._position += ByteArray.SIZE_OF_INT16;
        }        
		public writeUnsignedShort(value: number): void{
            this.validateBuffer(ByteArray.SIZE_OF_UINT16);

            this.data.setUint16(this._position, value, this.endian == ByteArray.LITTLE_ENDIAN);
            this._position += ByteArray.SIZE_OF_UINT16;
        }

        /**
		 * Writes a 32-bit unsigned integer to the byte stream.
		 * @param	value	An unsigned integer to write to the byte stream.
         */
        public writeUnsignedInt(value: number): void{
            this.validateBuffer(ByteArray.SIZE_OF_UINT32);

            this.data.setUint32(this._position, value, this.endian == ByteArray.LITTLE_ENDIAN);
            this._position += ByteArray.SIZE_OF_UINT32;
        }

        /**
		 * Writes a UTF-8 string to the byte stream. The length of the UTF-8 string in bytes 
		 * is written first, as a 16-bit integer, followed by the bytes representing the 
		 * characters of the string.
		 * @param	value	The string value to be written.
         */
        public writeUTF(value: string): void{
            var utf8bytes: Uint8Array = this.encodeUTF8(value);
            var length: number = utf8bytes.length;

            this.validateBuffer(ByteArray.SIZE_OF_UINT16 + length);

            this.data.setUint16(this._position, length, this.endian === ByteArray.LITTLE_ENDIAN);
			this._position += ByteArray.SIZE_OF_UINT16;
            this.writeUint8Array(utf8bytes);
        }

        /**
		 * Writes a UTF-8 string to the byte stream. Similar to the writeUTF() method,
		 * but writeUTFBytes() does not prefix the string with a 16-bit length word.
		 * @param	value	The string value to be written.
         */
        public writeUTFBytes(value: string): void{
            this.writeUint8Array(this.encodeUTF8(value));
        }


		public toString():string{
			return "[ByteArray]";
        }
        
        /****************************/
        /* EXTRA JAVASCRIPT APIs    */
        /****************************/

        /**
		 * Writes a Uint8Array to the byte stream.
		 * @param	value	The Uint8Array to be written.
         */
        public writeUint8Array(bytes: Uint8Array):void {
            this.validateBuffer(this._position + bytes.length);

            for (var i = 0; i < bytes.length; i++) {
                this.data.setUint8(this._position++, bytes[i]);
            }
        }

        /**
         * Writes a Uint16Array to the byte stream.
         * @param	value	The Uint16Array to be written.
         */
        public writeUint16Array(bytes: Uint16Array): void {
            this.validateBuffer(this._position + bytes.length);

            for (var i = 0; i < bytes.length; i++) {
                this.data.setUint16(this._position, bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                this._position += ByteArray.SIZE_OF_UINT16;
            }
        }

        /**
         * Writes a Uint32Array to the byte stream.
         * @param	value	The Uint32Array to be written.
         */
        public writeUint32Array(bytes: Uint32Array): void {
            this.validateBuffer(this._position + bytes.length);

            for (var i = 0; i < bytes.length; i++) {
                this.data.setUint32(this._position, bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                this._position += ByteArray.SIZE_OF_UINT32;
            }
        }

        /**
         * Writes a Int8Array to the byte stream.
         * @param	value	The Int8Array to be written.
         */
        public writeInt8Array(bytes: Int8Array): void {
            this.validateBuffer(this.position + bytes.length);

            for (var i = 0; i < bytes.length; i++) {
                this.data.setInt8(this._position++, bytes[i]);
            }
        }

        /**
         * Writes a Int16Array to the byte stream.
         * @param	value	The Int16Array to be written.
         */
        public writeInt16Array(bytes: Int16Array): void {
            this.validateBuffer(this.position + bytes.length);

            for (var i = 0; i < bytes.length; i++) {
                this.data.setInt16(this._position, bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                this._position += ByteArray.SIZE_OF_INT16;
            }
        }

        /**
         * Writes a Int32Array to the byte stream.
         * @param	value	The Int32Array to be written.
         */
        public writeInt32Array(bytes: Int32Array): void {
            this.validateBuffer(this.position + bytes.length);

            for (var i = 0; i < bytes.length; i++) {
                this.data.setInt32(this._position, bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                this._position += ByteArray.SIZE_OF_INT32;
            }
        }

        /**
         * Writes a Float32Array to the byte stream.
         * @param	value	The Float32Array to be written.
         */
        public writeFloat32Array(bytes: Float32Array): void {
            this.validateBuffer(this.position + bytes.length);

            for (var i = 0; i < bytes.length; i++) {
                this.data.setFloat32(this._position, bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                this._position += ByteArray.SIZE_OF_FLOAT32;
            }
        }

        /**
         * Writes a Float64Array to the byte stream.
         * @param	value	The Float64Array to be written.
         */
        public writeFloat64Array(bytes: Float64Array): void {
            this.validateBuffer(this.position + bytes.length);

            for (var i = 0; i < bytes.length; i++) {
                this.data.setFloat64(this._position, bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                this._position += ByteArray.SIZE_OF_FLOAT64;
            }
        }
		
		/**
         * Read a Uint8Array from the byte stream.
         * @param	length An unsigned short indicating the length of the Uint8Array.
         */
		public readUint8Array(length:number):Uint8Array{
			if (!this.validate(length)) return null;
			var result = new Uint8Array(new ArrayBuffer(length));
			for (var i = 0; i < length; i++) {
                result[i] = this.data.getUint8(this._position);
                this.position += ByteArray.SIZE_OF_UINT8;
            }
			return result;
		}
		
		/**
         * Read a Uint16Array from the byte stream.
         * @param	length An unsigned short indicating the length of the Uint16Array.
         */
		public readUint16Array(length:number):Uint16Array{
			var size:number = length * ByteArray.SIZE_OF_UINT16;
			if (!this.validate(size)) return null;
			var result = new Uint16Array(new ArrayBuffer(size));
			for (var i = 0; i < length; i++) {
                result[i] = this.data.getUint16(this._position);
                this.position += ByteArray.SIZE_OF_UINT16;
            }
			return result;
		}
		
		/**
         * Read a Uint32Array from the byte stream.
         * @param	length An unsigned short indicating the length of the Uint32Array.
         */
		public readUint32Array(length:number):Uint32Array{
			var size:number = length * ByteArray.SIZE_OF_UINT32;
			if (!this.validate(size)) return null;
			var result = new Uint32Array(new ArrayBuffer(size));
			for (var i = 0; i < length; i++) {
                result[i] = this.data.getUint32(this._position);
                this.position += ByteArray.SIZE_OF_UINT32;
            }
			return result;
		}
		
		/**
         * Read a Int8Array from the byte stream.
         * @param	length An unsigned short indicating the length of the Int8Array.
         */
		public readInt8Array(length:number):Int8Array{
			if (!this.validate(length)) return null;
			var result = new Int8Array(new ArrayBuffer(length));
			for (var i = 0; i < length; i++) {
                result[i] = this.data.getInt8(this._position);
                this.position += ByteArray.SIZE_OF_INT8;
            }
			return result;
		}
		
		/**
         * Read a Int16Array from the byte stream.
         * @param	length An unsigned short indicating the length of the Int16Array.
         */
		public readInt16Array(length:number):Int16Array{
			var size:number =  length * ByteArray.SIZE_OF_INT16
			if (!this.validate(size)) return null;
			var result = new Int16Array(new ArrayBuffer(size));
			for (var i = 0; i < length; i++) {
                result[i] = this.data.getInt16(this._position);
                this.position += ByteArray.SIZE_OF_INT16;
            }
			return result;
		}
		
		/**
         * Read a Int32Array from the byte stream.
         * @param	length An unsigned short indicating the length of the Int32Array.
         */
		public readInt32Array(length:number):Int32Array{
			var size:number =  length * ByteArray.SIZE_OF_INT32
			if (!this.validate(size)) return null;
			var result = new Int32Array(new ArrayBuffer(size));
			for (var i = 0; i < length; i++) {
                result[i] = this.data.getUint32(this._position);
                this.position += ByteArray.SIZE_OF_INT32;
            }
			return result;
		}
		
		/**
         * Read a Float32Array from the byte stream.
         * @param	length An unsigned short indicating the length of the Float32Array.
         */
		public readFloat32Array(length:number):Float32Array{
			var size:number =  length * ByteArray.SIZE_OF_FLOAT32
			if (!this.validate(size)) return null;
			var result = new Float32Array(new ArrayBuffer(size));
			for (var i = 0; i < length; i++) {
                result[i] = this.data.getFloat32(this._position);
                this.position += ByteArray.SIZE_OF_FLOAT32;
            }
			return result;
		}
		
		/**
         * Read a Float64Array from the byte stream.
         * @param	length An unsigned short indicating the length of the Float64Array.
         */
		public readFloat64Array(length:number):Float64Array{
			var size:number =  length * ByteArray.SIZE_OF_FLOAT64
			if (!this.validate(size)) return null;
			var result = new Float64Array(new ArrayBuffer(size));
			for (var i = 0; i < length; i++) {
                result[i] = this.data.getFloat64(this._position);
                this.position += ByteArray.SIZE_OF_FLOAT64;
            }
			return result;
		}
        /**********************/
        /*  PRIVATE METHODS   */
        /**********************/
        private validate(len:number): boolean {
            if (this.data.byteLength > 0 && this._position + len <= this.data.byteLength) {
                return true;
            } else {
                throw {
                    name: 'Error',
                    message: 'Error #2030: End of file was encountered.',
                    errorID: 2030 
                };
            }
        }
        private validateBuffer(len: number): void {
            if (this.data.byteLength < len) {
                var tmp: DataView = new DataView(new ArrayBuffer(len + this.BUFFER_EXT_SIZE));
                for (var i = 0; i < this.data.byteLength; i++) {
                    tmp.setUint8(i, this.data.getUint8(i));
                }
                this.data = null;
                this.data = tmp;
            }
        }

        /**
         * UTF-8 Encoding/Decoding
         */
        private encodeUTF8(str: string): Uint8Array {
            var pos: number = 0;
            var codePoints = this.stringToCodePoints(str);
            var outputBytes = [];

            while (codePoints.length > pos) {
                var code_point: number = codePoints[pos++];

                if (this.inRange(code_point, 0xD800, 0xDFFF)) {
                    this.encoderError(code_point);
                }
                else if (this.inRange(code_point, 0x0000, 0x007f)) {
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
        }
        private decodeUTF8(data: Uint8Array): string {
            var fatal: boolean = false;
            var pos: number = 0;
            var result: string = "";
            var code_point: number;
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
                        code_point = this.decoderError(fatal,_byte);
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
                                code_point = this.decoderError(fatal,_byte);
                            }
                        }

                    }
                }
                //Decode string
                if (code_point !== null && code_point !== this.EOF_code_point) {
                    if (code_point <= 0xFFFF) {
                        if(code_point > 0)result += String.fromCharCode(code_point);
                    } else {
                        code_point -= 0x10000;
                        result += String.fromCharCode(0xD800 + ((code_point >> 10) & 0x3ff));
                        result += String.fromCharCode(0xDC00 + (code_point & 0x3ff));
                    }
                }
            }
            return result;
        }
        private encoderError(code_point) {
           throw {
                name: 'EncodingError',
                message: 'The code point ' + code_point + ' could not be encoded.',
                errorID: 0
            }
        }
        private decoderError(fatal, opt_code_point?): number {
           if(fatal){
				throw {
					name: 'DecodingError',
					message: 'DecodingError.',
					errorID: 0
				}
		   }
           return opt_code_point || 0xFFFD;
        }
        private EOF_byte: number = -1;
        private EOF_code_point: number = -1;

        private inRange(a, min, max) {
            return min <= a && a <= max;
        }
        private div(n, d) {
            return Math.floor(n / d);
        }
        private stringToCodePoints(string) {
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
                } else { // (inRange(c, 0xD800, 0xDBFF))
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
        }
		
		/**
		 * AMF 3 Encoding and Decoding
		 */
		
		// AMF marker constants
		private UNDEFINED_TYPE = 0;
		private NULL_TYPE = 1;
		private FALSE_TYPE = 2;
		private TRUE_TYPE = 3;
		private INTEGER_TYPE = 4;
		private DOUBLE_TYPE = 5;
		private STRING_TYPE = 6;
		private XML_DOC_TYPE = 7;
		private DATE_TYPE = 8;
		private ARRAY_TYPE = 9;
		private OBJECT_TYPE = 10;
		private XML_TYPE = 11;
		private BYTE_ARRAY_TYPE = 12;

		// AbstractMessage Serialization Constants
		private HAS_NEXT_FLAG = 128;
		private BODY_FLAG = 1;
		private CLIENT_ID_FLAG = 2;
		private DESTINATION_FLAG = 4;
		private HEADERS_FLAG = 8;
		private MESSAGE_ID_FLAG = 16;
		private TIMESTAMP_FLAG = 32;
		private TIME_TO_LIVE_FLAG = 64;
		private CLIENT_ID_BYTES_FLAG = 1;
		private MESSAGE_ID_BYTES_FLAG = 2;

		//AsyncMessage Serialization Constants
		private CORRELATION_ID_FLAG = 1;
		private CORRELATION_ID_BYTES_FLAG = 2;

		// CommandMessage Serialization Constants
		private OPERATION_FLAG = 1;

		private CLASS_ALIAS_REGISTRY = {	
			"DSK": "flex.messaging.messages.AcknowledgeMessageExt",
			"DSA": "flex.messaging.messages.AsyncMessageExt",
			"DSC": "flex.messaging.messages.CommandMessageExt"	
		};
		
		private Flex = null;
		private initFlex():void
		{
			// Abstract Message //
			this.Flex.AbstractMessage = function() {
				this.clientId = null; // object
				this.destination = null; // string
				this.messageId = null; // string
				this.timestamp = null; // number
				this.timeToLive = null; // number
				
				this.headers = null; // Map
				this.body = null; // object
				
				//this.clientIdBytes; // byte array
				//this.messageIdBytes; // byte array
			};

			this.Flex.AbstractMessage.prototype = {
				
				readExternal: function(ba, parser) {
					var flagsArray = this.readFlags(ba);
					for (var i = 0; i < flagsArray.length; i++) {
						var flags = flagsArray[i],
						reservedPosition = 0;
						console.log(i +'/'+flagsArray.length, flags)
						if (i == 0) {
							if ((flags & this.BODY_FLAG) != 0) this.readExternalBody(ba, parser);
							if ((flags & this.CLIENT_ID_FLAG) != 0) this.clientId = parser.readData(ba);
							if ((flags & this.DESTINATION_FLAG) != 0) this.destination = parser.readData(ba);
							if ((flags & this.HEADERS_FLAG) != 0) this.headers = parser.readData(ba);
							if ((flags & this.MESSAGE_ID_FLAG) != 0) this.messageId = parser.readData(ba);
							if ((flags & this.TIMESTAMP_FLAG) != 0) this.timestamp = parser.readData(ba);
							if ((flags & this.TIME_TO_LIVE_FLAG) != 0) this.timeToLive = parser.readData(ba);
							reservedPosition = 7;
						} else if (i == 1) {
							if ((flags & this.CLIENT_ID_BYTES_FLAG) != 0) {
								var clientIdBytes = parser.readData(ba);
								this.clientId = this.UUIDUtils.fromByteArray(clientIdBytes);
							}
							
							if ((flags & this.MESSAGE_ID_BYTES_FLAG) != 0) {
								var messageIdBytes = parser.readData(ba);
								this.messageId = this.UUIDUtils.fromByteArray(messageIdBytes);
							}
							
							reservedPosition = 2;
						}
						
						// For forwards compatibility, read in any other flagged objects to
						// preserve the integrity of the input stream...
						if ((flags >> reservedPosition) != 0) {
							for (var j = reservedPosition; j < 6; j++) {
								if (((flags >> j) & 1) != 0) parser.readData(ba);
							}
						}
					}
					
					return this;
				},
				
				readExternalBody: function(ba, parser) {
					this.body = parser.readData(ba);
				},
				
				readFlags: function(ba) {
					var hasNextFlag = true, 
					flagsArray = [], 
					i = 0;
					
					while (hasNextFlag) {
						var flags = ba.readUnsignedByte();
						/*if (i == flagsArray.length) {
							short[] tempArray = new short[i*2];
							System.arraycopy(flagsArray, 0, tempArray, 0, flagsArray.length);
							flagsArray = tempArray;
						}*/
						
						flagsArray[i] = flags;
						hasNextFlag = ((flags & this.HAS_NEXT_FLAG) != 0) ? true : false;
						i++;
					}
					
					return flagsArray;
				}
			};

			// flex.messaging.messages.AsyncMessage //
			this.Flex.AsyncMessage = function() {
				this.correlationId = null; // string
				//var correlationIdBytes; // byte array
			};
			this.Flex.AsyncMessage.prototype = new this.Flex.AbstractMessage();
			this.Flex.AsyncMessage.constructor = this.Flex.AsyncMessage;

			this.Flex.AsyncMessage.prototype.readExternal = function(ba, parser) {
				this.Flex.AbstractMessage.prototype.readExternal.call(this, ba, parser);
				
				var flagsArray = this.readFlags(ba);
				for (var i = 0; i < flagsArray.length; i++) {
					var flags = flagsArray[i],
					reservedPosition = 0;
					
					if (i == 0) {
						if ((flags & this.CORRELATION_ID_FLAG) != 0) this.correlationId = parser.readData(ba);
						
						if ((flags & this.CORRELATION_ID_BYTES_FLAG) != 0) {
							var correlationIdBytes = parser.readData(ba);
							this.correlationId = this.UUIDUtils.fromByteArray(correlationIdBytes);
						}
						
						reservedPosition = 2;
					}
					
					// For forwards compatibility, read in any other flagged objects
					// to preserve the integrity of the input stream...
					if ((flags >> reservedPosition) != 0) {
						for (var j = reservedPosition; j < 6; ++j) {
							if (((flags >> j) & 1) != 0) parser.readData(ba);
						}
					}
				}
				
				return this;
			};

			// DSA - flex.messaging.messages.AsyncMessageExt //
			this.Flex.AsyncMessageExt = function() { };
			this.Flex.AsyncMessageExt.prototype = new this.Flex.AsyncMessage();
			this.Flex.AsyncMessageExt.constructor = this.Flex.AsyncMessageExt;

			// flex.messaging.messages.AcknowledgeMessage //
			this.Flex.AcknowledgeMessage = function() { };
			this.Flex.AcknowledgeMessage.prototype = new this.Flex.AsyncMessage();
			this.Flex.AcknowledgeMessage.constructor = this.Flex.AcknowledgeMessage;

			this.Flex.AcknowledgeMessage.prototype.readExternal = function(ba, parser) {
				this.Flex.AsyncMessage.prototype.readExternal.call(this, ba, parser);
				
				var flagsArray = this.readFlags(ba);
				for (var i = 0; i < flagsArray.length; ++i) {
					var flags = flagsArray[i],
					reservedPosition = 0;
					
					// For forwards compatibility, read in any other flagged objects
					// to preserve the integrity of the input stream...
					if ((flags >> reservedPosition) != 0) {
						for (var j = reservedPosition; j < 6; ++j) {
							if (((flags >> j) & 1) != 0) parser.readData(ba);
						}
					}
				}
				
				return this;
			};

			// DSK - flex.messaging.messages.AcknowledgeMessageExt //
			this.Flex.AcknowledgeMessageExt = function() { };
			this.Flex.AcknowledgeMessageExt.prototype = new this.Flex.AcknowledgeMessage();
			this.Flex.AcknowledgeMessageExt.constructor = this.Flex.AcknowledgeMessageExt;

			// flex.messaging.messages.CommandMessage //
			this.Flex.CommandMessage = function() {
				this.operation = 1000;
				this.operationName = "unknown";
			};
			this.Flex.CommandMessage.prototype = new this.Flex.AsyncMessage();
			this.Flex.CommandMessage.constructor = this.Flex.CommandMessage;

			this.Flex.CommandMessage.prototype.readExternal = function(ba, parser) {
				this.Flex.AsyncMessage.prototype.readExternal.call(this, ba, parser);
				
				var flagsArray = this.readFlags(ba);
				for (var i = 0; i < flagsArray.length; ++i) {
					var flags = flagsArray[i],
					reservedPosition = 0,
					operationNames = [
						"subscribe", "unsubscribe", "poll", "unused3", "client_sync", "client_ping",
						"unused6", "cluster_request", "login", "logout", "subscription_invalidate",
						"multi_subscribe", "disconnect", "trigger_connect"
					];
					
					if (i == 0) {
						if ((flags & this.OPERATION_FLAG) != 0) {
							this.operation = parser.readData(ba);
							if (this.operation < 0 || this.operation >= operationNames.length) {
								this.operationName = "invalid." + this.operation + "";
							} else {
								this.operationName = operationNames[this.operation];
							}
						}
						reservedPosition = 1;
					}
					
					// For forwards compatibility, read in any other flagged objects
					// to preserve the integrity of the input stream...
					if ((flags >> reservedPosition) != 0) {
						for (var j = reservedPosition; j < 6; ++j) {
							if (((flags >> j) & 1) != 0) parser.readData(ba);
						}
					}
				}
				
				return this;
			};

			// DSC - flex.messaging.messages.CommandMessageExt //
			this.Flex.CommandMessageExt = function() { };
			this.Flex.CommandMessageExt.prototype = new this.Flex.CommandMessage();
			this.Flex.CommandMessageExt.constructor = this.Flex.CommandMessageExt;

			// flex.messaging.messages.ErrorMessage //
			this.Flex.ErrorMessage = function() {
				this.faultCode = '';
				this.faultString = '';
				this.faultDetail = '';
				this.rootCause;
				this.extendedData;
			};
			this.Flex.ErrorMessage.prototype = new this.Flex.AcknowledgeMessage();
			this.Flex.ErrorMessage.constructor = this.Flex.ErrorMessage;

			// flex.messaging.messages.RPCPMessage //
			this.Flex.RPCPMessage = function() {
				this.remoteUsername = '';
				this.remotePassword = '';
			};
			this.Flex.RPCPMessage.prototype = new this.Flex.AbstractMessage();
			this.Flex.RPCPMessage.constructor = this.Flex.RPCPMessage;

			// flex.messaging.messages.HTTPMessage //
			this.Flex.HTTPMessage = function() {
				this.contentType = '';
				this.method = '';
				this.url = '';
				this.httpHeaders = {};
				this.recordHeaders = false;
			};
			this.Flex.HTTPMessage.prototype = new this.Flex.RPCPMessage();
			this.Flex.HTTPMessage.constructor = this.Flex.HTTPMessage;

			// flex.messaging.messages.RemotingMessage //
			this.Flex.RemotingMessage = function() {
				this.operation = '';
				this.source = '';
				this.parameters = [];
				this.parameterList = [];
			};
			this.Flex.RemotingMessage.prototype = new this.Flex.RPCPMessage();
			this.Flex.RemotingMessage.constructor = this.Flex.RemotingMessage;

			// flex.messaging.messages.SOAPMessage //
			this.Flex.SOAPMessage = function() {
				this.remoteUsername = '';
				this.remotePassword = '';
			};
			this.Flex.SOAPMessage.prototype = new this.Flex.HTTPMessage();
			this.Flex.SOAPMessage.constructor = this.Flex.SOAPMessage;

			// flex.messaging.io.ArrayCollection //
			this.Flex.ArrayCollection = function() {
				this.source = null;
			};
			this.Flex.ArrayCollection.prototype.readExternal = function(ba, parser) {
				this.source = parser.readData(ba);
				return this;
			};

			// Array List //
			this.Flex.ArrayList = function() { };
			this.Flex.ArrayList.prototype = new this.Flex.ArrayCollection();
			this.Flex.ArrayList.constructor = this.Flex.ArrayList;

			// flex.messaging.io.ObjectProxy //
			this.Flex.ObjectProxy = function() { };
			this.Flex.ObjectProxy.prototype.readExternal = function(ba, parser) {
				var obj = parser.readData(ba);
				for (var i in obj) {
					this[i] = obj[i];
				}
				return this;
			};

			// flex.messaging.io.ManagedObjectProxy //
			this.Flex.ManagedObjectProxy = function() { };
			this.Flex.ManagedObjectProxy.prototype = new this.Flex.ObjectProxy();
			this.Flex.ManagedObjectProxy.constructor = this.Flex.ManagedObjectProxy;

			// flex.messaging.io.SerializationProxy //
			this.Flex.SerializationProxy = function() {
				this.defaultInstance = null;
			};

			this.Flex.SerializationProxy.prototype.readExternal = function(ba, parser) {
				/*var saveObjectTable = null;
				var saveTraitsTable = null;
				var saveStringTable = null;
				var in3 = null;

				if (ba instanceof Amf3Input) in3 = ba;*/

				try {
					/*if (in3 != null) {
						saveObjectTable = in3.saveObjectTable();
						saveTraitsTable = in3.saveTraitsTable();
						saveStringTable = in3.saveStringTable();
					}*/
					
					this.defaultInstance = parser.readData(ba);
				} finally {
					/*if (in3 != null) {
						in3.restoreObjectTable(saveObjectTable);
						in3.restoreTraitsTable(saveTraitsTable);
						in3.restoreStringTable(saveStringTable);
					}*/
				}
				
				return this;
			};
		}
		
		private readStringCache:Array<string> = [];
		private readTraitsCache:Array<Object> = [];
		private readObjectCache:Array<Object> = [];
		
		private serialize():ArrayBuffer
		{
			return null;
		}
		private deserialize():any
		{
		}
		private readAmfData():any
		{
			if(this.Flex == null){
				this.initFlex();
			}
			var type = this.readByte();
			switch(type) {
				case this.UNDEFINED_TYPE 	: return undefined;
				case this.NULL_TYPE 		: return null;
				case this.FALSE_TYPE 		: return false;
				case this.TRUE_TYPE 		: return true;
				case this.INTEGER_TYPE 		: return this.readInt();
				case this.DOUBLE_TYPE 		: return this.readDouble();
				case this.STRING_TYPE 		: return this.readString();
				case this.XML_DOC_TYPE 		: return this.readXMLDoc();
				case this.DATE_TYPE 		: return this.readDate();
				case this.ARRAY_TYPE 		: return this.readArray();
				case this.OBJECT_TYPE 		: return this.readAmfObject();
				case this.XML_TYPE 			: return this.readXML();
				case this.BYTE_ARRAY_TYPE 	: return this.readByteArray();
				default: throw {
					name:"Error",
					message:"AMF3::readAmfData - Error : Undefined AMF3 type encountered '" + type + "'"
					errorID:0
				};
			}
		}
		
		private getStringReference(index):string {
			if (index >= this.readStringCache.length) {
				console.log("AMF3::getStringReference - Error : Undefined string reference '" + index + "'");
				return null;
			}
			return this.readStringCache[index];
		}
		private getTraitReference(index):Object {
			if (index >= this.readTraitsCache.length) {
				console.log("AMF3::getTraitReference - Error : Undefined trait reference '" + index + "'");
				return null;
			}
			return this.readTraitsCache[index];
		}
		private getObjectReference(index):Object {
			if (index >= this.readObjectCache.length) {
				console.log("AMF3::getObjectReference - Error : Undefined object reference '" + index + "'");
				return null;
			}
			return this.readObjectCache[index];
		}
		private readU29():number
		{
			var result = 0;
			// Each byte must be treated as unsigned
			var b = this.readUnsignedByte();
			
			if (b < 128) return b;
			
			result = (b & 0x7F) << 7;
			b = this.readUnsignedByte();
			
			if (b < 128) return (result | b);
			
			result = (result | (b & 0x7F)) << 7;
			b = this.readUnsignedByte();
			
			if (b < 128) return (result | b);
			
			result = (result | (b & 0x7F)) << 8;
			b = this.readUnsignedByte();
			
			return (result | b);
		}
		private readI29():number
		{
			var result = this.readU29();
			// Symmetric with writing an integer to fix sign bits for negative values...
			result = (result << 3) >> 3;
			return result;
		}
		private readString():string {
			var refIndex = this.readU29();
			if ((refIndex & 1) == 0) return this.getStringReference(refIndex >> 1);
			
			// writeString() special cases the empty string
			// to avoid creating a reference.
			var len = refIndex >> 1;
			var str = "";
			if (len > 0) {
				str = this.readUTFBytes(len);
				this.readStringCache.push(str);
			}
			return str;
		}
		private readXMLDoc() {
			var index = this.readU29();
			if((index & 1) == 0) return this.getObjectReference(index >> 1);
			
			//var xmldoc = new XML(this.readUTFBytes(index >> 1));
			var xmldoc = this.readUTFBytes(index >> 1);
			this.readObjectCache.push(xmldoc);
			return xmldoc;
		}
		private readDate() {
			var index = this.readU29();
			if ((index & 1) == 0) return this.getObjectReference(index >> 1);
			
			var d = new Date(this.readDouble());
			this.readObjectCache.push(d);
			return d;
		}
		private readArray() {
			var index = this.readU29();
			if ((index & 1) == 0) return this.getObjectReference(index >> 1);
			
			var arr = [];
			this.readObjectCache.push(arr);
			
			// Associative values
			var strKey = this.readString();
			while(strKey != "") {
				arr[strKey] = this.readAmfData();
				strKey = this.readString();
			}
			
			// Strict values
			var l = (index >> 1);
			for(var i = 0; i < l; i++) {
				arr[i] = this.readAmfData();
			}
			
			return arr;
		}
		private readAmfObject() {
			var index = this.readU29();
			if ((index & 1) == 0) return this.getObjectReference(index >> 1);
			
			// Read traits
			var traits;
			if ((index & 3) == 1) {
				traits = this.getTraitReference(index >> 2);
			} else {
				var isExternalizable:boolean = ((index & 4) == 4);
				var isDynamic:boolean = ((index & 8) == 8);
				var className:string = this.readString();
				
				var classMemberCount:number = (index >> 4); /* uint29 */
				var classMembers:Array<string> = [];
				for(var i = 0; i < classMemberCount; ++i) {
					classMembers.push(this.readString());
				}
				if (className.length == 0) className = 'Object';
				traits = { type:className, members:classMembers, count:classMemberCount, externalizable:isExternalizable, dynamic:isDynamic };
				this.readTraitsCache.push(traits);
			}
			
			// Check for any registered class aliases 
			var aliasedClass = this.CLASS_ALIAS_REGISTRY[traits.type];
			if (aliasedClass != null) traits.type = aliasedClass;
			
			var obj = {};
			
			//Add to references as circular references may search for this object
			this.readObjectCache.push(obj);
			
			if (traits.externalizable) {
				// Read Externalizable
				try {
					if (traits.type.indexOf("flex.") == 0) {
						// Try to get a class
						var classParts = traits.type.split(".");
						var unqualifiedClassName = classParts[(classParts.length - 1)];
						if (unqualifiedClassName && this.Flex[unqualifiedClassName]) {
							var flexParser = new this.Flex[unqualifiedClassName]();
							obj = flexParser.readExternal(this, this);
						} else {
							obj = this.readAmfData();
						}
					}
				} catch (e) {
					console.log("AMF3::readObject - Error : Unable to read externalizable data type '" + traits.type + "'  |  " + e);
					obj = "Unable to read externalizable data type '" + traits.type + "'";
				}
			} else {
				var l = traits.members.length;
				var key;
				
				for(var j = 0; j < l; ++j) {
					var val = this.readAmfData();
					key = traits.members[j];
					obj[key] = val;
				}
				
				if(traits.dynamic) {
					key = this.readString();
					while(key != "") {
						var value = this.readAmfData();
						obj[key] = value;
						key = this.readString();
					}
				}
			}
			
			if(traits) obj.__traits = traits;
			
			return obj;
		}
		private readXML() {
			var index = this.readU29();
			if((index & 1) == 0)  return this.getObjectReference(index >> 1);
			
			//var xml = new XML(this.readUTFBytes(index >> 1));
			var xml = this.readUTFBytes(index >> 1);
			this.readObjectCache.push(xml);
			return xml;
		}
		private readByteArray() {
			var index = this.readU29();
			if ((index & 1) == 0) return this.getObjectReference(index >> 1);
			
			var len = (index >> 1);
			//var ba2 = new ByteArray();
			var ba2 = new ByteArray(new ArrayBuffer(len));
			/*while(len--) {
				var b = this.readUnsignedByte().toString(16).toUpperCase();
				if (b.length < 2) b = '0' + b;
				ba2.push('0x' + b);
			}*/
			this.readBytes(ba2, 0, len);
			this.readObjectCache.push(ba2);
			return ba2;
		}
	}
}

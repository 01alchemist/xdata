TypeScript(JavaScript) DataArray
================================
### Status : [![Build Status](https://api.travis-ci.org/01alchemist/DataArray.png)](https://travis-ci.org/01alchemist/DataArray)
Extended ActionScript3 ByteArray API for JavaScript

Developed by [Nidin Vinayakan](https://github.com/nidin)

npm https://www.npmjs.com/package/data-array

License
----
[MIT](LICENSE)

##Usage 

    import {DataArray,ByteArray,BitArray} from "xdata/core"

###Classes
- **_1. BitArray_**
- **_2. ByteArray_**
- **_3. DataArray_**


###**_BitArray_**

    constructor(buffer?:ArrayBuffer)
    readBits(bits:number, bitBuffer:number = 0):number
    writeBits(bits:number, value:number)
    resetBitsPending()
    static calculateMaxBits(signed:boolean, values:Array<number>):number
    
###**_ByteArray_**

**constructor(buffer?:ArrayBuffer, offset:number = 0, length:number = 0)**
    
**readBoolean():boolean**

    /**
     * Reads a Boolean value from the byte stream. A single byte is read,
     * and true is returned if the byte is nonzero,
     * false otherwise.
     * @return    Returns true if the byte is nonzero, false otherwise.
     */

**readByte():number**

    /**
     * Reads a signed byte from the byte stream.
     * The returned value is in the range -128 to 127.
     * @return    An integer between -128 and 127.
     */

**readBytes(_bytes:ByteArray = null, offset:number = 0, length:number = 0, createNewBuffer:boolean = false):ByteArray**    
    
    /**
     * Reads the number of data bytes, specified by the length parameter, from the byte stream.
     * The bytes are read into the ByteArray object specified by the bytes parameter,
     * and the bytes are written into the destination ByteArray starting at the _position specified by offset.
     * @param    bytes    The ByteArray object to read data into.
     * @param    offset    The offset (_position) in bytes at which the read data should be written.
     * @param    length    The number of bytes to read.  The default value of 0 causes all available data to be read.
     */

**readDouble():number**    
    
    /**
     * Reads an IEEE 754 double-precision (64-bit) floating-point number from the byte stream.
     * @return    A double-precision (64-bit) floating-point number.
     */

**readFloat():number**    
    
    /**
     * Reads an IEEE 754 single-precision (32-bit) floating-point number from the byte stream.
     * @return    A single-precision (32-bit) floating-point number.
     */

**readInt():number**
    
    /**
     * Reads a signed 32-bit integer from the byte stream.
     *
     *   The returned value is in the range -2147483648 to 2147483647.
     * @return    A 32-bit signed integer between -2147483648 and 2147483647.
     */
    
**readInt64():Int64**
    
    /**
     * Reads a signed 64-bit integer from the byte stream.
     *
     *   The returned value is in the range −(2^63) to 2^63 − 1
     * @return    A 64-bit signed integer between −(2^63) to 2^63 − 1
     */
    
**readMultiByte(length:number, charSet?:string):string**
   
    /**
     * Reads a multibyte string of specified length from the byte stream using the
     * specified character set.
     * @param    length    The number of bytes from the byte stream to read.
     * @param    charSet    The string denoting the character set to use to interpret the bytes.
     *   Possible character set strings include "shift-jis", "cn-gb",
     *   "iso-8859-1", and others.
     *   For a complete list, see Supported Character Sets.
     *   Note: If the value for the charSet parameter
     *   is not recognized by the current system, the application uses the system's default
     *   code page as the character set. For example, a value for the charSet parameter,
     *   as in myTest.readMultiByte(22, "iso-8859-01") that uses 01 instead of
     *   1 might work on your development system, but not on another system.
     *   On the other system, the application will use the system's default code page.
     * @return    UTF-8 encoded string.
     */
    
**readShort():number**
    
    /**
     * Reads a signed 16-bit integer from the byte stream.
     *
     *   The returned value is in the range -32768 to 32767.
     * @return    A 16-bit signed integer between -32768 and 32767.
     */
    
**readUnsignedByte():number**
    
    /**
     * Reads an unsigned byte from the byte stream.
     *
     *   The returned value is in the range 0 to 255.
     * @return    A 32-bit unsigned integer between 0 and 255.
     */

**readUnsignedInt():number**

    /**
     * Reads an unsigned 32-bit integer from the byte stream.
     *
     *   The returned value is in the range 0 to 4294967295.
     * @return    A 32-bit unsigned integer between 0 and 4294967295.
     */
     
**readVariableSizedUnsignedInt():number**

    /**
     * Reads a variable sized unsigned integer (VX -> 16-bit or 32-bit) from the byte stream.
     *
     *   A VX is written as a variable length 2- or 4-byte element. If the index value is less than 65,280 (0xFF00),
     *   then the index is written as an unsigned two-byte integer. Otherwise the index is written as an unsigned
     *   four byte integer with bits 24-31 set. When reading an index, if the first byte encountered is 255 (0xFF),
     *   then the four-byte form is being used and the first byte should be discarded or masked out.
     *
     *   The returned value is in the range  0 to 65279 or 0 to 2147483647.
     * @return    A VX 16-bit or 32-bit unsigned integer between 0 to 65279 or 0 and 2147483647.
     */
     
     
to be continued...
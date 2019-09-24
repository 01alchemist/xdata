import { ByteArray } from "./ByteArray";
/**
 * JavaScript DataArray
 * version : 0.2
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 * Extended ActionScript3 ByteArray API implementation in JavaScript
 * limitation : size of DataArray cannot be changed
 */
export declare class DataArray extends ByteArray {
    static BIG_ENDIAN: string;
    static LITTLE_ENDIAN: string;
    constructor(buffer?: ArrayBuffer, offset?: number, length?: number);
    compress(algorithm?: string): void;
    decompressBuffer(algorithm?: string): void;
    decompress(algorithm?: string): void;
    compressAsync(algorithm: string): void;
    decompressAsync(algorithm?: string, callback?: any): void;
    deflate(): void;
    inflate(): void;
    /**
     * Reads the number of data bytes, specified by the length parameter, from the byte stream.
     * The bytes are read into the DataArray object specified by the bytes parameter,
     * and the bytes are written into the destination ByteArray starting at the _position specified by offset.
     * @param    _bytes    The DataArray object to read data into.
     * @param    offset    The offset (_position) in bytes at which the read data should be written.
     * @param    length    The number of bytes to read.  The default value of 0 causes all available data to be read.
     * @param createNewBuffer
     */
    readBytesAsByteArray(_bytes?: DataArray, offset?: number, length?: number, createNewBuffer?: boolean): DataArray;
    readBytesAsDataArray(_bytes?: DataArray | null, offset?: number, length?: number, createNewBuffer?: boolean): DataArray | null;
    /**
     * Reads an object from the byte array, encoded in AMF
     * serialized format.
     * @return    The deserialized object.
     */
    readObject(): any;
    /**
     * Writes an object into the byte array in AMF
     * serialized format.
     * @param    object    The object to serialize.
     */
    writeObject(value: any): void;
}

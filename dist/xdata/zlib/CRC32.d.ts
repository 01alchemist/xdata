/**
 * ZLIB CRC32
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 */
export declare class CRC32 {
    static ZLIB_CRC32_COMPACT: boolean;
    static single(num: number, crc: number): number;
    static calc(data: number[], pos: number, length: number): number;
    static update(data: number[], crc: number, pos: number, length: number): number;
    static Table: Uint32Array;
}

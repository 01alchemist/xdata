/**
 * ZLIB Decoder
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 */
export declare class Adler32 {
    static OptimizationParameter: number;
    static encoder: any;
    static calc(array: string | number[] | Uint8Array): number;
    static update(adler: number, array: number[]): number;
    static encodeString(str: string): any;
}

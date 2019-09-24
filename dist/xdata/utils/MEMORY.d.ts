/**
 * @author Nidin Vinayakan | nidinthb@gmail.com
 */
export declare class MEMORY {
    static u8Index: number;
    static u16Index: number;
    static u32Index: number;
    static u8: Uint8Array;
    static u16: Uint16Array;
    static u32: Uint32Array;
    static allocateUint8(len: number): void;
    static allocateUint16(len: number): void;
    static allocateUint32(len: number): void;
    static getUint8(): number;
    static getUint16(): number;
    static getUint32(): number;
}

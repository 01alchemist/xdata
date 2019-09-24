/**
 * JavaScript UInt64
 * version : 0.1
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 */
export declare class UInt64 {
    low: number;
    high: number;
    _value: number;
    constructor(low?: number, high?: number);
    value(): number;
}

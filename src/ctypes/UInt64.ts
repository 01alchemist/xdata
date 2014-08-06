/**
 * JavaScript UInt64
 * version : 0.1
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 */
module ctypes
{
    export class UInt64
    {
        public low:number;
        public high:number;
        public _value:number;

        constructor(low:number=0,high:number=0){
            this.low    = low;
            this.high   = high;
        }
        public value():number
        {
            //this._value = (this.high << 32) | this.low;
            this._value = Number('0x'+this.high.toString(16) + this.low.toString(16));
            return this._value;
        }

    }
}
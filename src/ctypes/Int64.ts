/**
 * JavaScript Int64
 * version : 0.1
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 */
module ctypes
{
    export class Int64
    {
        public low:number;
        public high:number;
        public _value:number;

        constructor(low:number,high:number){
            this.low    = low;
            this.high   = high;
        }
        public value():number
        {
            this._value = (this.high << 32) | this.low;
            return this._value;
        }

    }
}
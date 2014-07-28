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

        constructor(low:number=0,high:number=0){
            this.low    = low;
            this.high   = high;
        }
        public value():number
        {
            return (this.high << 32) | this.low;
        }

    }
}
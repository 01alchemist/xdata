/**
 * JavaScript Uint64
 * version : 0.1
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 */
module ctypes
{
    export class Uint64
    {
        public low:number;
        public high:number;

        constructor(low:number,high:number){
            this.low    = low;
            this.high   = high;
        }
        public value():number
        {
            return (this.high << 32) | this.low;
        }

    }
}
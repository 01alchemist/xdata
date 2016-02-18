/**
 * JavaScript Int64
 * version : 0.1
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 */
export class Int64 {
    public low:number;
    public high:number;
    public _value:number;

    constructor(low:number, high:number) {
        this.low = low;
        this.high = high;
    }

    public value():number {
        //this._value = (this.low | (this.high << 32));
        var _h:string = this.high.toString(16);
        var _hd:number = 8 - _h.length;
        if (_hd > 0) {
            for (var i = 0; i < _hd; i++) {
                _h = '0' + _h;
            }
        }
        var _l:string = this.low.toString(16);
        var _ld:number = 8 - _l.length;
        if (_ld > 0) {
            for (i = 0; i < _ld; i++) {
                _l = '0' + _l;
            }
        }
        this._value = Number('0x' + _h + _l);
        return this._value;
    }

}
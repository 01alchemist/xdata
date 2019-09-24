import { ByteArray } from "./ByteArray";
/**
 * JavaScript BitArray
 * version : 0.2
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 * Utility to read bits from ByteArray
 */
export class BitArray extends ByteArray {
  private bitsPending: number = 0;

  constructor(buffer?: ArrayBuffer) {
    super(buffer);
  }

  public readBits(bits: number, bitBuffer: number = 0): number {
    if (bits === 0) {
      return bitBuffer;
    }
    let partial: number;
    let bitsConsumed: number;
    if (this.bitsPending > 0) {
      const _byte: number =
        // @ts-ignore
        this[this.position - 1] & (0xff >> (8 - this.bitsPending));
      bitsConsumed = Math.min(this.bitsPending, bits);
      this.bitsPending -= bitsConsumed;
      partial = _byte >> this.bitsPending;
    } else {
      bitsConsumed = Math.min(8, bits);
      this.bitsPending = 8 - bitsConsumed;
      partial = this.readUnsignedByte() >> this.bitsPending;
    }
    bits -= bitsConsumed;
    bitBuffer = (bitBuffer << bitsConsumed) | partial;
    return bits > 0 ? this.readBits(bits, bitBuffer) : bitBuffer;
  }

  public writeBits(bits: number, value: number) {
    if (bits === 0) {
      return;
    }
    value &= 0xffffffff >>> (32 - bits);
    let bitsConsumed: number;
    if (this.bitsPending > 0) {
      if (this.bitsPending > bits) {
        // @ts-ignore
        this[this.position - 1] |= value << (this.bitsPending - bits);
        bitsConsumed = bits;
        this.bitsPending -= bits;
      } else if (this.bitsPending === bits) {
        // @ts-ignore
        this[this.position - 1] |= value;
        bitsConsumed = bits;
        this.bitsPending = 0;
      } else {
        // @ts-ignore
        this[this.position - 1] |= value >> (bits - this.bitsPending);
        bitsConsumed = this.bitsPending;
        this.bitsPending = 0;
      }
    } else {
      bitsConsumed = Math.min(8, bits);
      this.bitsPending = 8 - bitsConsumed;
      this.writeByte((value >> (bits - bitsConsumed)) << this.bitsPending);
    }
    bits -= bitsConsumed;
    if (bits > 0) {
      this.writeBits(bits, value);
    }
  }

  public resetBitsPending() {
    this.bitsPending = 0;
  }

  static calculateMaxBits(signed: boolean, values: number[]): number {
    let b: number = 0;
    let vmax: number = -2147483648; // int.MIN_VALUE;
    if (!signed) {
      for (let i: number = 0; i < values.length; i++) {
        b |= values[i];
      }
    } else {
      for (let i: number = 0; i < values.length; i++) {
        const svalue = values[i];
        if (svalue >= 0) {
          b |= svalue;
        } else {
          b |= ~svalue << 1;
        }
        if (vmax < svalue) {
          vmax = svalue;
        }
      }
    }
    let bits: number = 0;
    if (b > 0) {
      bits = b.toString(2).length;
      if (signed && vmax > 0 && vmax.toString(2).length >= bits) {
        bits++;
      }
    }
    return bits;
  }
}

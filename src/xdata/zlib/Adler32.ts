/**
 * ZLIB Decoder
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 */

export class Adler32 {
  static OptimizationParameter: number = 1024;
  static encoder: any;

  static calc(array: string | number[] | Uint8Array) {
    if (typeof array === "string") {
      array = Adler32.encodeString(array);
    }
    return Adler32.update(1, array as number[]);
  }

  static update(adler: number, array: number[]) {
    let s1: number = adler & 0xffff;
    let s2: number = (adler >>> 16) & 0xffff;
    let len: number = array.length;
    let tlen: number; // loop length
    let i: number = 0; // array index

    while (len > 0) {
      tlen =
        len > Adler32.OptimizationParameter
          ? Adler32.OptimizationParameter
          : len;
      len -= tlen;
      do {
        s1 += array[i++];
        s2 += s1;
      } while (--tlen);

      s1 %= 65521;
      s2 %= 65521;
    }

    return ((s2 << 16) | s1) >>> 0;
  }

  static encodeString(str: string) {
    if (!Adler32.encoder) {
      if (window["TextEncoder"]) {
        Adler32.encoder = new window["TextEncoder"]();
      } else {
        // fallback
        Adler32.encoder = {
          encode(str: string): Uint8Array {
            const tmp = str.split("");
            const data: Uint8Array = new Uint8Array(tmp.length);
            let i: number;
            let il: number;

            for (i = 0, il = tmp.length; i < il; i++) {
              data[i] = (tmp[i].charCodeAt(0) & 0xff) >>> 0;
            }
            return data;
          }
        };
      }
    }
    return Adler32.encoder.encode(str);
  }
}

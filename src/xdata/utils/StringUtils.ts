/**
 * String Utilities
 * @author Nidin Vinayakan | nidinthb@gmail.com
 */
export class StringUtils {
  static encoder: any;

  static encodeString(str: string): Uint8Array {
    if (!StringUtils.encoder) {
      if (window["TextEncoder"]) {
        StringUtils.encoder = new window["TextEncoder"]();
      } else {
        // fallback
        StringUtils.encoder = {
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
    return StringUtils.encoder.encode(str);
  }
}

/**
 * ZLIB CRC32
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 */

export class CRC32 {
  static ZLIB_CRC32_COMPACT: boolean = false;

  static single(num: number, crc: number) {
    return (CRC32.Table[(num ^ crc) & 0xff] ^ (num >>> 8)) >>> 0;
  }

  static calc(data: number[], pos: number, length: number) {
    return CRC32.update(data, 0, pos, length);
  }

  static update(data: number[], crc: number, pos: number, length: number) {
    const table = CRC32.Table;
    let i = typeof pos === "number" ? pos : (pos = 0);
    const il = typeof length === "number" ? length : data.length;

    crc ^= 0xffffffff;

    // loop unrolling for performance
    for (i = il & 7; i--; ++pos) {
      crc = (crc >>> 8) ^ table[(crc ^ data[pos]) & 0xff];
    }
    for (i = il >> 3; i--; pos += 8) {
      crc = (crc >>> 8) ^ table[(crc ^ data[pos]) & 0xff];
      crc = (crc >>> 8) ^ table[(crc ^ data[pos + 1]) & 0xff];
      crc = (crc >>> 8) ^ table[(crc ^ data[pos + 2]) & 0xff];
      crc = (crc >>> 8) ^ table[(crc ^ data[pos + 3]) & 0xff];
      crc = (crc >>> 8) ^ table[(crc ^ data[pos + 4]) & 0xff];
      crc = (crc >>> 8) ^ table[(crc ^ data[pos + 5]) & 0xff];
      crc = (crc >>> 8) ^ table[(crc ^ data[pos + 6]) & 0xff];
      crc = (crc >>> 8) ^ table[(crc ^ data[pos + 7]) & 0xff];
    }

    return (crc ^ 0xffffffff) >>> 0;
  }

  static Table: Uint32Array = CRC32.ZLIB_CRC32_COMPACT
    ? (function() {
        const table = new Uint32Array(256);
        let c: number;
        let i: number;
        let j: number;

        for (i = 0; i < 256; ++i) {
          c = i;
          for (j = 0; j < 8; ++j) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
          }
          table[i] = c >>> 0;
        }

        return table;
      })()
    : new Uint32Array(/* CRC32.Table_ */);
}

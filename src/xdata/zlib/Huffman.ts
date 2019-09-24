/**
 * ZLIB Decoder
 * @author Nidin Vinayakan | nidinthb@gmail.com
 */
export class Huffman {
  /**
   * build huffman table from length list
   * @param lengths:Uint8Array lengths length list
   * @return huffman table.
   */
  static buildHuffmanTable(lengths: Uint8Array | number[]): any {
    const listSize = lengths.length; // length list size
    let maxCodeLength = 0; // max code length for table size
    let minCodeLength = Number.POSITIVE_INFINITY; // min code length for table size
    let size; // table size
    let table; // huffman code table
    let bitLength; // bit length
    let code; // huffman code
    let skip; // skip length for table filling
    let reversed; // reversed code
    let rtemp; // reverse temp
    let i; // loop counter
    let il; // loop limit
    let j; // loop counter
    let value; // table value

    for (i = 0, il = listSize; i < il; ++i) {
      if (lengths[i] > maxCodeLength) {
        maxCodeLength = lengths[i];
      }
      if (lengths[i] < minCodeLength) {
        minCodeLength = lengths[i];
      }
    }

    size = 1 << maxCodeLength;
    table = new Uint32Array(size);

    for (bitLength = 1, code = 0, skip = 2; bitLength <= maxCodeLength; ) {
      for (i = 0; i < listSize; ++i) {
        if (lengths[i] === bitLength) {
          for (reversed = 0, rtemp = code, j = 0; j < bitLength; ++j) {
            reversed = (reversed << 1) | (rtemp & 1);
            rtemp >>= 1;
          }

          value = (bitLength << 16) | i;
          for (j = reversed; j < size; j += skip) {
            table[j] = value;
          }

          ++code;
        }
      }

      ++bitLength;
      code <<= 1;
      skip <<= 1;
    }

    return [table, maxCodeLength, minCodeLength];
  }
}

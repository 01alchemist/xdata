///<reference path="ZLIB.lib.d.ts" />
module nid.utils {
    "use strict"
    /**
     * ZLIB Decoder
     * @author Nidin Vinayakan | nidinthb@gmail.com
     */
    export class Huffman{

        /**
         * build huffman table from length list
         * @param lengths:Uint8Array lengths length list
         * @return huffman table.
         */
        static buildHuffmanTable(lengths):any {
            var listSize = lengths.length;//length list size
            var maxCodeLength = 0;//max code length for table size
            var minCodeLength = Number.POSITIVE_INFINITY;//min code length for table size
            var size;//table size
            var table;//huffman code table
            var bitLength;//bit length
            var code;//huffman code
            var skip;//skip length for table filling
            var reversed;//reversed code
            var rtemp;//reverse temp
            var i;//loop counter
            var il;//loop limit
            var j;//loop counter
            var value;//table value

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

            for (bitLength = 1, code = 0, skip = 2; bitLength <= maxCodeLength;) {
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

}
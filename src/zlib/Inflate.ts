///<reference path="ZLIB.lib.d.ts" />
module nid.utils {
    "use strict"
    /**
     * ZLIB Decoder
     * @author Nidin Vinayakan | nidinthb@gmail.com
     *
     */
    export class Inflate{
        /** @type {number} */
        public bufferSize;
        /** @type {Inflate.BufferType} */
        public bufferType;
        /** @type {number} */
        public cmf;
        /** @type {number} */
        public flg;

        /** @type {!(Uint8Array|Array)} */
        private input;
        private method;
        /** @type {number} */
        private ip = 0;
        /** @type {RawInflate} */
        private rawinflate;
        /** @type {(boolean|undefined)} verify flag. */
        private verify;

        static BufferType = RawInflate.BufferType;

        constructor(input, opt_params=null) {

            this.input = input;

            // option parameters
            if (opt_params || !(opt_params = {})) {
                if (opt_params['index']) {
                    this.ip = opt_params['index'];
                }
                if (opt_params['verify']) {
                    this.verify = opt_params['verify'];
                }
            }

            // Compression Method and Flags
            this.cmf = input[this.ip++];
            this.flg = input[this.ip++];

            // compression method
            switch (this.cmf & 0x0f) {
                case CompressionMethod.ZLIB.DEFLATE:
                    this.method = CompressionMethod.ZLIB.DEFLATE;
                    break;
                default:
                    throw new Error('unsupported compression method');
            }

            // fcheck
            if (((this.cmf << 8) + this.flg) % 31 !== 0) {
                throw new Error('invalid fcheck flag:' + ((this.cmf << 8) + this.flg) % 31);
            }

            // fdict (not supported)
            if (this.flg & 0x20) {
                throw new Error('fdict flag is not supported');
            }

            // RawInflate
            this.rawinflate = new RawInflate(input, {
                'index': this.ip,
                'bufferSize': opt_params['bufferSize'],
                'bufferType': opt_params['bufferType'],
                'resize': opt_params['resize']
            });

        }

        /**
         * decompress.
         * @return {!(Uint8Array|Array)} inflated buffer.
         */
        public decompress() {
            /** @type {!(Array|Uint8Array)} input buffer. */
            var input = this.input;
            /** @type {!(Uint8Array|Array)} inflated buffer. */
            var buffer;
            /** @type {number} adler-32 checksum */
            var adler32;

            buffer = this.rawinflate.decompress();
            this.ip = this.rawinflate.ip;

            // verify adler-32
            if (this.verify) {
                adler32 = (
                input[this.ip++] << 24 | input[this.ip++] << 16 |
                input[this.ip++] << 8 | input[this.ip++]
                ) >>> 0;

                if (adler32 !== Adler32.calc(buffer)) {
                    throw new Error('invalid adler-32 checksum');
                }
            }

            return buffer;
        }
    }
}
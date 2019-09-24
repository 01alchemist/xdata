import { ZLIB } from "./ZLIB";

export class ZLIBWorker {
  static ENCODE: number = 1;
  static DECODE: number = 2;
  private decoder: ZLIB;
  private payload: any;

  constructor() {
    this.decoder = new ZLIB();

    addEventListener(
      "message",
      (e: any) => {
        this.payload = e.data;

        if (this.payload.command === ZLIBWorker.DECODE) {
          this.decode(this.payload.data);
        } else if (this.payload.command === ZLIBWorker.ENCODE) {
          // not yet implemented
        }
      },
      false
    );
  }

  private decode(data: ArrayBuffer): void {
    const result = this.decoder.decode(new Uint8Array(data));
    (<any>postMessage)({ command: ZLIBWorker.DECODE, result: result.buffer }, [
      result.buffer
    ]);
  }
}
new ZLIBWorker();

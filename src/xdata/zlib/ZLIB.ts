import { Inflate } from "./Inflate";
/**
 * ZLIB Decoder
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 */

export class ZLIB {
  constructor() {}

  public encode(): any {}

  public decode(compressed: any): any {
    return new Inflate(compressed).decompress();
  }
}

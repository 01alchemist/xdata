import {ByteArray} from "../src/nid/utils/ByteArray";
/**
 * Created by Nidin Vinayakan on 15-02-2016.
 */
export class SimpleTest{

    constructor(){
        var byteArray = new ByteArray();
        byteArray.writeShort(52);
        byteArray.writeInt(-56256);
        byteArray.writeUnsignedInt(652);
        byteArray.writeDouble(Math.random() * Number.MAX_VALUE);
        byteArray.position = 0;
        console.log(byteArray.readShort());
        console.log(byteArray.readInt());
        console.log(byteArray.readUnsignedInt());
        console.log(byteArray.readDouble());
    }
}
new SimpleTest();
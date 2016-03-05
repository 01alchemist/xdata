System.register(["../modules/xdata/src/nid/utils/ByteArray"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var ByteArray_1;
    var SimpleTest;
    return {
        setters:[
            function (ByteArray_1_1) {
                ByteArray_1 = ByteArray_1_1;
            }],
        execute: function() {
            SimpleTest = (function () {
                function SimpleTest() {
                    var byteArray = new ByteArray_1.ByteArray();
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
                return SimpleTest;
            }());
            exports_1("SimpleTest", SimpleTest);
            new SimpleTest();
        }
    }
});
//# sourceMappingURL=SimpleTest.js.map
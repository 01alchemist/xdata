///<reference path="lzma/LZMA.ts" />
/**
* JavaScript AMF Serializer
* version : 0.1
* @author Nidin Vinayakan | nidinthb@gmail.com
*
*/
module nid.utils
{
	
	export class AMFHelper
	{
        /**
         * AMF 3 Encoding and Decoding
         */

        // AMF marker constants
        private UNDEFINED_TYPE = 0;
        private NULL_TYPE = 1;
        private FALSE_TYPE = 2;
        private TRUE_TYPE = 3;
        private INTEGER_TYPE = 4;
        private DOUBLE_TYPE = 5;
        private STRING_TYPE = 6;
        private XML_DOC_TYPE = 7;
        private DATE_TYPE = 8;
        private ARRAY_TYPE = 9;
        private OBJECT_TYPE = 10;
        private XML_TYPE = 11;
        private BYTE_ARRAY_TYPE = 12;

        // AbstractMessage Serialization Constants
        private HAS_NEXT_FLAG = 128;
        private BODY_FLAG = 1;
        private CLIENT_ID_FLAG = 2;
        private DESTINATION_FLAG = 4;
        private HEADERS_FLAG = 8;
        private MESSAGE_ID_FLAG = 16;
        private TIMESTAMP_FLAG = 32;
        private TIME_TO_LIVE_FLAG = 64;
        private CLIENT_ID_BYTES_FLAG = 1;
        private MESSAGE_ID_BYTES_FLAG = 2;

        //AsyncMessage Serialization Constants
        private CORRELATION_ID_FLAG = 1;
        private CORRELATION_ID_BYTES_FLAG = 2;

        // CommandMessage Serialization Constants
        private OPERATION_FLAG = 1;

        private CLASS_ALIAS_REGISTRY = {
            "DSK": "flex.messaging.messages.AcknowledgeMessageExt",
            "DSA": "flex.messaging.messages.AsyncMessageExt",
            "DSC": "flex.messaging.messages.CommandMessageExt"
        };

        private Flex = null;
        private initFlex():void
        {
            // Abstract Message //
            this.Flex.AbstractMessage = function() {
                this.clientId = null; // object
                this.destination = null; // string
                this.messageId = null; // string
                this.timestamp = null; // number
                this.timeToLive = null; // number

                this.headers = null; // Map
                this.body = null; // object

                //this.clientIdBytes; // byte array
                //this.messageIdBytes; // byte array
            };

            this.Flex.AbstractMessage.prototype = {

                readExternal: function(ba, parser) {
                    var flagsArray = this.readFlags(ba);
                    for (var i = 0; i < flagsArray.length; i++) {
                        var flags = flagsArray[i],
                            reservedPosition = 0;
                        console.log(i +'/'+flagsArray.length, flags)
                        if (i == 0) {
                            if ((flags & this.BODY_FLAG) != 0) this.readExternalBody(ba, parser);
                            if ((flags & this.CLIENT_ID_FLAG) != 0) this.clientId = parser.readData(ba);
                            if ((flags & this.DESTINATION_FLAG) != 0) this.destination = parser.readData(ba);
                            if ((flags & this.HEADERS_FLAG) != 0) this.headers = parser.readData(ba);
                            if ((flags & this.MESSAGE_ID_FLAG) != 0) this.messageId = parser.readData(ba);
                            if ((flags & this.TIMESTAMP_FLAG) != 0) this.timestamp = parser.readData(ba);
                            if ((flags & this.TIME_TO_LIVE_FLAG) != 0) this.timeToLive = parser.readData(ba);
                            reservedPosition = 7;
                        } else if (i == 1) {
                            if ((flags & this.CLIENT_ID_BYTES_FLAG) != 0) {
                                var clientIdBytes = parser.readData(ba);
                                this.clientId = this.UUIDUtils.fromByteArray(clientIdBytes);
                            }

                            if ((flags & this.MESSAGE_ID_BYTES_FLAG) != 0) {
                                var messageIdBytes = parser.readData(ba);
                                this.messageId = this.UUIDUtils.fromByteArray(messageIdBytes);
                            }

                            reservedPosition = 2;
                        }

                        // For forwards compatibility, read in any other flagged objects to
                        // preserve the integrity of the input stream...
                        if ((flags >> reservedPosition) != 0) {
                            for (var j = reservedPosition; j < 6; j++) {
                                if (((flags >> j) & 1) != 0) parser.readData(ba);
                            }
                        }
                    }

                    return this;
                },

                readExternalBody: function(ba, parser) {
                    this.body = parser.readData(ba);
                },

                readFlags: function(ba) {
                    var hasNextFlag = true,
                        flagsArray = [],
                        i = 0;

                    while (hasNextFlag) {
                        var flags = ba.readUnsignedByte();
                        /*if (i == flagsArray.length) {
                         short[] tempArray = new short[i*2];
                         System.arraycopy(flagsArray, 0, tempArray, 0, flagsArray.length);
                         flagsArray = tempArray;
                         }*/

                        flagsArray[i] = flags;
                        hasNextFlag = ((flags & this.HAS_NEXT_FLAG) != 0) ? true : false;
                        i++;
                    }

                    return flagsArray;
                }
            };

            // flex.messaging.messages.AsyncMessage //
            this.Flex.AsyncMessage = function() {
                this.correlationId = null; // string
                //var correlationIdBytes; // byte array
            };
            this.Flex.AsyncMessage.prototype = new this.Flex.AbstractMessage();
            this.Flex.AsyncMessage.constructor = this.Flex.AsyncMessage;

            this.Flex.AsyncMessage.prototype.readExternal = function(ba, parser) {
                this.Flex.AbstractMessage.prototype.readExternal.call(this, ba, parser);

                var flagsArray = this.readFlags(ba);
                for (var i = 0; i < flagsArray.length; i++) {
                    var flags = flagsArray[i],
                        reservedPosition = 0;

                    if (i == 0) {
                        if ((flags & this.CORRELATION_ID_FLAG) != 0) this.correlationId = parser.readData(ba);

                        if ((flags & this.CORRELATION_ID_BYTES_FLAG) != 0) {
                            var correlationIdBytes = parser.readData(ba);
                            this.correlationId = this.UUIDUtils.fromByteArray(correlationIdBytes);
                        }

                        reservedPosition = 2;
                    }

                    // For forwards compatibility, read in any other flagged objects
                    // to preserve the integrity of the input stream...
                    if ((flags >> reservedPosition) != 0) {
                        for (var j = reservedPosition; j < 6; ++j) {
                            if (((flags >> j) & 1) != 0) parser.readData(ba);
                        }
                    }
                }

                return this;
            };

            // DSA - flex.messaging.messages.AsyncMessageExt //
            this.Flex.AsyncMessageExt = function() { };
            this.Flex.AsyncMessageExt.prototype = new this.Flex.AsyncMessage();
            this.Flex.AsyncMessageExt.constructor = this.Flex.AsyncMessageExt;

            // flex.messaging.messages.AcknowledgeMessage //
            this.Flex.AcknowledgeMessage = function() { };
            this.Flex.AcknowledgeMessage.prototype = new this.Flex.AsyncMessage();
            this.Flex.AcknowledgeMessage.constructor = this.Flex.AcknowledgeMessage;

            this.Flex.AcknowledgeMessage.prototype.readExternal = function(ba, parser) {
                this.Flex.AsyncMessage.prototype.readExternal.call(this, ba, parser);

                var flagsArray = this.readFlags(ba);
                for (var i = 0; i < flagsArray.length; ++i) {
                    var flags = flagsArray[i],
                        reservedPosition = 0;

                    // For forwards compatibility, read in any other flagged objects
                    // to preserve the integrity of the input stream...
                    if ((flags >> reservedPosition) != 0) {
                        for (var j = reservedPosition; j < 6; ++j) {
                            if (((flags >> j) & 1) != 0) parser.readData(ba);
                        }
                    }
                }

                return this;
            };

            // DSK - flex.messaging.messages.AcknowledgeMessageExt //
            this.Flex.AcknowledgeMessageExt = function() { };
            this.Flex.AcknowledgeMessageExt.prototype = new this.Flex.AcknowledgeMessage();
            this.Flex.AcknowledgeMessageExt.constructor = this.Flex.AcknowledgeMessageExt;

            // flex.messaging.messages.CommandMessage //
            this.Flex.CommandMessage = function() {
                this.operation = 1000;
                this.operationName = "unknown";
            };
            this.Flex.CommandMessage.prototype = new this.Flex.AsyncMessage();
            this.Flex.CommandMessage.constructor = this.Flex.CommandMessage;

            this.Flex.CommandMessage.prototype.readExternal = function(ba, parser) {
                this.Flex.AsyncMessage.prototype.readExternal.call(this, ba, parser);

                var flagsArray = this.readFlags(ba);
                for (var i = 0; i < flagsArray.length; ++i) {
                    var flags = flagsArray[i],
                        reservedPosition = 0,
                        operationNames = [
                            "subscribe", "unsubscribe", "poll", "unused3", "client_sync", "client_ping",
                            "unused6", "cluster_request", "login", "logout", "subscription_invalidate",
                            "multi_subscribe", "disconnect", "trigger_connect"
                        ];

                    if (i == 0) {
                        if ((flags & this.OPERATION_FLAG) != 0) {
                            this.operation = parser.readData(ba);
                            if (this.operation < 0 || this.operation >= operationNames.length) {
                                this.operationName = "invalid." + this.operation + "";
                            } else {
                                this.operationName = operationNames[this.operation];
                            }
                        }
                        reservedPosition = 1;
                    }

                    // For forwards compatibility, read in any other flagged objects
                    // to preserve the integrity of the input stream...
                    if ((flags >> reservedPosition) != 0) {
                        for (var j = reservedPosition; j < 6; ++j) {
                            if (((flags >> j) & 1) != 0) parser.readData(ba);
                        }
                    }
                }

                return this;
            };

            // DSC - flex.messaging.messages.CommandMessageExt //
            this.Flex.CommandMessageExt = function() { };
            this.Flex.CommandMessageExt.prototype = new this.Flex.CommandMessage();
            this.Flex.CommandMessageExt.constructor = this.Flex.CommandMessageExt;

            // flex.messaging.messages.ErrorMessage //
            this.Flex.ErrorMessage = function() {
                this.faultCode = '';
                this.faultString = '';
                this.faultDetail = '';
                this.rootCause;
                this.extendedData;
            };
            this.Flex.ErrorMessage.prototype = new this.Flex.AcknowledgeMessage();
            this.Flex.ErrorMessage.constructor = this.Flex.ErrorMessage;

            // flex.messaging.messages.RPCPMessage //
            this.Flex.RPCPMessage = function() {
                this.remoteUsername = '';
                this.remotePassword = '';
            };
            this.Flex.RPCPMessage.prototype = new this.Flex.AbstractMessage();
            this.Flex.RPCPMessage.constructor = this.Flex.RPCPMessage;

            // flex.messaging.messages.HTTPMessage //
            this.Flex.HTTPMessage = function() {
                this.contentType = '';
                this.method = '';
                this.url = '';
                this.httpHeaders = {};
                this.recordHeaders = false;
            };
            this.Flex.HTTPMessage.prototype = new this.Flex.RPCPMessage();
            this.Flex.HTTPMessage.constructor = this.Flex.HTTPMessage;

            // flex.messaging.messages.RemotingMessage //
            this.Flex.RemotingMessage = function() {
                this.operation = '';
                this.source = '';
                this.parameters = [];
                this.parameterList = [];
            };
            this.Flex.RemotingMessage.prototype = new this.Flex.RPCPMessage();
            this.Flex.RemotingMessage.constructor = this.Flex.RemotingMessage;

            // flex.messaging.messages.SOAPMessage //
            this.Flex.SOAPMessage = function() {
                this.remoteUsername = '';
                this.remotePassword = '';
            };
            this.Flex.SOAPMessage.prototype = new this.Flex.HTTPMessage();
            this.Flex.SOAPMessage.constructor = this.Flex.SOAPMessage;

            // flex.messaging.io.ArrayCollection //
            this.Flex.ArrayCollection = function() {
                this.source = null;
            };
            this.Flex.ArrayCollection.prototype.readExternal = function(ba, parser) {
                this.source = parser.readData(ba);
                return this;
            };

            // Array List //
            this.Flex.ArrayList = function() { };
            this.Flex.ArrayList.prototype = new this.Flex.ArrayCollection();
            this.Flex.ArrayList.constructor = this.Flex.ArrayList;

            // flex.messaging.io.ObjectProxy //
            this.Flex.ObjectProxy = function() { };
            this.Flex.ObjectProxy.prototype.readExternal = function(ba, parser) {
                var obj = parser.readData(ba);
                for (var i in obj) {
                    this[i] = obj[i];
                }
                return this;
            };

            // flex.messaging.io.ManagedObjectProxy //
            this.Flex.ManagedObjectProxy = function() { };
            this.Flex.ManagedObjectProxy.prototype = new this.Flex.ObjectProxy();
            this.Flex.ManagedObjectProxy.constructor = this.Flex.ManagedObjectProxy;

            // flex.messaging.io.SerializationProxy //
            this.Flex.SerializationProxy = function() {
                this.defaultInstance = null;
            };

            this.Flex.SerializationProxy.prototype.readExternal = function(ba, parser) {
                /*var saveObjectTable = null;
                 var saveTraitsTable = null;
                 var saveStringTable = null;
                 var in3 = null;

                 if (ba instanceof Amf3Input) in3 = ba;*/

                try {
                    /*if (in3 != null) {
                     saveObjectTable = in3.saveObjectTable();
                     saveTraitsTable = in3.saveTraitsTable();
                     saveStringTable = in3.saveStringTable();
                     }*/

                    this.defaultInstance = parser.readData(ba);
                } finally {
                    /*if (in3 != null) {
                     in3.restoreObjectTable(saveObjectTable);
                     in3.restoreTraitsTable(saveTraitsTable);
                     in3.restoreStringTable(saveStringTable);
                     }*/
                }

                return this;
            };
        }

        private readStringCache:Array<string> = [];
        private readTraitsCache:Array<Object> = [];
        private readObjectCache:Array<Object> = [];

        private serialize():ArrayBuffer
        {
            return null;
        }
        private deserialize():any
        {
        }
        private readAmfData():any
        {
            if(this.Flex == null){
                this.initFlex();
            }
            var type = this.readByte();
            switch(type) {
                case this.UNDEFINED_TYPE 	: return undefined;
                case this.NULL_TYPE 		: return null;
                case this.FALSE_TYPE 		: return false;
                case this.TRUE_TYPE 		: return true;
                case this.INTEGER_TYPE 		: return this.readInt();
                case this.DOUBLE_TYPE 		: return this.readDouble();
                case this.STRING_TYPE 		: return this.readString();
                case this.XML_DOC_TYPE 		: return this.readXMLDoc();
                case this.DATE_TYPE 		: return this.readDate();
                case this.ARRAY_TYPE 		: return this.readArray();
                case this.OBJECT_TYPE 		: return this.readAmfObject();
                case this.XML_TYPE 			: return this.readXML();
                case this.BYTE_ARRAY_TYPE 	: return this.readByteArray();
                default: throw {
                    name:"Error",
                    message:"AMF3::readAmfData - Error : Undefined AMF3 type encountered '" + type + "'",
                    errorID:0
                };
            }
        }

        private getStringReference(index):string {
            if (index >= this.readStringCache.length) {
                console.log("AMF3::getStringReference - Error : Undefined string reference '" + index + "'");
                return null;
            }
            return this.readStringCache[index];
        }
        private getTraitReference(index):Object {
            if (index >= this.readTraitsCache.length) {
                console.log("AMF3::getTraitReference - Error : Undefined trait reference '" + index + "'");
                return null;
            }
            return this.readTraitsCache[index];
        }
        private getObjectReference(index):Object {
            if (index >= this.readObjectCache.length) {
                console.log("AMF3::getObjectReference - Error : Undefined object reference '" + index + "'");
                return null;
            }
            return this.readObjectCache[index];
        }
        private readU29():number
        {
            var result = 0;
            // Each byte must be treated as unsigned
            var b = this.readUnsignedByte();

            if (b < 128) return b;

            result = (b & 0x7F) << 7;
            b = this.readUnsignedByte();

            if (b < 128) return (result | b);

            result = (result | (b & 0x7F)) << 7;
            b = this.readUnsignedByte();

            if (b < 128) return (result | b);

            result = (result | (b & 0x7F)) << 8;
            b = this.readUnsignedByte();

            return (result | b);
        }
        private readI29():number
        {
            var result = this.readU29();
            // Symmetric with writing an integer to fix sign bits for negative values...
            result = (result << 3) >> 3;
            return result;
        }
        private readString():string {
            var refIndex = this.readU29();
            if ((refIndex & 1) == 0) return this.getStringReference(refIndex >> 1);

            // writeString() special cases the empty string
            // to avoid creating a reference.
            var len = refIndex >> 1;
            var str = "";
            if (len > 0) {
                str = this.readUTFBytes(len);
                this.readStringCache.push(str);
            }
            return str;
        }
        private readXMLDoc() {
            var index = this.readU29();
            if((index & 1) == 0) return this.getObjectReference(index >> 1);

            //var xmldoc = new XML(this.readUTFBytes(index >> 1));
            var xmldoc = this.readUTFBytes(index >> 1);
            this.readObjectCache.push(xmldoc);
            return xmldoc;
        }
        private readDate() {
            var index = this.readU29();
            if ((index & 1) == 0) return this.getObjectReference(index >> 1);

            var d = new Date(this.readDouble());
            this.readObjectCache.push(d);
            return d;
        }
        private readArray() {
            var index = this.readU29();
            if ((index & 1) == 0) return this.getObjectReference(index >> 1);

            var arr = [];
            this.readObjectCache.push(arr);

            // Associative values
            var strKey = this.readString();
            while(strKey != "") {
                arr[strKey] = this.readAmfData();
                strKey = this.readString();
            }

            // Strict values
            var l = (index >> 1);
            for(var i = 0; i < l; i++) {
                arr[i] = this.readAmfData();
            }

            return arr;
        }
        private readAmfObject() {
            var index = this.readU29();
            if ((index & 1) == 0) return this.getObjectReference(index >> 1);

            // Read traits
            var traits;
            if ((index & 3) == 1) {
                traits = this.getTraitReference(index >> 2);
            } else {
                var isExternalizable:boolean = ((index & 4) == 4);
                var isDynamic:boolean = ((index & 8) == 8);
                var className:string = this.readString();

                var classMemberCount:number = (index >> 4); /* uint29 */
                var classMembers:Array<string> = [];
                for(var i = 0; i < classMemberCount; ++i) {
                    classMembers.push(this.readString());
                }
                if (className.length == 0) className = 'Object';
                traits = { type:className, members:classMembers, count:classMemberCount, externalizable:isExternalizable, dynamic:isDynamic };
                this.readTraitsCache.push(traits);
            }

            // Check for any registered class aliases
            var aliasedClass = this.CLASS_ALIAS_REGISTRY[traits.type];
            if (aliasedClass != null) traits.type = aliasedClass;

            var obj = {};

            //Add to references as circular references may search for this object
            this.readObjectCache.push(obj);

            if (traits.externalizable) {
                // Read Externalizable
                try {
                    if (traits.type.indexOf("flex.") == 0) {
                        // Try to get a class
                        var classParts = traits.type.split(".");
                        var unqualifiedClassName = classParts[(classParts.length - 1)];
                        if (unqualifiedClassName && this.Flex[unqualifiedClassName]) {
                            var flexParser = new this.Flex[unqualifiedClassName]();
                            obj = flexParser.readExternal(this, this);
                        } else {
                            obj = this.readAmfData();
                        }
                    }
                } catch (e) {
                    console.log("AMF3::readObject - Error : Unable to read externalizable data type '" + traits.type + "'  |  " + e);
                    obj = "Unable to read externalizable data type '" + traits.type + "'";
                }
            } else {
                var l = traits.members.length;
                var key;

                for(var j = 0; j < l; ++j) {
                    var val = this.readAmfData();
                    key = traits.members[j];
                    obj[key] = val;
                }

                if(traits.dynamic) {
                    key = this.readString();
                    while(key != "") {
                        var value = this.readAmfData();
                        obj[key] = value;
                        key = this.readString();
                    }
                }
            }

            if(traits) obj.__traits = traits;

            return obj;
        }
        private readXML() {
            var index = this.readU29();
            if((index & 1) == 0)  return this.getObjectReference(index >> 1);

            //var xml = new XML(this.readUTFBytes(index >> 1));
            var xml = this.readUTFBytes(index >> 1);
            this.readObjectCache.push(xml);
            return xml;
        }
        private readByteArray() {
            var index = this.readU29();
            if ((index & 1) == 0) return this.getObjectReference(index >> 1);

            var len = (index >> 1);
            //var ba2 = new ByteArray();
            var ba2 = new ByteArray(new ArrayBuffer(len));
            /*while(len--) {
             var b = this.readUnsignedByte().toString(16).toUpperCase();
             if (b.length < 2) b = '0' + b;
             ba2.push('0x' + b);
             }*/
            this.readBytes(ba2, 0, len);
            this.readObjectCache.push(ba2);
            return ba2;
        }
	}
}

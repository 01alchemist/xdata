/**
 * Created by Nidin Vinayakan on 05-03-2016.
 */
importScripts("../bundle/xdata.js");

System.config({
  packages: {
    "../": {
      format: "register",
      defaultExtension: "js"
    }
  }
});
System.import("../src/nid/lzma/LZMAWorker").then(
  null,
  console.error.bind(console)
);

/**
 * Created by Nidin Vinayakan on 05-03-2016.
 */
importScripts(
    "../../../node_modules/systemjs/dist/system.src.js",
    "../bundle/xdata.js"
);

System.config({
    packages: {
        "../": {
            format: 'register',
            defaultExtension: 'js'
        }
    }
});
System.import('../src/nid/zlib/ZLIBWorker').then(null, console.error.bind(console));
var broccoli = require('broccoli');
var fs = require('fs');
var makeBrowserTree = require('./trees/browser_tree');
var path = require('path');
var printSlowTrees = require('broccoli-slow-trees');
var Q = require('q');
/**
 * BroccoliBuilder facade for all of our build pipelines.
 */
var AngularXGUIBuilder = (function () {
    function AngularXGUIBuilder(options) {
        this.options = options;
        this.outputPath = options.outputPath;
    }
    AngularXGUIBuilder.prototype.rebuildBrowserDevTree = function () {
        this.browserDevBuilder = this.browserDevBuilder || this.makeBrowserDevBuilder();
        return this.rebuild(this.browserDevBuilder, 'js.dev');
    };
    AngularXGUIBuilder.prototype.rebuildBrowserProdTree = function () {
        this.browserProdBuilder = this.browserProdBuilder || this.makeBrowserProdBuilder();
        return this.rebuild(this.browserProdBuilder, 'js.prod');
    };
    AngularXGUIBuilder.prototype.cleanup = function () {
        return Q.all([
            this.nodeBuilder && this.nodeBuilder.cleanup(),
            this.browserDevBuilder && this.browserDevBuilder.cleanup(),
            this.browserProdBuilder && this.browserProdBuilder.cleanup()
        ]);
    };
    AngularXGUIBuilder.prototype.makeBrowserDevBuilder = function () {
        var tree = makeBrowserTree({ name: 'dev', typeAssertions: true }, path.join(this.outputPath, 'js', 'dev'));
        return new broccoli.Builder(tree);
    };
    AngularXGUIBuilder.prototype.makeBrowserProdBuilder = function () {
        var tree = makeBrowserTree({ name: 'prod', typeAssertions: false }, path.join(this.outputPath, 'js', 'prod'));
        return new broccoli.Builder(tree);
    };
    AngularXGUIBuilder.prototype.rebuild = function (builder, name) {
        var _this = this;
        return builder.build().then(function (result) {
            if (!_this.firstResult) {
                _this.firstResult = result;
            }
            printSlowTrees(result.graph);
            writeBuildLog(result, name);
        }, function (error) {
            // the build tree is the same during rebuilds, only leaf properties of the nodes change
            // so let's traverse it and get updated values for input/cache/output paths
            if (_this.firstResult) {
                writeBuildLog(_this.firstResult, name);
            }
            throw error;
        });
    };
    return AngularXGUIBuilder;
})();
exports.AngularXGUIBuilder = AngularXGUIBuilder;
function writeBuildLog(result, name) {
    var logPath = "tmp/build." + name + ".log";
    var prevLogPath = logPath + '.previous';
    var formattedLogContent = JSON.stringify(broccoliNodeToBuildNode(result.graph), null, 2);
    if (fs.existsSync(prevLogPath))
        fs.unlinkSync(prevLogPath);
    if (fs.existsSync(logPath))
        fs.renameSync(logPath, prevLogPath);
    fs.writeFileSync(logPath, formattedLogContent, { encoding: 'utf-8' });
}
function broccoliNodeToBuildNode(broccoliNode) {
    var tree = broccoliNode.tree.newStyleTree || broccoliNode.tree;
    return new BuildNode(tree.description || tree.constructor.name, tree.inputPath ? [tree.inputPath] : tree.inputPaths, tree.cachePath, tree.outputPath, broccoliNode.subtrees.map(broccoliNodeToBuildNode));
}
var BuildNode = (function () {
    function BuildNode(pluginName, inputPaths, cachePath, outputPath, inputNodes) {
        this.pluginName = pluginName;
        this.inputPaths = inputPaths;
        this.cachePath = cachePath;
        this.outputPath = outputPath;
        this.inputNodes = inputNodes;
    }
    return BuildNode;
})();
//# sourceMappingURL=xdata_builder.js.map
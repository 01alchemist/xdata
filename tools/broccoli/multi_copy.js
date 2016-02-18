var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/fs-extra/fs-extra.d.ts" />
var Writer = require('broccoli-writer');
var fs = require('fs');
var fsx = require('fs-extra');
var minimatch = require('minimatch');
var path = require('path');
var glob = require('glob');
/**
 * A writer that copies an input file from an input path into (potentially many) output locations
 * given by glob patterns, .
 */
var MultiCopy = (function (_super) {
    __extends(MultiCopy, _super);
    function MultiCopy(inputTree, options) {
        _super.call(this);
        this.inputTree = inputTree;
        this.options = options;
    }
    MultiCopy.prototype.write = function (readTree, destDir) {
        var _this = this;
        return readTree(this.inputTree)
            .then(function (inputPath) {
            var fileName = path.basename(_this.options.srcPath);
            var data = fs.readFileSync(path.join(inputPath, _this.options.srcPath), 'utf-8');
            _this.options.targetPatterns.forEach(function (pattern) {
                var paths = glob.sync(pattern);
                paths = paths.filter(function (p) { return fs.statSync(p).isDirectory(); });
                if (_this.options.exclude) {
                    paths = paths.filter(function (p) { return !_this.options.exclude.some(function (excl) { return minimatch(p, excl); }); });
                }
                paths.forEach(function (p) {
                    var folder = path.join(destDir, p);
                    fsx.mkdirsSync(folder);
                    var outputPath = path.join(folder, fileName);
                    fs.writeFileSync(outputPath, data);
                });
            });
        });
    };
    return MultiCopy;
})(Writer);
exports.MultiCopy = MultiCopy;
//# sourceMappingURL=multi_copy.js.map
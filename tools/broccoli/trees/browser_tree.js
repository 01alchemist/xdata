'use strict';
var Funnel = require('broccoli-funnel');
var htmlReplace = require('../html-replace');
var jsReplace = require('../js-replace');
var path = require('path');
var stew = require('broccoli-stew');
var broccoli_typescript_1 = require('../broccoli-typescript');
var broccoli_dest_copy_1 = require('../broccoli-dest-copy');
var broccoli_flatten_1 = require('../broccoli-flatten');
var broccoli_merge_trees_1 = require('../broccoli-merge-trees');
var broccoli_replace_1 = require('../broccoli-replace');
var projectRootDir = path.normalize(path.join(__dirname, '..', '..', '..', '..'));
var kServedPaths = [];
module.exports = function makeBrowserTree(options, destinationPath) {
    var modulesTree = new Funnel('modules', {
        include: ['**/**/*.ts'],
        exclude: [
            '**/*.cjs',
            'benchmarks/e2e_test/**',
            // Exclude ES6 polyfill typings when tsc target=ES6
            'xgui/manual_typings/traceur-runtime.d.ts',
            'xgui/typings/es6-promise/**'
        ],
        destDir: '/'
    });
    var es5ModulesTree = new Funnel('modules', {
        include: ['**/**/*.ts'],
        exclude: ['**/*.cjs', 'benchmarks/e2e_test/**'],
        destDir: '/'
    });
    var scriptPathPatternReplacement = {
        match: '@@FILENAME_NO_EXT',
        replacement: function (replacement, relativePath) {
            return relativePath.replace(/\.\w+$/, '').replace(/\\/g, '/');
        }
    };
    modulesTree = broccoli_replace_1.default(modulesTree, {
        files: ["examples*/**/*.js"],
        patterns: [{ match: /\$SCRIPTS\$/, replacement: jsReplace('SCRIPTS') }]
    });
    // Use TypeScript to transpile the *.ts files to ES6
    var es6Tree = broccoli_typescript_1.default(modulesTree, {
        allowNonTsExtensions: false,
        declaration: true,
        emitDecoratorMetadata: true,
        mapRoot: '',
        noEmitOnError: false,
        rootDir: '.',
        sourceMap: true,
        sourceRoot: '.',
        target: 'ES6'
    });
    // Use TypeScript to transpile the *.ts files to ES5
    var es5Tree = broccoli_typescript_1.default(es5ModulesTree, {
        allowNonTsExtensions: false,
        declaration: true,
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        mapRoot: '',
        module: 'CommonJS',
        noEmitOnError: false,
        rootDir: '.',
        sourceMap: true,
        sourceRoot: '.',
        target: 'ES5'
    });
    // Now we add a few more files to the es6 tree that the es5 tree should not see
    var extras = new Funnel('tools/build', { files: ['es5build.js'], destDir: 'xgui' });
    es6Tree = broccoli_merge_trees_1.default([es6Tree, extras]);
    var vendorScriptsTree = broccoli_flatten_1.default(new Funnel('.', {
        files: [
            'node_modules/es6-shim/es6-shim.js',
            'node_modules/systemjs/dist/system.src.js',
            'node_modules/base64-js/lib/b64.js',
        ]
    }));
    var vendorScripts_benchmark = new Funnel('tools/build/snippets', { files: ['url_params_to_form.js'], destDir: '/' });
    var vendorScripts_benchmarks_external = new Funnel('node_modules/angular', { files: ['angular.js'], destDir: '/' });
    // Get scripts for each benchmark or example
    // let servingTrees = kServedPaths.reduce(getServedFunnels, []);
    function getServedFunnels(funnels, destDir) {
        var options = { srcDir: '/', destDir: destDir };
        funnels.push(new Funnel(vendorScriptsTree, options));
        if (destDir.indexOf('benchmarks') > -1) {
            funnels.push(new Funnel(vendorScripts_benchmark, options));
        }
        if (destDir.indexOf('benchmarks_external') > -1) {
            funnels.push(new Funnel(vendorScripts_benchmarks_external, options));
        }
        return funnels;
    }
    var htmlTree = new Funnel(modulesTree, { include: ['*/src/**/*.html'], destDir: '/' });
    var assetsTree = new Funnel(modulesTree, { include: ['**/*'], exclude: ['**/*.{html,ts}'], destDir: '/' });
    /*var scripts = mergeTrees(servingTrees);
  
    htmlTree = mergeTrees([htmlTree, scripts]);*/
    es5Tree = broccoli_merge_trees_1.default([es5Tree, htmlTree, assetsTree]);
    es6Tree = broccoli_merge_trees_1.default([es6Tree, htmlTree, assetsTree]);
    var mergedTree = broccoli_merge_trees_1.default([stew.mv(es6Tree, '/es6'), stew.mv(es5Tree, '/es5')]);
    return broccoli_dest_copy_1.default(mergedTree, destinationPath);
};
//# sourceMappingURL=browser_tree.js.map
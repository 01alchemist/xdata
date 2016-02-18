'use strict';

var Funnel = require('broccoli-funnel');
var htmlReplace = require('../html-replace');
var jsReplace = require('../js-replace');
var path = require('path');
var stew = require('broccoli-stew');

import compileWithTypescript from '../broccoli-typescript';
import destCopy from '../broccoli-dest-copy';
import flatten from '../broccoli-flatten';
import mergeTrees from '../broccoli-merge-trees';
import replace from '../broccoli-replace';


var projectRootDir = path.normalize(path.join(__dirname, '..', '..', '..', '..'));


const kServedPaths = [
];


module.exports = function makeBrowserTree(options, destinationPath) {
  var modulesTree = new Funnel('modules', {
    include: ['**/**/*.ts'],
    exclude: [
      '**/*.cjs',
      'benchmarks/e2e_test/**',
      // Exclude ES6 polyfill typings when tsc target=ES6
      'xdata/manual_typings/traceur-runtime.d.ts',
      'xdata/typings/es6-promise/**',
      'xdata/bundle/**'
    ],
    destDir: '/'
  });

  var es5ModulesTree = new Funnel('modules', {
    include: ['**/**/*.ts'],
    exclude: ['**/*.cjs', 'benchmarks/e2e_test/**', 'xdata/bundle/**'],
    destDir: '/'
  });

  var scriptPathPatternReplacement = {
    match: '@@FILENAME_NO_EXT',
    replacement: function(replacement, relativePath) {
      return relativePath.replace(/\.\w+$/, '').replace(/\\/g, '/');
    }
  };

  modulesTree = replace(modulesTree, {
    files: ["examples*/**/*.js"],
    patterns: [{match: /\$SCRIPTS\$/, replacement: jsReplace('SCRIPTS')}]
  });

  // Use TypeScript to transpile the *.ts files to ES6
  var es6Tree = compileWithTypescript(modulesTree, {
    allowNonTsExtensions: false,
    declaration: true,
    emitDecoratorMetadata: true,
    mapRoot: '',  // force sourcemaps to use relative path
    noEmitOnError: false,
    rootDir: '.',
    sourceMap: true,
    sourceRoot: '.',
    target: 'ES6'
  });

  // Use TypeScript to transpile the *.ts files to ES5
  var es5Tree = compileWithTypescript(es5ModulesTree, {
    allowNonTsExtensions: false,
    declaration: true,
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    mapRoot: '',  // force sourcemaps to use relative path
    module: 'CommonJS',
    noEmitOnError: false,
    rootDir: '.',
    sourceMap: true,
    sourceRoot: '.',
    target: 'ES5'
  });

  // Now we add a few more files to the es6 tree that the es5 tree should not see
  var extras = new Funnel('tools/build', {files: ['es5build.js'], destDir: 'xdata'});
  es6Tree = mergeTrees([es6Tree, extras]);

  var vendorScriptsTree = flatten(new Funnel('.', {
    files: [
      'node_modules/es6-shim/es6-shim.js',
      'node_modules/systemjs/dist/system.src.js',
      'node_modules/base64-js/lib/b64.js',
    ]
  }));

  var vendorScripts_benchmark =
      new Funnel('tools/build/snippets', {files: ['url_params_to_form.js'], destDir: '/'});
  var vendorScripts_benchmarks_external =
      new Funnel('node_modules/angular', {files: ['angular.js'], destDir: '/'});

  // Get scripts for each benchmark or example
  // let servingTrees = kServedPaths.reduce(getServedFunnels, []);
  function getServedFunnels(funnels, destDir) {
    let options = {srcDir: '/', destDir: destDir};
    funnels.push(new Funnel(vendorScriptsTree, options));
    if (destDir.indexOf('benchmarks') > -1) {
      funnels.push(new Funnel(vendorScripts_benchmark, options));
    }
    if (destDir.indexOf('benchmarks_external') > -1) {
      funnels.push(new Funnel(vendorScripts_benchmarks_external, options));
    }
    return funnels;
  }

  var htmlTree = new Funnel(modulesTree, {include: ['*/src/**/*.html'], destDir: '/'});

  var assetsTree = new Funnel(modulesTree, {include: ['**/*'], exclude: ['**/*.{html,ts}'], destDir: '/'});

  /*var scripts = mergeTrees(servingTrees);

  htmlTree = mergeTrees([htmlTree, scripts]);*/

  es5Tree = mergeTrees([es5Tree, htmlTree, assetsTree]);
  es6Tree = mergeTrees([es6Tree, htmlTree, assetsTree]);

  var mergedTree = mergeTrees([stew.mv(es6Tree, '/es6'), stew.mv(es5Tree, '/es5')]);

  return destCopy(mergedTree, destinationPath);
};

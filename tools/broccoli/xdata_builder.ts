var broccoli = require('broccoli');
var fs = require('fs');
var makeBrowserTree = require('./trees/browser_tree');
var path = require('path');
var printSlowTrees = require('broccoli-slow-trees');
var Q = require('q');

/**
 * BroccoliBuilder facade for all of our build pipelines.
 */
export class XDATABuilder {
  private nodeBuilder: BroccoliBuilder;
  private browserDevBuilder: BroccoliBuilder;
  private browserProdBuilder: BroccoliBuilder;
  private dartBuilder: BroccoliBuilder;
  private outputPath: string;
  private firstResult: BuildResult;

  constructor(public options: XDATABuilderOptions) { this.outputPath = options.outputPath; }


  public rebuildBrowserDevTree(): Promise<BuildResult> {
    this.browserDevBuilder = this.browserDevBuilder || this.makeBrowserDevBuilder();
    return this.rebuild(this.browserDevBuilder, 'js.dev');
  }


  public rebuildBrowserProdTree(): Promise<BuildResult> {
    this.browserProdBuilder = this.browserProdBuilder || this.makeBrowserProdBuilder();
    return this.rebuild(this.browserProdBuilder, 'js.prod');
  }


  cleanup(): Promise<any> {
    return Q.all([
      this.nodeBuilder && this.nodeBuilder.cleanup(),
      this.browserDevBuilder && this.browserDevBuilder.cleanup(),
      this.browserProdBuilder && this.browserProdBuilder.cleanup()
    ]);
  }


  private makeBrowserDevBuilder(): BroccoliBuilder {
    let tree = makeBrowserTree({name: 'dev', typeAssertions: true},
                               path.join(this.outputPath, 'js', 'dev'));
    return new broccoli.Builder(tree);
  }


  private makeBrowserProdBuilder(): BroccoliBuilder {
    let tree = makeBrowserTree({name: 'prod', typeAssertions: false},
                               path.join(this.outputPath, 'js', 'prod'));
    return new broccoli.Builder(tree);
  }


  private rebuild(builder, name) {
    return builder.build().then(
        (result) => {
          if (!this.firstResult) {
            this.firstResult = result;
          }

          printSlowTrees(result.graph);
          writeBuildLog(result, name);
        },
        (error) => {
          // the build tree is the same during rebuilds, only leaf properties of the nodes change
          // so let's traverse it and get updated values for input/cache/output paths
          if (this.firstResult) {
            writeBuildLog(this.firstResult, name);
          }
          throw error;
        });
  }
}


function writeBuildLog(result: BuildResult, name: string) {
  let logPath = `tmp/build.${name}.log`;
  let prevLogPath = logPath + '.previous';
  let formattedLogContent = JSON.stringify(broccoliNodeToBuildNode(result.graph), null, 2);

  if (fs.existsSync(prevLogPath)) fs.unlinkSync(prevLogPath);
  if (fs.existsSync(logPath)) fs.renameSync(logPath, prevLogPath);
  fs.writeFileSync(logPath, formattedLogContent, {encoding: 'utf-8'});
}


function broccoliNodeToBuildNode(broccoliNode) {
  let tree = broccoliNode.tree.newStyleTree || broccoliNode.tree;

  return new BuildNode(tree.description || tree.constructor.name,
                       tree.inputPath ? [tree.inputPath] : tree.inputPaths, tree.cachePath,
                       tree.outputPath, broccoliNode.subtrees.map(broccoliNodeToBuildNode));
}


class BuildNode {
  constructor(public pluginName: string, public inputPaths: string[], public cachePath: string,
              public outputPath: string, public inputNodes: BroccoliNode[]) {}
}

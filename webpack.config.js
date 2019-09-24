/* eslint-disable no-console */
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const pkg = require("./package.json");
const tsConfig = require("./tsconfig.json");

const { black, green, bgGreen } = chalk;
const { NODE_ENV } = process.env;
console.log(
  `Webpack build ${green("NODE_ENV")} 👉 ${bgGreen(` ${black(NODE_ENV)} `)}`
);

const mode =
  process.env.NODE_ENV === "production" ? "production" : "development";
const isDevMode = mode === "development";

const outDir = "dist";
const entries = {
  index: ["./src/index.ts"],
  core: ["./src/core.ts"],
  compression: ["./src/compression.ts"],
  helpers: ["./src/helpers.ts"]
};

fs.removeSync(path.resolve(__dirname, outDir));

const buildNum = () => {
  const { CI, CIRCLE_BUILD_NUM, CIRCLE_BRANCH, CIRCLE_PR_NUMBER } = process.env;
  if (CI) {
    const build = `-build[${CIRCLE_BUILD_NUM}]`;
    if (CIRCLE_BRANCH === "master") {
      return build;
    }
    if (CIRCLE_BRANCH === "develop") {
      return `${build} (dev)`;
    }
    return `${build} (pr:${CIRCLE_PR_NUMBER})`;
  }
  return "-(local)";
};

// Make ts path resolvers for webpack
const { baseUrl } = tsConfig.compilerOptions;
const tsPaths = tsConfig.compilerOptions.paths;
const resolvedTsPaths = {};
Object.keys(tsPaths).forEach(pathName => {
  const [tsPath] = tsPaths[pathName];
  let cleanPathName = pathName.replace(/\*/gi, "");
  cleanPathName =
    cleanPathName[cleanPathName.length - 1] === "/"
      ? cleanPathName.substring(0, cleanPathName.length - 1)
      : cleanPathName;
  const resolvedPath = path.resolve(
    __dirname,
    baseUrl,
    tsPath.replace(/\*/gi, "")
  );
  resolvedTsPaths[cleanPathName] = resolvedPath;
});

console.log("TypeScript resolved paths");
console.log("👇");
console.log(resolvedTsPaths);

module.exports = {
  target: "node",
  mode,
  stats: {
    warnings: false
  },
  node: {
    __dirname: false,
    __filename: false
  },
  context: __dirname,
  entry: entries,
  externals: [nodeExternals({})],
  devtool: "source-map",
  optimization: {
    minimize: true
  },
  devServer: {
    hot: true,
    contentBase: path.resolve(__dirname),
    publicPath: "/"
  },
  resolve: {
    mainFields: ["main", "module"],
    extensions: [".ts", ".js"],
    alias: {
      ...resolvedTsPaths
    }
  },
  plugins: [
    ...(isDevMode ? [] : [new CleanWebpackPlugin()]),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(pkg.version + buildNum()),
      APP_NAME: JSON.stringify(pkg.name)
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/
      }
      // {
      //   enforce: "pre",
      //   test: /\.(ts)$/,
      //   loader: "tslint-loader",
      //   exclude: /(node_modules)/,
      //   options: {
      //     emitErrors: true
      //   }
      // }
    ]
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, outDir),
    devtoolModuleFilenameTemplate(info) {
      return path.resolve(__dirname, encodeURI(info.resourcePath));
    },
    library: "[name]",
    libraryTarget: "umd"
  }
};

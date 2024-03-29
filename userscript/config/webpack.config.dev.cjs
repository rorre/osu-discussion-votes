const path = require("path");
const { merge } = require("webpack-merge");
const LiveReloadPlugin = require("webpack-livereload-plugin");
const UserScriptMetaDataPlugin = require("userscript-metadata-webpack-plugin");

const metadata = require("./metadata.cjs");
const webpackConfig = require("./webpack.config.base.cjs");

metadata.require.push(
  "file://" + path.resolve(__dirname, "../dist/index.debug.user.js")
);
metadata.match.push("http://127.0.0.1:8080/*");
metadata.connect.push("127.0.0.1");

const cfg = merge(webpackConfig, {
  entry: {
    debug: webpackConfig.entry,
    dev: path.resolve(__dirname, "./empty.cjs"),
  },
  output: {
    filename: "index.[name].user.js",
    path: path.resolve(__dirname, "../dist"),
  },
  devtool: "eval-source-map",
  watch: true,
  watchOptions: {
    ignored: /node_modules/,
  },
  plugins: [
    new LiveReloadPlugin({
      delay: 500,
    }),
    new UserScriptMetaDataPlugin({
      metadata,
    }),
  ],
});

module.exports = cfg;

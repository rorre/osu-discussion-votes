const { merge } = require("webpack-merge");
const UserScriptMetaDataPlugin = require("userscript-metadata-webpack-plugin");

const metadata = require("./metadata.cjs");
const webpackConfig = require("./webpack.config.base.cjs");
const updateURL =
  "https://gist.github.com/rorre/3e2c94442d31a12e857fb02b2942529f/raw/modvotes.user.js";

const cfg = merge(webpackConfig, {
  mode: "production",
  output: {
    filename: "index.prod.user.js",
  },
  optimization: {
    // if you need minimize, you need to config minimizer to keep all comments
    // to keep userscript meta.
    minimize: false,
  },
  plugins: [
    new UserScriptMetaDataPlugin({
      metadata: {
        ...metadata,
        updateURL: updateURL,
        downloadURL: updateURL,
      },
    }),
  ],
});

module.exports = cfg;

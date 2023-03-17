const path = require("path");
const Webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");

var fs = require("fs");

module.exports = (env) => {
  return {
    experiments: {
      outputModule: true,
    },
    optimization: {
      minimize: env.production ? true : false,
      minimizer: [new TerserPlugin({ test: /\.js(\?.*)?$/i })],
    },
    devtool: env.production ? undefined : "inline-source-map",
    target: "web",
    entry: "./src/index.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      // filename: (p) => {
      //   if (p.runtime.endsWith(".jhtml")) {
      //     return `contentids/${p.runtime.replace(".jhtml", ".js")}`;
      //   }
      //   return "[name]";
      // },
      library: { type: "module" },
      publicPath: "/",
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          type: "javascript/auto",
          use: ["babel-loader"],
        },
      ],
    },
    plugins: [new Webpack.ContextReplacementPlugin(/cssnano|svgo|lilconfig/)],
    resolve: {
      fallback: {
        path: false,
        os: false,
        url: false,
        assert: false,
        fs: false,
        request: false,
      },
    },
  };
};

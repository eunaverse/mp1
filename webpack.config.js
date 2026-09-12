const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  devtool: "source-map",
  context: path.join(__dirname, "src"),
  entry: "./index.js",
  devServer: {
    static: { directory: path.resolve(__dirname, "build") },
    open: false,
    host: "127.0.0.1",
    port: "auto",
    watchFiles: ["src/**/*.html"],
  },
  module: {
    rules: [
      { test: /\.js$/i, exclude: /node_modules/, loader: "babel-loader" },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.(svg|woff2?|png|jpg|gif|mp4|webm|vtt)$/i,
        type: "asset/resource",
        generator: { filename: "media/[name][ext]" },
      },
      { test: /\.html$/i, loader: "html-loader" },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "./.nojekyll", to: "./.nojekyll", noErrorOnMissing: true },
      ],
    }),
    new MiniCssExtractPlugin({ filename: "styles.css" }),
    new HtmlWebpackPlugin({ template: "index.html", inject: "body" }),
  ],
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "build"),
    publicPath: "",
    clean: true,
  },
};

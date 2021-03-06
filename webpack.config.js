"use strict";

const path = require("path");
const glob = require("glob");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
//const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = function (env) {
  return {
    entry: {
      index: path.resolve(__dirname, "./src/index.tsx"),
    },
    mode: env.production ? "production" : "development",
    devtool: !env.production && "inline-source-map",
    optimization: {
      runtimeChunk: "single",
      minimize: env.production,
      minimizer: [
        "...",
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: "all",
        name: false,
      },
    },
    resolve: {
      extensions: [ ".tsx", ".ts", ".js" ],
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: env.production
        ? "static/js/[name].[contenthash:8].js"
        : "static/js/[name].bundle.js",
      chunkFilename: env.production
        ? "static/js/[name].[contenthash:8].chunk.js"
        : "static/js/[name].chunk.js",
    },
    module: {
      rules: [
        {
          test: /\.(png|jp(e*)g|svg|gif)$/,
          use: [
            {
              loader: "file-loader",
              options: {
                name: "static/images/[hash]-[name].[ext]",
              },
            },
          ],
        },
        {
          test: /\.tsx?$/,
          use: [
            "babel-loader",
            "ts-loader",
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.s[ac]ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                importLoaders: 1,
              },
            },
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [
                    require("tailwindcss"),
                    require("autoprefixer"),
                    env.production &&
                    require("@fullhuman/postcss-purgecss")({
                      content: ["./src/**/*.tsx", "./public/index.html"],
                      defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g),
                    })
                  ].filter(Boolean),
                },
              },
            },
            "sass-loader",
          ],
          sideEffects: true,
        }
      ],
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanStaleWebpackAssets: false,
      }),
      new HtmlWebpackPlugin({
        inject: true,
        template: path.resolve(__dirname, "public/index.html"),
        templateParameters: {
          root: env.production ? "https://www.popcycle.shop" : ""
        }
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: "public/images", to: "static/images" },
          { from: "public/robots.txt" },
        ]
      }),
      new MiniCssExtractPlugin({
        filename: "static/styles/[name].css",
      }),
      new WebpackManifestPlugin(),
      //new BundleAnalyzerPlugin(),
    ],
  };
}

const path = require("node:path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


module.exports = {
  // mode: 'development',
  // mode: 'production',
  // mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: "./src/index.js",
  devServer: {
    static: {
      directory: path.join(__dirname, "./dist"),
    },
    open: true,
    hot: true,
  },
  devtool: "source-map",
  plugins: [
    new MiniCSSExtractPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    // new BundleAnalyzerPlugin()
  ],
  output: {
    assetModuleFilename: 'images/[name]-[hash][ext][query]' // Cache busting can be done like: "images/[name].[hash][ext][query]" but you need to reconcile, which is easy in react but not static html
  },
  module: {
    rules: [
      // this is an array for our different rules, js, .scss, etc.
      {
        test: /\.js$/, // test by regex
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCSSExtractPlugin.loader,
            options: {
              publicPath: "", // avoids a gotcha with images later
            },
          },
          "css-loader",
        ],
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        type: 'asset/resource',
        use: [
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
              },
              // optipng.enabled: false will disable optipng
              optipng: {
                enabled: false,
              },
              pngquant: {
                quality: [0.65, 0.9],
                speed: 4,
              },
              gifsicle: {
                interlaced: false,
              },
              // the webp option will enable WEBP
              webp: {
                quality: 75,
              },
            },
          },
        ],
      },
      // {
      //   test: /\.(avif|webp|png|jpe?g|gif|svg)$/i,
      //   type: 'asset/resource',
      // },
      // {
      //   test: /\.html/,
      //   type: 'asset/resource',
      //   generator: {
      //     filename: 'static/[hash][ext][query]'
      //   }
      // }
    ],
  },
};

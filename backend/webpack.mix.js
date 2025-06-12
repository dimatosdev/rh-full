const mix = require('laravel-mix');
const webpack = require('webpack');

mix.js('resources/js/app.jsx', 'public/js')
   .react()
   .css('resources/css/app.css', 'public/css')
   .options({
       processCssUrls: false
   })
   .webpackConfig({
       resolve: {
           fallback: {
               "fs": false,
               "path": require.resolve("path-browserify"),
               "crypto": false,
               "stream": false,
               "buffer": require.resolve("buffer"),
               "util": false
           },
           extensions: [".js", ".jsx", ".json"]
       },
       plugins: [
           new webpack.ProvidePlugin({
               Buffer: ['buffer', 'Buffer'],
               process: 'process/browser',
           }),
       ]
   });

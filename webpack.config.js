var webpack = require('webpack');
var path = require("path");
var ExtractTextPlugin = require('extract-text-webpack-plugin');
//var HtmlWebpackPlugin = require('html-webpack-plugin');

var plugins = [
    new ExtractTextPlugin('css/tabcms.css'),
    //new HtmlWebpackPlugin('index.html')
];

module.exports = {
    entry: {
        'tabcms': './src/tabcms.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/[name].js',
        library: 'tabcms',
        libraryTarget: "umd"
    },
    devServer: {
        historyApiFallback: true,
        hot: true,
        inline: true
    },
    externals: {
        jquery: 'jQuery',
        bootstrap: 'bootstrap'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    use: 'css-loader'
                })
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 15000
                }
            }
        ]
    },
    plugins: plugins
};
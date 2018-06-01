const path = require('path')
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin')    //生成html
const UglifyJsPlugin=require('uglifyjs-webpack-plugin')     //压缩JS
const CleanWebpackPlugin = require('clean-webpack-plugin')  //删除打包前代码
const pathsToClean = [
    'build',
]
module.exports = {
    entry: './src/index.js',
    output: {
        filename: '[name].[chunkhash:8].js',
        path: path.resolve(__dirname, 'build')
    },
    module: {
        rules: [{
                test: /\.css$/, //根据正则匹配css后缀的文件
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                loader: require.resolve('url-loader'),
                options: {
                    limit: 1024,
                    name: 'static/media/[name].[hash:8].[ext]',
                },
            },


        ]
    },
    plugins: [
        new webpack.BannerPlugin('版权所有，翻版必究'),
        new webpack.NoEmitOnErrorsPlugin(), // 碰到错误warning但是不停止编译
        new webpack.optimize.OccurrenceOrderPlugin(), //根据模块调用次数，给模块分配ids
        new HtmlWebpackPlugin({
            template: __dirname + "/public/index.html", //目标文件
            inject: 'true', //script标签位于html文件的 body 底部 false:不插入js标签
            minify: {
                removeComments: true,
                collapseWhitespace: true, //折叠空格
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            },
        }),
        new CleanWebpackPlugin(pathsToClean), //用于删除之前打包的文件
        //   new ExtractTextPlugin("[name]_[contenthash:15].css")
    ],
    optimization: {//压缩JS插件
            minimizer: [
                new UglifyJsPlugin({
                    uglifyOptions: {
                        compress: false
                    }
                })
            ]
        }
};

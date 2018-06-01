const path = require('path')
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
module.exports = {
    entry: './src/index.js',
    mode:'development',
    output: {
        filename: '[name].[hash:8].js',
        path: path.resolve(__dirname, 'build')
    },
    devServer: {
        contentBase: "./build",//本地服务器所加载的页面所在的目录
        historyApiFallback: true,//使用HTML5 History Api，任意的跳转或404响应可以指向 index.html 页面；
        inline: true,   //一般启用inline方式热更新
        hot: true,
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
        new webpack.NamedModulesPlugin(),   //当开启 hmr 的时候使用该插件会显示模块的相对路径，建议用于开发环境。
        new webpack.HotModuleReplacementPlugin(),   //启用热加载模块
        new webpack.NoEmitOnErrorsPlugin(), // 碰到错误warning但是不停止编译
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
        //   new ExtractTextPlugin("[name]_[contenthash:15].css")
    ]
};

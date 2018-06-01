# Webpack3配置由简至全（一）

标签（空格分隔）： webpack3 react

---

###一、基本安装
* 第一步
```
$ mkdir project-name && cd project-name
$ npm init -y   //-y:跳过询问
$ npm install webpack --save-dev
```
* 第二步
  在当前目录创建index.html 、 index.js 和 webpack.config.js
  |- package.json
  |- index.html
  |- src
  |- webpack.config.js
  &nbsp;&nbsp;&nbsp;&nbsp;|- index.js
* 第三步`html`&`webpack.config.js`
``` 
//index.html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>test</title>
</head>
<body>
	<div id="root"></div>
</body>
</html>
```
``` 
//webpack.config.js
const path = require('path');
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
```
* 第四步
运行`webpack.config.js` 
```
$ ./node_modules/.bin/webpack --config webpack.config.js
```
结果：
```
$ ./node_modules/.bin/webpack --mode development --config  webpack.config.js
Hash: e0686a5b50f610b48d10
Version: webpack 4.10.2
Time: 66ms
Built at: 2018-05-31 19:21:18
    Asset   Size  Chunks             Chunk Names
bundle.js  4 KiB    main  [emitted]  main
Entrypoint main = bundle.js
[./src/index.js] 227 bytes {main} [built]

```
自此我们已经完成了一个最简单的打包过程了

###二、完善`webpack.config.js`配置
- **1. HtmlWebpackPlugin插件  `//打包生成html文件`**
```
$ npm install html-webpack-plugin -D
```
在`webpack.config.js`中引入`html-webpack-plugin`
```
  plugins: [
      new HtmlWebpackPlugin({
          template: __dirname + "/index.html",  //目标文件
          inject: true, //script标签位置； false:不插入js标签
          minify: {     //一些压缩操作 =>自 create-react-app
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
  ]
```
- **2 . module --为了识别各种文件**

为了从 JavaScript 模块中 import 一个 CSS 文件
 首先下载loaders:
 `$ npm install --save-dev style-loader css-loader`
 然后
 
      ```
     module: {
       rules: [
         {
           test: /\.css$/,//根据正则匹配css后缀的文件
          use: [
             'style-loader',
             'css-loader'
           ]
         }
       ]
     }
     ```
其他类似，根据所用文件来使用相应解析器，如

     ```
    {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        loader: require.resolve('url-loader'),
        options: {
            limit: 1024,
            name: 'static/media/[name].[hash:8].[ext]',
        },
    },
     ```
     
- **3 . hash | chunkhash | contenthash --为了解决缓存问题**
 写法：`filename: '[name].[chunkhash:8].js'`
    - `hash`：一个版本一个独一无二的hash
        - （全部文件都共用相同的hash值）
    - `chunkhash`：一个模块独一无二的hash
        - （只要模块不改变，chunkhash不变）
    - `contenthash`：一个文件独一无二的hash
        - （文件改变内容，contenthash即改变） 

> 这里hash值改变就会产生一个问题：打包后的文件会始终叠加
因此需要用一个删除文件的插件`clean-webpack-plugin`
```new CleanWebpackPlugin(pathsToClean)//pathsToClean:'dist'```

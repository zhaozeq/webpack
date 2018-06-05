# Webpack3配置由简至全（二）

标签（空格分隔）： webpack3 react
tips: rm -rf node_modules

---

###二、完善`webpack.config.js`配置（2）
- **4 . 为了开发-开发工具**
官网[https://webpack.js.org][1]有介绍三种开发工具
 1. webpack's Watch Mode
 2. webpack-dev-server
 3. webpack-dev-middleware
    
    这里选用一个较为常用的---`webpack-dev-server`
首先下载依赖
```
$ npm install --save-dev webpack-dev-server
```
*webpack.config.js*
```
  const path = require('path');
  const webpack = require('webpack');
  const HtmlWebpackPlugin = require('html-webpack-plugin');
  const CleanWebpackPlugin = require('clean-webpack-plugin');

  module.exports = {
    entry: './src/index.js',
    output: {
        filename: '[name].[chunkhash:8].js',
        path: path.resolve(__dirname, 'dist')
    },
+   devServer: {
+     contentBase: './dist'
+   },
    plugins: [
      new CleanWebpackPlugin(['dist']),
    ],
  };
```
在`package.json`脚本行添加 `"start": "webpack-dev-server --open"`
最后通过`npm run start` 就可以开启一个简单的本地服务


----------


- **5 . 为了开发-热加载**
这里使用`webpack-dev-server`配置热加载
注意：热加载和`chunkhash`冲突 这里改为`hash`
*webpack.config.js*
```
  const path = require('path');
  const webpack = require('webpack');
  const HtmlWebpackPlugin = require('html-webpack-plugin');
  const CleanWebpackPlugin = require('clean-webpack-plugin');

  module.exports = {
    entry: './src/index.js',
    output: {
        filename: '[name].[hash:8].js',
        path: path.resolve(__dirname, 'dist')
    },
+   devServer: {
+     contentBase: './dist'
+     historyApiFallback: true,//任意的跳转或404响应可以指向首页；
+     inline: true,   //一般启用inline方式热更新
+     hot: true,
+   },
    plugins: [
      new CleanWebpackPlugin(['dist']),
+     new webpack.NamedModulesPlugin(),   //热加载显示模块的相对路径
+     new webpack.HotModuleReplacementPlugin(),   //启用热加载模块
    ],
  };
```
这样就把热加载项配置好了
当然热加载还不止这点 ->[热加载参考][2]

------------------
- **5 . 添加`postcss-loader`**
```
{
    test: /\.css$/,
    use: [
        require.resolve('style-loader'),
        {
            loader: require.resolve('css-loader'),
            options: {
                importLoaders: 1,  //接下来的需要的loader个数
                modules: true,     //模块化css
                localIdentName: '[local]_[hash:base64:5]' //css名称
            },
        },
        {
            loader: require.resolve('postcss-loader'),
            options: {
                ident: 'postcss',
                plugins: () => [
                    require('postcss-flexbugs-fixes'),
                    autoprefixer({
                        browsers: [
                            '>1%',
                            'last 4 versions',
                            'Firefox ESR',
                            'not ie < 9', // React doesn't support IE8 anyway
                        ],
                        flexbox: 'no-2009',
                    }),
                ],
            },
        },
    ],
},
```

------------------

- **6 . 公共文件抽取`DllPlugin`**大大加快编译速度
首先我选择在根目录下新增一个`webpack.dll.config.js`文件并配置好内容
```
const path = require("path");
const webpack = require("webpack");
const _package = require('./package.json'); // 引入package.json
module.exports = {
    entry: {
        vendor: Object.keys(_package.dependencies) // 遍历package.json的所有依赖包
    },
    output: {
        path: path.join(__dirname, 'build'), // 生成的文件存放路径
        filename: '[name].dll.js', // 生成的文件名字(默认为vendor.dll.js)
        library: '[name]_library'  // 生成文件的映射关系，与下面DllPlugin中配置对应
    },
    plugins: [
        new webpack.DllPlugin({
            // 会生成一个json文件，里面是关于dll.js的一些配置信息
            path: path.join(__dirname, 'public', '[name]-manifest.json'),
            name: '[name]_library', // 与上面output中配置对应
            context: __dirname // 上下文环境路径
        })
    ]
};
```
然后在`package.json`中配置启动

     "dll":"webpack --config webpack.dll.config.js --progress"
     执行 npm run dll =>生成依赖映射文件
最后在我们的`webpack.dev.config.js`plugin 中加入DllReferencePlugin

```
new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: path.join(__dirname, "public","vendor-manifest.json")//dll生成的映射json路径
        }),
```
> 注意：我们需要把dll生成的公共js文件需要在bundle.js之前引入才行
现在我们就可以开始npm run dev 实现快速编译了

---------------

- **7 . 配置eslint帮助我们检查代码，大大提高开发效率
    -> [Eslint参考文献][3]
    -> [Eslint中文][4]
    这个配置因人而异，很多编辑器可以直接引入eslint插件实现代码检测，就无需配置这个了，反而影响编译速度
 - start：老规矩先装依赖(这里使用`airbnb`编译规则，有自己的规则可以在`.eslintrc`相关文件上编写自己的rules)
    ```
     npm install --save-dev eslint
     eslint --init//这里根据需求走 我们选择popular -> bnb
    ```
    
 - 由于是代码检测工具所以我们需要放在js执行前
 
    ```
     {
        test: /\.(js|jsx|mjs)$/,
        enforce: 'pre',
        use: [
            {
            options: {
                formatter: eslintFormatter,//这个输出格式可以网上找或者自己写，传入一个eslint解析的结果，需要返回打印内容可以使用 'eslint-friendly-formater'
                eslintPath: require.resolve('eslint'),
            },
            loader: require.resolve('eslint-loader'),
            },
        ],
        include: `${__dirname}`,
    },
```

    `eslintFormatter.js`
    ```
    'use strict';
    const chalk = require('chalk');
    const table = require('text-table');
    
    function isError(message) {
      if (message.fatal || message.severity === 2) {
        return true;
      }
      return false;
    }
    
    function formatter(results) {
      let output = '\n';
      let hasErrors = false;
      let reportContainsErrorRuleIDs = false;
    
      results.forEach(result => {
        let messages = result.messages;
        if (messages.length === 0) {
          return;
        }
    
        messages = messages.map(message => {
          let messageType;
          if (isError(message)) {
            messageType = 'error';
            hasErrors = true;
            if (message.ruleId) {
              reportContainsErrorRuleIDs = true;
            }
          } else {
            messageType = 'warn';
          }
    
          let line = message.line || 0;
          let position = chalk.bold('Line ' + line + ':');
          return [
            '',
            position,
            messageType,
            message.message.replace(/\.$/, ''),
            chalk.underline(message.ruleId || ''),
          ];
        });
    
        // if there are error messages, we want to show only errors
        // if (hasErrors) {
        //   messages = messages.filter(m => m[2] === 'error');
        // }
    
        // add color to rule keywords
        messages.forEach(m => {
          console.log(m[4])
          m[4] = m[2] === 'error' ? chalk.red(m[4]) : chalk.yellow(m[4]);
          m.splice(2, 1);
        });
    
        let outputTable = table(messages, {
          align: ['l', 'l', 'l'],
          stringLength(str) {
            return str.length;
          },
        });
        output += `${outputTable}\n\n`;
      });
    
      // if (reportContainsErrorRuleIDs) {
    
      //   output +=
      //     'Search for the ' +
      //     chalk.underline(chalk.red('keywords')) +
      //     ' to learn more about each error.';
      // }
      return output;
    }
    
    module.exports = formatter;
    ```
OK,基本配置完结，现在基本的功能都已经有了，再来就是可以封装一下方法啥的！

 


  [1]: https://webpack.js.org
  [2]: https://webpack.js.org/guides/hot-module-replacement/#hmr-with-stylesheets
  [3]: https://eslint.org/docs/user-guide/configuring
  [4]: http://eslint.cn/docs/user-guide/configuring

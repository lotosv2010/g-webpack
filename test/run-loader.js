// 引入 loader-runner 模块中的 runLoaders 函数
// const { runLoaders } = require("loader-runner");
const { runLoaders } = require("../loader-runner");
// 引入 path 模块
const path = require("path");
// 引入 fs 模块
const fs = require("fs");

// 获取入口文件的绝对路径
const entryFilePath = path.resolve(__dirname, "../src/entry1.js");
// 定义需要处理的请求字符串
const request = `inline1-loader!inline2-loader!${entryFilePath}`;

// 定义 loader 规则
const rules = [
  {
    test: /\.js$/,
    use: ['normal1-loader', 'normal2-loader'],
  },
  {
    test: /\.js$/,
    enforce: 'pre',
    use: [
      'pre1-loader',
      {
        loader: 'pre2-loader',
        options: {
          name: 'gwb'
        }
      }
    ]
  },
  {
    test: /\.js$/,
    enforce: 'post',
    use: [
      'post1-loader',
      'post2-loader'
    ]
  }
];

// 将请求的字符串按照感叹号分割成数组
const parts = request.replace(/^-?!+/, '').split('!');
// 弹出数组最后一个元素，即资源路径
const resource = parts.pop();
// 将剩下的数组元素作为内联 loader 列表
const inlineLoaders = parts;
// 定义空数组 preLoaders、normalLoaders 和 postLoaders
const preLoaders = [];
const normalLoaders = [];
const postLoaders = [];

// 遍历 rules 数组
for (rule of rules) {
  // 如果当前规则匹配到了资源路径
  if (rule.test.test(resource)) {
    // 根据 enforce 属性判断是前置 loader 还是后置 loader 还是普通 loader，将 loader 添加到对应的数组中
    if (rule.enforce === 'pre') {
      preLoaders.push(...rule.use);
    } else if (rule.enforce === 'post') {
      postLoaders.push(...rule.use);
    } else {
      normalLoaders.push(...rule.use);
    }
  }
}

// 将 preLoaders、normalLoaders、postLoaders 和 inlineLoaders 数组合并成一个总的 loaders 数组
let loaders = [...postLoaders, ...inlineLoaders, ...normalLoaders, ...preLoaders];
if (request.startsWith('!!')) {
  loaders = [...inlineLoaders];
} else if (request.startsWith('-!')) {
  loaders = [...postLoaders, ...inlineLoaders];
} else if (request.startsWith('!')) {
  loaders = [...postLoaders, ...inlineLoaders, ...preLoaders];
}
// 定义一个函数，用于将 loader 转换成绝对路径
function resolveLoader(loader) {
  return { 
    loader: path.resolve(__dirname, '../loaders-chain', (loader.loader || loader) + '.js'),
    options: loader.options || {}
  };
}

// 将 loaders 数组中的 loader 转换成绝对路径
const resolvedLoaders = loaders.map(resolveLoader);
// 调用 runLoaders 函数，开始执行 loader 链
runLoaders({
  resource, // 资源路径
  loaders: resolvedLoaders, // 需要执行的 loader 列表
  context: {
    age: 20,
    getCurrentLoader() {
      return this.loaders[this.loaderIndex];
    },
    getOptions() {
      const loader = this.getCurrentLoader();
      return loader.options || loader.query;
    }
  }, // loader 执行的上下文对象
  readResource: fs.readFile.bind(fs) // 用于读取资源的函数
}, (err, result) => {
  // 打印错误和处理结果
  console.log(err);
  console.log(result);
});

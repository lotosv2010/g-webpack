// 引入 url 模块
const url = require('url');
// 创建 loader 对象的函数
function createLoaderObject({loader, options}) {
  // 通过 require 函数加载 loader
  let normal = require(loader);
  // 从 loader 中取出 pitch 函数和 raw 属性
  let pitch = normal.pitch;
  let raw = normal.raw || true;
  // 返回一个包含 loader 相关信息的对象
  const obj = {
    path: null,  // loader 的绝对路径
    query: null, // loader 的参数
    normal, // loader 函数
    pitch, // pitch 函数
    normalExecuted: false, // 是否执行过 normal 函数
    pitchExecuted: false,  // 是否执行过 pitch 函数
    data: {}, // 存储 loader 的数据
    raw // 是否是 raw loader，为 false 读成字符串，为 true 读成 buffer
  };
  // request 是 loader 的绝对路径和参数的拼接
  Object.defineProperty(obj, "request", {
    get: function () {
      return obj.path + obj.query;
    },
    set: function (value) {
      const { pathname, query } = url.parse(value);
      obj.path = decodeURIComponent(pathname);
      obj.query = query || options;
    }
  });
  // 给loader 的 request 属性赋值
  obj.request = loader;
  return obj;
}

// 迭代执行 normal loader 的函数
function iterateNormalLoaders(processOptions, loaderContext, args, pitchingCallback) {
  // 如果已经遍历完所有的 normal loader，则调用 pitchingCallback 函数
  if (loaderContext.loaderIndex < 0) {
    return pitchingCallback(null, args);
  }
  // 取出当前要执行的 loader 对象
  let currentLoader = loaderContext.loaders[loaderContext.loaderIndex];
  // 如果当前 loader 已经执行过 normal 函数，则向前遍历 loader 数组
  if (currentLoader.normalExecuted) {
    loaderContext.loaderIndex--;
    return iterateNormalLoaders(processOptions, loaderContext, args, pitchingCallback);
  }
  // 取出 normal 函数并标记当前 loader 已经执行过 normal 函数
  let fn = currentLoader.normal;
  currentLoader.normalExecuted = true;
  // 根据 loader 的 raw 属性将传入的参数转换为 buffer 类型或者 string 类型
  convertArgs(args, currentLoader.raw);
  // 执行 normal 函数，将返回值传入下一次迭代
  runSyncOrAsync(fn, loaderContext, args, (err, ...returnArgs) => {
    return iterateNormalLoaders(processOptions, loaderContext, returnArgs, pitchingCallback);
  });
}

// 将 loader 函数的参数转换为 buffer 类型或者 string 类型
function convertArgs(args, raw) {
  // 如果是 raw 模式且第一个参数不是 buffer 类型，则将第一个参数转换为 buffer 类型
  if (raw && !Buffer.isBuffer(args[0])) {
    args[0] = Buffer.from(args[0]);
  } else if (!raw && Buffer.isBuffer(args[0])) { // 如果不是 raw 模式且第一个参数是 buffer 类型，则将第一个参数转换为 string 类型
    args[0] = args[0].toString('utf-8');
  }
}

// 处理资源文件的函数
function processResource(processOptions, loaderContext, pitchingCallback) {
  // 读取资源文件的内容，存入 processOptions.resourceBuffer 中
  processOptions.readResource(loaderContext.resourcePath, (err, resourceBuffer) => {
    if (err) {
      return pitchingCallback(err);
    }
    processOptions.resourceBuffer = resourceBuffer;
    // 向前遍历 loader 数组，然后开始迭代执行 normal loader
    loaderContext.loaderIndex--;
    iterateNormalLoaders(processOptions, loaderContext, [resourceBuffer], pitchingCallback);
  });
}

// 迭代执行 pitch loader
function iteratePitchingLoaders(processOptions, loaderContext, pitchingCallback) {
  // 判断loader 数组是否遍历完成
  if (loaderContext.loaderIndex >= loaderContext.loaders.length) {
    // 遍历完成，开始处理资源
    return processResource(processOptions, loaderContext, pitchingCallback);
  }
  // 获取当前索引对应的 loader 对象
  let currentLoader = loaderContext.loaders[loaderContext.loaderIndex];
  // 判断当前 loader 是否已经执行过 pitch 方法
  if (currentLoader.pitchExecuted) {
    // 继续执行下一个 loader
    loaderContext.loaderIndex++;
    // 递归调用自身
    return iteratePitchingLoaders(processOptions, loaderContext, pitchingCallback);
  }
  // 获取 pitch 方法
  let fn = currentLoader.pitch;
  // 标记  pitch 方法已经执行
  currentLoader.pitchExecuted = true;
  // 如果 pitch 方法不存在，则继续执行下一个 loader
  if (!fn) {
    // 继续执行下一个 loader
    return iteratePitchingLoaders(processOptions, loaderContext, pitchingCallback);
  }
  // 执行 pitch 方法
  runSyncOrAsync(fn, loaderContext, [loaderContext.remainingRequest, loaderContext.previousRequest, loaderContext.data], (err, ...args) => {
    // 判断 pitch 方法有返回值，并且至少有一个参数存在
    if (args.length > 0 && args.some(item => item)) {
      // 继续执行下一个 loader
      loaderContext.loaderIndex--;
      // 递归执行下一个 normal loader
      return iterateNormalLoaders(processOptions, loaderContext, args, pitchingCallback);
    } else {
      // 执行下一个 pitch loader
      return iteratePitchingLoaders(processOptions, loaderContext, pitchingCallback);
    }
  });
}


// 执行 loader
function runSyncOrAsync(fn, loaderContext, args, runCallback) {
  // 标记函数是否是同步函数
  let isSync = true;
  // 创建 loader 的 callback 方法
  loaderContext.callback = (err, ...args) => {
    runCallback(err, ...args);
  };
  // 创建 loader 的 async 方法
  loaderContext.async = () => {
    // 标记为异步
    isSync = false;
    return loaderContext.callback;
  };
  // 执行 loader
  let result = fn.apply(loaderContext, args);
  // 如果是同步函数，则直接调用 callback
  if (isSync) {
    runCallback(null, result);
  }
}
/**

运行 Loader
@param {*} options
@param {*} finalCallback
*/
function runLoaders(options, finalCallback) {
  const {
    resource,
    loaders = [],
    context = {},
    readResource = fs.readFile.bind(fs)
  } = options;
  let loaderContext = context;
  let loaderObjects = loaders.map(createLoaderObject);
  // 定义 resource 属性
  Object.defineProperty(loaderContext, "resource", {
    get: function () {
      return loaderContext.resourcePath + (loaderContext.resourceQuery || '');
    },
    set: function (value) {
      var splittedResource = url.parse(value);
      loaderContext.resourcePath = decodeURIComponent(splittedResource.pathname);
      loaderContext.resourceQuery = splittedResource.query;
    }
  });
  loaderContext.resource = resource; // loader 的资源路径
  loaderContext.readResource = readResource; // 读取资源的函数
  loaderContext.loaders = loaderObjects; // loader 列表
  loaderContext.loaderIndex = 0; // 当前 loader 的索引
  loaderContext.callback = null; // 回调函数
  loaderContext.async = null; // 异步函数
  // 定义 request、remainingRequest、currentRequest、previousRequest 和 data 属性
  Object.defineProperty(loaderContext, 'request', {
    get() {
      return loaderContext.loaders.map(loader => loader.path).concat(resource).join('!');
    }
  });
  Object.defineProperty(loaderContext, 'remainingRequest', {
    get() {
      return loaderContext.loaders.slice(loaderContext.loaderIndex + 1).map(loader => loader.path).concat(resource).join('!');
    }
  });
  Object.defineProperty(loaderContext, 'currentRequest', {
    get() {
      return loaderContext.loaders.slice(loaderContext.loaderIndex).map(loader => loader.path).concat(resource).join('!');
    }
  });
  Object.defineProperty(loaderContext, 'previousRequest', {
    get() {
      return loaderContext.loaders.slice(0, loaderContext.loaderIndex).map(loader => loader.path).join('!');
    }
  });
  Object.defineProperty(loaderContext, 'data', {
    get() {
      return loaderContext.loaders[loaderContext.loaderIndex].data;
    }
  });
  // 定义 processOptions 对象
  let processOptions = {
    resourceBuffer: null, // 读取的资源文件
    readResource // 读取资源的方法
  };
  // 依次执行 pitching loader 和 normal loader
  iteratePitchingLoaders(processOptions, loaderContext, (err, result) => {
    finalCallback(err, {
      result,
      resourceBuffer: processOptions.resourceBuffer
    });
  });
}
exports.runLoaders = runLoaders;
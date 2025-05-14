// 导入Node.js内置的path模块，用于处理文件路径
const path = require("path");
// 导入Node.js内置的fs模块，用于操作文件系统
const fs = require("fs");
// 导入babel-types库，用于处理AST节点
const types = require("babel-types");
// 导入@babel/parser库，用于将源代码解析成抽象语法树（AST）
const parser = require("@babel/parser");
// 导入@babel/traverse库，用于遍历和操作AST
const traverse = require("@babel/traverse").default;
// 导入@babel/generator库，用于将修改过的AST重新生成源代码
const generator = require("@babel/generator").default;

// 定义toUnixSeq函数，将Windows风格的文件路径转换为Unix风格
function toUnixSeq(filePath) {
  // 使用正则表达式替换所有的反斜杠（\）为正斜杠（/）
  return filePath.replace(/\\/g, "/");
}
// 定义Complication类，用于处理编译过程
class Complication {
  // 构造函数，接收一个options参数
  constructor(options) {
    // 将传入的options对象赋值给实例的options属性
    this.options = options;
    // 设置实例的context属性为传入的options.context值，如果未传入，则使用当前工作目录的Unix风格路径
    this.options.context = this.options.context || toUnixSeq(process.cwd());
    // 初始化一个Set，用于存储文件依赖，避免重复添加
    this.fileDependencies = new Set();
    // 初始化一个数组，用于存储模块信息
    this.modules = [];
    // 初始化一个数组，用于存储代码块信息
    this.chunks = [];
    // 初始化一个空对象，用于存储输出文件的资源信息
    this.assets = {};
  }
  build(onCompiled) {
    //! 5.根据配置中的entry找出入口文件
    // 定义一个空对象，用于存储入口信息
    let entry = {};
    // 判断options.entry的类型
    if (typeof this.options.entry === "string") {
      // 如果是字符串类型，将其作为默认入口文件，将main作为键名
      entry.main = this.options.entry;
    } else {
      // 否则直接使用options.entry作为入口信息
      entry = this.options.entry;
    }
    // 遍历entry对象，处理每个入口文件
    for (let entryName in entry) {
      // 获取入口文件的完整路径
      let entryFilePath = path.posix.join(
        this.options.context,
        entry[entryName]
      );
      // 添加入口文件路径到文件依赖集合
      this.fileDependencies.add(entryFilePath);
      //! 6.从入口文件出发,调用所有配置的Loader对模块进行编译
      // 调用buildModule方法构建入口模块
      let entryModule = this.buildModule(entryName, entryFilePath);
      //! 8.根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk
      // 创建一个chunk对象，包含名称、入口模块和与该入口关联的模块
      let chunk = {
        name: entryName,
        entryModule,
        modules: this.modules.filter((module) =>
          module.names.includes(entryName)
        ),
      };
      // 将chunk对象添加到chunks数组
      this.chunks.push(chunk);
    }
    //! 9.再把每个 Chunk 转换成一个单独的文件加入到输出列表
    // 遍历chunks数组，为每个chunk生成输出文件
    this.chunks.forEach((chunk) => {
      // 替换输出文件名模板中的[name]为chunk名称
      let outputFilename = this.options.output.filename.replace(
        "[name]",
        chunk.name
      );
      // 调用getSourceCode方法获取chunk的源码，将其添加到assets对象
      this.assets[outputFilename] = getSourceCode(chunk);
    });
    // 调用onCompiled回调函数，传入构建结果
    onCompiled(
      null,
      {
        modules: this.modules,
        chunks: this.chunks,
        assets: this.assets,
      },
      this.fileDependencies
    );
  }
  buildModule(entryName, modulePath) {
    // 读取模块文件的原始源代码
    let rawSourceCode = fs.readFileSync(modulePath, "utf8");
    // 从options中获取模块规则
    let { rules } = this.options.module;
    // 定义一个空数组，用于存储模块加载器
    let loaders = [];
    // 遍历规则，根据匹配的规则将加载器添加到loaders数组中
    rules.forEach((rule) => {
      if (modulePath.match(rule.test)) {
        loaders.push(...rule.use);
      }
    });
    // 使用reduceRight逐个应用加载器，将原始源代码转换为处理后的源代码
    let transformedSourceCode = loaders.reduceRight(
      (sourceCode, loaderPath) => {
        const loaderFn = require(loaderPath);
        return loaderFn(sourceCode);
      },
      rawSourceCode
    );
    //! 7.再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理
    // 生成模块ID（相对路径）
    let moduleId = "./" + path.posix.relative(this.options.context, modulePath);
    // 创建模块对象
    let module = {
      id: moduleId,
      names: [entryName],
      dependencies: [],
    };
    // 将模块对象添加到模块数组中
    this.modules.push(module);
    // 使用@babel/parser解析处理后的源代码，生成AST（抽象语法树）
    let ast = parser.parse(transformedSourceCode, {
      sourceType: "module",
    });
    // 使用@babel/traverse遍历AST，处理require调用
    traverse(ast, {
      CallExpression: ({ node }) => {
        if (node.callee.name === "require") {
          // .代表当前的模块所有的目录，不是工作目录
          let depModuleName = node.arguments[0].value;
          // 获取当前的模块所在的目录
          let dirName = path.posix.dirname(modulePath);
          let depModulePath = path.posix.join(dirName, depModuleName);
          let { extensions } = this.options.resolve;
          // 尝试添加扩展名找到真正的模块路径
          depModulePath = tryExtensions(depModulePath, extensions);
          // 把依赖的模块路径添加到文件依赖列表
          this.fileDependencies.add(depModulePath);
          // 获取此模块的ID，也就是相对于根目录的相对路径
          let depModuleId =
            "./" + path.posix.relative(this.options.context, depModulePath);
          // 修改语法树，把引入模块路径改为模块的ID
          node.arguments[0] = types.stringLiteral(depModuleId);
          // 给当前模块添加依赖信息
          module.dependencies.push({
            depModuleId,
            depModulePath,
          });
        }
      },
    });
    // 使用@babel/generator将AST转换回源代码
    const { code } = generator(ast);
    // 将生成的源代码添加到模块对象中
    module._source = code;
    // 处理模块依赖
    this.processModule(module, entryName);
    return module;
  }
  processModule(module, entryName) {
    module.dependencies.forEach(({ depModuleId, depModulePath }) => {
      // 判断模块是否已经编译过了
      let existModule = this.modules.find((item) => item.id === depModuleId);
      if (existModule) {
        existModule.names.push(entryName);
        // 递归设置依赖模块的names
        this.processModule(existModule, entryName);
      } else {
        this.buildModule(entryName, depModulePath);
      }
    });
  }
}
// 定义tryExtensions函数，用于尝试不同的文件扩展名，找到对应的模块文件
function tryExtensions(modulePath, extensions) {
  // 如果原始路径的文件存在，则直接返回该路径
  if (fs.existsSync(modulePath)) {
    return modulePath;
  }
  // 遍历所有提供的扩展名
  for (let i = 0; i < extensions.length; i++) {
    // 生成一个新的文件路径，将扩展名添加到原始路径后
    let filePath = modulePath + extensions[i];
    // 如果新路径的文件存在，则返回该路径
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  // 如果尝试所有扩展名后都没有找到对应的文件，则抛出错误
  throw new Error(`模块${modulePath}未找到`);
}
function getSourceCode(chunk) {
  return `
  (() => {
    var modules = {
      ${chunk.modules
        .filter((module) => module.id !== chunk.entryModule.id)
        .map(
          (module) => `
            "${module.id}": module => {
              ${module._source}
              }
            `
        )}  
    };
    var cache = {};
    function require(moduleId) {
      var cachedModule = cache[moduleId];
      if (cachedModule !== undefined) {
        return cachedModule.exports;
      }
      var module = cache[moduleId] = {
        exports: {}
      };
      modules[moduleId](module, module.exports, require);
      return module.exports;
    }
    var exports = {};
    (() => {
      ${chunk.entryModule._source}
    })();
  })();
  `;
}
module.exports = Complication;
// 导入所需模块
const valueParser = require('postcss-value-parser');

const isUrlFunc = /url/i;
const needParseDeclaration = /(?:url)\(/i;

/**
 * 定义一个名为 parseDeclaration 的函数，用于解析给定的 PostCSS 声明节点
 * @param {object} declaration 当前处理的声明节点
 * @returns {array} 解析出的 URL 信息
 */
function parseDeclaration(declaration) {
  // 如果声明的值不包含需要解析的函数（例如 url()），则跳过解析
  if (!needParseDeclaration.test(declaration.value)) {
    return [];
  }
  // 使用 postcss-value-parser 解析声明的值，得到一个节点树。
  const parsed = valueParser(declaration.value);
  // 创建一个空数组 parsedURLs，用于存储解析出的 URL 信息
  const parsedURLs = [];
  // 使用 postcss-value-parser 的 walk 方法遍历节点树
  parsed.walk(valueNode => {
    // 如果当前节点不是函数类型，跳过此节点
    if (valueNode.type !== 'function') {
      return;
    }
    // 如果当前函数节点是 url() 函数，继续处理
    if (isUrlFunc.test(valueNode.value)) {
      // 从当前函数节点中提取子节点数组
      const { nodes } = valueNode;
      // 将子节点数组转换回字符串，得到 url 的值
      let url = valueParser.stringify(nodes);
      // 将解析出的 URL 信息作为对象添加到 parsedURLs 数组中
      parsedURLs.push({
        declaration,// 存储当前处理的声明节点
        // 获取 url() 函数内部的节点（例如 'image.png'）
        node: valueNode.nodes[0],
        url,// 存储解析出的 URL 字符串
        parsed// 存储解析后的节点树
      });
    }
  });
  return parsedURLs;
}

/**
 * 定义一个名为 plugin 的函数
 * @param {object} param 包含 imports、replacements 和 urlHandler 的对象作为参数
 * @returns {object} 返回一个包含 PostCSS 插件配置的对象
 */
const plugin = ({ imports = [], replacements = [], urlHandler }) => {
  // 返回一个包含 PostCSS 插件配置的对象。
  return {// 设置插件名称
    postcssPlugin: 'postcss-url-parser',
    prepare() {// 定义插件的 prepare 方法，用于创建一个新的 PostCSS 会话
      // 创建一个空数组 parsedDeclarations，用于存储解析过的声明
      const parsedDeclarations = [];
      // 返回一个对象，包含当前 PostCSS 会话的事件处理器
      return {// 定义一个处理声明节点的方法
        Declaration(declaration) {
          // 调用 parseDeclaration 函数解析当前声明节点，并获取解析后的 URL 信息
          const parsedURLs = parseDeclaration(declaration);
          // 将解析到的 URL 信息添加到 parsedDeclarations 数组中
          parsedDeclarations.push(...parsedURLs);
        },
        // 定义一个异步方法，用于处理 PostCSS 会话结束时的逻辑
        OnceExit() {
          // 如果没有解析到任何 URL 信息，直接返回
          if (parsedDeclarations.length === 0) {
            return;
          }
          // 将 getUrl.js 的导入信息添加到 imports 数组中
          imports.push({
            type: "get_url_import",// 设置导入类型
            importName: "cssLoaderGetUrlImport",// 设置导入的名称
            // 使用 urlHandler 处理 getUrl.js 的路径
            url: urlHandler(require.resolve("../runtime/getUrl.js")),
          });
          // 遍历解析过的声明
          for (let index = 0; index < parsedDeclarations.length; index++) {
            // 获取当前解析过的声明
            const item = parsedDeclarations[index];
            // 从当前解析过的声明中提取 URL 信息
            const { url, node } = item;
            const importName = `url_${index}`;
            // 将 URL 导入信息添加到 imports 数组中
            imports.push({
              type: 'url',// 设置导入类型
              importName,// 设置导入的名称
              url: JSON.stringify(url)// 将 URL 转换为 JSON 字符串
            });
            // 为当前 URL 生成一个替换名称
            const replacementName = `replacement_${index}`;
            // 将替换信息添加到 replacements 数组中
            replacements.push({
              replacementName,// 将生成的替换名称添加到当前替换信息对象中
              importName,// 设置当前替换信息的导入名称为
            });
            node.value = replacementName;
            item.declaration.value = item.parsed.toString();
          }
        }
      };
    }
  };
};
// 表示该插件是一个PostCSS插件
plugin.postcss = true;
// 导出插件
module.exports = plugin;
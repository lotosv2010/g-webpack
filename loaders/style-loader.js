// 引入 path 模块，用于处理文件路径
const path = require('path');
// 定义一个函数，用于将请求字符串转换为相对于 loaderContext.context 的路径
function stringifyRequest(loaderContext, request) {
  return JSON.stringify(loaderContext.utils.contextify(loaderContext.context, request));
}

/**
 * 定义一个空的 loaderAPI 函数
 */
function loaderAPI() { }

/**
 * 在 loaderAPI 上定义 pitch 方法，用于处理剩余请求
 * @param {*} remindingRequest 
 * @returns {string} 成的代码字符串
 */
loaderAPI.pitch = function (remindingRequest) {
  // 定义将要返回的代码字符串，用于将样式内容添加到 HTML 文档中
  const contentCode = `
    // 通过 require 导入样式内容
    const content = require("!!"+${stringifyRequest(this, `${remindingRequest}`)});
    // 创建一个 style 元素
    const element = document.createElement("style");
    // 将样式内容设置为 style 元素的 innerHTML
    element.innerHTML = (content.default || content).toString();
    // 将 style 元素添加到文档的 head 部分
    document.head.appendChild(element);
    module.exports = content;
  `;
  // 返回生成的代码字符串
  return contentCode;
};

// 导出 loaderAPI
module.exports = loaderAPI;
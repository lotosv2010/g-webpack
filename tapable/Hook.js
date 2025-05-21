/**
 * @file Hook.js
 * @description 钩子基类，所有钩子类型的父类，支持 tap 注册和动态编译执行。
 */

/**
 * 钩子基类
 */
class Hook {
  /**
   * 构造函数
   * @param {Array<string>} args 参数名数组
   */
  constructor(args) {
    if (!Array.isArray(args)) args = [];
    /**
     * 钩子的参数名列表
     * @type {Array<string>}
     */
    this.args = args;
    /**
     * 存储所有注册的 tap（钩子回调）
     * @type {Array<Object>}
     */
    this.taps = [];
    /**
     * call 方法，初始为代理函数
     * @type {Function}
     */
    this.call = CALL_DELEGATE;
  }

  /**
   * 注册同步钩子
   * @param {string|Object} options tap 名称或配置对象
   * @param {Function} fn 回调函数
   */
  tap(options, fn) {
    this._tap("sync", options, fn);
  }

  /**
   * 内部注册方法，支持不同类型（如 sync、async）
   * @param {string} type 类型
   * @param {string|Object} options tap 名称或配置对象
   * @param {Function} fn 回调函数
   */
  _tap(type, options, fn) {
    if (typeof options === 'string')
      options = { name: options };
    let tapInfo = { ...options, type, fn };
    this._insert(tapInfo);
  }

  /**
   * 重置编译，call 重新指向代理函数
   */
  _resetCompilation() {
    this.call = CALL_DELEGATE;
  }

  /**
   * 插入 tap，并重置编译
   * @param {Object} tapInfo
   */
  _insert(tapInfo) {
    this._resetCompilation();
    this.taps.push(tapInfo);
  }

  /**
   * 抽象方法，子类需重写
   * @param {Object} options
   */
  compile(options) {
    throw new Error("Abstract: should be overridden");
  }

  /**
   * 创建 call 方法，实际会调用 compile 生成最终执行函数
   * @param {string} type
   * @returns {Function}
   */
  _createCall(type) {
    return this.compile({
      taps: this.taps,
      args: this.args,
      type
    });
  }
}

/**
 * call 的初始代理函数，首次调用时会编译生成真正的 call 方法
 * @param  {...any} args
 * @returns {any}
 */
const CALL_DELEGATE = function (...args) {
  this.call = this._createCall("sync");
  return this.call(...args);
};

module.exports = Hook;
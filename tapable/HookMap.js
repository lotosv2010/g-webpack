/**
 * @file HookMap.js
 * @description 钩子映射类
 */

class HookMap {
  /**
   * 构造函数
   * @param {Function} factory - 钩子工厂函数
   */
  constructor(factory) {
    this._map = new Map();
    this._factory = factory;
  }

  /**
   * 获取或创建钩子
   * @param {*} key - 钩子的键
   * @returns {*} 钩子
   */
  for (key) {
    const hook = this.get(key);
    if (!hook) {
      const newHook = this._factory(key);
      this.set(key, newHook);
      return newHook;
    }
    return hook;
  }

  /**
   * 获取钩子
   * @param {*} key - 钩子的键
   * @returns {*} 钩子
   */
  get(key) {
    return this._map.get(key);
  }

  /**
   * 设置钩子
   * @param {*} key - 钩子的键
   * @param {*} value - 钩子
   */
  set(key, value) {
    this._map.set(key, value);
  }

  /**
   * 添加钩子
   * @param {*} key - 钩子的键
   * @param {*} options - 钩子的选项
   * @param {*} fn - 钩子的函数
   */
  tap(key, options, fn) {
    return this.for(key).tap(options, fn);
  }

  /**
   * 添加异步钩子
   * @param {*} key - 钩子的键
   * @param {*} options - 钩子的选项
   * @param {*} fn - 钩子的函数
   */
  tapAsync(key, options, fn) {
    return this.for(key).tapAsync(options, fn);
  }

  /**
   * 添加异步钩子
   * @param {*} key - 钩子的键
   * @param {*} options - 钩子的选项
   * @param {*} fn - 钩子的函数
   */
  tapPromise(key, options, fn) {
    return this.for(key).tapPromise(options, fn);
  }
}

module.exports = HookMap;
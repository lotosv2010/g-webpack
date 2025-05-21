/**
 * @file SyncHook.js
 * @description 定义同步钩子 SyncHook 及其工厂，支持注册和串行执行 tap 回调。
 */

const Hook = require('./Hook');
const HookCodeFactory = require('./HookCodeFactory');

/**
 * 同步钩子的代码工厂，继承自 HookCodeFactory
 * 负责生成串行执行所有 tap 的代码
 */
class SyncHookCodeFactory extends HookCodeFactory {
  /**
   * 生成串行执行所有 tap 的代码
   * @returns {string} 返回生成的代码字符串
   */
  content() {
    return this.callTapsSeries()
  }
}

// 创建 SyncHookCodeFactory 实例
let factory = new SyncHookCodeFactory();

/**
 * 同步钩子类，继承自 Hook
 * 支持注册和串行执行 tap 回调
 */
class SyncHook extends Hook {
  /**
   * 编译钩子，生成最终的调用函数
   * @param {Object} options 编译选项
   * @returns {Function} 返回生成的调用函数
   */
  compile(options) {
    factory.setup(this, options);
    return factory.create(options);
  }
}

module.exports = SyncHook;
/**
 * @file AsyncParallelHook.js
 * @description 定义异步并行钩子 AsyncParallelHook 及其工厂，支持注册和并行执行 tap 回调。
 */

const Hook = require('./Hook');
const HookCodeFactory = require('./HookCodeFactory');

/**
 * 异步并行钩子的代码工厂，继承自 HookCodeFactory
 * 负责生成并行执行所有 tap 的代码
 */
class AsyncParallelHookCodeFactory extends HookCodeFactory {
  /**
   * 生成并行执行所有 tap 的代码
   * @returns {string} 返回生成的代码字符串
   */
  content() {
    // 调用父类的 callTapsParallel 方法，生成并行调用的代码
    return this.callTapsParallel();
  }
}

// 创建 AsyncParallelHookCodeFactory 实例
let factory = new AsyncParallelHookCodeFactory();

/**
 * 异步并行钩子类，继承自 Hook
 * 支持注册和并行执行 tap 回调
 */
class AsyncParallelHook extends Hook {
  /**
   * 编译钩子，生成最终的调用函数
   * @param {Object} options 编译选项
   * @returns {Function} 返回生成的调用函数
   */
  compile(options) {
    // 设置工厂的上下文
    factory.setup(this, options);
    // 创建最终的钩子执行函数
    return factory.create(options);
  }
}

module.exports = AsyncParallelHook;
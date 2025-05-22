/**
 * 创建一个属性 context 
 * @param {object} obj 源对象
 * @param {string} prop 属性名
 * @param {function} factory 创建属性值的工厂函数
 */
const F = (obj, prop, factory) => {
  if(obj[prop] === undefined) {
    obj[prop] = factory();
  }
}

/**
 * 应用 webpack 配置项的基础默认值
 * @param {object} options webpack 配置项
 */
const applyWebpackOptionsBaseDefaults = (options) => {
  F(options, 'context', () => process.cwd());
}

/**
 * 应用webpack配置项的默认值
 * @param {object} options webpack 配置项
 */
const applyWebpackOptionsDefaults = (options) => {
  F(options, 'context', () => process.cwd());
}

exports.applyWebpackOptionsBaseDefaults = applyWebpackOptionsBaseDefaults;
exports.applyWebpackOptionsDefaults = applyWebpackOptionsDefaults;
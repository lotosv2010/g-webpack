/**
 * 获取经过 normalization 的静态资源
 * @param {object} entry 静态资源
 * @return {object} 返回经过 normalization 的静态资源
 */
const getNormalizedStatic = entry => {
  if (typeof entry === 'string') {
    return {
      main: {
        import: [entry]
      }
    }
  } else if (Array.isArray(entry)) {
    return {
      main: {
        import: entry
      }
    };
  }
  return entry;
}

/**
 * 获取经过 normalization 的 webpack 配置
 * @param {object} config webpack 配置
 * @return {object} 返回经过 normalization 的 webpack 配置
 */
const getNormalizedWebpackOptions = config => {
  return {
    ...config,
    entry: getNormalizedStatic(config.entry)
  }
}

exports.getNormalizedWebpackOptions = getNormalizedWebpackOptions;
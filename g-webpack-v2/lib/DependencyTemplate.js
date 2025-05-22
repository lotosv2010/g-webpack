class DependencyTemplate {
  apply(dependency, source, templateContext) {
    throw new Error('DependencyTemplate.apply() must be implemented'); // apply 方法必须由子类实现
  }
}

module.exports = DependencyTemplate;
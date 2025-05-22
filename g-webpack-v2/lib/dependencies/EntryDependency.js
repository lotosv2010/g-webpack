const ModuleDependency = require("./ModuleDependency");

/**
 * EntryDependency是ModuleDependency的子类，
 * EntryDependency是入口模块的依赖
 */
class EntryDependency extends ModuleDependency {
  constructor(request) {
    super(request);
  }
  get type() {
    return "entry";
  }
  get category() {
    return "esm";
  }
}

module.exports = EntryDependency;
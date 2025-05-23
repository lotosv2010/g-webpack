const ModuleDependency = require("./ModuleDependency");
//入口模块依赖
class EntryDependency extends ModuleDependency {
  constructor(request) {
    super(request);//./src/index.js
  }
  //类型为入口
  get type() {
    return "entry";
  }
}
module.exports = EntryDependency;
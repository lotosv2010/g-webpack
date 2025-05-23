const Dependency = require("../Dependency");
const DependencyTemplate = require("../DependencyTemplate");
/**
 * 所有模块依赖的父类
 */
class ModuleDependency extends Dependency {
	constructor(request) {
		super();
		this.request = request;
	}
}

ModuleDependency.Template = DependencyTemplate;
module.exports = ModuleDependency;
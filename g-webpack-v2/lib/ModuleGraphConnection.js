class ModuleGraphConnection {
	constructor(originModule, dependency, module) {
		this.originModule = originModule;
		this.dependency = dependency;
		this.module = module;
	}
}
module.exports = ModuleGraphConnection;
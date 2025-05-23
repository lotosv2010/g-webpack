const DependenciesBlock = require("./DependenciesBlock");
class Module extends DependenciesBlock {
	constructor(type) {
		super();
		this.type = type;
		this.presentationalDependencies = [];
	}
	addPresentationalDependency(presentationalDependency) {
		this.presentationalDependencies.push(presentationalDependency);
	}
}

module.exports = Module;
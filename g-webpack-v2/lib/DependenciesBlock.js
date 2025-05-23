class DependenciesBlock {
	constructor() {
		this.dependencies = [];
	}
	addDependency(dependency) {
		this.dependencies.push(dependency);
	}
}
module.exports = DependenciesBlock;
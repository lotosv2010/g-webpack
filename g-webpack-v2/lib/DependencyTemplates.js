class DependencyTemplates {
	constructor(hashFunction = "md4") {
		this._map = new Map();
		this._hashFunction = hashFunction;
	}
	get(dependency) {
		return this._map.get(dependency);
	}
	set(dependency, dependencyTemplate) {
		this._map.set(dependency, dependencyTemplate);
	}
}
module.exports = DependencyTemplates;
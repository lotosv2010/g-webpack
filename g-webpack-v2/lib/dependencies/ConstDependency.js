const NullDependency = require("./NullDependency");
class ConstDependency extends NullDependency {
	constructor(expression, range) {
		super();
		this.expression = expression;
		this.range = range;
	}
}

ConstDependency.Template = class ConstDependencyTemplate extends NullDependency.Template {
	apply(dependency, source) {
		const dep = dependency;
		source.replace(dep.range[0], dep.range[1] - 1, dep.expression);
	}
};
module.exports = ConstDependency;
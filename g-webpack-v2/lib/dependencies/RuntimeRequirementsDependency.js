const NullDependency = require("./NullDependency");
class RuntimeRequirementsDependency extends NullDependency {
	constructor(runtimeRequirements) {
		super();
		this.runtimeRequirements = new Set(runtimeRequirements);
	}
}
RuntimeRequirementsDependency.Template = class RuntimeRequirementsDependencyTemplate extends NullDependency.Template {
	apply(dependency, source, { runtimeRequirements }) {
		const dep = dependency;
		for (const req of dep.runtimeRequirements) {
			runtimeRequirements.add(req);
		}
	}
};
module.exports = RuntimeRequirementsDependency;
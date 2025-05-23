const Dependency = require("../Dependency");
const DependencyTemplate = require("../DependencyTemplate");
class NullDependency extends Dependency {
}
NullDependency.Template = class NullDependencyTemplate extends DependencyTemplate {
	apply(dependency, source, templateContext) { }
};
module.exports = NullDependency;
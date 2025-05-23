const NullDependency = require("./NullDependency");
class HarmonyExportHeaderDependency extends NullDependency {
	constructor(range, rangeStatement) {
		super();
		this.range = range;
		this.rangeStatement = rangeStatement;
	}
	get type() {
		return "harmony export header";
	}
}
HarmonyExportHeaderDependency.Template = class HarmonyExportDependencyTemplate extends NullDependency.Template {
	apply(dependency, source) {
		const dep = dependency;
		const content = "";
		const replaceUntil = dep.range
			? dep.range[0] - 1
			: dep.rangeStatement[1] - 1;
		source.replace(dep.rangeStatement[0], replaceUntil, content);
	}
};
module.exports = HarmonyExportHeaderDependency;
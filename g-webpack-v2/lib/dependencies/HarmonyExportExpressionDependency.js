const NullDependency = require("./NullDependency");
const HarmonyExportInitFragment = require("./HarmonyExportInitFragment");
class HarmonyExportExpressionDependency extends NullDependency {
	constructor(range, rangeStatement) {
		super();
		this.range = range;
		this.rangeStatement = rangeStatement;
	}
	get type() {
		return "harmony export expression";
	}

}
HarmonyExportExpressionDependency.Template = class HarmonyExportDependencyTemplate extends NullDependency.Template {
	apply(dependency, source, { initFragments }) {
		const dep = dependency;
		const name = "webpackDefaultExport";
		const exportsName = '__webpack_exports__';
		//const webpackDefaultExport = 
		let content = `const ${name} = `;

		const map = new Map();
		map.set('default', name);//default => webpackDefaultExport
		initFragments.push(new HarmonyExportInitFragment(exportsName, map));
		source.replace(
			dep.rangeStatement[0],
			dep.range[0] - 1,
			content + "("
		);
		source.replace(dep.range[1], dep.rangeStatement[1], ");");
	}
};
module.exports = HarmonyExportExpressionDependency;
const NullDependency = require("./NullDependency");
const InitFragment = require("../InitFragment");
class HarmonyCompatibilityDependency extends NullDependency {
	get type() {
		return "harmony export header";
	}
}
HarmonyCompatibilityDependency.Template = class HarmonyExportDependencyTemplate extends NullDependency.Template {
	apply(dependency, source, { module, runtimeTemplate, initFragments }) {
		const content = 'webpackRequire.r(__webpack_exports__);\n';
		initFragments.push(new InitFragment(content, ""));
	}
};
module.exports = HarmonyCompatibilityDependency;
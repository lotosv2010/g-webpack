const HarmonyImportDependency = require("./HarmonyImportDependency");
class HarmonyImportSideEffectDependency extends HarmonyImportDependency {
	get type() {
		return "harmony side effect evaluation";
	}

}
HarmonyImportSideEffectDependency.Template = class HarmonyImportSideEffectDependencyTemplate
 extends HarmonyImportDependency.Template {
	apply(dependency, source, templateContext) {
		super.apply(dependency, source, templateContext);
	}
};
module.exports = HarmonyImportSideEffectDependency;
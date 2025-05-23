const ModuleDependency = require("./ModuleDependency");
const InitFragment = require("../InitFragment");
class HarmonyImportDependency extends ModuleDependency {
	get category() {
		return "esm";
	}
	getImportStatement() {
		const importVar = this.getImportVar();
		return [
			`var ${importVar} = webpackRequire("./src/title.js");\n`
			, ""];
	}
	getImportVar() {
		return '_title__WEBPACK_IMPORTED_MODULE_0__';
	}
}

HarmonyImportDependency.Template = class HarmonyImportDependencyTemplate extends ModuleDependency.Template {
	apply(dependency, source, templateContext) {
		const dep = dependency;
		const importStatement = dep.getImportStatement(false, templateContext);
		templateContext.initFragments.push(
			new InitFragment(
				importStatement[0] + importStatement[1],
				''
			)
		);
	}
};
module.exports = HarmonyImportDependency;
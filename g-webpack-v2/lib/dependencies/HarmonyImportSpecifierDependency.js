const HarmonyImportDependency = require("./HarmonyImportDependency");
class HarmonyImportSpecifierDependency extends HarmonyImportDependency {
	constructor(request, range) {
		super(request);
		this.range = range;
	}
	get type() {
		return "harmony import specifier";
	}
}
HarmonyImportSpecifierDependency.Template = class HarmonyImportSpecifierDependencyTemplate extends HarmonyImportDependency.Template {
	apply(dependency, source, templateContext) {
		const dep = dependency;
		const { moduleGraph } = templateContext;
		const exportExpr = this._getCodeForIds(dep);
		const range = dep.range;
		source.replace(range[0], range[1] - 1, exportExpr);
	}
	_getCodeForIds(dep, source, templateContext, ids) {
		return '_title__WEBPACK_IMPORTED_MODULE_0__["default"]';
	}
};
module.exports = HarmonyImportSpecifierDependency;
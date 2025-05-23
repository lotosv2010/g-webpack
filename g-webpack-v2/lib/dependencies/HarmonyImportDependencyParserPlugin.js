
const ConstDependency = require("./ConstDependency");
const harmonySpecifierTag = Symbol("harmony import");
const HarmonyImportSideEffectDependency = require("./HarmonyImportSideEffectDependency");
const HarmonyImportSpecifierDependency = require("./HarmonyImportSpecifierDependency");
class HarmonyImportDependencyParserPlugin {
	apply(parser) {
		parser.hooks.import.tap("HarmonyImportDependencyParserPlugin", (statement, source) => {
			const clearDep = new ConstDependency("", statement.range);
			parser.state.module.addPresentationalDependency(clearDep);
			const sideEffectDep = new HarmonyImportSideEffectDependency(source);
			parser.state.module.addDependency(sideEffectDep);
		});
		parser.hooks.importSpecifier.tap(
			"HarmonyImportDependencyParserPlugin",
			(statement, source, id, name) => {
				const ids = id === null ? [] : [id];
				parser.tagVariable(name, harmonySpecifierTag, {
					name,
					source,
					ids
				});
				return true;
			}
		);
		parser.hooks.expression
			.for(harmonySpecifierTag)
			.tap("HarmonyImportDependencyParserPlugin", expr => {
				const settings = parser.currentTagData;
				const dep = new HarmonyImportSpecifierDependency(settings.source, expr.range);
				parser.state.module.addPresentationalDependency(dep);
				return true;
			});
	}
}
module.exports = HarmonyImportDependencyParserPlugin
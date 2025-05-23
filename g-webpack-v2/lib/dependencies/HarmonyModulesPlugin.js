const HarmonyCompatibilityDependency = require("./HarmonyCompatibilityDependency");
const HarmonyExportExpressionDependency = require("./HarmonyExportExpressionDependency");
const HarmonyExportHeaderDependency = require("./HarmonyExportHeaderDependency");
const HarmonyImportSideEffectDependency = require("./HarmonyImportSideEffectDependency");
const HarmonyImportSpecifierDependency = require("./HarmonyImportSpecifierDependency");
const HarmonyDetectionParserPlugin = require("./HarmonyDetectionParserPlugin");
const HarmonyExportDependencyParserPlugin = require("./HarmonyExportDependencyParserPlugin");
const HarmonyImportDependencyParserPlugin = require("./HarmonyImportDependencyParserPlugin");
class HarmonyModulesPlugin {
	constructor(options) {
		this.options = options;
	}
	apply(compiler) {
		compiler.hooks.compilation.tap("HarmonyModulesPlugin", (compilation, {
			normalModuleFactory
		}) => {
			compilation.dependencyTemplates.set(HarmonyCompatibilityDependency, new HarmonyCompatibilityDependency.Template());
			compilation.dependencyFactories.set(HarmonyImportSideEffectDependency, normalModuleFactory);
			compilation.dependencyTemplates.set(HarmonyImportSideEffectDependency, new HarmonyImportSideEffectDependency.Template());
			compilation.dependencyFactories.set(HarmonyImportSpecifierDependency, normalModuleFactory);
			compilation.dependencyTemplates.set(HarmonyImportSpecifierDependency, new HarmonyImportSpecifierDependency.Template());
			compilation.dependencyTemplates.set(HarmonyExportHeaderDependency, new HarmonyExportHeaderDependency.Template());
			compilation.dependencyTemplates.set(HarmonyExportExpressionDependency, new HarmonyExportExpressionDependency.Template());
			const handler = (parser) => {
				//判断当前模块是不是es module 如果是的话require.r
				new HarmonyDetectionParserPlugin().apply(parser);
				//检测import语句
				new HarmonyImportDependencyParserPlugin().apply(parser);
				//检测export语句
				new HarmonyExportDependencyParserPlugin().apply(parser);
			};
			normalModuleFactory.hooks.parser.for("javascript/auto").tap("HarmonyModulesPlugin", handler);
		});
	}
}
module.exports = HarmonyModulesPlugin;

const HarmonyExportHeaderDependency = require("./HarmonyExportHeaderDependency");
const HarmonyExportExpressionDependency = require("./HarmonyExportExpressionDependency");

class HarmonyExportDependencyParserPlugin {
	apply(parser) {
		parser.hooks.export.tap("HarmonyExportDependencyParserPlugin", statement => {
			const dep = new HarmonyExportHeaderDependency(statement.declaration.range, statement.range);
			parser.state.module.addPresentationalDependency(dep);
			return true;
		});
		parser.hooks.exportExpression.tap(
			"HarmonyExportDependencyParserPlugin",
			(statement, expr) => {
				const dep = new HarmonyExportExpressionDependency(expr.range, statement.range)
				parser.state.module.addPresentationalDependency(dep);
			})

	}
};
module.exports = HarmonyExportDependencyParserPlugin;
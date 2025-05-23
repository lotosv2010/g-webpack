const HarmonyCompatibilityDependency = require("./HarmonyCompatibilityDependency");
module.exports = class HarmonyDetectionParserPlugin {
	constructor(options) {
		const {
			topLevelAwait = false
		} = options || {};
		this.topLevelAwait = topLevelAwait;
	}
	apply(parser) {
		parser.hooks.program.tap("HarmonyDetectionParserPlugin", ast => {
			const isHarmony = ast.body.some(statement => statement.type === "ImportDeclaration" 
			|| statement.type === "ExportDefaultDeclaration" || 
			statement.type === "ExportNamedDeclaration" || 
			statement.type === "ExportAllDeclaration");
			if (isHarmony) {
				const module = parser.state.module;
				const compatDep = new HarmonyCompatibilityDependency();
				module.addPresentationalDependency(compatDep);
			}
		});
	}
};
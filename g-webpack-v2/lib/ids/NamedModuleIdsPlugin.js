class NamedModuleIdsPlugin {
	constructor(options) {
		this.options = options || {};
	}
	apply(compiler) {
		compiler.hooks.compilation.tap("NamedModuleIdsPlugin", compilation => {
			compilation.hooks.moduleIds.tap("NamedModuleIdsPlugin", () => {
				const context = this.options.context
					? this.options.context
					: compiler.context;
				const chunkGraph = compilation.chunkGraph;
				for (const chunk of compilation.chunks) {
					for (const m of chunkGraph.getChunkModulesIterable(chunk)) {
						chunkGraph.setModuleId(m, m.libIdent({ context }));
					}
				}
			});
		});
	}
}
module.exports = NamedModuleIdsPlugin;
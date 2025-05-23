const { ConcatSource, PrefixSource } = require("webpack-sources");
class Template {
	static asString(str) {
		if (Array.isArray(str)) {
			return str.join("\n");
		}
		return str;
	}
	static renderChunkModules(renderContext, modules, renderModule) {
		const { chunkGraph } = renderContext;
		var source = new ConcatSource();
		const allModules = modules.map(module => {
			return {
				id: chunkGraph.getModuleId(module),
				source: renderModule(module)
			};
		});
		source.add("{\n");
		for (let i = 0; i < allModules.length; i++) {
			const module = allModules[i];
			if (i !== 0) {
				source.add(",\n");
			}
			source.add(`\n ${JSON.stringify(module.id)}:\n`);
			source.add(module.source);
		}
		source.add(`\n\n}`);
		return source;
	}
	static indent(s) {
		if (Array.isArray(s)) {
			return s.map(Template.indent).join("\n");
		} else {
			const str = s.trimEnd();
			if (!str) return "";
			const ind = str[0] === "\n" ? "" : "\t";
			return ind + str.replace(/\n([^\n])/g, "\n\t$1");
		}
	}
	static renderRuntimeModules(runtimeModules, renderContext) {
		const source = new ConcatSource();
		for (const module of runtimeModules) {
			const { codeGenerationResults } = renderContext;
			const runtimeSource = codeGenerationResults.get(module);
			if (runtimeSource) {
				source.add("(() => {\n");
				source.add(runtimeSource);
				source.add("\n})();\n\n");
			}
		}
		return source;
	}
}
module.exports = Template;
const { ConcatSource, RawSource } = require("webpack-sources");
const JavascriptGenerator = require("./JavascriptGenerator");
const JavascriptParser = require("./JavascriptParser");
const Template = require("../Template");
const NormalModule = require("../NormalModule");
class JavascriptModulesPlugin {
	apply(compiler) {
		compiler.hooks.compilation.tap("JavascriptModulesPlugin", (compilation, { normalModuleFactory }) => {
			compilation.hooks.renderManifest.tap("JavascriptModulesPlugin", (result, options) => {
				const render = () => this.renderMain(options, compilation);
				return { render };
			});//在webpack打包的时候可能会遇到很多类型的文件javascript/auto、javascript/esm、、javascript/dynamic
			normalModuleFactory.hooks.createParser.for("javascript/auto").tap("JavascriptModulesPlugin", options => {
				return new JavascriptParser("auto");
			});
			normalModuleFactory.hooks.createGenerator.for("javascript/auto").tap("JavascriptModulesPlugin", () => {
				return new JavascriptGenerator();
			});
		});
	}
	renderBootstrap({ chunk, chunkGraph }) {
		const result = { header: [] };
		let { header } = result;
		header.push("// The module cache");
		header.push("var __webpack_module_cache__ = {};");
		header.push("");
		header.push("// The require function");
		header.push(`function webpackRequire(moduleId) {`);
		header.push(Template.indent(this.renderRequire()));
		header.push("}");
		header.push("");
		return result;
	}
	renderRequire() {
		return `
		var cachedModule = __webpack_module_cache__[moduleId];
		if (cachedModule !== undefined) {
			return cachedModule.exports;
		}
		var module = __webpack_module_cache__[moduleId] = { exports: {} };
		__webpack_modules__[moduleId](module, module.exports, webpackRequire);
		return module.exports
		`
	}
	renderMain(renderContext, compilation) {
		const { chunk, chunkGraph } = renderContext;
		const source = new ConcatSource();
		source.add("(() => { \n");
		const bootstrap = this.renderBootstrap(renderContext);//入口模块会成为行内模块，会直接执行
		const allModules = [...compilation.modules].filter(module => module instanceof NormalModule);
		let inlinedModules = new Set(chunkGraph.getChunkEntryModulesIterable(chunk));
		const chunkModules = Template.renderChunkModules(
			renderContext,
			allModules.filter(m => !inlinedModules.has(m)),
			module => this.renderModule(module, renderContext,
				true));
		source.add("var __webpack_modules__ = (");
		source.add(chunkModules);
		source.add(");\n");
		if (bootstrap.header.length > 0) {
			const header = Template.asString(bootstrap.header) + "\n";
			source.add(new RawSource(header))
		}
		const runtimeModules = chunkGraph.getChunkRuntimeModulesInOrder(chunk);
		if (runtimeModules.length > 0) {
			source.add(Template.renderRuntimeModules(runtimeModules, renderContext));
		}
		source.add(`
				(() => {
				webpackRequire.d = (exports, definition) => {
					for (var key in definition) {
						if (webpackRequire.o(definition, key) && !webpackRequire.o(exports, key)) {
							Object.defineProperty(exports, key, {
								enumerable: true,
								get: definition[key]
							});
						}
					}
				};
			})();
			(() => {
				webpackRequire.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
			})();
			(() => {
				webpackRequire.r = exports => {
					if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
						Object.defineProperty(exports, Symbol.toStringTag, {
							value: 'Module'
						});
					}
					Object.defineProperty(exports, 'esmodule', {
						value: true
					});
				};
			})();
		`);
		const startupSource = new ConcatSource();
		startupSource.add(`var __webpack_exports__ = {};\n`);
		for (const m of inlinedModules) {
			const renderedModule = this.renderModule(m, renderContext, false);
			startupSource.add("(() => {\n");
			startupSource.add(renderedModule);
			let footer = "\n})();\n\n";
			startupSource.add(footer);
		}
		source.add(startupSource);
		source.add("})()\n");
		return new ConcatSource(source, ";")
	}
	renderModule(module, renderContext, factory) {
		const { codeGenerationResults } = renderContext;
		const moduleSource = codeGenerationResults.get(module);
		if (factory) {
			const factorySource = new ConcatSource();
			const args = ['module', '__webpack_exports__', 'webpackRequire'];
			factorySource.add(" ((" + args.join(", ") + ") => {\n\n");
			factorySource.add(moduleSource);
			factorySource.add("\n\n })");
			return factorySource;
		} else {
			return moduleSource;
		}
	}
}
module.exports = JavascriptModulesPlugin;
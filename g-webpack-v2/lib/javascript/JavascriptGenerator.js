const Generator = require("../Generator");
const { ReplaceSource } = require("webpack-sources");
const InitFragment = require("../InitFragment");
class JavascriptGenerator extends Generator {
	generate(module, generateContext) {
		const originalSource = module.originalSource();
		const source = new ReplaceSource(originalSource); // 创建一个 ReplaceSource 对象
		const initFragments = []; // 创建一个名为 initFragments 的数组
		this.sourceModule(module, initFragments, source, generateContext); // 生成模块的源码
		return InitFragment.addToSource(source, initFragments, generateContext);;
	}
	sourceDependency(module, dependency, initFragments, source, generateContext) {
		const { dependencyTemplates } = generateContext;
		const template = dependencyTemplates.get(dependency.constructor);
		template.apply(dependency, source, {
			module,
			initFragments
		});
	}
	sourceModule(module, initFragments, source, generateContext) {
		for (const dependency of module.dependencies) {
			this.sourceDependency(
				module,
				dependency,
				initFragments,
				source,
				generateContext
			);
		}

		if (module.presentationalDependencies !== undefined) {
			for (const dependency of module.presentationalDependencies) {
				this.sourceDependency(
					module,
					dependency,
					initFragments,
					source,
					generateContext
				);
			}
		}
	}
}
module.exports = JavascriptGenerator;
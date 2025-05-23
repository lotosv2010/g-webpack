const { SyncHook, SyncBailHook, AsyncParallelHook, AsyncSeriesHook } = require("tapable");
const NormalModuleFactory = require("./NormalModuleFactory");
const Compilation = require('./Compilation');
const ResolverFactory = require("./ResolverFactory");
const { mkdirp, join } = require("./util/fs");
class Compiler {
	constructor(context, options) {
		this.context = context;
		this.options = options;
		this.resolverFactory = new ResolverFactory();
		this.hooks = {
			environment: new SyncHook(),
			afterEnvironment: new SyncHook(),
			initialize: new SyncHook(),
			entryOption: new SyncBailHook(["context", "entry"]),
			afterPlugins: new SyncHook(["compiler"]),
			afterResolvers: new SyncHook(["compiler"]),
			thisCompilation: new SyncHook(["compilation", "params"]),
			compilation: new SyncHook(["compilation", "params"]),
			normalModuleFactory: new SyncHook(["normalModuleFactory"]),
			beforeRun: new AsyncSeriesHook(["compiler"]),
			run: new AsyncSeriesHook(["compiler"]),
			beforeCompile: new AsyncSeriesHook(["params"]),
			compile: new SyncHook(["params"]),
			make: new AsyncParallelHook(["compilation"]),
			finishMake: new AsyncSeriesHook(["compilation"]),
			afterCompile: new AsyncSeriesHook(["compilation"]),
			emit: new AsyncSeriesHook(["compilation"])
		}
		this.outputPath = "";
	}
	run(callback) {
		const finalCallback = (err, stats) => {
			callback(err, stats)
		}
		const onCompiled = (err, compilation) => {
			this.emitAssets(compilation, err => {
				let stats = {
					modules: compilation.modules,
				}
				finalCallback(err, stats)
			})
		}
		//在运行编译器之前触发的钩子
		this.hooks.beforeRun.callAsync(this, err => {
			//在运行编译器时触发的钩子
			this.hooks.run.callAsync(this, err => {
				this.compile(onCompiled);
			});
		});
	}
	emitAssets(compilation, callback) {
		const emitFiles = err => {
			const assets = compilation.getAssets();
			compilation.assets = { ...compilation.assets };
			const allTargetPaths = new Set();
			let inProgress = 0;
			assets.forEach(asset => {
				inProgress++;
				let { name: file, source } = asset;
				const getContent = () => {
					if (typeof source.buffer === "function") {
						return source.buffer();
					} else {
						const bufferOrString = source.source();
						if (Buffer.isBuffer(bufferOrString)) {
							return bufferOrString;
						} else {
							return Buffer.from(bufferOrString, "utf8");
						}
					}
				};
				let targetFile = file;
				const targetPath = join(this.outputFileSystem, this.outputPath, targetFile);
				allTargetPaths.add(targetPath);
				const content = getContent();
				this.outputFileSystem.writeFile(targetPath, content, err => {
					if (--inProgress === 0) {
						callback(err)
					}
				})
			});
		}
		this.hooks.emit.callAsync(compilation, err => {
			mkdirp(this.outputFileSystem, this.outputPath, emitFiles);
		});
	}
	compile(callback) {
		//先获取编译对象的参数params = {normalModuleFactory}
		const params = this.newCompilationParams();
		//在编译之前触发的钩子
		this.hooks.beforeCompile.callAsync(params, err => {
			//在编译开始时触发的钩子
			this.hooks.compile.call(params);
			const compilation = this.newCompilation(params);
			//在创建模块及代码块之前触发的钩子
			//这是一个非常重要的钩子，代表真正的开始构建
			this.hooks.make.callAsync(compilation, err => {
				this.hooks.finishMake.callAsync(compilation, err => {
					compilation.finish(err => {
						compilation.seal(err => {
							this.hooks.afterCompile.callAsync(compilation, err => {
								return callback(null, compilation);
							});
						});
					});
				});
			});
		});
	}
	newCompilation(params) {
		const compilation = this.createCompilation(params);
		//在当前编译之前触发的钩子
		this.hooks.thisCompilation.call(compilation, params);
		//在新编译实例创建后触发的钩子
		this.hooks.compilation.call(compilation, params);
		return compilation;
	}
	createCompilation(params) {
		return new Compilation(this, params);
	}
	newCompilationParams() {
		const params = {
			normalModuleFactory: this.createNormalModuleFactory()
		};
		return params;
	}
	createNormalModuleFactory() {
		//创建一个普通模块工厂
		const normalModuleFactory = new NormalModuleFactory({
			context: this.options.context,
			resolverFactory: this.resolverFactory
		});
		///当你创建好了一个新的模块工厂实例的时候触发一个normalModuleFactory钩子
		this.hooks.normalModuleFactory.call(normalModuleFactory);
		return normalModuleFactory;
	}
}
module.exports = Compiler;
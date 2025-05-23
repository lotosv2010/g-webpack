const { SyncHook, SyncWaterfallHook, AsyncSeriesHook, AsyncSeriesBailHook, HookMap, SyncBailHook } = require('tapable');
const ModuleGraph = require("./ModuleGraph");
const ChunkGraph = require("./ChunkGraph");
const DependencyTemplates = require("./DependencyTemplates");
const Entrypoint = require("./Entrypoint");
const Chunk = require("./Chunk");
const buildChunkGraph = require("./buildChunkGraph");
const CodeGenerationResults = require("./CodeGenerationResults");
const { connectChunkGroupAndChunk } = require("./GraphHelpers");
class Compilation {
	constructor(compiler, params) {
		this.dependencyFactories = new Map();
		this.entries = new Map();
		this.modules = new Set();
		this._modules = new Map();
		this.builtModules = new Set();
		this.assets = {};
		this.compiler = compiler;
		this.resolverFactory = compiler.resolverFactory;
		this.inputFileSystem = compiler.inputFileSystem;
		this.moduleGraph = new ModuleGraph();
		this.dependencyTemplates = new DependencyTemplates();
		this.hooks = {
			buildModule: new SyncHook(["module"]),
			seal: new SyncHook([]),
			addEntry: new SyncHook(["entry", "options"]),
			succeedEntry: new SyncHook(["entry", "options", "module"]),
			succeedModule: new SyncHook(["module"]),
			renderManifest: new SyncWaterfallHook(["result", "options"]),
			optimize: new SyncHook([]),
			afterChunks: new SyncHook(["chunks"]),
			optimizeTree: new AsyncSeriesHook(["chunks", "modules"]),
			optimizeChunkModules: new AsyncSeriesBailHook(["chunks", "modules"]),
			afterOptimizeTree: new SyncHook(["chunks", "modules"]),
			afterOptimizeChunkModules: new SyncHook(["chunks", "modules"]),
			moduleIds: new SyncHook(["modules"]),
			chunkIds: new SyncHook(["chunks"]),
			beforeCodeGeneration: new SyncHook([]),
			afterSeal: new AsyncSeriesHook([]),
			assetPath: new SyncWaterfallHook(["path", "options", "assetInfo"]),
			runtimeModule: new SyncHook(["module", "chunk"]),
			runtimeRequirementInTree: new HookMap(
				() => new SyncBailHook(["chunk", "runtimeRequirements", "context"])
			),
		};
		this.chunks = new Set();
		this.chunkGroups = [];
		this.namedChunks = new Map();
	}
	addRuntimeModule(chunk, module, chunkGraph = this.chunkGraph) {
		this.modules.add(module);
		this._modules.set(module.identifier(), module);
		chunkGraph.connectChunkAndModule(chunk, module);
		chunkGraph.connectChunkAndRuntimeModule(chunk, module);
		chunkGraph.addModuleRuntimeRequirements(
			module,
			'main'
		);
		this.hooks.runtimeModule.call(module, chunk);
	}
	getAssets() {
		const array = [];
		for (const assetName of Object.keys(this.assets)) {
			array.push({
				name: assetName,
				source: this.assets[assetName]
			});
		}
		return array;
	}
	addEntry(context, entry, options, callback) {
		this._addEntryItem(context, entry, "dependencies", options, callback);
	}
	_addEntryItem(context, entry, target, options, callback) {
		const {
			name
		} = options;
		let entryData = {
			dependencies: [],
			options
		};
		entryData[target].push(entry);
		this.entries.set(name, entryData);
		this.hooks.addEntry.call(entry, options);
		this.addModuleTree({
			context,
			dependency: entry
		}, (err, module) => {
			this.hooks.succeedEntry.call(entry, options, module);
			return callback(err, module);
		});
	}
	addModuleTree({
		context,
		dependency
	}, callback) {
		const Dep = dependency.constructor;
		const moduleFactory = this.dependencyFactories.get(Dep);
		this.handleModuleCreation({
			factory: moduleFactory,
			dependencies: [dependency],
			context
		}, (err, result) => {
			callback(err, result);
		});
	}
	handleModuleCreation({
		factory,
		dependencies,
		context,
		originModule,
		recursive = true,
		connectOrigin = recursive
	}, callback) {
		const moduleGraph = this.moduleGraph;
		this._factorizeModule({
			factory,
			dependencies,
			originModule,
			context
		}, (err, factoryResult) => {
			const newModule = factoryResult.module;
			this._addModule(newModule, (err, module) => {
				for (let i = 0; i < dependencies.length; i++) {
					const dependency = dependencies[i];
					moduleGraph.setResolvedModule(connectOrigin ? originModule : null, dependency, module);
					this._handleModuleBuildAndDependencies(originModule, module, recursive, callback);
				}
			});
		});
	}
	_handleModuleBuildAndDependencies(originModule, module, recursive, callback) {
		this.buildModule(module, err => {
			this.processModuleDependencies(module, err => {
				callback(err, module);
			});
		});
	}
	buildModule(module, callback) {
		this.hooks.buildModule.call(module);
		this.builtModules.add(module);
		module.build(this.options, this, this.resolverFactory.get("normal"), this.inputFileSystem, err => {
			this.hooks.succeedModule.call(module);
			return callback(err);
		});
	}
	processModuleDependencies(module, callback) {
		let inProgress = 0;
		const dependencies = module.dependencies;
		if (dependencies.length > 0) {
			for (const dep of dependencies) {
				const constructor = dep.constructor;
				const factory = this.dependencyFactories.get(constructor);
				inProgress++;
				this.handleModuleCreation({
					factory,
					dependencies: [dep],
					context: module.context,
					originModule: module
				}, (err, result) => {
					if (--inProgress === 0) {
						callback(err, module);
					}
				});
			}
		} else {
			callback(null, module);
		}
	}
	_addModule(module, callback) {
		const identifier = module.identifier();
		this._modules.set(identifier, module);
		this.modules.add(module);
		callback(null, module);
	}
	_factorizeModule({
		factory,
		dependencies,
		originModule,
		context
	}, callback) {
		factory.create({
			context: context ? context : originModule ? originModule.context : this.compiler.context,
			dependencies
		}, (err, result) => {
			callback(err, result);
		});
	}
	finish(callback) {
		return callback();
	}
	seal(callback) {
		const chunkGraph = new ChunkGraph(this.moduleGraph);
		this.chunkGraph = chunkGraph;
		const chunkGraphInit = new Map();//初始化的chunk依赖图 代码块和它的入口模块之间的关系
		for (const [name, {
			dependencies,
			options
		}] of this.entries) {
			const chunk = this.addChunk(name);
			const entrypoint = new Entrypoint(options);
			entrypoint.setRuntimeChunk(chunk);//因为现在我们没把运行时代码提取成单独的chunk
			entrypoint.setEntrypointChunk(chunk);//设置入点的chunk的main
			connectChunkGroupAndChunk(entrypoint, chunk);
			const entryModules = new Set();
			for (const dep of dependencies) {
				const module = this.moduleGraph.getModule(dep);
				if (module) {
					chunkGraph.connectChunkAndEntryModule(chunk, module, entrypoint);
					entryModules.add(module);
					const modulesList = chunkGraphInit.get(entrypoint);
					if (modulesList === undefined) {
						chunkGraphInit.set(entrypoint, [module]);
					} else {
						modulesList.push(module);
					}
				}
			}
		}
		buildChunkGraph(this, chunkGraphInit);
		this.hooks.optimize.call();
		this.hooks.afterChunks.call(this.chunks);
		this.hooks.optimizeTree.callAsync(this.chunks, this.modules, err => {
			this.hooks.afterOptimizeTree.call(this.chunks, this.modules);
			this.hooks.optimizeChunkModules.callAsync(this.chunks, this.modules, err => {
				this.hooks.afterOptimizeChunkModules.call(this.chunks, this.modules);
				this.hooks.moduleIds.call(this.modules);
				this.hooks.chunkIds.call(this.chunks);
				this.createModuleHashes();
				this.hooks.beforeCodeGeneration.call();
				this.codeGeneration(err => {
					this.processRuntimeRequirements();
					this.createModuleAssets();
					this.createChunkAssets(err => {
						return this.hooks.afterSeal.callAsync(err => {
							callback(err);
						});
					});
				});
			});
		});
		return callback();
	}
	createModuleAssets() {

	}
	processRuntimeRequirements(chunkGraph = this.chunkGraph) {
		const { chunks } = this;
		const set = new Set([
			"__webpack_require__",
			"__webpack_require__.r",
			"__webpack_exports__",
			"__webpack_require__.*",
			"__webpack_require__.d"
		]);
		for (const chunk of chunks) {
			for (const r of set) {
				this.hooks.runtimeRequirementInTree
					.for(r)
					.call();
			}
			chunkGraph.addChunkRuntimeRequirements(chunk, set);
			chunkGraph.addTreeRuntimeRequirements(chunk, set);
		}
	}
	createModuleHashes() {

	}
	createChunkAssets(callback) {
		const { chunkGraph, codeGenerationResults } = this;
		for (const chunk of this.chunks) {
			const res = this.hooks.renderManifest.call([], { chunk, chunkGraph, codeGenerationResults });
			const source = res.render();
			this.emitAsset('main.js', source);
		}
		callback();
	}
	emitAsset(file, source) {
		this.assets[file] = source;
	}
	getRenderManifest(options) {
		return this.hooks.renderManifest.call([], options);
	}
	codeGeneration(callback) {
		const { dependencyTemplates, codeGenerationResults } = this;
		this.codeGenerationResults = new CodeGenerationResults();
		for (const module of this.modules) {
			const result = module.codeGeneration({ dependencyTemplates });
			this.codeGenerationResults.set(module, result);
		}
		callback();
	}
	addChunk(name) {
		const chunk = new Chunk(name);
		this.chunks.add(chunk);
		ChunkGraph.setChunkGraphForChunk(chunk, this.chunkGraph);
		if (name) {
			this.namedChunks.set(name, chunk);
		}
		return chunk;
	}
	getPath(filename, data = {}) {
		return this.getAssetPath(filename, data);
	}
	getAssetPath(filename, data) {
		return this.hooks.assetPath.call(
			filename,
			data
		);
	}
}
module.exports = Compilation;
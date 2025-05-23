const chunkGraphForChunkMap = new Map();
const EMPTY_SET = new Set();
class ChunkGraphModule {
	constructor() {
		this.chunks = new Set();
		this.id = null;
	}
}
class ChunkGraphChunk {
	constructor() {
		this.modules = new Set();
		//此代码块对应的入口模块，后面会从入口模块出发，到它依赖的其它模块，然后全放到这个代码里
		this.entryModules = new Map();
		//runtimeRequirements  "__webpack_require__.d";
		this.runtimeRequirements = undefined;
		//在seal阶段，上面这些运行时会转换成模块放在runtimeModules里
		this.runtimeModules = new Set();
	}
}
class ChunkGraph {
	constructor(moduleGraph) {
		this._modules = new Map();
		this._chunks = new Map();
		this.moduleGraph = moduleGraph;
		this.runtimeRequirementsInTree = new Set();
	}
	static setChunkGraphForChunk(chunk, chunkGraph) {
		chunkGraphForChunkMap.set(chunk, chunkGraph);
	}
	connectChunkAndEntryModule(chunk, module, entrypoint) {
		const cgm = this._getChunkGraphModule(module);
		const cgc = this._getChunkGraphChunk(chunk);
		if (cgm.entryInChunks === undefined) {
			cgm.entryInChunks = new Set();
		}
		cgm.entryInChunks.add(chunk);
		cgc.entryModules.set(module, entrypoint);
	}
	_getChunkGraphModule(module) {
		let cgm = this._modules.get(module);
		if (cgm === undefined) {
			cgm = new ChunkGraphModule();
			this._modules.set(module, cgm);
		}
		return cgm;
	}
	_getChunkGraphChunk(chunk) {
		let cgc = this._chunks.get(chunk);
		if (cgc === undefined) {
			cgc = new ChunkGraphChunk();
			this._chunks.set(chunk, cgc);
		}
		return cgc;
	}
	addModuleRuntimeRequirements(
		module,
		runtime,
		items
	) {

	}
	connectChunkAndRuntimeModule(chunk, module) {
		const cgm = this._getChunkGraphModule(module);
		const cgc = this._getChunkGraphChunk(chunk);
		if (cgm.runtimeInChunks === undefined) {
			cgm.runtimeInChunks = new Set();
		}
		cgm.runtimeInChunks.add(chunk);
		cgc.runtimeModules.add(module);
	}
	addTreeRuntimeRequirements(chunk, items) {
		const cgc = this._getChunkGraphChunk(chunk);
		const runtimeRequirements = cgc.runtimeRequirementsInTree;
		if (runtimeRequirements) {
			for (const item of items) runtimeRequirements.add(item);
		}
	}
	getTreeRuntimeRequirements(chunk) {
		const cgc = this._getChunkGraphChunk(chunk);
		return cgc.runtimeRequirementsInTree;
	}
	getChunkEntryModulesWithChunkGroupIterable(chunk) {
		const cgc = this._getChunkGraphChunk(chunk);
		return cgc.entryModules;
	}
	getModuleRuntimes(module) {
		const cgm = this._getChunkGraphModule(module);
		return cgm.chunks.getFromUnorderedCache(getModuleRuntimes);
	}
	getModuleId(module) {
		const cgm = this._getChunkGraphModule(module);
		return cgm.id;
	}
	setModuleId(module, id) {
		const cgm = this._getChunkGraphModule(module);
		cgm.id = id;
	}
	getChunkModulesIterable(chunk) {
		const cgc = this._getChunkGraphChunk(chunk);
		return cgc.modules;
	}
	getModuleRuntimeRequirements(module, runtime) {
		const cgm = this._getChunkGraphModule(module);
		const runtimeRequirements =
			cgm.runtimeRequirements && cgm.runtimeRequirements.get(runtime);
		return runtimeRequirements === undefined ? EMPTY_SET : runtimeRequirements;
	}
	connectChunkAndModule(chunk, module) {
		const cgm = this._getChunkGraphModule(module);
		const cgc = this._getChunkGraphChunk(chunk);
		cgm.chunks.add(chunk);
		cgc.modules.add(module);
	}
	getOrderedChunkModulesIterableBySourceType(chunk, sourceType) {
		const cgc = this._getChunkGraphChunk(chunk);
		const modulesWithSourceType = cgc.modules
			.getFromUnorderedCache(cgc._modulesBySourceType)
			.get(sourceType);
		if (modulesWithSourceType === undefined) return undefined;
		modulesWithSourceType.sortWith(comparator);
		return modulesWithSourceType;
	}
	getChunkEntryModulesIterable(chunk) {
		const cgc = this._getChunkGraphChunk(chunk);
		return cgc.entryModules.keys();
	}
	getChunkRuntimeModulesInOrder(chunk) {
		const cgc = this._getChunkGraphChunk(chunk);
		const array = Array.from(cgc.runtimeModules);
		return array;
	}
	addChunkRuntimeRequirements(chunk, items) {
		const cgc = this._getChunkGraphChunk(chunk);
		const runtimeRequirements = cgc.runtimeRequirements;
		if (runtimeRequirements === undefined) {
			cgc.runtimeRequirements = items;
		} else if (runtimeRequirements.size >= items.size) {
			for (const item of items) runtimeRequirements.add(item);
		} else {
			for (const item of runtimeRequirements) items.add(item);
			cgc.runtimeRequirements = items;
		}
	}
}
module.exports = ChunkGraph;
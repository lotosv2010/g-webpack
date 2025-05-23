const ChunkGroup = require("./ChunkGroup");
class Entrypoint extends ChunkGroup {
	constructor(entryOptions) {
		super();
		this.options = entryOptions;
		this._runtimeChunk = undefined;//require.d 等方法也有可能会抽取成单独的chunk
		this._entrypointChunk = undefined;//入口chunk main commonChunk asyncchunk
	}
	setRuntimeChunk(chunk) {
		this._runtimeChunk = chunk;
	}
	setEntrypointChunk(chunk) {
		this._entrypointChunk = chunk;
	}
}
module.exports = Entrypoint;
class ChunkGroup {
	constructor(options) {
		this.options = options;
		this.chunks = [];
	}
	pushChunk(chunk) {
		this.chunks.push(chunk);
		return true;
	}
}
module.exports = ChunkGroup;
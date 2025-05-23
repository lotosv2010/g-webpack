
class Chunk {
	constructor(name) {
		this.name = name;
		this._groups = new Set();
	}
	addGroup(chunkGroup) {
		this._groups.add(chunkGroup);
	}
}
module.exports = Chunk;
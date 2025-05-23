const visitModules = (compilation) => {
	const chunkGraph = compilation.chunkGraph;
	for (const chunk of compilation.chunks) {
		const modules = compilation.modules;
		for (const m of modules) {
			chunkGraph.connectChunkAndModule(chunk, m);
		}
	}
}
const connectChunkGroups = () => {
}
const cleanupUnconnectedGroups = () => {
}
const buildChunkGraph = (compilation, inputEntrypointsAndModules) => {
	visitModules(compilation);
	connectChunkGroups();
	cleanupUnconnectedGroups();
};
module.exports = buildChunkGraph;
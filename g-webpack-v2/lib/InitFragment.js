const { ConcatSource } = require("webpack-sources");
class InitFragment {
	constructor(content, endContent) {
		this.content = content;
		this.endContent = endContent;
	}
	getContent() {
		return this.content;
	}
	getEndContent() {
		return this.endContent;
	}
	static addToSource(source, initFragments) {
		if (initFragments.length > 0) {
			const concatSource = new ConcatSource();
			const endContents = [];
			for (let fragment of initFragments) {
				concatSource.add(fragment.getContent());
				const endContent = fragment.getEndContent();
				if (endContent) {
					endContents.push(endContent);
				}
			}
			concatSource.add(source);
			for (const content of endContents.reverse()) {
				concatSource.add(content);
			}
			return concatSource;
		}
	}
}
module.exports = InitFragment;
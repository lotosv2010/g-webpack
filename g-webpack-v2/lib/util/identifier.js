const path = require("path");
const WINDOWS_ABS_PATH_REGEXP = /^[a-zA-Z]:[\\/]/;
const WINDOWS_PATH_SEPARATOR_REGEXP = /\\/g;
const relativePathToRequest = relativePath => {
	if (relativePath === "") return "./.";
	if (relativePath === "..") return "../.";
	if (relativePath.startsWith("../")) return relativePath;
	return `./${relativePath}`;
};
const absoluteToRequest = (context, maybeAbsolutePath) => {
	if (maybeAbsolutePath[0] === "/") {
		if (maybeAbsolutePath.length > 1 && maybeAbsolutePath[maybeAbsolutePath.length - 1] === "/") {
			return maybeAbsolutePath;
		}
		const querySplitPos = maybeAbsolutePath.indexOf("?");
		let resource = querySplitPos === -1 ? maybeAbsolutePath : maybeAbsolutePath.slice(0, querySplitPos);
		resource = relativePathToRequest(path.posix.relative(context, resource));
		return querySplitPos === -1 ? resource : resource + maybeAbsolutePath.slice(querySplitPos);
	}
	if (WINDOWS_ABS_PATH_REGEXP.test(maybeAbsolutePath)) {
		const querySplitPos = maybeAbsolutePath.indexOf("?");
		let resource = querySplitPos === -1 ? maybeAbsolutePath : maybeAbsolutePath.slice(0, querySplitPos);
		resource = path.win32.relative(context, resource);
		if (!WINDOWS_ABS_PATH_REGEXP.test(resource)) {
			resource = relativePathToRequest(resource.replace(WINDOWS_PATH_SEPARATOR_REGEXP, "/"));
		}
		return querySplitPos === -1 ? resource : resource + maybeAbsolutePath.slice(querySplitPos);
	}
	return maybeAbsolutePath;
};
const contextify = (context, request) => {
	return request.split("!").map(r => absoluteToRequest(context, r)).join("!");
};
exports.contextify = contextify;
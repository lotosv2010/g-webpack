const path = require("path");
const mkdirp = (fs, p, callback) => {
	fs.mkdir(p, err => {
		if (err) {
			if (err.code === "ENOENT") {
				const dir = dirname(fs, p);
				if (dir === p) {
					callback(err);
					return;
				}
				mkdirp(fs, dir, err => {
					if (err) {
						callback(err);
						return;
					}
					fs.mkdir(p, err => {
						if (err) {
							if (err.code === "EEXIST") {
								callback();
								return;
							}
							callback(err);
							return;
						}
						callback();
					});
				});
				return;
			} else if (err.code === "EEXIST") {
				callback();
				return;
			}
			callback(err);
			return;
		}
		callback();
	});
};
exports.mkdirp = mkdirp;

const join = (fs, rootPath, filename) => {
	if (fs && fs.join) {
		return fs.join(rootPath, filename);
	} else if (path.posix.isAbsolute(rootPath)) {
		return path.posix.join(rootPath, filename);
	} else if (path.win32.isAbsolute(rootPath)) {
		return path.win32.join(rootPath, filename);
	} else {
		throw new Error(
			`${rootPath} is neither a posix nor a windows path, and there is no 'join' method defined in the file system`
		);
	}
};
exports.join = join;
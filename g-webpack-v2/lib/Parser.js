const AbstractMethodError = require("./AbstractMethodError");
class Parser {
	parse(source, state) {
		throw new AbstractMethodError();
	}
}
module.exports = Parser;
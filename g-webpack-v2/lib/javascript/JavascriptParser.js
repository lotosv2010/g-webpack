
const { SyncBailHook, HookMap } = require("tapable");
const { Parser: AcornParser } = require("acorn");
const Parser = require("../Parser");
const parser = AcornParser.extend();
const defaultParserOptions = {
	ranges: true,
	ecmaVersion: 2020,
	sourceType: "module",
}
class VariableInfo {
	constructor(declaredScope, freeName, tagInfo) {
		this.declaredScope = declaredScope;
		this.freeName = freeName;
		this.tagInfo = tagInfo;
	}
}
class JavascriptParser extends Parser {
	constructor(sourceType = "auto") {
		super();
		this.sourceType = sourceType;
		this.hooks = {
			statement: new SyncBailHook(["statement"]),
			import: new SyncBailHook(["statement", "source"]),
			importSpecifier: new SyncBailHook([
				"statement",
				"source",
				"exportName",
				"identifierName"
			]),
			export: new SyncBailHook(["statement"]),
			exportExpression: new SyncBailHook(["statement", "declaration"]),
			expression: new HookMap(() => new SyncBailHook(["expression"])),
			program: new SyncBailHook(["ast", "comments"]),
		}
		this.scope = undefined;
		this.state = undefined;
	}
	parse(source, state) {
		let ast = JavascriptParser._parse(source);
		this.state = state;
		this.scope = {
			topLevelScope: true,
			inTry: false,
			inShorthand: false,
			isStrict: false,
			isAsmJs: false,
			definitions: new Map()
		};
		this.hooks.program.call(ast)
		this.blockPreWalkStatements(ast.body);
		this.walkStatements(ast.body);
	}
	callHooksForInfoWithFallback(hookMap, info, fallback, defined, ...args) {
		let tagInfo = info.tagInfo;
		const hook = hookMap.get(tagInfo.tag);
		if (hook !== undefined) {
			this.currentTagData = tagInfo.data;
			const result = hook.call(...args);
			if (result !== undefined) return result;
		}
	}
	tagVariable(name, tag, data) {
		const oldInfo = this.scope.definitions.get(name);
		let newInfo;
		if (oldInfo === undefined) {
			newInfo = new VariableInfo(this.scope, name, { tag, data });
		}//记录全局作用域中的title这个变量来自于newInfo
		this.scope.definitions.set(name, newInfo);
	}
	getVariableInfo(name) {
		const value = this.scope.definitions.get(name);
		if (value === undefined) {
			return name;
		} else {
			return value;
		}
	}
	callHooksForNameWithFallback(hookMap, name, fallback, defined, ...args) {
		return this.callHooksForInfoWithFallback(
			hookMap,
			this.getVariableInfo(name),
			fallback,
			defined,
			...args
		);
	}
	callHooksForName(hookMap, name, ...args) {
		return this.callHooksForNameWithFallback(
			hookMap,
			name,
			undefined,
			undefined,
			...args
		);
	}
	walkIdentifier(expression) {
		this.callHooksForName(this.hooks.expression, expression.name, expression);
	}
	walkExpression(expression) {
		switch (expression.type) {
			case "Identifier":
				this.walkIdentifier(expression);
				break;
		}
	}
	walkExpressions(expressions) {
		for (const expression of expressions) {
			if (expression) {
				this.walkExpression(expression);
			}
		}
	}
	walkCallExpression(expression) {
		if (expression.arguments)
			this.walkExpressions(expression.arguments);
	}
	walkExpression(expression) {
		switch (expression.type) {
			case "CallExpression":
				this.walkCallExpression(expression);
				break;
			case "Identifier":
				this.walkIdentifier(expression);
				break;
		}
	}
	walkExpressionStatement(statement) {
		this.walkExpression(statement.expression);
	}
	walkStatement(statement) {
		switch (statement.type) {
			case "ExpressionStatement":
				this.walkExpressionStatement(statement);
				break;
			case "ExportDefaultDeclaration":
				this.walkExportDefaultDeclaration(statement);
				break;
		}
	}
	walkExportDefaultDeclaration(statement) {
		this.hooks.export.call(statement);
		this.hooks.exportExpression.call(statement, statement.declaration)
	}
	walkStatements(statements) {
		for (let index = 0, len = statements.length; index < len; index++) {
			const statement = statements[index];
			this.walkStatement(statement);
		}
	}
	blockPreWalkStatements(statements) {
		for (let index = 0, len = statements.length; index < len; index++) {
			const statement = statements[index];
			this.blockPreWalkStatement(statement);
		}
	}
	blockPreWalkStatement(statement) {
		switch (statement.type) {
			case "ImportDeclaration":
				this.blockPreWalkImportDeclaration(statement);
				break;
			default:
				break;
		}
	}
	blockPreWalkImportDeclaration(statement) {
		const source = statement.source.value;
		this.hooks.import.call(statement, source);
		for (const specifier of statement.specifiers) {
			const name = specifier.local.name;
			switch (specifier.type) {
				case "ImportDefaultSpecifier":
					if (
						!this.hooks.importSpecifier.call(statement, source, "default", name)
					) {
						this.defineVariable(name);
					}
					break;
			}
		}
	}
	static _parse(code) {
		let ast = parser.parse(code, defaultParserOptions);
		return ast;
	}
}
module.exports = JavascriptParser;
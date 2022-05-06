let { getFilesRecursive, getFileContent } = require('file-oprtr');

module.exports = class StyleReader {

	files = [];

	variables = {};

	constructor(source) {
		this.setSource(source);
	}

	setSource(source) {
		this.source = source ? source : this.source;
	}

	setSourceFiles(source) {
		this.setSource(source);
		this.files = getFilesRecursive(this.source);
		return this;
	}

	getAll() {
		this.files.map(this.setVariables.bind(this));
	}

	setVariables(file) {
		let variables = {},
			content = getFileContent(file),
			setVariable = arr => variables[arr[0]] = arr.slice(1).join(',') || '',
			saveVariables = el => el && el[1] ? setVariable(el[1].split(',').map(s => s.trim())) : false;
		[...content.matchAll(/var\((.*)\)/g)].map(saveVariables);
		this.freeRegExp();
		if (JSON.stringify(variables) === '{}') return;
		this.variables[file] = variables;
	}

	freeRegExp() {
		''.matchAll(/\s*/g);
	}

};
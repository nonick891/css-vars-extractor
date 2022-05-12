let keys = obj => Object.keys(obj),
	{
		writeFile,
		getRootFilePath,
		getFileDir
	} = require('file-oprtr');

module.exports = class FileSaver {

	/**
	 * @type {{
	 *  level: String,
	 *  fileName: String,
	 *  format: String,
	 *  files: Object,
	 *  rootSelector: String,
	 *  emptyFiles: Boolean
	 * }}
	 * @example
	 * this.options = {
	 *  level: 'folder' || 'file'
	 *  format: 'json' || 'style' || 'both',
	 * };
	 */
	options = {
		level: 'folder',
		fileName: 'variables',
		format: 'scss',
		files: {},
		rootSelector: '.root',
		emptyFiles: true
	};

	format = {
		json: ['json', 'txt'],
		style: ['scss', 'css', 'sass']
	};

	saveQueue = [];

	constructor(options) {
		this.setOptions(options);
	}

	getContent(f) {
		return this.options.files[f];
	}

	setOptions(options) {
		this.options = Object.assign({}, this.options, options ? options : {});
	}

	setFiles(files, update = []) {
		this.setOptions({ files });
		return this.saveQueue = update.length > 0 ? update : keys(files);
	}

	saveFiles(files, update= []) {
		let exclude = this.setFiles(files, update);
		this.saveQueue.map(this.save.bind(this));
		return exclude;
	}

	save(file) {
		if (this.options.level === 'folder') {
			this.writeDirFile(getFileDir(file));
		}
	}

	writeDirFile(dir) {
		let content = this.getFolderFileContents(dir);
		if (!this.options.emptyFiles && content.trim() === '') return;
		writeFile(
			getRootFilePath(dir, this.getFileName()),
			content, true
		);
	}

	getFolderFileContents(dir) {
		return keys(this.options.files)
			.map(this.getFileContent(dir))
			.filter(Boolean)
			.join('\n');
	}

	getFileContent(dir) {
		return (f) => (getFileDir(f) === dir)
			? this.getRootVars(f) : '';
	}

	getRootVars(file) {
		let vars = this.getContent(file);
		return !this.isEmptyObj(vars)
			? this.getStyleVars(vars, file) : '';
	}

	getStyleVars(vars, comment) {
		return `
${this.options.rootSelector} {
${comment ? '\t//' + comment : ''}
	${this.getVars(vars)}
}\n\n`.trim()
	}

	isEmptyObj(content) {
		return JSON.stringify(content) === '{}';
	}

	getVars(content) {
		return keys(content)
			.map(k => `${k}: ${content[k] || '""'};`)
			.join('\n\t');
	}

	getFileName() {
		return `${this.options.fileName}.${this.options.format}`
	}

	getFormat() {
		keys(this.format)
			.find(key => key === this.options.format);
	}
}
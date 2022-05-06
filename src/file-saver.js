let path = require('path'),
	keys = obj => Object.keys(obj),
	{ writeFile, getRootFilePath } = require('file-oprtr');
module.exports = class FileSaver {

	/**
	 *
	 * @type {{
	 *  level: 'folder' || 'file',
	 *  fileName: {string},
	 *  format: 'json' || 'style' || 'both',
	 *  files: {object},
	 *  savePath: {string},
	 *  rootSelector: {string}
	 * }}
	 */
	options = {
		level: 'folder',
		fileName: 'variables',
		format: 'scss',
		rootSelector: '.root'
	};

	format = {
		json: ['json', 'txt'],
		style: ['scss', 'css', 'sass']
	};

	saveQueue = [];

	constructor(options) {
		this.setOptions(options);
	}

	setOptions(options) {
		options && keys(options).map(key =>
			this.options[key] = options[key]
		);
	}

	setFiles(files, update = []) {
		this.setOptions({ files });
		return this.saveQueue = update.length > 0 ? update : keys(files);
	}

	saveFiles(files, update = []) {
		let exclude = this.setFiles(files, update);
		this.saveQueue.map(this.save.bind(this));
		return exclude;
	}

	save(file) {
		let parsed = path.parse(file);
		if (this.options.level === 'folder') {
			let save = keys(this.options.files).map(f =>
				path.parse(f).dir === parsed.dir
			       ? this.getStyleVars(this.options.files[f], f) : ''
			).filter(Boolean).join('\n');
			writeFile(
				getRootFilePath(parsed.dir, this.getFileName()),
				save, true
			);
		}
	}

	getStyleVars(content, comment) {
		return `
${this.options.rootSelector} {
${comment ? '\t//' + comment : ''}
	${this.getVars(content)}
}\n\n`.trim()
	}

	getVars(content) {
		return keys(content)
			.map(k => `${k}: ${content[k] || '""'};`)
			.join('\n\t')
	}

	getFileName() {
		return `${this.options.fileName}.${this.options.format}`
	}

	getFormat() {
		keys(this.format)
			.find(key => key === this.options.format);
	}
}
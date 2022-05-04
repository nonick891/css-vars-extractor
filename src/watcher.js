let { watchFolder } = require('file-oprtr');

export default class Watcher {

	bag = {};

	stopStage = ['watchClose', 'done', 'failed'];

	constructor(folder) {
		this.folder = folder;
	}

	addWatcher(folder, handler) {
		this.folder = folder ? folder : this.folder;
		if (!this.folder || this.bag[this.folder]) return false;
		this.bag[this.folder] = watchFolder({
			folder: this.folder, create: handler,
			update: handler, error: handler
		});
	}

	conditionalRemove(stage) {
		if (!this.isStop(stage)) return;
		this.removeWatchers();
	}

	isStop(stage) {
		return this.stopStage.indexOf(stage) > -1;
	}

	removeWatchers() {
		Object.keys(this.bag).map(folder =>
			this.bag[folder].close()
		);
	}
}
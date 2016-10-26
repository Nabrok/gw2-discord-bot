import BaseStore from './BaseStore';

import LoadingActions from '../actions/LoadingActions';

class LoadingStore extends BaseStore {
	constructor() {
		super();
		this.subscribe(() => this._registerToActions.bind(this));

		this._pending = 0;
	}

	_registerToActions(action) {
		var current = this.loading;
		switch(action.actionType) {
			case 'ADD LOADER':
				this._pending++;
				break;
			case 'DEL LOADER':
				this._pending--;
				break;
		}
		if (this.loading !== current) this.emitChange();
	}

	get loading() {
		return (this._pending > 0);
	}
}

export default new LoadingStore();
 

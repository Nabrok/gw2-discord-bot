import BaseStore from './BaseStore';
import Gw2Api from '../services/Gw2Api';

import TraitActions from '../actions/TraitActions';

class TraitStore extends BaseStore {
	constructor() {
		super();
		this.subscribe(() => this._registerToActions.bind(this));

		this._items = [];
	}

	_registerToActions(action) {
		switch(action.actionType) {
			case 'TRAITS':
				this._items = this._items.concat(action.traits);
				this.emitChange();
				break;
		}
	}

	retrieve(ids) {
		var existing = this._items.map(i => i.id);
		ids = ids.filter(id => existing.indexOf(id) === -1);
		if (ids.length === 0) return;
		Gw2Api.request('/v2/traits', ids).then(TraitActions.receive);
	}

	get(id) {
		return this._items.find(i => id === i.id);
	}
}

export default new TraitStore();
 

import BaseStore from './BaseStore';
import Gw2Api from '../services/Gw2Api';

import ProfessionActions from '../actions/ProfessionActions';

class ProfessionStore extends BaseStore {
	constructor() {
		super();
		this.subscribe(() => this._registerToActions.bind(this));

		this._items = [];
	}

	_registerToActions(action) {
		switch(action.actionType) {
			case 'PROFESSIONS':
				this._items = this._items.concat(action.professions);
				this.emitChange();
				break;
		}
	}

	retrieve(ids) {
		if (! Array.isArray(ids)) ids = [ ids ];
		var existing = this._items.map(i => i.id);
		ids = ids.filter(id => existing.indexOf(id) === -1);
		if (ids.length === 0) return;
		Gw2Api.request('/v2/professions', ids).then(ProfessionActions.receive);
	}

	get(id) {
		return this._items.find(i => id === i.id);
	}
}

export default new ProfessionStore();
 

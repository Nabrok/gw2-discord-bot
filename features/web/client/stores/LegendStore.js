import BaseStore from './BaseStore';
import Gw2Api from '../services/Gw2Api';

import LegendActions from '../actions/LegendActions';

class LegendStore extends BaseStore {
	constructor() {
		super();
		this.subscribe(() => this._registerToActions.bind(this));

		this._items = [];
	}

	_registerToActions(action) {
		switch(action.actionType) {
			case 'LEGENDS':
				this._items = this._items.concat(action.legends);
				this.emitChange();
				break;
		}
	}

	retrieve(ids) {
		if (! Array.isArray(ids)) ids = [ ids ];
		var existing = this._items.map(i => i.id);
		ids = ids.filter(id => existing.indexOf(id) === -1);
		if (ids.length === 0) return;
		Gw2Api.request('/v2/legends', ids).then(LegendActions.receive);
	}

	get(id) {
		return this._items.find(i => id === i.id);
	}
}

export default new LegendStore();

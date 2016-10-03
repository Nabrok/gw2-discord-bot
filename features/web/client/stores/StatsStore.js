import BaseStore from './BaseStore';
import Gw2Api from '../services/Gw2Api';

import StatsActions from '../actions/StatsActions';

class StatsStore extends BaseStore {
	constructor() {
		super();
		this.subscribe(() => this._registerToActions.bind(this));

		this._stats = [];
	}

	_registerToActions(action) {
		switch(action.actionType) {
			case 'ITEMS':
				var infix_ids = action.items.filter(i => i.details && i.details.infix_upgrade).map(i => i.details.infix_upgrade.id);
				if (infix_ids.length > 0) this.retrieveStats(infix_ids);
				break;
			case 'STATS':
				this._stats = this._stats.concat(action.stats);
				this.emitChange();
				break;
		}
	}

	retrieveStats(ids) {
		var existing = this._stats.map(i => i.id);
		ids = ids.filter(id => existing.indexOf(id) === -1);
		if (ids.length === 0) return;
		Gw2Api.request('/v2/itemstats', ids).then(StatsActions.receiveStats);
	}

	getStats(id) {
		return this._stats.find(s => id === s.id);
	}
}

export default new StatsStore();

import BaseStore from './BaseStore';
import Gw2Api from '../services/Gw2Api';

import PriceActions from '../actions/PriceActions';

class PriceStore extends BaseStore {
	constructor() {
		super();
		this.subscribe(() => this._registerToActions.bind(this));

		this._prices = [];
	}

	_registerToActions(action) {
		switch(action.actionType) {
			case 'PRICES':
				this._prices = this._prices.concat(action.prices);
				this.emitChange();
				break;
		}
	}

	retrieve(ids) {
		var existing = this._prices.map(i => i.id);
		ids = ids.filter(id => existing.indexOf(id) === -1);
		if (ids.length === 0) return;
		Gw2Api.request('/v2/commerce/prices', ids).then(PriceActions.receive);
	}

	get(id) {
		return this._prices.find(i => id === i.id);
	}
}

export default new PriceStore();
 

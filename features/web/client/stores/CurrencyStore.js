import BaseStore from './BaseStore';
import Gw2Api from '../services/Gw2Api';

import CurrencyActions from '../actions/CurrencyActions';

class CurrencyStore extends BaseStore {
	constructor() {
		super();
		this.subscribe(() => this._registerToActions.bind(this));

		this._currencies = [];
	}

	_registerToActions(action) {
		switch(action.actionType) {
			case 'CURRENCIES':
				if (action.currencies.length > 0) {
					this._currencies = this._currencies.concat(action.currencies);
					this.emitChange();
				}
				break;
		}
	}

	retrieve(ids) {
		var existing = this._currencies.map(i => i.id);
		ids = ids.filter(id => existing.indexOf(parseInt(id)) === -1);
		if (ids.length === 0) return;
		Gw2Api.request('/v2/currencies', ids).then(CurrencyActions.receive);
	}

	get(id) {
		return this._currencies.find(i => parseInt(id) === i.id);
	}
}

export default new CurrencyStore();
 

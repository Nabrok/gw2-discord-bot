import BaseStore from './BaseStore';
import Gw2Api from '../services/Gw2Api';

import ItemActions from '../actions/ItemActions';

class ItemStore extends BaseStore {
	constructor() {
		super();
		this.subscribe(() => this._registerToActions.bind(this));

		this._items = [];
	}

	_registerToActions(action) {
		switch(action.actionType) {
			case 'ITEMS':
				this._items = this._items.concat(action.items);
				this.emitChange();
				break;
		}
	}

	retrieveItems(ids) {
		var existing = this._items.map(i => i.id);
		ids = ids.filter(id => existing.indexOf(id) === -1);
		if (ids.length === 0) return;
		Gw2Api.request('/v2/items', ids).then(ItemActions.receiveItems);
	}

	get(ids) {
		if (! Array.isArray(ids)) ids = [ids];
		this.retrieveItems(ids);
		return ids.map(i => this.getItem(parseInt(i)) || {});
	}

	getItem(id) {
		return this._items.find(i => id === i.id);
	}
}

export default new ItemStore();

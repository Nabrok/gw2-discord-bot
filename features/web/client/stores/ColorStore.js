import BaseStore from './BaseStore';
import Gw2Api from '../services/Gw2Api';

import ColorActions from '../actions/ColorActions';

class ColorStore extends BaseStore {
	constructor() {
		super();
		this.subscribe(() => this._registerToActions.bind(this));

		this._colors = [];
	}

	_registerToActions(action) {
		switch(action.actionType) {
			case 'COLORS':
				this._colors = this._colors.concat(action.colors);
				this.emitChange();
				break;
		}
	}

	retrieveColors(ids) {
		var existing = this._colors.map(i => i.id);
		ids = ids.filter(id => existing.indexOf(id) === -1);
		if (ids.length === 0) return;
		Gw2Api.request('/v2/colors', ids).then(ColorActions.receiveColors);
	}

	get(ids) {
		if (! Array.isArray(ids)) ids = [ids];
		this.retrieveColors(ids);
		return ids.map(i => this.getColor(parseInt(i)) || {});
	}

	getColor(id) {
		return this._colors.find(i => id === i.id);
	}
}

export default new ColorStore();

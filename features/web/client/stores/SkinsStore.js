import BaseStore from './BaseStore';
import Gw2Api from '../services/Gw2Api';

import SkinsActions from '../actions/SkinsActions';

class SkinsStore extends BaseStore {
	constructor() {
		super();
		this.subscribe(() => this._registerToActions.bind(this));

		this._skins = [];
	}

	_registerToActions(action) {
		switch(action.actionType) {
			case 'SKINS':
				this._skins = this._skins.concat(action.skins);
				this.emitChange();
				break;
		}
	}

	retrieveSkins(ids) {
		var existing = this._skins.map(i => i.id);
		ids = ids.filter(id => existing.indexOf(id) === -1);
		if (ids.length === 0) return;
		Gw2Api.request('/v2/skins', ids).then(SkinsActions.receiveSkins);
	}

	get(ids) {
		if (! Array.isArray(ids)) ids = [ids];
		this.retrieveSkins(ids);
		return ids.map(s => this.getSkin(parseInt(s)) || {});
	}

	getSkin(id) {
		return this._skins.find(i => id === i.id);
	}
}

export default new SkinsStore();
 

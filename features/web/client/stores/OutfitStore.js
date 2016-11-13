import BaseStore from './BaseStore';
import Gw2Api from '../services/Gw2Api';

import OutfitActions from '../actions/OutfitActions';

class OutfitStore extends BaseStore {
	constructor() {
		super();
		this.subscribe(() => this._registerToActions.bind(this));

		this._outfits = [];
	}

	_registerToActions(action) {
		switch(action.actionType) {
			case 'OUTFITS':
				this._outfits = this._outfits.concat(action.outfits);
				this.emitChange();
				break;
		}
	}

	retrieveOutfits(ids) {
		var existing = this._outfits.map(i => i.id);
		ids = ids.filter(id => existing.indexOf(id) === -1);
		if (ids.length === 0) return;
		Gw2Api.request('/v2/outfits', ids).then(OutfitActions.receiveOutfits);
	}

	get(ids) {
		if (! Array.isArray(ids)) ids = [ids];
		this.retrieveOutfits(ids);
		return ids.map(i => this.getOutfit(parseInt(i)) || {});
	}

	getOutfit(id) {
		return this._outfits.find(i => id === i.id);
	}
}

export default new OutfitStore();

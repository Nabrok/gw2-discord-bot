import BaseStore from './BaseStore';
import Gw2Api from '../services/Gw2Api';

import AchievementActions from '../actions/AchievementActions';

class AchievementStore extends BaseStore {
	constructor() {
		super();
		this.subscribe(() => this._registerToActions.bind(this));

		this._achievements = [];
	}

	_registerToActions(action) {
		switch(action.actionType) {
			case 'ACHIEVEMENTS':
				this._achievements = this._achievements.concat(action.achievements);
				this.emitChange();
				break;
		}
	}

	retrieve(ids) {
		var existing = this._achievements.map(i => i.id);
		ids = ids.filter(id => existing.indexOf(id) === -1);
		if (ids.length === 0) return;
		Gw2Api.request('/v2/achievements', ids).then(AchievementActions.receive);
	}

	get(id) {
		return this._achievements.find(i => id === i.id);
	}
}

export default new AchievementStore();
 

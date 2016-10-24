import BaseStore from './BaseStore';
import Gw2Api from '../services/Gw2Api';

import AchievementCategoryActions from '../actions/AchievementCategoryActions';

class AchievementCategoryStore extends BaseStore {
	constructor() {
		super();
		this.subscribe(() => this._registerToActions.bind(this));

		this._categories = [];

		Gw2Api.request('/v2/achievements/categories?ids=all').then(AchievementCategoryActions.receive);
	}

	_registerToActions(action) {
		switch(action.actionType) {
			case 'ACHIEVEMENT_CATEGORIES':
				this._categories = this._categories.concat(action.categories);
				this.emitChange();
				break;
		}
	}

	get categories() {
		return this._categories;
	}

	get(id) {
		return this._categories.find(i => id === i.id);
	}
}

export default new AchievementCategoryStore();


import BaseStore from './BaseStore';
import Socket from '../services/WebSocket';
import PrivacyActions from '../actions/PrivacyActions';

class PrivacyStore extends BaseStore {
	constructor() {
		super();
		this.subscribe(() => this._registerToActions.bind(this));

		Socket.on('new privacy', PrivacyActions.receive);

		this._privacy = null;
	}

	_registerToActions(action) {
		switch(action.actionType) {
			case 'PRIVACY':
				this._privacy = action.privacy;
				this.emitChange();
				break;
			case 'LOGOUT':
				this._privacy = null;
				this.emitChange();
				break;
		}
	}

	getPrivacy(character) {
		return this._privacy[character] || 1;
	}
}

export default new PrivacyStore();

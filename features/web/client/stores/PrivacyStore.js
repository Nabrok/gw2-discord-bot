import BaseStore from './BaseStore';
import Socket from '../services/WebSocket';

import LoginStore from './LoginStore';
import PrivacyActions from '../actions/PrivacyActions';

class PrivacyStore extends BaseStore {
	constructor() {
		super();
		this.subscribe(() => this._registerToActions.bind(this));

		Socket.on('new privacy', PrivacyActions.receive);

		this._privacy = {};
	}

	_registerToActions(action) {
		switch(action.actionType) {
			case 'PRIVACY':
				this._privacy = action.privacy;
				this.emitChange();
				break;
			case 'LOGIN':
				LoginStore.waitFor();
				Socket.send('get privacy').then(PrivacyActions.receive).catch(err => console.log(err));
				break;
			case 'LOGOUT':
				this._privacy = {};
				this.emitChange();
				break;
		}
	}

	getPrivacy(character) {
		return this._privacy[character] || 1;
	}
}

export default new PrivacyStore();

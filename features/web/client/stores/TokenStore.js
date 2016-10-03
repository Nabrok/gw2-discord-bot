import BaseStore from './BaseStore';
import Socket from '../services/WebSocket';
import TokenActions from '../actions/TokenActions';
import LoginStore from './LoginStore';

class TokenStore extends BaseStore {
	constructor() {
		super();
		this.subscribe(() => this._registerToActions.bind(this));

		Socket.on('new token', TokenActions.receiveToken);

		this._token = null;
	}

	_registerToActions(action) {
		switch(action.actionType) {
			case 'TOKEN':
				this._token = action.token;
				this.emitChange();
				break;
			case 'LOGIN':
				LoginStore.waitFor();
				Socket.send('get token').then(TokenActions.receiveToken);
				break;
			case 'LOGOUT':
				this._token = null;
				this.emitChange();
				break;
		}
	}

	checkGw2Scope(scope) {
		if (! this._token) return false;
		return (this._token.permissions.indexOf(scope) > -1);
	}

	get token() {
		return this._token;
	}
}

export default new TokenStore();

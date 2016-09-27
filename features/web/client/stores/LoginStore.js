import BaseStore from './BaseStore';
import jwt_decode from 'jwt-decode';

class LoginStore extends BaseStore {
	constructor() {
		super();
		this.subscribe(() => this._registerToActions.bind(this));
		this._user = null;
		this._jwt = null;
	}

	_registerToActions(action) {
		switch(action.actionType) {
			case 'LOGIN':
				this._jwt = action.jwt;
				this._user = jwt_decode(this._jwt);
				this.emitChange();
				break;
			case 'LOGOUT':
				this._user = null;
				this.emitChange();
				break;
		};
	}

	isLoggedIn() {
		return !!this._user;
	}

	get sub() {
		if (! this._user) return;
		return JSON.parse(this._user.sub);
	}

	get username() {
		if (! this._user) return '';
		return this.sub.username;
	}

	get discriminator() {
		if (! this._user) return '';
		return this.sub.discriminator;
	}

	get id() {
		if (! this._user) return '';
		return this.sub.id;
	}
}

export default new LoginStore();

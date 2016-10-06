import BaseStore from './BaseStore';
import Socket from '../services/WebSocket';

import LoginStore from './LoginStore';
import DiscordServerActions from '../actions/DiscordServerActions';

class DiscordServerStore extends BaseStore {
	constructor() {
		super();
		this.subscribe(() => this._registerToActions.bind(this));

		Socket.on('new discord servers', DiscordServerActions.receive);

		this._servers = [];
	}

	_registerToActions(action) {
		switch(action.actionType) {
			case 'DISCORD SERVER':
				this._servers = action.servers;
				this.emitChange();
				break;
			case 'LOGIN':
				LoginStore.waitFor();
				Socket.send('get discord servers').then(DiscordServerActions.receive).catch(err => console.log(err));
				break;
			case 'LOGOUT':
				this._servers = [];
				this.emitChange();
				break;
		}
	}

	get servers() {
		return this._servers;
	}
}

export default new DiscordServerStore();

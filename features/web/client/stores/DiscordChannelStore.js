import BaseStore from './BaseStore';
import Socket from '../services/WebSocket';

import LoginStore from './LoginStore';
import DiscordChannelActions from '../actions/DiscordChannelActions';

class DiscordChannelStore extends BaseStore {
	constructor() {
		super();
		this.subscribe(() => this._registerToActions.bind(this));

		Socket.on('new discord channels', DiscordChannelActions.receive);

		this._channels = [];
	}

	_registerToActions(action) {
		switch(action.actionType) {
			case 'DISCORD CHANNEL':
				this._channels = action.channels;
				this.emitChange();
				break;
			case 'LOGIN':
				LoginStore.waitFor();
				Socket.send('get discord channels').then(DiscordChannelActions.receive).catch(err => console.log(err));
				break;
			case 'LOGOUT':
				this._channels = [];
				this.emitChange();
				break;
		}
	}

	get channels() {
		return this._channels;
	}

	serverChannels(server) {
		return this._channels.filter(c => c.server === server);
	}
}

export default new DiscordChannelStore();

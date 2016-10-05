import React from 'react';
import { Button, Modal, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

import DiscordServerStore from '../../stores/DiscordServerStore';
import DiscordChannelStore from '../../stores/DiscordChannelStore';

export default class PostToChannel extends React.Component {
	constructor(props) {
		super(props);

		this._open = this._open.bind(this);
		this._close = this._close.bind(this);

		var servers = this._getServers();
		this.state = {
			showModal: false,
			servers: this._getServers(),
			channels: [],
			selectedServer: ''
		};
		if (servers.length === 1) {
			this.state.selectedServer = servers[0].id;
			this.state.channels = this._getChannels(servers[0].id);
		}
	}

	_open() {
		this.setState({ showModal: true });
	}

	_close() {
		this.setState({ showModal: false });
	}

	_getServers() {
		return DiscordServerStore.servers;
	}

	_getChannels(server) {
		return DiscordChannelStore.serverChannels(server);
	}

	_serverChange(e) {
		var selectedServer = e.target.value;
		var channels = this._getChannels(selectedServer);
		this.setState({ selectedServer, channels });
	}

	render() {
		return(<div>
			<Button bsStyle="primary" onClick={this._open}>Post To Channel</Button>
			<Modal show={this.state.showModal} onHide={this._close}>
				<Modal.Header closeButton>
					<Modal.Title>Post To Channel</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<form>
						{ this.state.servers.length > 1 && <FormGroup controlId="serverSelect">
							<ControlLabel>Server</ControlLabel>
							<FormControl componentClass="select" placeholder="Server" value={this.state.selectedServer} onChange={this._serverChange.bind(this)}>
								<option value=""></option>
								{this.state.servers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
							</FormControl>
						</FormGroup> }
						{ this.state.selectedServer && <FormGroup controlId="channelSelect">
							<ControlLabel>Channel</ControlLabel>
							<FormControl componentClass="select" placeholder="Channel">
								<option value=""></option>
								{this.state.channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
							</FormControl>
						</FormGroup> }
					</form>
				</Modal.Body>
			</Modal>
		</div>);
	}
}

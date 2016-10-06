import React from 'react';
import { Button, Modal, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';

import Socket from '../../services/WebSocket';

import DiscordServerStore from '../../stores/DiscordServerStore';
import DiscordChannelStore from '../../stores/DiscordChannelStore';

export default class PostToChannel extends React.Component {
	constructor(props) {
		super(props);

		this._open = this._open.bind(this);
		this._close = this._close.bind(this);
		this._getPreview = this._getPreview.bind(this);

		this._getPreview(props.cmd, props.data);
		var servers = this._getServers();
		this.state = {
			showModal: false,
			servers: this._getServers(),
			channels: [],
			selectedServer: '',
			selectedChannel: '',
			preview: ''
		};
		if (servers.length === 1) {
			this.state.selectedServer = servers[0].id;
			this.state.channels = this._getChannels(servers[0].id);
		}
	}

	componentWillReceiveProps(newProps) {
		this._getPreview(newProps.cmd, newProps.data);
	}

	componentDidMount() {
		this._discordServersListener = this._serversUpdated.bind(this);
		this._discordChannelsListener = this._channelsUpdated.bind(this);
		DiscordServerStore.addChangeListener(this._discordServersListener);
		DiscordChannelStore.addChangeListener(this._discordChannelsListener);
	}

	componentWillUnmount() {
		DiscordServerStore.removeChangeListener(this._discordServersListener);
		DiscordChannelStore.removeChangeListener(this._discordChannelsListener);
	}

	_serversUpdated() {
		this.setState({ servers: this._getServers() });
	}

	_channelsUpdated() {
		if (! this.state.selectedServer) return;
		this.setState({ channels: this._getChannels(this.state.selectedServer) });
	}

	_open() {
		this.setState({ showModal: true, selectedChannel: '' });
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

	_getPreview(cmd, data) {
		Socket.send("get "+cmd, data)
			.then(preview => {
				this.setState({ preview });
			})
		;
	}

	_serverChange(e) {
		var selectedServer = e.target.value;
		var channels = this._getChannels(selectedServer);
		this.setState({ selectedServer, channels });
	}

	_channelChange(e) {
		var selectedChannel = e.target.value;
		this.setState({ selectedChannel });
	}

	_post() {
		var data = Object.assign(this.props.data, { channel: this.state.selectedChannel });
		Socket.send("post "+this.props.cmd, data).then(() => this._close());
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
						{ this.state.selectedServer && <FormGroup controlId="channelSelect" value={this.state.selectedChannel} onChange={this._channelChange.bind(this)}>
							<ControlLabel>Channel</ControlLabel>
							<FormControl componentClass="select" placeholder="Channel">
								<option value=""></option>
								{this.state.channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
							</FormControl>
						</FormGroup> }
					</form>
					<div className="discord_preview"><ReactMarkdown source={this.state.preview} /></div>
				</Modal.Body>
				<Modal.Footer>
					<Button bsStyle="primary" disabled={!this.state.selectedChannel} onClick={this._post.bind(this)}>Post</Button>
				</Modal.Footer>
			</Modal>
		</div>);
	}
}

import React from 'react';
import { Panel, Button, FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';
import Socket from '../services/WebSocket';
import request from 'superagent';


class ShowKey extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name: props.name,
			permissions: props.permissions
		}
	}

	componentWillReceiveProps(newProps) {
		this.setState({ name: newProps.name, permissions: newProps.permissions });
	}

	render() {
		return (
			<div>
				<p><b>{this.state.name}</b></p>
				{ this.state.permissions && this.state.permissions.map(p => <span key={p}>{p} </span>) }
			</div>
		);
	}
}

class NewKey extends React.Component {
	constructor(props) {
		super(props);

		this.handleChange = this.handleChange.bind(this);
		this.saveKey = this.saveKey.bind(this);

		this.state = { key: '', new_token: {} };
	}

	componentWillMount() {
		var code = Math.random().toString(36).toUpperCase().substr(2, 5);
		this.setState({ code, });
	}

	getValidationState() {
		var k = this.state.key;
		if (! k) return;
		if (! k.match(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{20}-\w{4}-\w{4}-\w{4}-\w{12}$/)) {
			return 'warning';
		}
		if (this.state.error) {
			return 'error';
		}
		return 'success';
	}

	handleChange(e) {
		var k = e.target.value;
		this.setState({ key: k, error: null, new_token: {}  });
		if (! k.match(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{20}-\w{4}-\w{4}-\w{4}-\w{12}$/)) {
			return;
		}
		request.get('https://api.guildwars2.com/v2/tokeninfo?access_token='+k).accept('json').end((err, res) => {
			if (err && ! res) {
				this.setState({ error: err.message });
				console.log(err);
				return;
			}
			var token = JSON.parse(res.text);
			var newState = { new_token: token };
			newState.new_token = token;
			if (token.text) newState.error = token.text;
			if (token.name && ! token.name.match(this.state.code)) newState.error = 'code is not in key name';
			this.setState(newState);
		});
	}

	saveKey() {
		Socket.send('set key', this.state.key).then(res => {
			this.props.onChange();
		}).catch(err => {
			alert('Error saving key');
		});
	}

	render() {
		return (
			<div>
				<Panel header="New Key">
					<p>Please provide a key from <a href="https://account.arena.net/applications" target="_new">https://account.arena.net/applications</a> - include the code <b>{this.state.code}</b> in the key name field.</p>
					<form>
						<FormGroup controlId="formApiKey" validationState={this.getValidationState()}>
							<ControlLabel>API Key</ControlLabel>
							<FormControl type="text" value={this.state.key} placeholder="API Key" onChange={this.handleChange} />
							<FormControl.Feedback />
							<HelpBlock>{ this.state.error }</HelpBlock>
						</FormGroup>
					</form>
					<ShowKey name={this.state.new_token.name} permissions={this.state.new_token.permissions} />
				</Panel>
				<Button bsStyle="primary" disabled={(this.getValidationState() === 'success') ? false : true} onClick={this.saveKey}>Save Key</Button>
			</div>
		);
	}
}

export default class ApiKey extends React.Component {
	constructor() {
		super();
		this.keyChanged = this.keyChanged.bind(this);
		this.state = {
			addingKey: false
		};
	}

	componentWillMount() {
		this.keyChanged();
	}

	keyChanged() {
		Socket.send('get token').then(token => { this.setState(Object.assign(token, { addingKey: false })) });
	}

	render() {
		return (
			<div>
				<Panel header="Current Key">
					<ShowKey name={this.state.name} permissions={this.state.permissions} />
				</Panel>
				{ this.state.addingKey ?
					<NewKey onChange={this.keyChanged} /> :
					<Button bsStyle="primary" onClick={ () => { this.setState({ addingKey: true }) } }>Change Key</Button>
				}
			</div>
		);
	}
}

import React from 'react';
import { Alert, Table, DropdownButton, MenuItem } from 'react-bootstrap';
import { browserHistory, Link } from 'react-router';

import Socket from '../services/WebSocket';
import TokenStore from '../stores/TokenStore';
import PrivacyStore from '../stores/PrivacyStore';

export default class Characters extends React.Component {
	constructor(props) {
		super(props);

		this._getCharacters = this._getCharacters.bind(this);

		this.state = {
			token: this._getTokenState(),
			characters: [],
			characterList: [],
			selectedPrivacy: 0
		};
	}

	_getTokenState() {
		return TokenStore.token || {};
	}

	componentDidMount() {
		this.changeListener = this._onTokenChange.bind(this);
		this.privChangeListener = this._onPrivacyChange.bind(this);
		TokenStore.addChangeListener(this.changeListener);
		PrivacyStore.addChangeListener(this.privChangeListener);
		this._getCharacters();
	}

	componentWillUnmount() {
		TokenStore.removeChangeListener(this.changeListener);
		PrivacyStore.removeChangeListener(this.privChangeListener);
	}

	_onTokenChange() {
		this.setState({ token: this._getTokenState() });
		this._getCharacters();
	}

	_onPrivacyChange() {
		this.setState({ characterList: this._characterList(this.state.characters) });
	}

	_getCharacters() {
		if (this.state.token.permissions && this.state.token.permissions.indexOf('characters') === -1) return this.setState({ characters: [], characterList: [] });
		Socket.send('get characters')
			.then(characters => this.setState({ characters, characterList: this._characterList(characters) }))
			.catch(err => {
				console.log(err);
			})
		;
	}

	_characterList(characters) {
		if (! characters) return [];
		var privacyDetails = { 1: 'Private', 2: 'Guild Only', 4: 'Public' };
		return characters.map(c => {
			return {
				name: c,
				privacy: privacyDetails[PrivacyStore.getPrivacy(c)]
			};
		});
	}

	_setPrivacy(details) {
		var data = {};
		data[details.name] = details.privacy;
		Socket.send('set privacy', data);
	}

	render() {
		return(<div>
			{ this.state.token.permissions && this.state.token.permissions.indexOf('characters') === -1 && <Alert bsStyle="danger">
				You do not have the <b>characters</b> permission on your API key.
			</Alert> }
			<Table striped bordered condensed hover>
				<thead>
					<tr>
						<th>Name</th>
						<th>Privacy</th>
					</tr>
				</thead>
				<tbody>
					{this.state.characterList.map((c,i) =>
						<tr key={i}>
							<td><Link to={"/characters/"+c.name}>{c.name}</Link></td>
							<td><DropdownButton bsStyle="link" bsSize="xsmall" title={c.privacy} id={"dropdown-privacy-"+i} onSelect={this._setPrivacy}>
								<MenuItem eventKey={{ name: c.name, privacy: 1 }}>Private</MenuItem>
								<MenuItem eventKey={{ name: c.name, privacy: 2 }}>Guild Only</MenuItem>
								<MenuItem eventKey={{ name: c.name, privacy: 4 }}>Public</MenuItem>
							</DropdownButton></td>
						</tr>
					)}
				</tbody>
			</Table>
		</div>);
	}
}

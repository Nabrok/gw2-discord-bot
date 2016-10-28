import React from 'react';
import { Alert, DropdownButton, MenuItem, Panel } from 'react-bootstrap';
import { browserHistory, Link } from 'react-router';

import { randomColor } from '../utils';

import Socket from '../services/WebSocket';
import TokenStore from '../stores/TokenStore';
import PrivacyStore from '../stores/PrivacyStore';

class CharacterIcon extends React.Component {
	render() {
		var initials = this.props.name.split(/\s+/).splice(0,2).map(s => s.charAt(0)).join('');
		var backgroundColor = randomColor(this.props.name);
		return (<li>
			<Link to={"/characters/"+this.props.name}>
				<div className="avatarIcon" style={{ backgroundColor }}>{initials}</div>
				<div className="avatarInfo">{this.props.name}</div>
			</Link>
			{ this.props.children && <span>{this.props.children}</span> }
		</li>);
	}
}

class CharacterDisplay extends React.Component {
	constructor(props) {
		super(props);

		this._setPrivacy = this._setPrivacy.bind(this);
	}

	_setPrivacy(privacy) {
		var data = {};
		data[this.props.name] = privacy;
		Socket.send('set privacy', data);
	}

	render() {
		return (<CharacterIcon {...this.props}>
			<DropdownButton bsSize="xsmall" title={this.props.privacy} id={"dropdown-privacy-"+this.props.name} onSelect={this._setPrivacy}>
				<MenuItem eventKey={1}>Private</MenuItem>
				<MenuItem eventKey={2}>Guild Only</MenuItem>
				<MenuItem eventKey={4}>Public</MenuItem>
			</DropdownButton>
		</CharacterIcon>);
	}
}

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
				console.log(err.stack);
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

	render() {
		var private_chars = this.state.characterList.filter(c => c.privacy === 'Private');
		var guild_chars = this.state.characterList.filter(c => c.privacy === 'Guild Only');
		var public_chars = this.state.characterList.filter(c => c.privacy === 'Public');
		return(<div>
			{ this.state.token.permissions && this.state.token.permissions.indexOf('characters') === -1 && <Alert bsStyle="danger">
				You do not have the <b>characters</b> permission on your API key.
			</Alert> }
			{ public_chars.length > 0 && <Panel header="Public Characters">
				<ul className="avatarContainer">
					{ public_chars.map((c,i) => <CharacterDisplay key={i} {...c} />) }
				</ul>
			</Panel> }
			{ guild_chars.length > 0 && <Panel header="Guild Only Characters">
				<ul className="avatarContainer">
					{ guild_chars.map((c,i) => <CharacterDisplay key={i} {...c} />) }
				</ul>
			</Panel> }
			{ private_chars.length > 0 && <Panel header="Private Characters">
				<ul className="avatarContainer">
					{ private_chars.map((c,i) => <CharacterDisplay key={i} {...c} />) }
				</ul>
			</Panel> }
		</div>);
	}
}

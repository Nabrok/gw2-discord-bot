import React from 'react';
import LoginStore from '../stores/LoginStore';

class Username extends React.Component {
	constructor() {
		super();
		this.state = this._getLoginState();
	}

	_getLoginState() {
		return {
			username: LoginStore.username
		}
	}

	render() {
		return (<span>{this.state.username}</span>);
	}
}

export default class Home extends React.Component {
	render() {
		return (<p>Hello <Username /></p>);
	}
}

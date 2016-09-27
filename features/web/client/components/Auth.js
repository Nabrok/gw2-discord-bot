import React from 'react';
import { browserHistory } from 'react-router';
import Socket from '../services/WebSocket';

export default class Auth extends React.Component {
	componentDidMount() {
		Socket.login(window.location.href).then(() => { browserHistory.push('/'); }).catch(err => this.setState({ error: err }));
	}

	render() {
		return (
			<div>Authorizing ...</div>
		);
	}
}
